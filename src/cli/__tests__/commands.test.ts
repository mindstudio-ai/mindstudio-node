import { CLI } from "../commands";
import { ConfigManager } from "../config";
import { TypeGenerator } from "../../codegen";
import { Prompts } from "../prompts";
import { Command } from "commander";
import { MindStudio } from "../../";
import { MindStudioError } from "../../errors";

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

  describe("handleSync", () => {
    let mockPrompts: jest.Mocked<Prompts>;

    beforeEach(() => {
      // Setup mock prompts
      mockPrompts = {
        getApiKey: jest.fn(),
      } as unknown as jest.Mocked<Prompts>;

      // Mock the MindStudio constructor and its methods
      jest.spyOn(MindStudio.prototype, "init").mockImplementation();

      // Update CLI instance with mock prompts
      cli = new CLI(new Command(), mockConfig, mockTypeGenerator, mockPrompts);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should handle initialization errors gracefully", async () => {
      // Setup
      mockConfig.exists.mockImplementation(() => Promise.resolve(false));
      mockPrompts.getApiKey.mockResolvedValue("test-key");

      // Mock MindStudio init to throw a MindStudioError
      const error = new MindStudioError(
        "Failed to initialize MindStudio client",
        "init_failed",
        500
      );
      jest.spyOn(MindStudio.prototype, "init").mockRejectedValue(error);

      // Execute
      await cli["handleSync"]({});

      // Verify
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Initialization failed:",
        error
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        "This will not affect your application runtime."
      );
    });

    it("should successfully sync when all operations succeed", async () => {
      // Setup
      const configData = { version: "1.0.0", workers: [] };
      const mockTypes = "// generated types";

      mockConfig.exists.mockImplementation(() => Promise.resolve(true));
      mockPrompts.getApiKey.mockResolvedValue("test-key");

      // Mock successful client initialization
      jest.spyOn(MindStudio.prototype, "init").mockImplementation();

      // Mock config generation
      mockConfig.generateConfig.mockReturnValue(configData);
      mockTypeGenerator.generateTypes.mockReturnValue(mockTypes);

      // Execute
      await cli["handleSync"]({});

      // Verify
      expect(mockConfig.write).toHaveBeenCalledWith(configData);
      expect(mockConfig.writeTypes).toHaveBeenCalledWith(mockTypes);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "Successfully synced workspace"
      );
    });

    it("should show initialization messages for new workspace", async () => {
      // Setup
      const configData = { version: "1.0.0", workers: [] };
      mockConfig.exists.mockImplementation(() => Promise.resolve(false));
      mockPrompts.getApiKey.mockResolvedValue("test-key");
      mockConfig.generateConfig.mockReturnValue(configData);

      // Mock successful client initialization
      jest.spyOn(MindStudio.prototype, "init").mockImplementation();

      // Execute
      await cli["handleSync"]({});

      // Verify - use ordered verification
      expect(mockConsoleLog).toHaveBeenNthCalledWith(
        1,
        "Initializing MindStudio..."
      );
      expect(mockConsoleLog).toHaveBeenNthCalledWith(
        2,
        "Fetching worker configurations..."
      );
      expect(mockConsoleLog).toHaveBeenNthCalledWith(
        3,
        "Generating configuration..."
      );
    });
  });
});
