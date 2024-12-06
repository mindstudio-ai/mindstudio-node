"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MindStudio = void 0;
const client_1 = require("@core/http/client");
const loader_1 = require("@core/workers/loader");
const keyManager_1 = require("./core/auth/keyManager");
const errors_1 = require("./errors");
class MindStudio {
    constructor(apiKey, options) {
        this.apiKey = keyManager_1.KeyManager.resolveKey(apiKey);
        this.httpClient = new client_1.HttpClient(this.apiKey, {
            baseUrl: options === null || options === void 0 ? void 0 : options.baseUrl,
        });
        this.workerLoader = new loader_1.WorkerLoader(this.run.bind(this));
        this._workers = this.workerLoader.loadFromConfig();
    }
    /**
     * Type-safe worker access - only available if types are generated
     */
    get workers() {
        if (!this._workers) {
            throw new errors_1.MindStudioError("Type-safe workers not available. Run 'npx mindstudio sync' first to generate types.", "types_not_generated", 400);
        }
        return this._workers;
    }
    /**
     * Direct worker execution without type safety
     */
    async run(params) {
        try {
            const response = await this.httpClient.post("/workers/run", {
                workerId: params.workerId,
                workflow: params.workflow,
                variables: params.variables || {},
            });
            return {
                success: true,
                result: response.result,
                billingCost: response.billingCost,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
}
exports.MindStudio = MindStudio;
