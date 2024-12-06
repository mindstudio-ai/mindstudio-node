import { WorkflowFunction } from "../types";

// This file will be overwritten by the sync command
export interface MindStudioWorkers {
  [workerName: string]: {
    [workflowName: string]: WorkflowFunction;
  };
}
