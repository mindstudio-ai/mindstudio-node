import { MSWorker, MSWorkflow, Worker, Workflow } from "../../types";

export const createTestWorker = (
  id: string = "test-worker-id",
  name: string = "Test Worker",
  slug: string = "test-worker"
): MSWorker => new Worker(id, name, slug, []);

export const createTestWorkflow = (
  id: string = "test-workflow-id",
  name: string = "Generate Text",
  slug: string = "generateText",
  launchVariables: string[] = ["prompt"],
  worker: Pick<MSWorker, "id" | "name" | "slug"> = {
    id: "test-worker-id",
    name: "Test Worker",
    slug: "test-worker",
  }
): MSWorkflow =>
  new Workflow(
    id,
    name,
    slug,
    launchVariables,
    [], // outputVariables
    worker
  );

export const mockConfigWithWorker = {
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
          outputVariables: [],
          worker: {
            id: "test-worker-id",
            name: "Test Worker",
            slug: "test-worker",
          },
        },
      ],
    },
  ],
};
