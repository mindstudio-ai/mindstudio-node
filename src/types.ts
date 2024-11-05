declare namespace NodeJS {
  interface ProcessEnv {
    MINDSTUDIO_KEY: string;
  }
}

import { EntityFormatter } from "./utils/nameFormatter";

export interface MSWorker {
  id: string;
  name: string;
  slug: string;
  workflows: MSWorkflow[];
  toString(): string;
}

export interface MSWorkflow {
  id: string;
  name: string;
  slug: string;
  launchVariables: string[];
  outputVariables: string[];
  worker: Omit<MSWorker, "workflows">;
  toString(): string;
}

// Implement the interfaces with classes
export class Worker implements MSWorker {
  constructor(
    public id: string,
    public name: string,
    public slug: string,
    public workflows: MSWorkflow[]
  ) {}

  toString(): string {
    return EntityFormatter.formatWorker(this);
  }
}

export class Workflow implements MSWorkflow {
  constructor(
    public id: string,
    public name: string,
    public slug: string,
    public launchVariables: string[],
    public outputVariables: string[],
    public worker: Pick<MSWorker, "id" | "name" | "slug">
  ) {}

  toString(): string {
    return EntityFormatter.formatWorkflow(this);
  }
}

// Runtime types for workflow execution
export interface MSVariables {
  [key: string]: string;
}

// Shared response type for all workflow executions
export interface WorkflowResponse<TResult> {
  success: boolean;
  result: TResult;
  error?: any;
  billingCost?: number;
}

// Base configuration type
export interface MindStudioConfig {
  baseUrl?: string;
}

// Base function type for workflows
export type WorkflowFunction<
  TInput extends MSVariables = MSVariables,
  TOutput = Record<string, string> | string | undefined,
> = ((input: TInput) => Promise<WorkflowResponse<TOutput>>) & { __info?: any };
