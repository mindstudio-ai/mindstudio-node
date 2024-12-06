export default {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@mindstudio/(.*)$": "<rootDir>/src/$1",
    "^@cli/(.*)$": "<rootDir>/src/cli/$1",
  },
  collectCoverageFrom: ["src/**/*.ts"],
  watchPathIgnorePatterns: ["node_modules", "dist", "coverage"],
};
