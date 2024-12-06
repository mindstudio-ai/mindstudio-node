import { BaseCommand } from "./base";
import { ConfigManager } from "@core/config/manager";
import { WorkerDiscoveryService } from "../services/discovery";
import { KeyManager } from "@core/auth/keyManager";
import { Config, ListOptions } from "../types";
import { MSWorker } from "@core/types";

export class ListCommand implements BaseCommand {
  constructor(private configManager: ConfigManager) {}

  public async execute(options: ListOptions): Promise<void> {
    try {
      // Try to use existing config first
      if (this.configManager.exists()) {
        const config = this.configManager.readConfig();
        this.displayWorkers(config.workers);
        return;
      }

      // Fallback to API if no config
      const apiKey = KeyManager.resolveKey(options.key);
      const workers = await WorkerDiscoveryService.fetchWorkerDefinitions(
        apiKey,
        options.baseUrl
      );
      this.displayWorkers(workers);
    } catch (error) {
      console.error(
        "\n❌ Failed to list workers:" +
          `\n   ${error instanceof Error ? error.message : String(error)}` +
          "\n\n   Note: Run 'npx mindstudio sync' first to fetch worker definitions\n"
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
