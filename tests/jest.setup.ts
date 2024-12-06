import dotenv from "dotenv";
import path from "path";

// Load test environment variables
dotenv.config({ path: path.join(__dirname, ".env.test") });

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
