import { TestOptions } from "../types";
import { ConfigManager } from "../../core/config/manager";
import { MindStudio } from "../../client";
import { Prompts } from "../services/prompts";
import { BaseCommand } from "./base";
import { KeyManager } from "../../core/auth/keyManager";

export class TestCommand implements BaseCommand {
  constructor(
    private config: ConfigManager,
    private prompts: Prompts
  ) {}

  public async execute(options: TestOptions): Promise<void> {
    try {
      const config = this.config.readConfig();
      const apiKey = KeyManager.resolveKey(options.key);

      const client = new MindStudio(apiKey, {
        baseUrl: options.baseUrl,
      });

      const { worker, workflow } =
        options.worker && options.workflow
          ? { worker: options.worker, workflow: options.workflow }
          : await this.prompts.selectWorkerAndWorkflow(config);

      const input = options.input
        ? JSON.parse(options.input)
        : await this.prompts.getWorkflowInput(config, worker, workflow);

      const result = await client.workers[worker][workflow](input);

      if (!result.success) {
        throw result.error;
      }

      console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error("Invalid JSON input:\n" + error.message);
      } else if (error instanceof Error) {
        console.error("Test failed:\n" + error.message);
      } else {
        console.error("Test failed:", error);
      }
    }
  }
}
