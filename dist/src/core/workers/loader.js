"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerLoader = void 0;
const manager_1 = require("@core/config/manager");
const types_1 = require("@core/types");
class WorkerLoader {
    constructor(runFn) {
        this.runFn = runFn;
        this.configManager = new manager_1.ConfigManager();
    }
    loadFromConfig() {
        try {
            const config = this.configManager.readConfig();
            const workers = this.createWorkerWorkflows(config);
            return this.createWorkerFunctions(workers);
        }
        catch (error) {
            return undefined;
        }
    }
    createWorkerWorkflows(config) {
        return config.workers.map((worker) => new types_1.Worker(worker.id, worker.name, worker.slug, worker.workflows.map((workflow) => new types_1.Workflow(workflow.id, workflow.name, workflow.slug, workflow.launchVariables, workflow.outputVariables, worker))));
    }
    createWorkerFunctions(workers) {
        return workers.reduce((acc, worker) => {
            acc[worker.slug] = worker.workflows.reduce((workflowAcc, workflow) => {
                workflowAcc[workflow.slug] = this.createWorkflowFunction(worker, workflow);
                return workflowAcc;
            }, {});
            return acc;
        }, {});
    }
    createWorkflowFunction(worker, workflow) {
        const fn = async (variables) => {
            return this.runFn({
                workerId: worker.id,
                workflow: workflow.slug,
                variables: variables || {},
            });
        };
        fn.__info = {
            ...workflow,
            worker: {
                id: worker.id,
                name: worker.name,
                slug: worker.slug,
            },
        };
        return fn;
    }
}
exports.WorkerLoader = WorkerLoader;
