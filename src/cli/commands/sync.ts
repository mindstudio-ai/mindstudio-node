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
        console.log(
          "📝 Generating type definitions from existing configuration..."
        );
        const config = await this.config.load();
        const types = this.typeGenerator.generateTypes(
          this.config.convertToWorkerWorkflows(config)
        );
        await this.config.writeTypes(types);
        console.log("✨ Successfully generated type definitions");
        return;
      } catch (error) {
        console.error("Failed to generate types:", error);
        return;
      }
    }

    try {
      const apiKey = await this.prompts.getApiKey(options.key);
      if (!apiKey) {
        console.error(
          "\n❌ No API key provided." +
            "\n   Set MINDSTUDIO_KEY in your environment or .env file" +
            "\n   Or get one from: https://app.mindstudio.ai/workspace/settings/developer?page=api-keys"
        );
        return;
      }

      console.log(
        configExists
          ? "🔄 Syncing workspace..."
          : "🎉 Initializing workspace..."
      );

      const client = new MindStudio(apiKey, { baseUrl: options.baseUrl });
      await client.init(true);

      const newConfig = this.config.generateConfig(client);
      await this.config.write(newConfig);

      console.log("📝 Generating type definitions...");
      const types = this.typeGenerator.generateTypes(
        this.config.convertToWorkerWorkflows(newConfig)
      );
      await this.config.writeTypes(types);

      console.log("✨ Successfully synced workspace and generated types");
    } catch (error) {
      console.error("Sync failed:", error);
      console.error("This will not affect your application runtime.");
    }
  }
}
