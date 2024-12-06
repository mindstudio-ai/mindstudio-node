import { ConfigManager } from "@core/config/manager";
import { SyncOptions } from "../types";
import { BaseCommand } from "./base";
import { TypeGenerator } from "../services/generator";
export declare class SyncCommand implements BaseCommand {
    private configManager;
    private typeGenerator;
    constructor(configManager: ConfigManager, typeGenerator: TypeGenerator);
    private convertToWorkerWorkflows;
    execute(options: SyncOptions): Promise<void>;
}
