import { MSWorker } from "./types";

export class TypeGenerator {
  generateTypes(workers: MSWorker[]): string {
    return `
import { AxiosInstance } from "axios";
import { MSVariables, MSWorkflowExecutionResult } from "./types";

export interface MindStudioConfig {
  baseUrl?: string;
}

export type WorkflowFunction<TInput extends MSVariables = MSVariables, TOutput extends MSWorkflowExecutionResult = MSWorkflowExecutionResult> = 
  ((input: TInput) => Promise<{ result: TOutput }>) & { __info?: any };

export interface WorkerClient {
  [workflowName: string]: WorkflowFunction;
}

${this.generateWorkerInterfaces(workers)}

export interface MindStudioWorkers {
  ${workers.map((w) => `${w.toString()}: ${this.getWorkerInterfaceName(w.toString())};`).join("\n  ")}
}

export class MindStudio {
  public workers: MindStudioWorkers;
  private readonly http: AxiosInstance;

  constructor(apiKey: string, config?: MindStudioConfig);
  init(): Promise<void>;
}

export default MindStudio;
`.trim();
  }

  private getWorkerInterfaceName(slug: string): string {
    return `${slug}Worker`;
  }

  private generateWorkerInterfaces(workers: MSWorker[]): string {
    return workers
      .map((worker) => {
        const interfaceName = this.getWorkerInterfaceName(worker.toString());

        return `
export interface ${interfaceName} {
  ${worker.workflows
    .map(
      (workflow) => `
  ${workflow.toString()}(input: {
    ${workflow.launchVariables.map((v) => `${v}: string;`).join("\n    ")}
  }): Promise<{
    result: {
      ${workflow.outputVariables.map((v) => `${v}: string;`).join("\n      ")}
    };
  }>;`
    )
    .join("\n")}
}`;
      })
      .join("\n\n");
  }
}
