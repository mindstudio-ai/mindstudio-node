import axios from "axios";
import MockAdapter from "axios-mock-adapter";

export const setupApiMock = () => {
  const mock = new MockAdapter(axios);

  return {
    reset: () => mock.reset(),
    mockWorkflowExecution: (response: any) => {
      mock.onPost("/workers/run").reply(200, response);
    },
    mockWorkflowExecutionError: (error: Error) => {
      mock.onPost("/workers/run").reply(400, { error: error.message });
    },
  };
};
