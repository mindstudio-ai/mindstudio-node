export interface WorkflowResponse<T> {
  result: T;
  threadId: string;
  billingCost?: string;
}

export interface WorkflowRunOptions {
  callbackUrl?: string;
}

export interface WorkflowFunction<TInput = any, TOutput = any> {
  (variables?: TInput, options?: WorkflowRunOptions): Promise<WorkflowResponse<TOutput>>;
  __info?: {
    id: string;
    name: string;
    slug: string;
    launchVariables: string[];
    outputVariables: string[];
    worker: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export * from "./generated/workers";
