import dotenv from "dotenv";
import path from "path";

// Load test environment variables
const result = dotenv.config({
  path: path.join(__dirname, "../.env.test"),
});

if (result.error) {
  console.warn("Failed to load test environment variables:", result.error);
}

// Set default test API key if not provided
if (!process.env.MINDSTUDIO_KEY) {
  process.env.MINDSTUDIO_KEY = "test-api-key-123";
}

// Global test timeout
jest.setTimeout(30000);
