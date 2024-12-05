import { MindStudio } from "../../client";
import { TypeGenerator } from "../../codegen";
import { ConfigManager } from "../config";
import { Prompts } from "../prompts";

interface SyncOptions {
  key?: string;
  baseUrl?: string;
  offline?: boolean;
}

export class SyncCommand {
  constructor(
    private config: ConfigManager,
    private typeGenerator: TypeGenerator,
    private prompts: Prompts
  ) {}

  public async execute(options: SyncOptions): Promise<void> {
    const configExists = await this.config.exists();
    const isCI = process.env.CI === "true";
    const isOffline = options.offline || isCI;

    if (configExists && isOffline) {
      try {
        console.log("\n🔍 Found existing configuration");
        console.log("📝 Generating type definitions...");

        const config = await this.config.load();
        const types = this.typeGenerator.generateTypes(
          this.config.convertToWorkerWorkflows(config)
        );
        await this.config.writeTypes(types);

        console.log("✨ Successfully generated type definitions");
        console.log("   Types available in: node_modules/mindstudio/types\n");
        return;
      } catch (error) {
        console.error("\n❌ Failed to generate types:", error);
        console.error("   Try running with full sync: npx mindstudio sync\n");
        return;
      }
    }

    try {
      const apiKey = await this.prompts.getApiKey(options.key);
      if (!apiKey) {
        console.error(
          "\n❌ No API key provided" +
            "\n   Set MINDSTUDIO_KEY in your environment or .env file" +
            "\n   Get your key at: https://app.mindstudio.ai/workspace/settings/developer?page=api-keys\n"
        );
        return;
      }

      console.log(
        "\n🚀 " +
          (configExists ? "Syncing" : "Initializing") +
          " MindStudio workspace..."
      );
      console.log("📡 Fetching latest worker configurations...");

      const workers = await MindStudio.fetchWorkerDefinitions(
        apiKey,
        options.baseUrl
      );
      const config = {
        version: "1.0.0",
        workers: workers.map((w) => ({
          id: w.id,
          name: w.name,
          slug: w.slug,
          workflows: w.workflows.map((wf) => ({
            id: wf.id,
            name: wf.name,
            slug: wf.slug,
            launchVariables: wf.launchVariables,
            outputVariables: wf.outputVariables,
          })),
        })),
      };

      await this.config.write(config);
      console.log("💾 Configuration saved to .mindstudio.json");

      console.log("📝 Generating type definitions...");
      const types = this.typeGenerator.generateTypes(workers);
      await this.config.writeTypes(types);

      console.log(
        "\n✨ Success!" +
          "\n   • Configuration " +
          (configExists ? "updated" : "created") +
          "\n   • Type definitions generated" +
          "\n   • Ready to use in your code\n"
      );
    } catch (error) {
      console.error(
        "\n❌ " +
          (configExists ? "Sync" : "Initialization") +
          " failed:" +
          `\n   ${error instanceof Error ? error.message : String(error)}` +
          "\n\n   Note: This won't affect your application runtime." +
          "\n   You can try again later with: npx mindstudio sync\n"
      );
    }
  }
}
