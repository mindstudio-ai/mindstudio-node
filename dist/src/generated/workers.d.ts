import { WorkflowFunction } from "@mindstudio/types";
export interface MindStudioWorkers {
    [workerName: string]: {
        [workflowName: string]: WorkflowFunction;
    };
}
