"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const list_1 = require("@cli/commands/list");
const manager_1 = require("@core/config/manager");
const fs_1 = __importDefault(require("fs"));
const api_1 = require("../__fixtures__/api");
const config_1 = require("../__fixtures__/config");
describe("List Command", () => {
    const CONFIG_PATH = ".mindstudio.json";
    let listCommand;
    let originalEnv;
    const apiMock = (0, api_1.setupApiMock)();
    beforeEach(() => {
        // Save original env
        originalEnv = { ...process.env };
        // Initialize fresh components
        listCommand = new list_1.ListCommand(new manager_1.ConfigManager());
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
    });
    afterEach(() => {
        // Restore original env
        process.env = originalEnv;
        // Cleanup files
        if (fs_1.default.existsSync(CONFIG_PATH)) {
            fs_1.default.unlinkSync(CONFIG_PATH);
        }
        // Clear console mocks
        jest.clearAllMocks();
    });
    describe("Configuration Based Listing", () => {
        it("should list workers from existing configuration", async () => {
            // Setup existing config
            fs_1.default.writeFileSync(CONFIG_PATH, JSON.stringify(config_1.mockConfig));
            const consoleSpy = jest.spyOn(console, "log");
            await listCommand.execute({});
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Available Workers:"));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("test-worker"));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("generateText"));
        });
        it("should show input and output variables", async () => {
            fs_1.default.writeFileSync(CONFIG_PATH, JSON.stringify(config_1.mockConfig));
            const consoleSpy = jest.spyOn(console, "log");
            await listCommand.execute({});
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Input: prompt"));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Output: text"));
        });
    });
    describe("API Based Listing", () => {
        it("should fetch and list workers from API when no config exists", async () => {
            process.env.MINDSTUDIO_KEY = "test-api-key";
            const consoleSpy = jest.spyOn(console, "log");
            await listCommand.execute({});
            const apiCalls = apiMock.getHistory().get;
            expect(apiCalls[0].url).toBe("/workers/load");
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Test Worker"));
        });
        it("should use provided API key", async () => {
            await listCommand.execute({ key: "custom-api-key" });
            const apiCalls = apiMock.getHistory().get;
            expect(apiCalls[0].headers).toHaveProperty("Authorization", "Bearer custom-api-key");
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
            const consoleSpy = jest.spyOn(console, "error");
            await listCommand.execute({});
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to list workers"));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("API key not found"));
        });
        it("should handle API errors gracefully", async () => {
            process.env.MINDSTUDIO_KEY = "test-api-key";
            apiMock.mockWorkerDefinitionsError(new Error("API Error"));
            const consoleSpy = jest.spyOn(console, "error");
            await listCommand.execute({});
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to list workers"));
        });
        it("should handle invalid configuration gracefully", async () => {
            fs_1.default.writeFileSync(CONFIG_PATH, "invalid json");
            const consoleSpy = jest.spyOn(console, "error");
            await listCommand.execute({});
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to list workers"));
        });
    });
});
