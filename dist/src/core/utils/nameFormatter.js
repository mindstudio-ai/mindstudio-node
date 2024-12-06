"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityFormatter = void 0;
class EntityFormatter {
    static formatWorker(worker) {
        var _a;
        if (worker.slug) {
            return this.formatEntity(worker.slug, 'pascalCase');
        }
        const name = this.formatEntity(worker.name, 'pascalCase');
        return `${name}_${(_a = worker.id) === null || _a === void 0 ? void 0 : _a.split("-")[0]}`;
    }
    static formatWorkflow(workflow) {
        return this.formatEntity(workflow.name, 'camelCase');
    }
    static formatEntity(name, caseStyle) {
        var _a;
        // Preserve leading underscores
        const leadingUnderscores = ((_a = name.match(/^_+/)) === null || _a === void 0 ? void 0 : _a[0]) || "";
        // Remove illegal characters (keeping only letters, numbers, spaces, hyphens, and underscores)
        const cleanName = name
            .replace(/^_+/, "") // temporarily remove leading underscores
            .replace(/[^\w\s-]/g, ""); // remove all other illegal characters
        // Split on spaces, hyphens, and camelCase boundaries
        const words = cleanName
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .split(/[\s-]+/)
            .map((word) => word.toLowerCase())
            .filter((word) => word.length > 0);
        // Convert to camelCase and reattach leading underscores
        return (leadingUnderscores +
            words
                .map((word, index) => (index === 0 && caseStyle === 'camelCase')
                ? word.toLowerCase()
                : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(""));
    }
}
exports.EntityFormatter = EntityFormatter;
