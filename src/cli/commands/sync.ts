import { MindStudio } from "../../client";
import { TypeGenerator } from "../../codegen";
import { ConfigManager } from "../config";
import { Prompts } from "../prompts";

interface SyncOptions {
  key?: string;
  baseUrl?: string;
}

export class SyncCommand {
  constructor(
    private config: ConfigManager,
    private typeGenerator: TypeGenerator,
    private prompts: Prompts
  ) {}

  public async execute(options: SyncOptions): Promise<void> {
    const isInit = !(await this.config.exists());
    console.log(isInit ? "Initializing MindStudio..." : "Syncing workspace...");

    try {
      const apiKey = await this.prompts.getApiKey(options.key);

      if (!apiKey) {
        console.error(
          "No API key provided. Set MINDSTUDIO_KEY in your environment or .env file"
        );
        return;
      }

      if (isInit) {
        console.log("Fetching worker configurations...");
      }

      const client = new MindStudio(apiKey, {
        baseUrl: options.baseUrl,
      });
      await client.init(true);

      if (isInit) {
        console.log("Generating configuration...");
      }

      const newConfig = this.config.generateConfig(client);
      await this.config.write(newConfig);

      console.log("Generating type definitions...");
      const types = this.typeGenerator.generateTypes(
        this.config.convertToWorkerWorkflows(newConfig)
      );
      await this.config.writeTypes(types);

      console.log(
        isInit
          ? "Successfully initialized MindStudio\nType definitions have been generated in node_modules/mindstudio/types"
          : "Successfully synced workspace"
      );
    } catch (error) {
      console.error(isInit ? "Initialization failed:" : "Sync failed:", error);
      console.error("This will not affect your application runtime.");
    }
  }
}
