import { MindStudio } from "../../src/public/client";
import { MindStudioError } from "../../src/public/errors";
import { setupApiMock } from "../utils/mocks/api";
import { mockConfig } from "../utils/mocks/config";
import fs from "fs";

describe("MindStudio Client", () => {
  const apiMock = setupApiMock();
  const TEST_API_KEY = "test-api-key-123";
  const CONFIG_PATH = ".mindstudio.json";

  beforeEach(() => {
    apiMock.reset();
  });

  afterEach(() => {
    // Clean up config file after each test
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
  });

  describe("initialization", () => {
    it("should throw error when API key is missing", () => {
      expect(() => new MindStudio("")).toThrow("API key is required");
    });

    it("should initialize with custom base URL", () => {
      const client = new MindStudio(TEST_API_KEY, {
        baseUrl: "https://custom-api.example.com",
      });
      expect(client).toBeInstanceOf(MindStudio);
    });
  });

  describe("workflow execution", () => {
    let client: MindStudio;

    beforeEach(() => {
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

  describe("type-safe workflow execution", () => {
    beforeEach(() => {
      // Write mock config
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(mockConfig));
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
});
