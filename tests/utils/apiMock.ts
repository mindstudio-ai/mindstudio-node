import axios from "axios";
import MockAdapter from "axios-mock-adapter";

export class ApiMock {
  private mock: MockAdapter;

  constructor() {
    this.mock = new MockAdapter(axios);
  }

  reset() {
    this.mock.reset();
  }

  mockWorkflowExecution(response: any) {
    this.mock.onPost("/workers/run").reply(200, response);
  }

  mockWorkflowExecutionError(error: Error) {
    this.mock.onPost("/workers/run").reply(400, {
      error: error.message,
    });
  }

  mockWorkerLoad(workers: any) {
    this.mock.onGet("/workers/load").reply(200, { apps: workers });
  }

  mockWorkflowLoad(workerId: string, workflows: any) {
    this.mock.onGet(`/workers/${workerId}/workflows`).reply(200, {
      workflows,
    });
  }
}
