import { Command } from "commander";

import { SyncCommand, TestCommand } from "./commands";
import { TypeGenerator } from "./services/generator";
import { Prompts } from "./services/prompts";
import { ListCommand } from "./commands/list";
import { ConfigManager } from "../core/config/manager";

export class CLI {
  constructor(
    private program: Command = new Command(),
    private configManager: ConfigManager = new ConfigManager(),
    private typeGenerator: TypeGenerator = new TypeGenerator(),
    private prompts: Prompts = new Prompts()
  ) {
    if (!this.program.commands.length) {
      this.setupCommands();
    }
  }

  private setupCommands(): void {
    this.program.name("mindstudio").description("MindStudio CLI");

    if (!this.program.opts().version) {
      this.program.version(require("../../../package.json").version);
    }

    this.program
      .option("--base-url <url>", "Override API base URL")
      .option("--key <apiKey>", "Override API key");

    const syncCmd = new SyncCommand(this.configManager, this.typeGenerator);
    const testCmd = new TestCommand(this.configManager, this.prompts);
    const listCmd = new ListCommand(this.configManager);

    this.program
      .command("sync")
      .description("Initialize workspace and manage type definitions")
      .option("--key <apiKey>", "MindStudio API key")
      .option("--base-url <url>", "API base URL")
      .option(
        "--offline",
        "Generate types from existing config without API calls"
      )
      .action((options) => syncCmd.execute(options));

    this.program
      .command("test")
      .description("Test a workflow")
      .option("--worker <worker>", "Worker name")
      .option("--workflow <workflow>", "Workflow name")
      .option("--input <input>", "Input JSON string")
      .action((options) => testCmd.execute(options));

    this.program
      .command("list")
      .description("List available workers and their workflows")
      .option("--key <apiKey>", "MindStudio API key")
      .option("--base-url <url>", "API base URL")
      .action((options) => listCmd.execute(options));
  }

  public async run(args: string[]): Promise<void> {
    await this.program.parseAsync(args);
  }
}
