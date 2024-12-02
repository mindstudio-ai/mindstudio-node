import axios, { AxiosInstance } from "axios";
import { version } from '../package.json';
import { MindStudioError } from "./errors";
import {
  MSVariables,
  MSWorker,
  MindStudioConfig,
  Worker,
  Workflow,
  MSWorkflow,
} from "./types";
import { InputValidator } from "./validators";
import { MindStudioWorkers } from "./generated";

export class MindStudio {
  public workers: MindStudioWorkers = {};
  private readonly http: AxiosInstance;
  private readonly validator: InputValidator;

  constructor(apiKey: string, config: MindStudioConfig = {}) {
    if (!apiKey) {
      throw new MindStudioError("API key is required", "missing_api_key", 400);
    }

    this.validator = new InputValidator();
    const baseURL = config.baseUrl || "https://api.mindstudio.ai/developer/v2";

    this.http = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        'User-Agent': `MindStudio-NPM/v${version}`,
      },
    });
  }

  async init(forceRefresh = false): Promise<void> {
    // First try to load from local config
    try {
      const { ConfigManager } = require("./cli/config");
      const configManager = new ConfigManager();

      if ((await configManager.exists()) && !forceRefresh) {
        const config = await configManager.load();
        const workers = configManager.convertToWorkerWorkflows(config);
        await this.createWorkerMethods(workers);

        // Kick off API fetch in background to update to latest
        this.fetchWorkers()
          .then((workers) => this.createWorkerMethods(workers))
          .catch(() => {
            // Silently fail background update - we're already initialized from config
          });

        return;
      }
    } catch (configError) {
      // Config load failed, fall back to API
    }

    // If no config exists or loading failed, initialize from API
    try {
      const workers = await this.fetchWorkers();
      await this.createWorkerMethods(workers);
    } catch (error) {
      throw new MindStudioError(
        "Failed to initialize MindStudio client",
        "init_failed",
        500,
        error
      );
    }
  }

  private async fetchWorkers(): Promise<MSWorker[]> {
    const { data } = await this.http.get("/workers/load");
    const workers = data.apps;

    return await Promise.all(
      workers.map(
        async (workerData: { id: string; name: string; slug: string }) => {
          const { data: workflowData } = await this.http.get(
            `/workers/${workerData.id}/workflows`
          );

          const worker = new Worker(
            workerData.id,
            workerData.name,
            workerData.slug,
            workflowData.workflows.map(
              (wf: MSWorkflow) =>
                new Workflow(
                  wf.id,
                  wf.name,
                  wf.slug,
                  wf.launchVariables,
                  wf.outputVariables,
                  workerData
                )
            )
          );

          return worker;
        }
      )
    );
  }

  private async createWorkerMethods(workers: MSWorker[]): Promise<void> {
    for (const worker of workers) {
      const workerName = worker.toString();

      if (!(workerName in this.workers)) {
        this.workers[workerName] = {};
      }

      for (const workflow of worker.workflows) {
        const workflowName = workflow.toString();

        // Create the workflow function
        const workflowFn = async (input?: MSVariables) => {
          // Validate input if workflow has defined variables
          if (workflow.launchVariables?.length) {
            if (!input) {
              throw new MindStudioError(
                "Input variables are required for this workflow",
                "missing_input",
                400
              );
            }
            this.validator.validateInput(input, workflow.launchVariables);
          }

          try {
            const response = await this.http.post("/workers/run", {
              workerId: worker.id,
              workflow: workflow.name,
              variables: input || {},
            });

            const apiResult = response.data.result;
            const billingCost = response.data.billingCost;

            // Determine result based on output variables
            if (workflow.outputVariables?.length) {
              // Validate output if workflow has defined variables
              this.validator.validateOutput(
                apiResult,
                workflow.outputVariables
              );
              return {
                success: true,
                result: apiResult as Record<string, string>,
                billingCost,
              };
            } else {
              // For workflows without output variables, result is string or undefined
              return {
                success: true,
                result:
                  typeof apiResult === "string"
                    ? apiResult
                    : JSON.stringify(apiResult),
                billingCost,
              };
            }
          } catch (error) {
            return {
              success: false,
              error: error as Error,
            };
          }
        };

        workflowFn.__info = { ...workflow, worker };

        // Assign the workflow function
        this.workers[workerName][workflowName] = workflowFn;
      }
    }
  }
}

export default MindStudio;
