import { TestOptions } from "../types";
import { ConfigManager } from "../../core/config/manager";
import { MindStudio } from "../../client";
import { Prompts } from "../services/prompts";
import { BaseCommand } from "./base";
import { KeyManager } from "../../core/auth/keyManager";

export class TestCommand extends BaseCommand {
  constructor(
    private config: ConfigManager,
    private prompts: Prompts
  ) {
    super();
  }

  public async execute(options: TestOptions): Promise<void> {
    try {
      const config = this.config.readConfig();
      this.logDebug(
        `Loaded config with ${config.workers.length} workers`,
        options
      );

      const apiKey = KeyManager.resolveKey(options.key);
      this.logDebug("API key resolved", options);

      const client = new MindStudio(apiKey, {
        baseUrl: options.baseUrl,
      });
      this.logDebug(
        `Client initialized with base URL: ${options.baseUrl || "default"}`,
        options
      );

      const { worker, workflow } =
        options.worker && options.workflow
          ? { worker: options.worker, workflow: options.workflow }
          : await this.prompts.selectWorkerAndWorkflow(config);

      this.logDebug(
        `Selected worker: ${worker}, workflow: ${workflow}`,
        options
      );

      const input = options.input
        ? JSON.parse(options.input)
        : await this.prompts.getWorkflowInput(config, worker, workflow);

      this.logDebug(`Input prepared: ${JSON.stringify(input)}`, options);

      console.log("\n Executing workflow...");
      const result = await client.workers[worker][workflow](input);

      if (!result.success) {
        throw result.error;
      }

      console.log("\n✨ Success!");
      console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error("\n❌ Invalid JSON input:");
        if (options.verbose) {
          console.error(error);
        } else {
          console.error(error.message);
        }
      } else if (error instanceof Error) {
        console.error("\n❌ Test failed:");
        if (options.verbose) {
          console.error(error);
        } else {
          console.error(error.message);
        }
      } else {
        console.error("\n❌ Test failed:", error);
      }
    }
  }
}
