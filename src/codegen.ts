import { MSWorker } from "./types";

export class TypeGenerator {
  generateTypes(workers: MSWorker[]): string {
    return `
import { 
  WorkflowResponse,
  WorkflowFunction,
} from "./types";

// Type for workflows with output variables
export type OutputVarsResponse<T extends Record<string, string>> = WorkflowResponse<T>;

// Type for workflows without output variables
export type StringResponse = WorkflowResponse<string | undefined>;

${this.generateWorkerInterfaces(workers)}

export interface MindStudioWorkers {
  ${workers.map((w) => `${w.toString()}: ${this.getWorkerInterfaceName(w.toString())};`).join("\n  ")}
}
`.trim();
  }

  private generateWorkerInterfaces(workers: MSWorker[]): string {
    return workers
      .map((worker) => {
        const interfaceName = this.getWorkerInterfaceName(worker.toString());

        return `
export interface ${interfaceName} {
  ${worker.workflows
    .map((workflow) => {
      const launchVars = workflow.launchVariables
        .map((v) => `${v}: string;`)
        .join("\n    ");

      // Generate input type
      const inputType = `{ ${launchVars} }`;

      // Generate output type based on output variables
      let outputType: string;
      if (workflow.outputVariables.length > 0) {
        const outputVars = workflow.outputVariables
          .map((v) => `${v}: string;`)
          .join("\n      ");
        outputType = `OutputVarsResponse<{
      ${outputVars}
    }>`;
      } else {
        outputType = "StringResponse";
      }

      return `
  ${workflow.toString()}: WorkflowFunction<${inputType}, ${outputType}>;`;
    })
    .join("\n")}
}`;
      })
      .join("\n\n");
  }

  private getWorkerInterfaceName(slug: string): string {
    return `${slug}Worker`;
  }
}
