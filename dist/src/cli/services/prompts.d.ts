import { Config } from "@core/config/types";
export declare class Prompts {
    selectWorkerAndWorkflow(config: Config): Promise<{
        worker: string;
        workflow: string;
    }>;
    getWorkflowInput(config: Config, worker: string, workflow: string): Promise<Record<string, string>>;
}
