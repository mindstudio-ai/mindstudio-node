import axios, { AxiosInstance } from "axios";
import { version } from "../package.json";
import { MindStudioError } from "./errors";
import {
  MSVariables,
  MSWorker,
  MindStudioConfig,
  Worker,
  Workflow,
  MSWorkflow,
  WorkflowResponse,
} from "./types";
import { InputValidator } from "./validators";
import { MindStudioWorkers } from "./generated";

export class MindStudio {
  private readonly http: AxiosInstance;
  private readonly validator: InputValidator;
  private _workers?: MindStudioWorkers;

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
        "User-Agent": `MindStudio-NPM/v${version}`,
      },
    });

    // Attempt to load workers from the generated types
    this.loadWorkersFromConfig();
  }

  private loadWorkersFromConfig(): void {
    try {
      const { ConfigManager } = require("./cli/config");
      const configManager = new ConfigManager();
      const config = configManager.loadSync(); // Synchronous load for simplicity
      this._workers = configManager.convertToWorkerWorkflows(config);
    } catch (error) {
      // If loading fails, _workers remains undefined
      console.warn(
        "Type-safe workers not available. Run 'npx mindstudio sync' to generate types."
      );
    }
  }

  /**
   * Type-safe worker access - only available if types are generated
   */
  public get workers(): MindStudioWorkers {
    if (!this._workers) {
      throw new MindStudioError(
        "Type-safe workers not available. Run 'npx mindstudio sync' first to generate types.",
        "types_not_generated",
        400
      );
    }
    return this._workers;
  }

  /**
   * Direct worker execution without type safety
   */
  public async run(params: {
    workerId: string;
    workflow: string;
    variables?: Record<string, string>;
  }): Promise<WorkflowResponse<any>> {
    try {
      const response = await this.http.post("/workers/run", {
        workerId: params.workerId,
        workflow: params.workflow,
        variables: params.variables || {},
      });

      return {
        success: true,
        result: response.data.result,
        billingCost: response.data.billingCost,
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error,
        };
      }
      return {
        success: false,
        error: new Error(String(error)),
      };
    }
  }

  /**
   * @internal Used by CLI for worker discovery
   */
  static async fetchWorkerDefinitions(
    apiKey: string,
    baseUrl?: string
  ): Promise<MSWorker[]> {
    const client = new MindStudio(apiKey, { baseUrl });
    const { data } = await client.http.get("/workers/load");
    const workers = data.apps;

    return await Promise.all(
      workers.map(
        async (workerData: { id: string; name: string; slug: string }) => {
          const { data: workflowData } = await client.http.get(
            `/workers/${workerData.id}/workflows`
          );

          return new Worker(
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
        }
      )
    );
  }
}

export default MindStudio;
