import MockAdapter from "axios-mock-adapter";
export interface ApiMock {
    reset: () => void;
    mockWorkflowExecution: (response: any) => void;
    mockWorkflowExecutionError: (error: Error) => void;
    mockWorkerDefinitions: (workers: any[]) => void;
    mockWorkerDefinitionsError: (error: Error) => void;
    getHistory: () => MockAdapter["history"];
}
export declare const setupApiMock: () => ApiMock;
