import { Workflow, Worker } from "../../src/core/types";

const workerData = {
  id: "test-worker-id",
  name: "Test Worker",
  slug: "test-worker",
};

export const mockConfig = {
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
export const mockWorkers = [
  new Worker(
    mockConfig.workers[0].id,
    mockConfig.workers[0].name,
    mockConfig.workers[0].slug,
    mockConfig.workers[0].workflows.map(
      (wf) =>
        new Workflow(
          wf.id,
          wf.name,
          wf.slug,
          wf.launchVariables,
          wf.outputVariables,
          mockConfig.workers[0]
        )
    )
  ),
];
