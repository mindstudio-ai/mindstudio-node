import { MindStudio } from "../../client";
import { ConfigManager } from "@core/config/manager";
import { SyncOptions } from "../types";
import { Worker, Workflow } from "@core/types";
import { Config } from "@core/config/types";
import { BaseCommand } from "./base";
import { WorkerDiscoveryService } from "../services/discovery";
import { TypeGenerator } from "../services/generator";
import { Prompts } from "../services/prompts";

export class SyncCommand implements BaseCommand {
  constructor(
    private configManager: ConfigManager,
    private typeGenerator: TypeGenerator,
    private prompts: Prompts
  ) {}

  private convertToWorkerWorkflows(config: Config) {
    return config.workers.map(
      (worker) =>
        new Worker(
          worker.id,
          worker.name,
          worker.slug,
          worker.workflows.map(
            (workflow) =>
              new Workflow(
                workflow.id,
                workflow.name,
                workflow.slug,
                workflow.launchVariables,
                workflow.outputVariables,
                worker
              )
          )
        )
    );
  }

  public async execute(options: SyncOptions): Promise<void> {
    const configExists = this.configManager.exists();
    const isCI = process.env.CI === "true";
    const isOffline = options.offline || isCI;

    if (configExists && isOffline) {
      try {
        console.log("\n🔍 Found existing configuration");
        console.log("📝 Generating type definitions...");

        const config = this.configManager.readConfig();
        const types = this.typeGenerator.generateTypes(
          this.convertToWorkerWorkflows(config)
        );
        this.configManager.writeTypes(types);

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

      const workers = await WorkerDiscoveryService.fetchWorkerDefinitions(
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

      this.configManager.write(config);
      console.log("💾 Configuration saved to .mindstudio.json");

      console.log("📝 Generating type definitions...");
      const types = this.typeGenerator.generateTypes(workers);
      this.configManager.writeTypes(types);

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
