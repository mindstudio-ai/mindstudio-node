import path from "path";

export class ConfigPaths {
  static getConfigPath(): string {
    return path.join(process.cwd(), ".mindstudio.json");
  }

  static getTypesPath(): string {
    try {
      // Try to resolve the main entry point using require
      const mainModule = require.resolve("mindstudio");
      const projectRoot = process.cwd();
      const packageDir = path.dirname(path.dirname(path.dirname(mainModule))); // Go up two levels from dist/src/index.js

      // If we're running from a project that has mindstudio as dependency
      // (not running from within mindstudio package itself)

      if (!projectRoot.includes(packageDir)) {
        return path.join(packageDir, "dist/src/generated");
      }
    } catch {
      // Either:
      // 1. We're in development
      // 2. Resolution failed
      // 3. We're in tests (where require.resolve might be mocked)
    }

    // Default to local development path
    return path.join(process.cwd(), "dist/src/generated");
  }
}
