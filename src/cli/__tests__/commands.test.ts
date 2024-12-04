import { CLI } from "../commands";
import { ConfigManager } from "../config";
import { TypeGenerator } from "../../codegen";
import { Prompts } from "../prompts";
import { Command } from "commander";

describe("CLI", () => {
  let cli: CLI;
  let mockConfig: jest.Mocked<ConfigManager>;
  let mockTypeGenerator: jest.Mocked<TypeGenerator>;
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;

  beforeEach(() => {
    // Create proper mocks with Jest functions
    mockConfig = {
      exists: jest.fn(),
      load: jest.fn(),
      writeTypes: jest.fn(),
      convertToWorkerWorkflows: jest.fn(),
      write: jest.fn(),
      generateConfig: jest.fn(),
    } as unknown as jest.Mocked<ConfigManager>;

    mockTypeGenerator = {
      generateTypes: jest.fn(),
    } as unknown as jest.Mocked<TypeGenerator>;

    // Create CLI instance with fresh Command instance
    cli = new CLI(
      new Command(), // Create new instance for each test
      mockConfig,
      mockTypeGenerator,
      {} as Prompts
    );

    // Mock console methods
    mockConsoleError = jest.spyOn(console, "error").mockImplementation();
    mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  describe("handleGenerate", () => {
    it("should not exit process when config does not exist", async () => {
      // Setup
      mockConfig.exists.mockImplementation(() => Promise.resolve(false));

      // Execute
      await cli["handleGenerate"]();

      // Verify
      expect(mockConsoleError).toHaveBeenCalledWith(
        'No configuration found. Run "mindstudio sync" first.'
      );
    });

    it("should not exit process when generation fails", async () => {
      // Setup
      mockConfig.exists.mockImplementation(() => Promise.resolve(true));
      mockConfig.load.mockImplementation(() =>
        Promise.reject(new Error("Failed to load"))
      );

      // Execute
      await cli["handleGenerate"]();

      // Verify
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Generation failed:",
        expect.any(Error)
      );
    });

    it("should successfully generate types when config exists", async () => {
      // Setup
      const configData = { version: "1.0.0", workers: [] };
      const mockTypes = "// generated types";

      mockConfig.exists.mockImplementation(() => Promise.resolve(true));
      mockConfig.load.mockImplementation(() => Promise.resolve(configData));
      mockConfig.convertToWorkerWorkflows.mockReturnValue([]);
      mockTypeGenerator.generateTypes.mockReturnValue(mockTypes);

      // Execute
      await cli["handleGenerate"]();

      // Verify
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "Generating type definitions..."
      );
      expect(mockConfig.writeTypes).toHaveBeenCalledWith(mockTypes);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "Successfully generated type definitions"
      );
    });
  });
});
