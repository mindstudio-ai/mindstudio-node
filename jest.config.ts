export default {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup/testEnv.ts"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/__tests__/**"],
  watchPathIgnorePatterns: [
    "node_modules",
    "dist",
    "coverage",
    "\\.git",
    "\\.vscode",
  ],
  watchman: false,
  reporters: ["default"],
};
