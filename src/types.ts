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
  billingCost?: number;
}

// Base configuration type
export interface MindStudioConfig {
  baseUrl?: string;
}

// Base function type for workflows
export type WorkflowFunction<
  TInput extends MSVariables | void = MSVariables,
  TOutput = Record<string, string> | string | undefined,
> = TInput extends void
  ? (() => Promise<WorkflowResponse<TOutput>>) & { __info?: any }
  : ((input: TInput) => Promise<WorkflowResponse<TOutput>>) & { __info?: any };

// Type for workflows with output variables
export type OutputVarsResponse<T extends Record<string, string>> =
  WorkflowResponse<T>;

// Type for workflows without output variables
export type StringResponse = WorkflowResponse<string | undefined>;
