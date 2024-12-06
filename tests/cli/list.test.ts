import { ListCommand } from "../../src/cli/commands/list";
import { ConfigManager } from "../../src/core/config/manager";
import fs from "fs";
import { setupApiMock } from "../__fixtures__/api";
import { mockConfig } from "../__fixtures__/config";

describe("List Command", () => {
  const CONFIG_PATH = ".mindstudio.json";
  let listCommand: ListCommand;
  let originalEnv: NodeJS.ProcessEnv;
  const apiMock = setupApiMock();

  beforeEach(() => {
    // Clean up any existing files first
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }

    // Save original env
    originalEnv = { ...process.env };

    // Initialize fresh components
    listCommand = new ListCommand(new ConfigManager());

    // Reset environment
    delete process.env.MINDSTUDIO_KEY;

    // Reset API mocks
    apiMock.reset();

    // Mock successful API response
    apiMock.mockWorkerDefinitions([
      {
        id: "test-id",
        name: "Test Worker",
        slug: "test-worker",
        workflows: [
          {
            id: "wf-id",
            name: "Generate Text",
            slug: "generateText",
            launchVariables: ["prompt"],
            outputVariables: ["text"],
          },
        ],
      },
    ]);

    // Clear all console mocks
    jest.clearAllMocks();
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
    apiMock.reset();
  });

  describe("Configuration Based Listing", () => {
    it("should list workers from existing configuration", async () => {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(mockConfig));
      const consoleSpy = jest.spyOn(console, "log");

      await listCommand.execute({});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("📦 Available Workers")
      );
      expect(consoleSpy).toHaveBeenCalledWith("\x1b[1mTest Worker\x1b[0m");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("workers.TestWorker")
      );
    });

    it("should show input and output variables", async () => {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(mockConfig));
      const consoleSpy = jest.spyOn(console, "log");

      await listCommand.execute({});

      // Check for function signature with input
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("generateText({ prompt })")
      );
      // Check for return type
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Returns: { text }")
      );
    });
  });

  describe("API Based Listing", () => {
    it("should fetch and list workers from API when no config exists", async () => {
      process.env.MINDSTUDIO_KEY = "test-api-key";
      const consoleSpy = jest.spyOn(console, "log");

      await listCommand.execute({});

      const apiCalls = apiMock.getHistory().get;
      expect(apiCalls[0].url).toBe("/workers/load");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Test Worker")
      );
    });

    it("should use provided API key", async () => {
      await listCommand.execute({ key: "custom-api-key" });

      const apiCalls = apiMock.getHistory().get;
      expect(apiCalls[0].headers).toHaveProperty(
        "Authorization",
        "Bearer custom-api-key"
      );
    });

    it("should use custom base URL when provided", async () => {
      process.env.MINDSTUDIO_KEY = "test-api-key";
      const customUrl = "https://custom-api.example.com";

      await listCommand.execute({ baseUrl: customUrl });

      const apiCalls = apiMock.getHistory().get;
      expect(apiCalls[0].baseURL).toBe(customUrl);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing API key gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      await listCommand.execute({});
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to list workers")
      );
    });

    it("should handle API errors gracefully", async () => {
      process.env.MINDSTUDIO_KEY = "test-api-key";
      apiMock.mockWorkerDefinitionsError(new Error("API Error"));
      const consoleSpy = jest.spyOn(console, "error");

      await listCommand.execute({});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to list workers")
      );
    });

    it("should handle invalid configuration gracefully", async () => {
      fs.writeFileSync(CONFIG_PATH, "invalid json");
      const consoleSpy = jest.spyOn(console, "error");

      await listCommand.execute({});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to list workers")
      );
    });
  });

  describe("Verbose Logging", () => {
    it("should show debug logs when verbose flag is enabled", async () => {
      process.env.MINDSTUDIO_KEY = "test-api-key";
      const consoleSpy = jest.spyOn(console, "log");

      await listCommand.execute({ verbose: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("🔍 Debug: Checking for existing configuration")
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "🔍 Debug: No configuration found, fetching from API"
        )
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("🔍 Debug: API key resolved")
      );
    });

    it("should not show debug logs when verbose flag is disabled", async () => {
      process.env.MINDSTUDIO_KEY = "test-api-key";
      const consoleSpy = jest.spyOn(console, "log");

      await listCommand.execute({ verbose: false });

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("🔍 Debug:")
      );
    });

    it("should show detailed error information in verbose mode", async () => {
      process.env.MINDSTUDIO_KEY = "test-api-key";
      const testError = new Error("Detailed API Error");
      testError.stack = "Error: Detailed API Error\n    at Test.stack";
      apiMock.mockWorkerDefinitionsError(testError);
      const consoleSpy = jest.spyOn(console, "error");

      await listCommand.execute({ verbose: true });

      const allCalls = consoleSpy.mock.calls.flat().join("\n");
      expect(allCalls).toContain("Request failed with status code 500");
    });
  });
});
