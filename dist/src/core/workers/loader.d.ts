import { WorkflowResponse } from "../../types";
import { MindStudioWorkers } from "@mindstudio/types";
type RunFunction = (params: {
    workerId: string;
    workflow: string;
    variables?: Record<string, string>;
}) => Promise<WorkflowResponse<any>>;
export declare class WorkerLoader {
    private runFn;
    private configManager;
    constructor(runFn: RunFunction);
    loadFromConfig(): MindStudioWorkers | undefined;
    private createWorkerWorkflows;
    private createWorkerFunctions;
    private createWorkflowFunction;
}
export {};
