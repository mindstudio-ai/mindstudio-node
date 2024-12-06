export interface WorkflowResponse<T> {
  result: T;
  billingCost?: string;
}

export interface WorkflowFunction<TInput = any, TOutput = any> {
  (variables?: TInput): Promise<WorkflowResponse<TOutput>>;
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
