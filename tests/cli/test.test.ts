import { TestCommand } from "../../src/cli/commands/test";
import { ConfigManager } from "../../src/core/config/manager";
import { Prompts } from "../../src/cli/services/prompts";
import { mockConfig } from "../__fixtures__/config";
import { setupApiMock } from "../__fixtures__/api";
import fs from "fs";

describe("Test Command", () => {
  const CONFIG_PATH = ".mindstudio.json";
  let testCommand: TestCommand;
  let config: ConfigManager;
  let prompts: Prompts;
  let originalEnv: NodeJS.ProcessEnv;
  const apiMock = setupApiMock();

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };

    // Initialize fresh components
    config = new ConfigManager();
    prompts = new Prompts();
    testCommand = new TestCommand(config, prompts);

    // Reset environment
    delete process.env.MINDSTUDIO_KEY;

    // Reset API mocks
    apiMock.reset();

    // Setup mock config
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(mockConfig));

    // Mock successful API response
    apiMock.mockWorkflowExecution({
      result: "Generated test result",
      billingCost: "0.01",
    });
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;

    // Cleanup files
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("Direct Workflow Execution", () => {
    it("should execute workflow with provided parameters", async () => {
      process.env.MINDSTUDIO_KEY = "test-api-key";

      await testCommand.execute({
        worker: "test-worker",
        workflow: "generateText",
        input: '{"prompt":"Test input"}',
      });

      const apiCalls = apiMock.getHistory().post;
      expect(JSON.parse(apiCalls[0].data)).toMatchObject({
        workerId: "test-worker-id",
        workflow: "generateText",
        variables: { prompt: "Test input" },
      });
    });

    it("should handle invalid JSON input", async () => {
      process.env.MINDSTUDIO_KEY = "test-api-key";
      const consoleSpy = jest.spyOn(console, "error");

      await testCommand.execute({
        worker: "test-worker",
        workflow: "generateText",
        input: "invalid json",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid JSON input:")
      );
    });
  });

  describe("Interactive Workflow Selection", () => {
    it("should prompt for worker and workflow when not provided", async () => {
      process.env.MINDSTUDIO_KEY = "test-api-key";

      jest.spyOn(prompts, "selectWorkerAndWorkflow").mockResolvedValue({
        worker: "test-worker",
        workflow: "generateText",
      });
      jest.spyOn(prompts, "getWorkflowInput").mockResolvedValue({
        prompt: "Interactive input",
      });

      await testCommand.execute({});

      const apiCalls = apiMock.getHistory().post;
      expect(JSON.parse(apiCalls[0].data)).toMatchObject({
        variables: { prompt: "Interactive input" },
      });
    });
  });

  describe("API Key Handling", () => {
    it("should use provided API key", async () => {
      await testCommand.execute({
        key: "custom-api-key",
        worker: "test-worker",
        workflow: "generateText",
        input: "{}",
      });

      const apiCalls = apiMock.getHistory().post;
      expect(apiCalls[0].headers).toHaveProperty(
        "Authorization",
        "Bearer custom-api-key"
      );
    });

    it("should fail gracefully when no API key is available", async () => {
      const consoleSpy = jest.spyOn(console, "error");

      await testCommand.execute({
        worker: "test-worker",
        workflow: "generateText",
        input: "{}",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("API key not found")
      );
    });
  });

  describe("Custom Base URL", () => {
    it("should use custom base URL when provided", async () => {
      process.env.MINDSTUDIO_KEY = "test-api-key";
      const customUrl = "https://custom-api.example.com";

      await testCommand.execute({
        baseUrl: customUrl,
        worker: "test-worker",
        workflow: "generateText",
        input: "{}",
      });

      const apiCalls = apiMock.getHistory().post;
      expect(apiCalls[0].baseURL).toContain(customUrl);
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      process.env.MINDSTUDIO_KEY = "test-api-key";
      apiMock.mockWorkflowExecutionError(new Error("API Error"));
      const consoleSpy = jest.spyOn(console, "error");

      await testCommand.execute({
        worker: "test-worker",
        workflow: "generateText",
        input: '{"prompt": "test"}',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Test failed:")
      );
    });
  });
});
