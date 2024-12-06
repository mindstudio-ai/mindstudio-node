import { HttpClient } from "@core/http/client";
import { HttpClientConfig, WorkflowExecutionResponse } from "@core/types";
import { WorkerLoader } from "@core/workers/loader";
import { MindStudioWorkers } from "@generated/workers";
import { MindStudioError } from "./errors";
import { WorkflowResponse } from "./types";

export class MindStudio {
  private readonly httpClient: HttpClient;
  private readonly workerLoader: WorkerLoader;
  private _workers?: MindStudioWorkers;

  constructor(apiKey: string, config: HttpClientConfig = {}) {
    this.httpClient = new HttpClient(apiKey, config);
    this.workerLoader = new WorkerLoader(this.run.bind(this));
    this._workers = this.workerLoader.loadFromConfig();
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
      const response = await this.httpClient.post<WorkflowExecutionResponse>(
        "/workers/run",
        {
          workerId: params.workerId,
          workflow: params.workflow,
          variables: params.variables || {},
        }
      );

      return {
        success: true,
        result: response.result,
        billingCost: response.billingCost,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}
