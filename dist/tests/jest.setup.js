"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load test environment variables
dotenv_1.default.config({ path: path_1.default.join(__dirname, ".env.test") });
// Set default test API key if not provided
if (!process.env.MINDSTUDIO_KEY) {
    process.env.MINDSTUDIO_KEY = "test-api-key-123";
}
// Global test timeout
jest.setTimeout(5000);
// Add to existing setup
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
};
