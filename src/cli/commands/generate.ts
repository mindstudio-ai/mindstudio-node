import { TypeGenerator } from "../../codegen";
import { ConfigManager } from "../config";

export class GenerateCommand {
  constructor(
    private config: ConfigManager,
    private typeGenerator: TypeGenerator
  ) {}

  public async execute(): Promise<void> {
    try {
      // Check for CI environment
      const isCI = process.env.CI === "true";

      if (!(await this.config.exists())) {
        if (isCI) {
          console.warn(
            "\n⚠️  No MindStudio configuration found in CI environment - skipping type generation"
          );
          return;
        }

        console.warn(
          "\n⚠️  No MindStudio configuration found" +
            "\n   This is normal if you haven't initialized your workspace yet." +
            "\n   To set up your workspace:" +
            "\n   1. Get your API key from https://app.mindstudio.ai/workspace/settings/developer?page=api-keys" +
            "\n   2. Run: npx mindstudio sync" +
            "\n   3. Commit the generated .mindstudio.json file\n"
        );
        return;
      }

      const config = await this.config.load();

      try {
        console.log("Generating type definitions...");
        const types = this.typeGenerator.generateTypes(
          this.config.convertToWorkerWorkflows(config)
        );
        await this.config.writeTypes(types);
        console.log("✨ Successfully generated type definitions");
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (isCI) {
          console.warn(
            "\n⚠️  Failed to generate types in CI environment - continuing build"
          );
          return;
        }

        console.warn(
          "\n⚠️  Failed to generate type definitions:" +
            `\n   ${errorMsg}` +
            "\n   To fix this:" +
            "\n   1. Run: npx mindstudio sync" +
            "\n   2. Check if your .mindstudio.json is valid" +
            "\n   3. If the issue persists, try removing node_modules/.mindstudio and running sync again\n"
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(
        "\n⚠️  Configuration error:" +
          `\n   ${errorMsg}` +
          "\n   To resolve this:" +
          "\n   1. Ensure .mindstudio.json exists and is valid" +
          "\n   2. Run: npx mindstudio sync to recreate configuration" +
          "\n   3. Contact support if the issue persists\n"
      );
    }
  }
}
