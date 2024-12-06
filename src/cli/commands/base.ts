import { MindStudioError } from "../../errors";
import { CommandOptions } from "../types";

export abstract class BaseCommand {
  abstract execute(options: CommandOptions): Promise<void>;

  protected logDebug(message: string, options?: CommandOptions): void {
    if (options?.verbose) {
      console.log(`🔍 Debug: ${message}`);
    }
  }

  protected logError(
    error: unknown,
    message: string,
    options?: CommandOptions
  ): void {
    if (error instanceof MindStudioError) {
      console.error(
        `\n❌ ${message}:` +
          `\n   ${error.message}` +
          (options?.verbose
            ? `\n   Code: ${error.code}` +
              `\n   Status: ${error.status}` +
              (error.details
                ? `\n   Details: ${JSON.stringify(error.details, null, 2)}`
                : "")
            : "")
      );
    } else {
      console.error(
        `\n❌ ${message}:` +
          (options?.verbose
            ? `\n   ${error instanceof Error ? error.stack : String(error)}`
            : `\n   ${error instanceof Error ? error.message : String(error)}`)
      );
    }
  }
}
