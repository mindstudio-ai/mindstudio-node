import { Command } from "commander";
import { TypeGenerator } from "../codegen";
import { ConfigManager } from "./config";
import { Prompts } from "./prompts";
import { GenerateCommand, SyncCommand, TestCommand } from "./commands";

export class CLI {
  constructor(
    private program: Command = new Command(),
    private config: ConfigManager = new ConfigManager(),
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
      this.program.version(require("../../package.json").version);
    }

    this.program
      .option("--base-url <url>", "Override API base URL")
      .option("--key <apiKey>", "Override API key");

    const generateCmd = new GenerateCommand(this.config, this.typeGenerator);
    const syncCmd = new SyncCommand(
      this.config,
      this.typeGenerator,
      this.prompts
    );
    const testCmd = new TestCommand(this.config, this.prompts);

    this.program
      .command("sync")
      .description("Initialize or sync MindStudio configuration")
      .option("--key <apiKey>", "MindStudio API key")
      .option("--base-url <url>", "API base URL")
      .action((options) => syncCmd.execute(options));

    this.program
      .command("generate")
      .description("Generate type definitions from existing configuration")
      .action(() => generateCmd.execute());

    this.program
      .command("test")
      .description("Test a workflow")
      .option("--worker <worker>", "Worker name")
      .option("--workflow <workflow>", "Workflow name")
      .option("--input <input>", "Input JSON string")
      .action((options) => testCmd.execute(options));
  }

  public async run(args: string[]): Promise<void> {
    await this.program.parseAsync(args);
  }
}
