"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerDiscoveryService = void 0;
const client_1 = require("@core/http/client");
const types_1 = require("@core/types");
class WorkerDiscoveryService {
    static async fetchWorkerDefinitions(apiKey, baseUrl) {
        const httpClient = new client_1.HttpClient(apiKey, { baseUrl });
        const workers = await httpClient.get("/workers/load");
        return await Promise.all(workers.apps.map(async (workerData) => {
            const workflowData = await httpClient.get(`/workers/${workerData.id}/workflows`);
            return new types_1.Worker(workerData.id, workerData.name, workerData.slug, workflowData.workflows.map((wf) => new types_1.Workflow(wf.id, wf.name, wf.slug, wf.launchVariables, wf.outputVariables, workerData)));
        }));
    }
}
exports.WorkerDiscoveryService = WorkerDiscoveryService;
