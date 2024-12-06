import { Config } from "./types";
import { MindStudio } from "../../client";
export declare class ConfigManager {
    write(config: Config): void;
    writeTypes(types: string): void;
    readConfig(): Config;
    exists(): boolean;
    clean(): void;
    generateConfig(client: MindStudio): Config;
}
