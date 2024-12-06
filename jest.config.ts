export default {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^@internal/(.*)$": "<rootDir>/src/internal/$1",
    "^@public/(.*)$": "<rootDir>/src/public/$1",
    "^@cli/(.*)$": "<rootDir>/src/cli/$1",
    "^@test-utils/(.*)$": "<rootDir>/tests/utils/$1",
  },
  collectCoverageFrom: [
    "src/public/**/*.ts",
    "src/cli/**/*.ts",
    "!src/generated/**",
  ],
  watchPathIgnorePatterns: ["node_modules", "dist", "coverage"],
};
