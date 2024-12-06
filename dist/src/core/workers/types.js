"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workflow = exports.Worker = void 0;
const nameFormatter_1 = require("@core/utils/nameFormatter");
class Worker {
    constructor(id, name, slug, workflows) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.workflows = workflows;
    }
    toString() {
        return nameFormatter_1.EntityFormatter.formatWorker(this);
    }
}
exports.Worker = Worker;
class Workflow {
    constructor(id, name, slug, launchVariables, outputVariables, worker) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.launchVariables = launchVariables;
        this.outputVariables = outputVariables;
        this.worker = worker;
    }
    toString() {
        return nameFormatter_1.EntityFormatter.formatWorkflow(this);
    }
}
exports.Workflow = Workflow;
