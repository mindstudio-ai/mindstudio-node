"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApiKey = validateApiKey;
function validateApiKey(key) {
    if (!key) {
        throw new Error("API key is required");
    }
    if (typeof key !== "string") {
        throw new Error("API key must be a string");
    }
    if (key.trim().length === 0) {
        throw new Error("API key cannot be empty");
    }
    return key.trim();
}
