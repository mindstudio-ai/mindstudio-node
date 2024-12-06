import { KeyManager } from "../../core/auth/keyManager";
import { ConfigManager } from "../../core/config/manager";
import { WorkerDiscoveryService } from "../services/discovery";
import { Config, ListOptions } from "../types";
import { BaseCommand } from "./base";

export class ListCommand extends BaseCommand {
  constructor(private configManager: ConfigManager) {
    super();
  }

  public async execute(options: ListOptions): Promise<void> {
    try {
      this.logDebug("Checking for existing configuration...", options);

      if (this.configManager.exists()) {
        this.logDebug("Using existing configuration", options);
        const config = this.configManager.readConfig();
        this.logDebug(
          `Found ${config.workers.length} workers in config`,
          options
        );
        this.displayWorkers(config.workers);
        return;
      }

      this.logDebug("No configuration found, fetching from API", options);
      const apiKey = KeyManager.resolveKey(options.key);
      this.logDebug("API key resolved", options);

      const workers = await WorkerDiscoveryService.fetchWorkerDefinitions(
        apiKey,
        options.baseUrl
      );
      this.logDebug(`Fetched ${workers.length} workers from API`, options);

      this.displayWorkers(workers);
    } catch (error) {
      console.error("\n❌ Failed to list workers:");
      if (options.verbose) {
        console.error(error);
      } else {
        console.error(error instanceof Error ? error.message : String(error));
      }
      console.error(
        "\n   Note: Run 'npx mindstudio sync' first to fetch worker definitions\n"
      );
    }
  }

  private displayWorkers(workers: Array<Config["workers"][0]>): void {
    console.log("\nAvailable Workers:\n");

    workers.forEach((worker) => {
      console.log(`• ${worker.name} (${worker.slug})`);
      worker.workflows.forEach((workflow) => {
        console.log(`  └─ ${workflow.name} (${workflow.slug})`);
        if (workflow.launchVariables.length) {
          console.log(`     ├─ Input: ${workflow.launchVariables.join(", ")}`);
        }
        if (workflow.outputVariables.length) {
          console.log(`     └─ Output: ${workflow.outputVariables.join(", ")}`);
        }
      });
      console.log("");
    });

    console.log(
      "Run 'npx mindstudio sync' to generate type definitions for these workers\n"
    );
  }
}
