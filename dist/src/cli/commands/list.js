"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCommand = void 0;
const discovery_1 = require("../services/discovery");
const keyManager_1 = require("@core/auth/keyManager");
class ListCommand {
    constructor(configManager) {
        this.configManager = configManager;
    }
    async execute(options) {
        try {
            // Try to use existing config first
            if (this.configManager.exists()) {
                const config = this.configManager.readConfig();
                this.displayWorkers(config.workers);
                return;
            }
            // Fallback to API if no config
            const apiKey = keyManager_1.KeyManager.resolveKey(options.key);
            const workers = await discovery_1.WorkerDiscoveryService.fetchWorkerDefinitions(apiKey, options.baseUrl);
            this.displayWorkers(workers);
        }
        catch (error) {
            console.error("\n❌ Failed to list workers:" +
                `\n   ${error instanceof Error ? error.message : String(error)}` +
                "\n\n   Note: Run 'npx mindstudio sync' first to fetch worker definitions\n");
        }
    }
    displayWorkers(workers) {
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
        console.log("Run 'npx mindstudio sync' to generate type definitions for these workers\n");
    }
}
exports.ListCommand = ListCommand;
