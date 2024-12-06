import { SyncCommand } from "../../src/cli/commands/sync";
import { TypeGenerator } from "../../src/cli/services/generator";
import { ConfigManager } from "../../src/core/config/manager";
import fs from "fs";
import { setupApiMock } from "../__fixtures__/api";
import { mockConfig } from "../__fixtures__/config";

describe("Sync Command", () => {
  const CONFIG_PATH = ".mindstudio.json";
  const TYPES_PATH = "dist/src/generated";

  let syncCommand: SyncCommand;
  let originalEnv: NodeJS.ProcessEnv;
  const apiMock = setupApiMock();

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };

    // Clean test environment
    if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH);
    if (fs.existsSync(TYPES_PATH)) {
      fs.rmSync(TYPES_PATH, { recursive: true, force: true });
    }

    // Reset environment variables
    delete process.env.CI;
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
            name: "Test Workflow",
            slug: "test-workflow",
            launchVariables: ["prompt"],
            outputVariables: ["result"],
          },
        ],
      },
    ]);

    syncCommand = new SyncCommand(new ConfigManager(), new TypeGenerator());
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;

    // Cleanup files
    if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH);
    if (fs.existsSync(TYPES_PATH)) {
      fs.rmSync(TYPES_PATH, { recursive: true, force: true });
    }
  });

  describe("API Key Resolution", () => {
    it("should use API key from environment variable", async () => {
      process.env.MINDSTUDIO_KEY = "test-env-key";

      await syncCommand.execute({});

      // Verify successful sync by checking config exists and content
      expect(fs.existsSync(CONFIG_PATH)).toBeTruthy();
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      expect(config.workers[0].name).toBe("Test Worker");
    });

    it("should use API key from command line argument", async () => {
      await syncCommand.execute({ key: "test-cli-key" });

      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      expect(config.workers[0].slug).toBe("test-worker");
    });

    it("should fail when no API key is available", async () => {
      const consoleSpy = jest.spyOn(console, "error");

      await syncCommand.execute({});

      expect(fs.existsSync(CONFIG_PATH)).toBeFalsy();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("API key error")
      );
    });
  });

  describe("Offline Mode", () => {
    beforeEach(() => {
      // Create types directory only for successful cases
      if (!fs.existsSync(TYPES_PATH)) {
        fs.mkdirSync(TYPES_PATH, { recursive: true });
      }
    });

    it("should generate types from existing config in offline mode", async () => {
      // Setup existing config
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(mockConfig));

      await syncCommand.execute({ offline: true });

      expect(fs.existsSync(TYPES_PATH)).toBeTruthy();
      const generatedTypes = fs.readFileSync(
        `${TYPES_PATH}/workers.d.ts`,
        "utf-8"
      );
      expect(generatedTypes).toContain("export interface MindStudioWorkers");
    });

    it("should work in CI environment without API key", async () => {
      // Setup existing config
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(mockConfig));
      process.env.CI = "true";

      await syncCommand.execute({});

      expect(fs.existsSync(TYPES_PATH)).toBeTruthy();
    });

    it("should fail gracefully with invalid config", async () => {
      // Remove types directory to test failure case
      if (fs.existsSync(TYPES_PATH)) {
        fs.rmSync(TYPES_PATH, { recursive: true });
      }

      fs.writeFileSync(CONFIG_PATH, "invalid json");
      const consoleSpy = jest.spyOn(console, "error");

      await syncCommand.execute({ offline: true });

      expect(fs.existsSync(TYPES_PATH)).toBeFalsy();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Try running with full sync")
      );
    });
  });

  describe("Configuration Updates", () => {
    it("should create new config when none exists", async () => {
      process.env.MINDSTUDIO_KEY = "test-key";

      await syncCommand.execute({});

      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      expect(config).toHaveProperty("version");
      expect(config.workers[0].name).toBe("Test Worker");
    });

    it("should update existing config while preserving structure", async () => {
      // Setup existing config
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(mockConfig));
      process.env.MINDSTUDIO_KEY = "test-key";

      await syncCommand.execute({});

      const updatedConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      expect(updatedConfig).toHaveProperty("version", mockConfig.version);
      expect(updatedConfig.workers[0].name).toBe("Test Worker");
    });
  });

  describe("Custom Options", () => {
    it("should handle custom base URL", async () => {
      process.env.MINDSTUDIO_KEY = "test-key";
      const customUrl = "https://custom-api.example.com";

      await syncCommand.execute({
        baseUrl: customUrl,
      });

      // Check if the API was called with the custom base URL
      const apiCalls = apiMock.getHistory().get;
      expect(apiCalls.some((call) => call.baseURL === customUrl)).toBeTruthy();
      expect(fs.existsSync(CONFIG_PATH)).toBeTruthy();
    });
  });

  describe("Type Generation", () => {
    beforeEach(() => {
      // Create types directory
      if (!fs.existsSync(TYPES_PATH)) {
        fs.mkdirSync(TYPES_PATH, { recursive: true });
      }
    });

    it("should generate correct type definitions with JSDoc comments", async () => {
      process.env.MINDSTUDIO_KEY = "test-key";
      await syncCommand.execute({});

      const types = fs.readFileSync(`${TYPES_PATH}/workers.d.ts`, "utf-8");

      // Check header
      expect(types).toContain("* Available MindStudio Workers");
      expect(types).toContain("* Run 'npx mindstudio list'");

      // Check worker documentation
      expect(types).toContain("/** Test Worker */");

      // Check workflow documentation
      expect(types).toContain("* Test Workflow");
      expect(types).toContain("* @param input.prompt - Input variable");
      expect(types).toContain("* @returns result.result - Output variable");

      // Check type definitions
      expect(types).toContain("export interface TestWorkerWorker {");
      expect(types).toContain("testWorkflow: WorkflowFunction<");
      expect(types).toContain("{ prompt: string }");
      expect(types).toContain("result: string");
    });

    it("should handle workers with no variables", async () => {
      // Mock worker with no variables
      apiMock.mockWorkerDefinitions([
        {
          id: "test-id",
          name: "Empty Worker",
          slug: "empty-worker",
          workflows: [
            {
              id: "wf-id",
              name: "Empty Workflow",
              slug: "empty",
              launchVariables: [],
              outputVariables: [],
            },
          ],
        },
      ]);

      process.env.MINDSTUDIO_KEY = "test-key";
      await syncCommand.execute({});

      const types = fs.readFileSync(`${TYPES_PATH}/workers.d.ts`, "utf-8");
      expect(types).toContain("EmptyWorker: EmptyWorkerWorker");
    });
  });
});
