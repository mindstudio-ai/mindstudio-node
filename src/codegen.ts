import { MSWorker } from "./types";

export class TypeGenerator {
  generateTypes(workers: MSWorker[]): string {
    const workerInterfaces = this.generateWorkerInterfaces(workers);
    const workerFunctions = workers.map(
      (w) => `  ${w.toString()}: ${this.getWorkerInterfaceName(w.toString())};`
    );

    return `import { OutputVarsResponse, StringResponse, WorkflowFunction } from "./types";

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
            // Generate input type based on launch variables
            let inputType =
              workflow.launchVariables.length > 0
                ? `{ ${workflow.launchVariables.map((v) => `${v}: string`).join("; ")} }`
                : "void";

            // Generate output type based on output variables
            let outputType =
              workflow.outputVariables.length > 0
                ? `{
    ${workflow.outputVariables.map((v) => `${v}: string`).join(";\n    ")}
  }`
                : "string | undefined";

            return `\n  ${workflow.toString()}: WorkflowFunction<${inputType}, ${outputType}>;`;
          })
          .join("")}\n}`;
      })
      .join("\n\n");
  }

  private getWorkerInterfaceName(slug: string): string {
    return `${slug}Worker`;
  }
}
