"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeGenerator = void 0;
class TypeGenerator {
    generateTypes(workers) {
        const workerInterfaces = this.generateWorkerInterfaces(workers);
        const workerFunctions = workers.map((w) => `  /** ${w.name} */
  ${w.toString()}: ${this.getWorkerInterfaceName(w.toString())};`);
        return `import { WorkflowFunction } from "../types";

/**
 * Available MindStudio Workers
 * Run 'npx mindstudio list' to see all available workers
 */
${workerInterfaces}

export interface MindStudioWorkers {
${workerFunctions.join("\n")}
}`.trim();
    }
    generateWorkerInterfaces(workers) {
        return workers
            .map((worker) => {
            const interfaceName = this.getWorkerInterfaceName(worker.toString());
            return `export interface ${interfaceName} {${worker.workflows
                .map((workflow) => {
                const inputType = this.generateInputType(workflow.launchVariables);
                const outputType = this.generateOutputType(workflow.outputVariables);
                return `
  /** 
   * ${workflow.name}
   * @param input - Required variables
   ${workflow.launchVariables.map((v) => `* @param input.${v} - Input variable`).join("\n   ")}
   * @returns Result object
   ${workflow.outputVariables.map((v) => `* @returns result.${v} - Output variable`).join("\n   ")}
   */
  ${workflow.toString()}: WorkflowFunction<${inputType}, ${outputType}>;`;
            })
                .join("")}\n}`;
        })
            .join("\n\n");
    }
    generateInputType(variables) {
        return variables.length > 0
            ? `{ ${variables.map((v) => `${v}: string`).join("; ")} }`
            : "void";
    }
    generateOutputType(variables) {
        return variables.length > 0
            ? `{\n    ${variables.map((v) => `${v}: string`).join(";\n    ")}\n  }`
            : "string | undefined";
    }
    getWorkerInterfaceName(slug) {
        return `${slug}Worker`;
    }
}
exports.TypeGenerator = TypeGenerator;
