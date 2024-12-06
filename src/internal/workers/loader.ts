import { ConfigManager } from "@cli/config";
import { WorkflowResponse, WorkflowFunction } from "@public/types";
import { MindStudioWorkers } from "@generated/workers";
import { MSWorker, MSWorkflow, MSVariables } from "./types";

type RunFunction = (params: {
  workerId: string;
  workflow: string;
  variables?: Record<string, string>;
}) => Promise<WorkflowResponse<any>>;

export class WorkerLoader {
  constructor(private runFn: RunFunction) {}

  loadFromConfig(): MindStudioWorkers | undefined {
    try {
      const configManager = new ConfigManager();
      const config = configManager.load();
      const workers = configManager.convertToWorkerWorkflows(config);

      return this.createWorkerFunctions(workers);
    } catch (error) {
      // If loading fails, return undefined so client can handle appropriately
      return undefined;
    }
  }

  private createWorkerFunctions(workers: MSWorker[]): MindStudioWorkers {
    return workers.reduce((acc, worker) => {
      acc[worker.slug] = worker.workflows.reduce(
        (workflowAcc, workflow) => {
          workflowAcc[workflow.slug] = this.createWorkflowFunction(
            worker,
            workflow
          );
          return workflowAcc;
        },
        {} as Record<string, WorkflowFunction>
      );
      return acc;
    }, {} as MindStudioWorkers);
  }

  private createWorkflowFunction(
    worker: MSWorker,
    workflow: MSWorkflow
  ): WorkflowFunction {
    const fn = async (
      variables?: MSVariables
    ): Promise<WorkflowResponse<any>> => {
      return this.runFn({
        workerId: worker.id,
        workflow: workflow.slug,
        variables: variables || {},
      });
    };

    (fn as any).__info = {
      ...workflow,
      worker: {
        id: worker.id,
        name: worker.name,
        slug: worker.slug,
      },
    };

    return fn;
  }
}
