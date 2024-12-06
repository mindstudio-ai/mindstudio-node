import { MindStudioWorkers, WorkflowResponse } from "@mindstudio/types";
export declare class MindStudio {
    private readonly httpClient;
    private readonly workerLoader;
    private _workers?;
    private apiKey;
    constructor(apiKey?: string, options?: {
        baseUrl?: string;
    });
    /**
     * Type-safe worker access - only available if types are generated
     */
    get workers(): MindStudioWorkers;
    /**
     * Direct worker execution without type safety
     */
    run(params: {
        workerId: string;
        workflow: string;
        variables?: Record<string, string>;
    }): Promise<WorkflowResponse<any>>;
}
