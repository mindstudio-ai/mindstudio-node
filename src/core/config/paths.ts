import path from "path";

export class ConfigPaths {
  static getConfigPath(): string {
    return ".mindstudio.json";
  }

  static getTypesPath(): string {
    try {
      // Try development path first
      return path.join(process.cwd(), "dist/src/generated");
    } catch {
      try {
        // Fall back to installed package path
        const packageDir = path.dirname(
          require.resolve("mindstudio/package.json")
        );
        return path.join(packageDir, "dist/src/generated");
      } catch {
        // Final fallback to local node_modules
        return path.join(
          process.cwd(),
          "node_modules/mindstudio/dist/src/generated"
        );
      }
    }
  }
}
