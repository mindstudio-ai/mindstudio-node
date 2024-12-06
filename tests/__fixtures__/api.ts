import axios from "axios";
import MockAdapter from "axios-mock-adapter";

export interface ApiMock {
  reset: () => void;
  mockWorkflowExecution: (response: any) => void;
  mockWorkflowExecutionError: (error: Error) => void;
  mockWorkerDefinitions: (workers: any[]) => void;
  mockWorkerDefinitionsError: (error: Error) => void;
  getHistory: () => MockAdapter["history"];
}

export const setupApiMock = (): ApiMock => {
  const mock = new MockAdapter(axios);

  return {
    reset: () => mock.reset(),
    mockWorkflowExecution: (response: any) => {
      mock.onPost("/workers/run").reply(200, response);
    },
    mockWorkflowExecutionError: (error: Error) => {
      mock.onPost("/workers/run").reply(400, {
        message: error.message,
        code: "workflow_error",
      });
    },
    mockWorkerDefinitions: (workers: any[]) => {
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
    mockWorkerDefinitionsError: (error: Error) => {
      mock.onGet("/workers/load").reply(500, error);
    },
    getHistory: () => mock.history,
  };
};
