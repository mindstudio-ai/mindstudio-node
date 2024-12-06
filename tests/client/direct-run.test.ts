import { MindStudio } from "../../src/client";
import { setupApiMock } from "../__fixtures__/api";

describe("Direct Workflow Execution", () => {
  const apiMock = setupApiMock();
  const TEST_API_KEY = "test-api-key-123";
  let client: MindStudio;

  beforeEach(() => {
    apiMock.reset();
    client = new MindStudio(TEST_API_KEY);
  });

  it("should execute workflow successfully", async () => {
    apiMock.mockWorkflowExecution({
      result: "Generated text",
      billingCost: "0.01",
    });

    const result = await client.run({
      workerId: "test-worker",
      workflow: "generateText",
      variables: { prompt: "Hello" },
    });

    expect(result).toEqual({
      success: true,
      result: "Generated text",
      billingCost: "0.01",
    });
  });

  it("should handle workflow execution errors", async () => {
    apiMock.mockWorkflowExecutionError(new Error("Workflow failed"));

    const result = await client.run({
      workerId: "test-worker",
      workflow: "generateText",
      variables: { prompt: "Hello" },
    });

    expect(result).toEqual({
      success: false,
      error: expect.any(Error),
    });
  });
});