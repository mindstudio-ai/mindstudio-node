export interface CommandOptions {
  key?: string;
  baseUrl?: string;
  [key: string]: any;
}

export abstract class BaseCommand {
  abstract execute(options: CommandOptions): Promise<void>;
}
