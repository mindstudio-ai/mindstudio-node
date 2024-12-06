import { ConfigManager } from "@core/config/manager";
import { WorkflowResponse, WorkflowFunction } from "../../types";
import { MindStudioWorkers } from "@mindstudio/types";
import { MSWorker, MSWorkflow, MSVariables } from "./types";
import { Config } from "@core/config/types";
import { Worker, Workflow } from "@core/types";

type RunFunction = (params: {
  workerId: string;
  workflow: string;
  variables?: Record<string, string>;
}) => Promise<WorkflowResponse<any>>;

export class WorkerLoader {
  private configManager = new ConfigManager();

  constructor(private runFn: RunFunction) {}

  loadFromConfig(): MindStudioWorkers | undefined {
    try {
      const config = this.configManager.readConfig();
      const workers = this.createWorkerWorkflows(config);
      return this.createWorkerFunctions(workers);
    } catch (error) {
      return undefined;
    }
  }

  private createWorkerWorkflows(config: Config): MSWorker[] {
    return config.workers.map(
      (worker) =>
        new Worker(
          worker.id,
          worker.name,
          worker.slug,
          worker.workflows.map(
            (workflow) =>
              new Workflow(
                workflow.id,
                workflow.name,
                workflow.slug,
                workflow.launchVariables,
                workflow.outputVariables,
                worker
              )
          )
        )
    );
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
