"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../src/client");
const fs_1 = __importDefault(require("fs"));
const api_1 = require("../__fixtures__/api");
const config_1 = require("../__fixtures__/config");
describe("Type-Safe Workflow Execution", () => {
    const apiMock = (0, api_1.setupApiMock)();
    const TEST_API_KEY = "test-api-key-123";
    const CONFIG_PATH = ".mindstudio.json";
    beforeEach(() => {
        apiMock.reset();
        fs_1.default.writeFileSync(CONFIG_PATH, JSON.stringify(config_1.mockConfig));
    });
    afterEach(() => {
        if (fs_1.default.existsSync(CONFIG_PATH)) {
            fs_1.default.unlinkSync(CONFIG_PATH);
        }
    });
    it("should execute workflow with type definitions", async () => {
        apiMock.mockWorkflowExecution({
            result: "Generated text",
            billingCost: "0.01",
        });
        const client = new client_1.MindStudio(TEST_API_KEY);
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
        fs_1.default.unlinkSync(CONFIG_PATH);
        const client = new client_1.MindStudio(TEST_API_KEY);
        expect(() => client.workers).toThrow("Type-safe workers not available. Run 'npx mindstudio sync' first to generate types.");
    });
});
