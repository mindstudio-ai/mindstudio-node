import { TestOptions } from "@cli/types";
import { ConfigManager } from "@core/config/manager";
import { Prompts } from "../services/prompts";
import { BaseCommand } from "./base";
export declare class TestCommand implements BaseCommand {
    private config;
    private prompts;
    constructor(config: ConfigManager, prompts: Prompts);
    execute(options: TestOptions): Promise<void>;
}
