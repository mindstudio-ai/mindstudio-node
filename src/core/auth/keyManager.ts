import * as dotenv from "dotenv";
import { MindStudioError } from "@mindstudio/errors";

export class KeyManager {
  private static readonly API_KEY_ERROR_MESSAGE =
    "\n❌ API key error:" +
    "\n\nYou can provide your API key in several ways:" +
    "\n   • Set MINDSTUDIO_KEY in your environment" +
    "\n   • Create a .env file with MINDSTUDIO_KEY=your-key" +
    "\n   • Pass --key flag to CLI commands" +
    "\n\nGet your API key at: https://app.mindstudio.ai/workspace/settings/developer?page=api-keys\n";

  /**
   * Resolves the API key from available sources in order of precedence:
   * 1. Direct argument
   * 2. Environment variable (MINDSTUDIO_KEY)
   * 3. .env file
   */
  static resolveKey(providedKey?: string): string {
    // 1. Use provided key if available
    if (providedKey) {
      return providedKey;
    }

    // 2. Check environment variable
    if (process.env.MINDSTUDIO_KEY) {
      return process.env.MINDSTUDIO_KEY;
    }

    // 3. Try loading from .env file
    dotenv.config();
    if (process.env.MINDSTUDIO_KEY) {
      return process.env.MINDSTUDIO_KEY;
    }

    throw new MindStudioError(
      "API key not found" + this.API_KEY_ERROR_MESSAGE,
      "missing_api_key",
      400
    );
  }
}
