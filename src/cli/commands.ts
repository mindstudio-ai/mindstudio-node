import { Command } from "commander";
import { MindStudio } from "../client";
import { TypeGenerator } from "../codegen";
import { ConfigManager } from "./config";
import { Prompts } from "./prompts";

interface CommandOptions {
  key?: string;
  baseUrl?: string;
}

export class CLI {
  private program: Command;
  private config: ConfigManager;
  private prompts: Prompts;
  private typeGenerator: TypeGenerator;

  constructor() {
    this.program = new Command();
    this.config = new ConfigManager();
    this.prompts = new Prompts();
    this.typeGenerator = new TypeGenerator();
    this.setupCommands();
  }

  private setupCommands(): void {
    this.program
      .name("mindstudio")
      .description("MindStudio CLI")
      .version(require("../../package.json").version)
      .option("--base-url <url>", "Override API base URL")
      .option("--key <apiKey>", "Override API key");

    this.program
      .command("sync")
      .description("Initialize or sync MindStudio configuration")
      .option("--key <apiKey>", "MindStudio API key")
      .option("--base-url <url>", "API base URL")
      .action(this.handleSync.bind(this));

    this.program
      .command("generate")
      .description("Generate type definitions from existing configuration")
      .action(this.handleGenerate.bind(this));

    this.program
      .command("test")
      .description("Test a workflow")
      .option("--worker <worker>", "Worker name")
      .option("--workflow <workflow>", "Workflow name")
      .option("--input <input>", "Input JSON string")
      .action(this.handleTest.bind(this));
  }

  private getConfig(options: CommandOptions) {
    return {
      apiKey: options.key || process.env.MINDSTUDIO_KEY,
      baseUrl: options.baseUrl || process.env.MINDSTUDIO_BASE_URL,
    };
  }

  private async handleSync(cmdOptions: CommandOptions): Promise<void> {
    const isInit = !(await this.config.exists());
    console.log(isInit ? "Initializing MindStudio..." : "Syncing workspace...");

    try {
      const options = this.getConfig(cmdOptions);
      const apiKey = await this.prompts.getApiKey(options.apiKey);

      if (isInit) {
        console.log("Fetching worker configurations...");
      }

      const client = new MindStudio(apiKey, {
        baseUrl: options.baseUrl,
      });
      await client.init(true);

      if (isInit) {
        console.log("Generating configuration...");
      }

      const newConfig = this.config.generateConfig(client);
      await this.config.write(newConfig);

      console.log("Generating type definitions...");
      const types = this.typeGenerator.generateTypes(
        this.config.convertToWorkerWorkflows(newConfig)
      );
      await this.config.writeTypes(types);

      console.log(
        isInit
          ? "Successfully initialized MindStudio\nType definitions have been generated in node_modules/mindstudio/types"
          : "Successfully synced workspace"
      );
    } catch (error) {
      console.error(isInit ? "Initialization failed:" : "Sync failed:", error);
      process.exit(1);
    }
  }

  private async handleGenerate(): Promise<void> {
    try {
      if (!(await this.config.exists())) {
        throw new Error('No configuration found. Run "mindstudio sync" first.');
      }

      const config = await this.config.load();
      console.log("Generating type definitions...");

      const types = this.typeGenerator.generateTypes(
        this.config.convertToWorkerWorkflows(config)
      );
      await this.config.writeTypes(types);

      console.log("Successfully generated type definitions");
    } catch (error) {
      console.error("Generation failed:", error);
      process.exit(1);
    }
  }

  private async handleTest(options: {
    worker?: string;
    workflow?: string;
    input?: string;
  }): Promise<void> {
    try {
      const config = await this.config.load();
      const globalOptions = this.getConfig(this.program.opts());
      const apiKey = await this.prompts.getApiKey(globalOptions.apiKey);
      const client = new MindStudio(apiKey, {
        baseUrl: globalOptions.baseUrl,
      });
      await client.init();

      const { worker, workflow } =
        options.worker && options.workflow
          ? { worker: options.worker, workflow: options.workflow }
          : await this.prompts.selectWorkerAndWorkflow(config);

      const input = options.input
        ? JSON.parse(options.input)
        : await this.prompts.getWorkflowInput(config, worker, workflow);

      const result = await client.workers[worker][workflow](input);
      console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Test failed:", error);
      process.exit(1);
    }
  }

  public async run(args: string[]): Promise<void> {
    await this.program.parseAsync(args);
  }
}
