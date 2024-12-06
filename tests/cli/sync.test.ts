import { ConfigManager } from "@core/config/manager";
import { Worker, Workflow } from "@core/types";
import fs from "fs";
import { SyncCommand } from "@cli/commands/sync";
import { Prompts } from "@cli/services/prompts";
import { WorkerDiscoveryService } from "@cli/services/discovery";
import { TypeGenerator } from "@cli/services/generator";
import { mockWorkers, mockConfig } from "../__fixtures__/config";

describe("Sync Command Integration", () => {
  const CONFIG_PATH = ".mindstudio.json";
  const TYPES_PATH = "dist/src/generated";

  let syncCommand: SyncCommand;
  let config: ConfigManager;
  let typeGenerator: TypeGenerator;
  let prompts: Prompts;

  beforeEach(() => {
    // Clear any existing files
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
    if (fs.existsSync(TYPES_PATH)) {
      fs.rmSync(TYPES_PATH, { recursive: true, force: true });
    }

    // Initialize components
    config = new ConfigManager();
    typeGenerator = new TypeGenerator();
    prompts = new Prompts();
    syncCommand = new SyncCommand(config, typeGenerator, prompts);

    // Reset environment
    delete process.env.CI;
    delete process.env.MINDSTUDIO_KEY;
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
    if (fs.existsSync(TYPES_PATH)) {
      fs.rmSync(TYPES_PATH, { recursive: true, force: true });
    }
  });

  describe("First-time setup", () => {
    it("should initialize workspace when no config exists", async () => {
      // Mock API key prompt
      jest.spyOn(prompts, "getApiKey").mockResolvedValue("test-api-key");

      // Mock worker discovery
      jest
        .spyOn(WorkerDiscoveryService, "fetchWorkerDefinitions")
        .mockResolvedValue(mockWorkers);

      await syncCommand.execute({});

      // Verify config file was created
      expect(fs.existsSync(CONFIG_PATH)).toBeTruthy();
      const savedConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      expect(savedConfig).toEqual(mockConfig);

      // Verify types were generated
      expect(fs.existsSync(TYPES_PATH)).toBeTruthy();
    });

    it("should fail gracefully when no API key is provided", async () => {
      jest.spyOn(prompts, "getApiKey").mockResolvedValue("");

      await syncCommand.execute({});

      expect(fs.existsSync(CONFIG_PATH)).toBeFalsy();
      expect(fs.existsSync(TYPES_PATH)).toBeFalsy();
    });
  });

  describe("Offline mode", () => {
    let fetchWorkersSpy = jest.spyOn(
      WorkerDiscoveryService,
      "fetchWorkerDefinitions"
    );

    beforeEach(() => {
      // Create existing config
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(mockConfig));

      fetchWorkersSpy.mockReset();
    });

    it("should generate types from existing config in offline mode", async () => {
      await syncCommand.execute({ offline: true });

      expect(fs.existsSync(TYPES_PATH)).toBeTruthy();
      // No API calls should be made
      expect(
        WorkerDiscoveryService.fetchWorkerDefinitions
      ).not.toHaveBeenCalled();
    });

    it("should generate types in CI environment", async () => {
      process.env.CI = "true";

      await syncCommand.execute({});

      expect(fs.existsSync(TYPES_PATH)).toBeTruthy();
      // No API calls should be made
      expect(
        WorkerDiscoveryService.fetchWorkerDefinitions
      ).not.toHaveBeenCalled();
    });

    it("should fail gracefully when config is invalid", async () => {
      // Write invalid config
      fs.writeFileSync(CONFIG_PATH, "invalid json");

      await syncCommand.execute({ offline: true });

      expect(fs.existsSync(TYPES_PATH)).toBeFalsy();
    });
  });

  describe("Update existing configuration", () => {
    beforeEach(() => {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(mockConfig));
    });

    it("should update existing config with new worker definitions", async () => {
      const updatedWorkers = [
        new Worker(
          "test-worker-id",
          "Updated Worker Name",
          "test-worker",
          mockConfig.workers[0].workflows.map(
            (wf) =>
              new Workflow(
                wf.id,
                wf.name,
                wf.slug,
                wf.launchVariables,
                wf.outputVariables,
                {
                  id: "test-worker-id",
                  name: "Updated Worker Name",
                  slug: "test-worker",
                }
              )
          )
        ),
      ];

      jest.spyOn(prompts, "getApiKey").mockResolvedValue("test-api-key");
      jest
        .spyOn(WorkerDiscoveryService, "fetchWorkerDefinitions")
        .mockResolvedValue(updatedWorkers);

      await syncCommand.execute({});

      const savedConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      expect(savedConfig.workers[0].name).toBe("Updated Worker Name");
    });
  });

  describe("Custom options", () => {
    it("should use provided API key instead of prompting", async () => {
      const getApiKeySpy = jest.spyOn(prompts, "getApiKey");
      jest
        .spyOn(WorkerDiscoveryService, "fetchWorkerDefinitions")
        .mockResolvedValue(mockWorkers);

      await syncCommand.execute({ key: "custom-api-key" });

      expect(getApiKeySpy).toHaveBeenCalledWith("custom-api-key");
    });

    it("should use custom base URL for API calls", async () => {
      const customBaseUrl = "https://custom-api.example.com";
      const fetchSpy = jest
        .spyOn(WorkerDiscoveryService, "fetchWorkerDefinitions")
        .mockResolvedValue(mockWorkers);

      jest.spyOn(prompts, "getApiKey").mockResolvedValue("test-api-key");

      await syncCommand.execute({ baseUrl: customBaseUrl });

      expect(fetchSpy).toHaveBeenCalledWith(expect.any(String), customBaseUrl);
    });
  });
});
