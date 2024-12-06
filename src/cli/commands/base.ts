import { CommandOptions } from "../types";

export abstract class BaseCommand {
  abstract execute(options: CommandOptions): Promise<void>;

  protected logDebug(message: string, options?: CommandOptions): void {
    if (options?.verbose) {
      console.log(`🔍 Debug: ${message}`);
    }
  }
}
