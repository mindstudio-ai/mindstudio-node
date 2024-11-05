import { MindStudioError } from "./errors";

export class InputValidator {
  validateInput(input: unknown, requiredKeys: string[]): void {
    if (!this.isValidStringRecord(input, requiredKeys)) {
      throw new MindStudioError(
        "Invalid input: all values must be strings and contain required keys",
        "validation_error",
        400,
        { requiredKeys, input }
      );
    }
  }

  validateOutput(output: unknown, expectedKeys: string[]): void {
    if (!this.isValidStringRecord(output, expectedKeys)) {
      throw new MindStudioError(
        "Invalid output: all values must be strings and contain expected keys",
        "validation_error",
        400,
        { expectedKeys, output }
      );
    }
  }

  private isValidStringRecord(value: unknown, requiredKeys: string[]): boolean {
    if (!value || typeof value !== "object") {
      return false;
    }

    const record = value as Record<string, unknown>;

    // Check all required keys exist
    for (const key of requiredKeys) {
      if (!(key in record)) {
        return false;
      }
    }

    // Check all values are strings
    for (const val of Object.values(record)) {
      if (typeof val !== "string") {
        return false;
      }
    }

    return true;
  }
}
