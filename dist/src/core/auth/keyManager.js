"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyManager = void 0;
const dotenv = __importStar(require("dotenv"));
const errors_1 = require("@mindstudio/errors");
class KeyManager {
    /**
     * Resolves the API key from available sources in order of precedence:
     * 1. Direct argument
     * 2. Environment variable (MINDSTUDIO_KEY)
     * 3. .env file
     */
    static resolveKey(providedKey) {
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
        throw new errors_1.MindStudioError("API key not found" + this.API_KEY_ERROR_MESSAGE, "missing_api_key", 400);
    }
}
exports.KeyManager = KeyManager;
KeyManager.API_KEY_ERROR_MESSAGE = "\n❌ API key error:" +
    "\n\nYou can provide your API key in several ways:" +
    "\n   • Set MINDSTUDIO_KEY in your environment" +
    "\n   • Create a .env file with MINDSTUDIO_KEY=your-key" +
    "\n   • Pass --key flag to CLI commands" +
    "\n\nGet your API key at: https://app.mindstudio.ai/workspace/settings/developer?page=api-keys\n";
