"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const errors_1 = require("@mindstudio/errors");
const axios_1 = __importDefault(require("axios"));
const os_1 = require("os");
class HttpClient {
    constructor(apiKey, config = {}) {
        if (!apiKey) {
            throw new errors_1.MindStudioError("API key is required", "missing_api_key", 400);
        }
        const baseURL = config.baseUrl || "https://api.mindstudio.ai/developer/v2";
        this.http = axios_1.default.create({
            baseURL,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "User-Agent": `MindStudio-NPM/v${os_1.version}`,
            },
        });
    }
    async get(path) {
        try {
            const response = await this.http.get(path);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    async post(path, data) {
        try {
            const response = await this.http.post(path, data);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    handleError(error) {
        var _a, _b, _c, _d, _e, _f;
        if (axios_1.default.isAxiosError(error)) {
            const status = ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500;
            const code = ((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.code) || "unknown_error";
            const message = ((_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.message) || error.message;
            return new errors_1.MindStudioError(message, code, status, (_f = error.response) === null || _f === void 0 ? void 0 : _f.data);
        }
        return error instanceof Error ? error : new Error(String(error));
    }
}
exports.HttpClient = HttpClient;
