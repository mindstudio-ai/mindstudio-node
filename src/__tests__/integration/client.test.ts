import { MindStudio } from "../../client";
import { ApiMock } from "../setup/apiMock";
import { ConfigManager } from "../../cli/config";

describe("MindStudio Client Integration", () => {
  const apiMock = new ApiMock();
  const TEST_API_KEY = process.env.MINDSTUDIO_KEY || "test-api-key-123";

  beforeEach(() => {
    apiMock.reset();
  });

  describe("Direct Execution", () => {
    it("should execute workflow without type definitions", async () => {
      apiMock.mockWorkflowExecution({
        result: "Generated text",
        billingCost: "0.01",
      });

      const client = new MindStudio(TEST_API_KEY);
      const result = await client.run({
        workerId: "test-worker-id",
        workflow: "generateText",
        variables: {
          prompt: "Hello world",
        },
      });

      expect(result).toEqual({
        success: true,
        result: "Generated text",
        billingCost: "0.01",
      });
    });

    it("should handle execution errors gracefully", async () => {
      apiMock.mockWorkflowExecutionError(new Error("Execution failed"));

      const client = new MindStudio(TEST_API_KEY);
      const result = await client.run({
        workerId: "test-worker-id",
        workflow: "generateText",
        variables: {
          prompt: "Hello world",
        },
      });

      expect(result).toEqual({
        success: false,
        error: expect.any(Error),
      });
    });
  });

  describe("Type-Safe Execution", () => {
    let configManager: ConfigManager;

    beforeEach(() => {
      configManager = new ConfigManager();
      configManager.write({
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
              },
            ],
          },
        ],
      });
    });

    it("should execute workflow with type definitions", async () => {
      apiMock.mockWorkflowExecution({
        result: "Generated text",
        billingCost: "0.01",
      });

      const client = new MindStudio(TEST_API_KEY);

      console.log(client.workers);
      const result = await client.workers["test-worker"].generateText({
        prompt: "Hello world",
      });

      expect(result).toEqual({
        success: true,
        result: "Generated text",
        billingCost: "0.01",
      });
    });

    it("should throw error when type definitions are not available", async () => {
      configManager.clean();

      const client = new MindStudio(TEST_API_KEY);

      expect(() => client.workers).toThrow(
        "Type-safe workers not available. Run 'npx mindstudio sync' first to generate types."
      );
    });
  });

  describe("Client Initialization", () => {
    it("should throw error when API key is missing", () => {
      expect(() => new MindStudio("")).toThrow("API key is required");
    });

    it("should accept custom base URL", async () => {
      apiMock.mockWorkflowExecution({
        result: "Generated text",
        billingCost: "0.01",
      });

      const client = new MindStudio(TEST_API_KEY, {
        baseUrl: "https://custom-api.mindstudio.ai",
      });

      const result = await client.run({
        workerId: "test-worker-id",
        workflow: "generateText",
        variables: { prompt: "Hello" },
      });

      expect(result.success).toBe(true);
    });
  });
});
