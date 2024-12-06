"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupApiMock = void 0;
const axios_1 = __importDefault(require("axios"));
const axios_mock_adapter_1 = __importDefault(require("axios-mock-adapter"));
const setupApiMock = () => {
    const mock = new axios_mock_adapter_1.default(axios_1.default);
    return {
        reset: () => mock.reset(),
        mockWorkflowExecution: (response) => {
            mock.onPost("/workers/run").reply(200, response);
        },
        mockWorkflowExecutionError: (error) => {
            mock.onPost("/workers/run").networkError();
        },
        mockWorkerDefinitions: (workers) => {
            mock.onGet("/workers/load").reply(200, {
                apps: workers.map((w) => ({
                    id: w.id,
                    name: w.name,
                    slug: w.slug,
                })),
            });
            workers.forEach((worker) => {
                mock.onGet(`/workers/${worker.id}/workflows`).reply(200, {
                    workflows: worker.workflows,
                });
            });
        },
        mockWorkerDefinitionsError: (error) => {
            mock.onGet("/workers/load").reply(500, error);
        },
        getHistory: () => mock.history,
    };
};
exports.setupApiMock = setupApiMock;
