import axios, { AxiosInstance } from "axios";
import { MindStudioError } from "./errors";
import {
  MSVariables,
  MSWorker,
  MSWorkflow,
  MSWorkflowExecutionResult,
  Worker,
  Workflow,
} from "./types";
import { InputValidator } from "./validators";

export interface MindStudioConfig {
  baseUrl?: string;
}

export type WorkflowFunction<
  TInput extends MSVariables = MSVariables,
  TOutput extends MSWorkflowExecutionResult = MSWorkflowExecutionResult,
> = ((input: TInput) => Promise<{ result: TOutput }>) & { __info?: any };

export interface WorkerClient {
  [workflowName: string]: WorkflowFunction;
}

export interface MindStudioWorkers {
  [workerName: string]: WorkerClient;
}

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
      },
    });
  }

  async init(): Promise<void> {
    try {
      const workers = await this.fetchWorkers();
      console.log("Fetched workers", workers);
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
        (this.workers as Record<string, WorkerClient>)[workerName] = {};
      }

      for (const workflow of worker.workflows) {
        const workflowName = workflow.toString();

        // Create the workflow function
        const workflowFn = async (input: MSVariables) => {
          // Validate input if workflow has defined variables
          if (workflow.launchVariables?.length) {
            this.validator.validateInput(input, workflow.launchVariables);
          }

          const response = await this.http.post("/workers/run", {
            workerId: worker.id,
            workflowId: workflow.id,
            variables: input,
          });

          const result = response.data.result;

          // Validate output if workflow has defined variables
          if (workflow.outputVariables?.length) {
            this.validator.validateOutput(result, workflow.outputVariables);
          }

          return { result };
        };

        workflowFn.__info = { ...workflow, worker };

        // Assign the workflow function directly
        (this.workers as Record<string, WorkerClient>)[workerName][
          workflowName
        ] = workflowFn;
      }
    }
  }
}

export default MindStudio;
