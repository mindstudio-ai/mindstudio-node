"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@cli/commands/test");
const manager_1 = require("@core/config/manager");
const prompts_1 = require("@cli/services/prompts");
const config_1 = require("../__fixtures__/config");
const api_1 = require("../__fixtures__/api");
const fs_1 = __importDefault(require("fs"));
describe("Test Command", () => {
    const CONFIG_PATH = ".mindstudio.json";
    let testCommand;
    let config;
    let prompts;
    let originalEnv;
    const apiMock = (0, api_1.setupApiMock)();
    beforeEach(() => {
        // Save original env
        originalEnv = { ...process.env };
        // Initialize fresh components
        config = new manager_1.ConfigManager();
        prompts = new prompts_1.Prompts();
        testCommand = new test_1.TestCommand(config, prompts);
        // Reset environment
        delete process.env.MINDSTUDIO_KEY;
        // Reset API mocks
        apiMock.reset();
        // Setup mock config
        fs_1.default.writeFileSync(CONFIG_PATH, JSON.stringify(config_1.mockConfig));
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
        if (fs_1.default.existsSync(CONFIG_PATH)) {
            fs_1.default.unlinkSync(CONFIG_PATH);
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
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Invalid JSON input:"));
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
            expect(apiCalls[0].headers).toHaveProperty("Authorization", "Bearer custom-api-key");
        });
        it("should fail gracefully when no API key is available", async () => {
            const consoleSpy = jest.spyOn(console, "error");
            await testCommand.execute({
                worker: "test-worker",
                workflow: "generateText",
                input: "{}",
            });
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("API key not found"));
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
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Test failed:"));
        });
    });
});
