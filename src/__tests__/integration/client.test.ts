import { MindStudio } from "../../client";
import { MindStudioError } from "../../errors";
import { ApiMock } from "../setup/apiMock";
import { ConfigManager } from "../../cli/config";

describe("MindStudio Client", () => {
  const apiMock = new ApiMock();
  const TEST_API_KEY = "test-api-key";

  beforeEach(() => {
    apiMock.reset();
  });

  describe("Client Initialization", () => {
    it("should throw error when API key is missing", () => {
      expect(() => new MindStudio("")).toThrow(MindStudioError);
      expect(() => new MindStudio("")).toThrow("API key is required");
    });

    it("should initialize with custom base URL", () => {
      const client = new MindStudio(TEST_API_KEY, {
        baseUrl: "https://custom-api.example.com",
      });
      expect(client).toBeInstanceOf(MindStudio);
    });
  });

  describe("Workflow Execution", () => {
    let client: MindStudio;

    beforeEach(() => {
      client = new MindStudio(TEST_API_KEY);
    });

    it("should execute workflow with direct run method", async () => {
      apiMock.mockWorkflowExecution({
        result: "Generated text",
        billingCost: "0.01",
      });

      const result = await client.run({
        workerId: "test-worker",
        workflow: "generateText",
        variables: { prompt: "Hello world" },
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
        variables: { prompt: "Hello world" },
      });

      expect(result).toEqual({
        success: false,
        error: expect.any(Error),
      });
    });
  });

  describe("Type-Safe Workflow Execution", () => {
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

    afterEach(() => {
      configManager.clean();
    });

    it("should execute workflow with type definitions", async () => {
      apiMock.mockWorkflowExecution({
        result: "Generated text",
        billingCost: "0.01",
      });

      const client = new MindStudio(TEST_API_KEY);
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
});
