export interface CommandOptions {
    key?: string;
    baseUrl?: string;
    [key: string]: any;
}
export declare abstract class BaseCommand {
    abstract execute(options: CommandOptions): Promise<void>;
}
