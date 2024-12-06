import { MSWorker } from "@internal/types";

export class TypeGenerator {
  generateTypes(workers: MSWorker[]): string {
    const workerInterfaces = this.generateWorkerInterfaces(workers);
    const workerFunctions = workers.map(
      (w) => `  ${w.toString()}: ${this.getWorkerInterfaceName(w.toString())};`
    );

    return `import { WorkflowFunction } from "../types/client";

${workerInterfaces}

export interface MindStudioWorkers {
${workerFunctions.join("\n")}
}`.trim();
  }

  private generateWorkerInterfaces(workers: MSWorker[]): string {
    return workers
      .map((worker) => {
        const interfaceName = this.getWorkerInterfaceName(worker.toString());

        return `export interface ${interfaceName} {${worker.workflows
          .map((workflow) => {
            const inputType = this.generateInputType(workflow.launchVariables);
            const outputType = this.generateOutputType(
              workflow.outputVariables
            );

            return `\n  ${workflow.toString()}: WorkflowFunction<${inputType}, ${outputType}>;`;
          })
          .join("")}\n}`;
      })
      .join("\n\n");
  }

  private generateInputType(variables: string[]): string {
    return variables.length > 0
      ? `{ ${variables.map((v) => `${v}: string`).join("; ")} }`
      : "void";
  }

  private generateOutputType(variables: string[]): string {
    return variables.length > 0
      ? `{\n    ${variables.map((v) => `${v}: string`).join(";\n    ")}\n  }`
      : "string | undefined";
  }

  private getWorkerInterfaceName(slug: string): string {
    return `${slug}Worker`;
  }
}