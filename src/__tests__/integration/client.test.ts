import { MindStudio } from "../../client";
import { ApiMock } from "../setup/apiMock";
import { mockWorkerData } from "../__mocks__/workerData";

describe("MindStudio Client Integration", () => {
  const apiMock = new ApiMock();
  const TEST_API_KEY = process.env.MINDSTUDIO_KEY || "test-api-key-123";

  beforeEach(() => {
    apiMock.reset();
  });

  it("should initialize and execute workflow", async () => {
    // Mock the initial worker load with properly formatted names
    apiMock.mockWorkerLoad([
      {
        id: "test-worker-id",
        name: "Test Worker",
      },
    ]);

    // Mock the workflow load
    apiMock.mockWorkflowLoad("test-worker-id", [
      {
        id: "test-workflow-id",
        name: "Generate Text",
        launchVariables: ["prompt"],
        outputVariables: [],
      },
    ]);

    // Mock the workflow execution
    apiMock.mockWorkflowExecution({
      result: "Generated text",
      billingCost: "0.01",
    });

    // Initialize client
    const client = new MindStudio(TEST_API_KEY);
    await client.init();

    // The client should now have a TestWorker.generateText method
    const result = await client.workers.TestWorker_test.generateText({
      prompt: "Hello world",
    });

    expect(result).toEqual({
      success: true,
      result: "Generated text",
      billingCost: "0.01",
    });
  });
});
