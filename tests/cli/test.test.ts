import { TestCommand } from "@cli/commands/test";
import { ConfigManager } from "@core/config/manager";
import { Prompts } from "@cli/services/prompts";
import { mockConfig } from "../__fixtures__/config";
import { setupApiMock } from "../__fixtures__/api";
import fs from "fs";

describe("Test Command Integration", () => {
  const CONFIG_PATH = ".mindstudio.json";
  let testCommand: TestCommand;
  let config: ConfigManager;
  let prompts: Prompts;
  const apiMock = setupApiMock();

  beforeEach(() => {
    // Initialize fresh components
    config = new ConfigManager();
    prompts = new Prompts();
    testCommand = new TestCommand(config, prompts);

    // Setup mock config
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(mockConfig));

    // Reset API mocks
    apiMock.reset();

    // Reset environment
    delete process.env.MINDSTUDIO_KEY;
  });

  afterEach(() => {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
  });

  describe("Direct workflow execution", () => {
    it("should execute workflow with provided parameters", async () => {
      // Mock successful API response
      apiMock.mockWorkflowExecution({
        result: "Generated story about a space cat",
        billingCost: "0.01",
      });

      jest.spyOn(prompts, "getApiKey").mockResolvedValue("test-api-key");

      await testCommand.execute({
        worker: "test-worker",
        workflow: "generateText",
        input: '{"prompt":"Write a story about a space cat"}',
      });

      // Verify console output
      expect(console.log).toHaveBeenCalledWith(
        "Result:",
        expect.stringContaining("Generated story about a space cat")
      );
    });

    it("should handle invalid JSON input gracefully", async () => {
      jest.spyOn(prompts, "getApiKey").mockResolvedValue("test-api-key");

      await testCommand.execute({
        worker: "test-worker",
        workflow: "generateText",
        input: "invalid json",
      });

      expect(console.error).toHaveBeenCalledWith(
        "Invalid JSON input:",
        expect.any(String)
      );
    }, 10000);
  });

  describe("Interactive workflow selection", () => {
    it("should prompt for worker and workflow when not provided", async () => {
      apiMock.mockWorkflowExecution({
        result: "Test result",
        billingCost: "0.01",
      });

      jest.spyOn(prompts, "getApiKey").mockResolvedValue("test-api-key");
      jest.spyOn(prompts, "selectWorkerAndWorkflow").mockResolvedValue({
        worker: "test-worker",
        workflow: "generateText",
      });
      jest.spyOn(prompts, "getWorkflowInput").mockResolvedValue({
        prompt: "Interactive input",
      });

      await testCommand.execute({});

      expect(prompts.selectWorkerAndWorkflow).toHaveBeenCalled();
      expect(prompts.getWorkflowInput).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "Result:",
        expect.stringContaining("Test result")
      );
    });
  });

  describe("API key handling", () => {
    it("should use provided API key", async () => {
      apiMock.mockWorkflowExecution({ result: "Success" });

      const getApiKeySpy = jest.spyOn(prompts, "getApiKey");

      await testCommand.execute({
        key: "custom-api-key",
        worker: "test-worker",
        workflow: "generateText",
        input: "{}",
      });

      expect(getApiKeySpy).toHaveBeenCalledWith("custom-api-key");
    });

    it("should fail gracefully when no API key is available", async () => {
      jest.spyOn(prompts, "getApiKey").mockResolvedValue("");

      await testCommand.execute({
        worker: "test-worker",
        workflow: "generateText",
        input: "{}",
      });

      expect(console.error).toHaveBeenCalledWith(
        "No API key provided. Set MINDSTUDIO_KEY in your environment or .env file"
      );
    });
  });

  describe("Error handling", () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear console mocks
    });

    it("should handle API errors gracefully", async () => {
      apiMock.mockWorkflowExecutionError(new Error("API Error"));
      jest.spyOn(prompts, "getApiKey").mockResolvedValue("test-api-key");

      await testCommand.execute({
        worker: "test-worker",
        workflow: "generateText",
        input: '{"prompt": "test"}',
        key: "test-api-key",
      });

      expect(console.error).toHaveBeenCalledWith(
        "Test failed:",
        expect.any(Error)
      );
    });
  });

  describe("Custom base URL", () => {
    it("should use custom base URL when provided", async () => {
      apiMock.mockWorkflowExecution({ result: "Success" });

      jest.spyOn(prompts, "getApiKey").mockResolvedValue("test-api-key");

      await testCommand.execute({
        baseUrl: "https://custom-api.example.com",
        worker: "test-worker",
        workflow: "generateText",
        input: "{}",
      });

      // Verify the custom base URL was used in the API call
      expect(apiMock.getHistory().post[0].baseURL).toBe(
        "https://custom-api.example.com"
      );
    });
  });
});
