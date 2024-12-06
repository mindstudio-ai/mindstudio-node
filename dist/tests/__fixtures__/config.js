"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockWorkers = exports.mockConfig = void 0;
const types_1 = require("@core/types");
const workerData = {
    id: "test-worker-id",
    name: "Test Worker",
    slug: "test-worker",
};
exports.mockConfig = {
    version: "1.0.0",
    workers: [
        {
            id: "test-worker-id",
            name: "Test Worker",
            slug: "test-worker",
            workflows: [
                {
                    id: "test-workflow-id",
                    name: "Generate Text",
                    slug: "generateText",
                    launchVariables: ["prompt"],
                    outputVariables: ["text"],
                },
            ],
        },
    ],
};
// For use with WorkerDiscoveryService mocks
exports.mockWorkers = [
    new types_1.Worker(exports.mockConfig.workers[0].id, exports.mockConfig.workers[0].name, exports.mockConfig.workers[0].slug, exports.mockConfig.workers[0].workflows.map((wf) => new types_1.Workflow(wf.id, wf.name, wf.slug, wf.launchVariables, wf.outputVariables, exports.mockConfig.workers[0]))),
];
