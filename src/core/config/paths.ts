import path from "path";

export class ConfigPaths {
  static getConfigPath(): string {
    return path.join(process.cwd(), ".mindstudio.json");
  }

  static getTypesPath(): string {
    try {
      // Try multiple resolution strategies
      let packageDir: string | null = null;

      try {
        // Try resolving the main entry point
        const mainPath = require.resolve("mindstudio");
        packageDir = path.dirname(path.dirname(mainPath)); // Go up two levels from dist/index.js
      } catch {
        try {
          // Fallback: try direct node_modules path
          const directPath = path.join(
            process.cwd(),
            "node_modules",
            "mindstudio"
          );
          if (require.resolve(directPath)) {
            packageDir = directPath;
          }
        } catch {}
      }

      // If we found the package and we're not in it
      if (packageDir && !process.cwd().includes(packageDir)) {
        return path.join(packageDir, "dist/src/generated");
      }
    } catch {}

    // Default to local development path
    return path.join(process.cwd(), "dist/src/generated");
  }
}
