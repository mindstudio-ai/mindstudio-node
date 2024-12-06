import { MindStudio } from "../../src/client";
import fs from "fs";
import { setupApiMock } from "../__fixtures__/api";
import { mockConfig } from "../__fixtures__/config";

describe("Type-Safe Workflow Execution", () => {
  const apiMock = setupApiMock();
  const TEST_API_KEY = "test-api-key-123";
  const CONFIG_PATH = ".mindstudio.json";

  beforeEach(() => {
    apiMock.reset();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(mockConfig));
  });

  afterEach(() => {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
  });

  it("should execute workflow with type definitions", async () => {
    apiMock.mockWorkflowExecution({
      result: "Generated text",
      billingCost: "0.01",
    });

    const client = new MindStudio(TEST_API_KEY);
    const result = await client.workers["test-worker"].generateText({
      prompt: "Hello",
    });

    expect(result).toEqual({
      success: true,
      result: "Generated text",
      billingCost: "0.01",
    });
  });

  it("should throw error when type definitions are not available", async () => {
    fs.unlinkSync(CONFIG_PATH);
    const client = new MindStudio(TEST_API_KEY);

    expect(() => client.workers).toThrow(
      "Type-safe workers not available. Run 'npx mindstudio sync' first to generate types."
    );
  });
});
