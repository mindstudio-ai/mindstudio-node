"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = void 0;
const commander_1 = require("commander");
const manager_1 = require("@core/config/manager");
const commands_1 = require("./commands");
const generator_1 = require("./services/generator");
const prompts_1 = require("./services/prompts");
const list_1 = require("./commands/list");
class CLI {
    constructor(program = new commander_1.Command(), configManager = new manager_1.ConfigManager(), typeGenerator = new generator_1.TypeGenerator(), prompts = new prompts_1.Prompts()) {
        this.program = program;
        this.configManager = configManager;
        this.typeGenerator = typeGenerator;
        this.prompts = prompts;
        if (!this.program.commands.length) {
            this.setupCommands();
        }
    }
    setupCommands() {
        this.program.name("mindstudio").description("MindStudio CLI");
        if (!this.program.opts().version) {
            this.program.version(require("../../package.json").version);
        }
        this.program
            .option("--base-url <url>", "Override API base URL")
            .option("--key <apiKey>", "Override API key");
        const syncCmd = new commands_1.SyncCommand(this.configManager, this.typeGenerator);
        const testCmd = new commands_1.TestCommand(this.configManager, this.prompts);
        const listCmd = new list_1.ListCommand(this.configManager);
        this.program
            .command("sync")
            .description("Initialize workspace and manage type definitions")
            .option("--key <apiKey>", "MindStudio API key")
            .option("--base-url <url>", "API base URL")
            .option("--offline", "Generate types from existing config without API calls")
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
    async run(args) {
        await this.program.parseAsync(args);
    }
}
exports.CLI = CLI;
