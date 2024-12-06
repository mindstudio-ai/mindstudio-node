import { BaseCommand } from "./base";
import { ConfigManager } from "@core/config/manager";
import { ListOptions } from "../types";
export declare class ListCommand implements BaseCommand {
    private configManager;
    constructor(configManager: ConfigManager);
    execute(options: ListOptions): Promise<void>;
    private displayWorkers;
}
