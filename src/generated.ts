import { WorkflowFunction } from "./types";

export interface MindStudioWorkers {
  [workerName: string]: {
    [workflowName: string]: WorkflowFunction;
  };
}
