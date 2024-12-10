export interface HttpClientConfig {
  baseUrl?: string;
}

export interface WorkflowExecutionResponse {
  result: any;
  threadId: string;
  billingCost: string;
}
