import path from "path";

export class ConfigPaths {
  static getConfigPath(): string {
    return ".mindstudio.json";
  }

  static getTypesPath(): string {
    // Check if we're running from within a project that has mindstudio installed
    try {
      const requirePath = require.resolve("mindstudio/package.json");
      // If we can resolve mindstudio package and we're not in its own directory,
      // we're running from a project with mindstudio as dependency
      if (!process.cwd().includes(path.dirname(requirePath))) {
        const packageDir = path.dirname(requirePath);
        return path.join(packageDir, "dist/src/generated");
      }
    } catch {}

    // Either we're in development or previous resolution failed
    return path.join(process.cwd(), "dist/src/generated");
  }
}
