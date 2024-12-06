import { TestOptions } from "@cli/types";
import { ConfigManager } from "@core/config/manager";
import { MindStudio } from "@mindstudio/client";
import { Prompts } from "../services/prompts";
import { BaseCommand } from "./base";

export class TestCommand implements BaseCommand {
  constructor(
    private config: ConfigManager,
    private prompts: Prompts
  ) {}

  public async execute(options: TestOptions): Promise<void> {
    try {
      const config = this.config.readConfig();
      const apiKey = await this.prompts.getApiKey(options.key);

      if (!apiKey) {
        console.error(
          "No API key provided. Set MINDSTUDIO_KEY in your environment or .env file"
        );
        return;
      }

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
        console.error("Invalid JSON input:", error.message);
      } else {
        console.error("Test failed:", error);
      }
      console.error("This will not affect your application runtime.");
    }
  }
}
