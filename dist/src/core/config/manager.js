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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const paths_1 = require("./paths");
class ConfigManager {
    write(config) {
        fs.writeFileSync(paths_1.ConfigPaths.getConfigPath(), JSON.stringify(config, null, 2));
    }
    writeTypes(types) {
        const typesDir = paths_1.ConfigPaths.getTypesPath();
        fs.mkdirSync(typesDir, { recursive: true });
        fs.writeFileSync(path_1.default.join(typesDir, "workers.d.ts"), types);
    }
    readConfig() {
        try {
            const configFile = fs.readFileSync(paths_1.ConfigPaths.getConfigPath(), "utf-8");
            return JSON.parse(configFile);
        }
        catch (error) {
            throw new Error('Failed to load configuration. Run "mindstudio sync" first.');
        }
    }
    exists() {
        return fs.existsSync(paths_1.ConfigPaths.getConfigPath());
    }
    clean() {
        fs.rmSync(paths_1.ConfigPaths.getConfigPath(), { force: true });
    }
    generateConfig(client) {
        const workers = Object.values(client.workers).map((worker) => {
            var _a;
            const workflows = Object.values(worker).map((workflowFn) => {
                const info = workflowFn.__info;
                if (!info) {
                    throw new Error("Workflow function missing metadata");
                }
                return {
                    id: info.id,
                    name: info.name,
                    slug: info.slug,
                    launchVariables: info.launchVariables || [],
                    outputVariables: info.outputVariables || [],
                };
            });
            const firstWorkflowFn = Object.values(worker)[0];
            if (!((_a = firstWorkflowFn.__info) === null || _a === void 0 ? void 0 : _a.worker)) {
                throw new Error("Worker function missing metadata");
            }
            const workerInfo = firstWorkflowFn.__info.worker;
            return {
                id: workerInfo.id,
                name: workerInfo.name,
                slug: workerInfo.slug,
                workflows,
            };
        });
        return {
            version: "1.0.0",
            workers,
        };
    }
}
exports.ConfigManager = ConfigManager;
