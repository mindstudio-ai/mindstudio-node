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

export interface MSWorkflowExecutionResult {
  result: Record<string, string>;
}
