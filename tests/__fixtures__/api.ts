import axios from "axios";
import MockAdapter from "axios-mock-adapter";

export interface ApiMock {
  reset: () => void;
  mockWorkflowExecution: (response: any) => void;
  mockWorkflowExecutionError: (error: Error) => void;
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
      mock.onPost("/workers/run").networkError();
    },
    getHistory: () => mock.history,
  };
};
