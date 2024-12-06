"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prompts = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
class Prompts {
    async selectWorkerAndWorkflow(config) {
        const { worker } = await inquirer_1.default.prompt([
            {
                type: "list",
                name: "worker",
                message: "Select a worker:",
                choices: Object.keys(config.workers),
            },
        ]);
        const { workflow } = await inquirer_1.default.prompt([
            {
                type: "list",
                name: "workflow",
                message: "Select a workflow:",
                choices: Object.keys(config.workers[worker].workflows),
            },
        ]);
        return { worker, workflow };
    }
    async getWorkflowInput(config, worker, workflow) {
        var _a;
        const workflowConfig = (_a = config.workers
            .find(({ id }) => id === worker)) === null || _a === void 0 ? void 0 : _a.workflows.find(({ id }) => id === workflow);
        const input = {};
        for (const key of (workflowConfig === null || workflowConfig === void 0 ? void 0 : workflowConfig.launchVariables) || []) {
            const { value } = await inquirer_1.default.prompt([
                {
                    type: "input",
                    name: "value",
                    message: `Enter value for ${key}:`,
                },
            ]);
            input[key] = value;
        }
        return input;
    }
}
exports.Prompts = Prompts;
