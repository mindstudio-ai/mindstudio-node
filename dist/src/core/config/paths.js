"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigPaths = void 0;
const path_1 = __importDefault(require("path"));
class ConfigPaths {
    static getConfigPath() {
        return ".mindstudio.json";
    }
    static getTypesPath() {
        try {
            // Try development path first
            return path_1.default.join(process.cwd(), "dist/src/generated");
        }
        catch {
            try {
                // Fall back to installed package path
                const packageDir = path_1.default.dirname(require.resolve("mindstudio/package.json"));
                return path_1.default.join(packageDir, "dist/src/generated");
            }
            catch {
                // Final fallback to local node_modules
                return path_1.default.join(process.cwd(), "node_modules/mindstudio/dist/src/generated");
            }
        }
    }
}
exports.ConfigPaths = ConfigPaths;
