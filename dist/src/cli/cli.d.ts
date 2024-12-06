import { Command } from "commander";
import { ConfigManager } from "@core/config/manager";
import { TypeGenerator } from "./services/generator";
import { Prompts } from "./services/prompts";
export declare class CLI {
    private program;
    private configManager;
    private typeGenerator;
    private prompts;
    constructor(program?: Command, configManager?: ConfigManager, typeGenerator?: TypeGenerator, prompts?: Prompts);
    private setupCommands;
    run(args: string[]): Promise<void>;
}
