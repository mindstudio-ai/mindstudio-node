"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MindStudioError = void 0;
class MindStudioError extends Error {
    constructor(message, code, status, details) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
        this.name = "MindStudioError";
    }
}
exports.MindStudioError = MindStudioError;
