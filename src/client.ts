import { HttpClient } from "./core/http/client";
import { WorkflowExecutionResponse } from "./core/http/types";
import { WorkerLoader } from "./core/workers/loader";
import { MindStudioWorkers, WorkflowResponse } from "./types";
import { KeyManager } from "./core/auth/keyManager";
import { MindStudioError } from "./errors";

export class MindStudio {
  private readonly httpClient: HttpClient;
  private readonly workerLoader: WorkerLoader;
  private _workers?: MindStudioWorkers;
  private apiKey: string;

  constructor(apiKey?: string, options?: { baseUrl?: string }) {
    this.apiKey = KeyManager.resolveKey(apiKey);

    this.httpClient = new HttpClient(this.apiKey, {
      baseUrl: options?.baseUrl,
    });
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
        result: response.result,
        billingCost: response.billingCost,
      };
    } catch (error) {
      if (error instanceof MindStudioError) {
        throw error;
      }
      throw new MindStudioError(
        error instanceof Error ? error.message : String(error),
        "workflow_execution_failed",
        500
      );
    }
  }
}
