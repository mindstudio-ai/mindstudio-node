import { KeyManager } from "../../core/auth/keyManager";
import { ConfigManager } from "../../core/config/manager";
import { EntityFormatter } from "../../core/utils/nameFormatter";
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
      this.logError(error, "Failed to list workers", options);
      console.warn(
        "\n   Note: Run 'npx mindstudio sync' first to fetch worker definitions\n"
      );
    }
  }

  private displayWorkers(workers: Array<Config["workers"][0]>): void {
    console.log("\n📦 Available Workers\n");

    workers.forEach((worker) => {
      const formattedWorkerName = EntityFormatter.formatWorker(worker);
      console.log(`\x1b[1m${worker.name}\x1b[0m`);
      console.log(`Import: workers.${formattedWorkerName}\n`);

      worker.workflows.forEach((workflow) => {
        const formattedWorkflowName = EntityFormatter.formatWorkflow(workflow);
        console.log(`  🔹 ${workflow.name}`);

        // Create function signature
        const inputs = workflow.launchVariables.length
          ? `{ ${workflow.launchVariables.join(", ")} }`
          : "";
        console.log(
          `    └─ workers.${formattedWorkerName}.${formattedWorkflowName}(${inputs})`
        );

        // Show return type
        const returns = workflow.outputVariables.length
          ? `{ ${workflow.outputVariables.join(", ")} }`
          : "string | undefined";
        console.log(`       Returns: ${returns}`);
        console.log(""); // Add spacing between workflows
      });
      console.log("─".repeat(50) + "\n"); // Add separator between workers
    });

    console.log(
      "💡 Run 'npx mindstudio sync' to generate type definitions for these workers\n"
    );
  }
}
