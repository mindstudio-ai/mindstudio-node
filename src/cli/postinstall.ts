import fs from "fs/promises";
import { ConfigManager } from "./config";
import { TypeGenerator } from "../codegen";
import path from "path";

async function postinstall() {
  console.log(
    "MindStudio: Running postinstall script",
    path.join(process.cwd(), ".mindstudio.json")
  );
  try {
    // Check if .mindstudio.json exists
    try {
      await fs.access(".mindstudio.json");
    } catch {
      console.log(
        "MindStudio: No configuration found, skipping type generation"
      );
      // File doesn't exist, exit silently
      return;
    }

    // File exists, generate types
    const config = new ConfigManager();
    const typeGenerator = new TypeGenerator();

    const existingConfig = await config.load();
    const types = typeGenerator.generateTypes(
      config.convertToWorkerWorkflows(existingConfig)
    );
    await config.writeTypes(types);

    console.log(
      "MindStudio: Generated type definitions from existing configuration"
    );
  } catch (error) {
    // Log error but don't fail install
    console.error(
      "MindStudio: Failed to generate types during install:",
      error
    );
  }
}

postinstall();
