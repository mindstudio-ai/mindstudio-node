"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCommand = void 0;
const client_1 = require("@mindstudio/client");
const keyManager_1 = require("@core/auth/keyManager");
class TestCommand {
    constructor(config, prompts) {
        this.config = config;
        this.prompts = prompts;
    }
    async execute(options) {
        try {
            const config = this.config.readConfig();
            const apiKey = keyManager_1.KeyManager.resolveKey(options.key);
            const client = new client_1.MindStudio(apiKey, {
                baseUrl: options.baseUrl,
            });
            const { worker, workflow } = options.worker && options.workflow
                ? { worker: options.worker, workflow: options.workflow }
                : await this.prompts.selectWorkerAndWorkflow(config);
            const input = options.input
                ? JSON.parse(options.input)
                : await this.prompts.getWorkflowInput(config, worker, workflow);
            const result = await client.workers[worker][workflow](input);
            if (!result.success) {
                throw result.error;
            }
            console.log("Result:", JSON.stringify(result, null, 2));
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                console.error("Invalid JSON input:\n" + error.message);
            }
            else if (error instanceof Error) {
                console.error("Test failed:\n" + error.message);
            }
            else {
                console.error("Test failed:", error);
            }
        }
    }
}
exports.TestCommand = TestCommand;
