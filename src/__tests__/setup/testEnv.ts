import dotenv from "dotenv";
import path from "path";

// Load test environment variables
const result = dotenv.config({
  path: path.join(__dirname, "../.env.test"),
});

if (result.error) {
  console.warn("Failed to load test environment variables:", result.error);
}

// Verify API key is set
if (!process.env.MINDSTUDIO_KEY) {
  console.warn("MINDSTUDIO_KEY is not set in test environment");
}

// Global test timeout
jest.setTimeout(30000);
