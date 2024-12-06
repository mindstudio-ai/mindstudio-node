"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../src/client");
describe("MindStudio Client Initialization", () => {
    let originalEnv;
    beforeEach(() => {
        originalEnv = { ...process.env };
        delete process.env.MINDSTUDIO_KEY;
    });
    afterEach(() => {
        process.env = originalEnv;
    });
    it("should throw error when API key is missing", () => {
        expect(() => new client_1.MindStudio()).toThrow();
    });
    it("should initialize with custom base URL", () => {
        const customUrl = "https://custom-api.example.com";
        const client = new client_1.MindStudio("test-api-key", {
            baseUrl: customUrl,
        });
        expect(client).toBeInstanceOf(client_1.MindStudio);
    });
    it("should use API key from environment", () => {
        process.env.MINDSTUDIO_KEY = "env-api-key";
        const client = new client_1.MindStudio();
        expect(client).toBeInstanceOf(client_1.MindStudio);
    });
    it("should prioritize provided API key over environment", () => {
        process.env.MINDSTUDIO_KEY = "env-api-key";
        const providedKey = "provided-api-key";
        const client = new client_1.MindStudio(providedKey);
        expect(client).toBeInstanceOf(client_1.MindStudio);
    });
});
