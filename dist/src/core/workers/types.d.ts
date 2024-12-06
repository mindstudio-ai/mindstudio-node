export interface MSVariables {
    [key: string]: string;
}
export interface MSWorker {
    id: string;
    name: string;
    slug: string;
    workflows: MSWorkflow[];
    toString(): string;
}
export interface MSWorkflow {
    id: string;
    name: string;
    slug: string;
    launchVariables: string[];
    outputVariables: string[];
    worker: Omit<MSWorker, "workflows">;
    toString(): string;
}
export declare class Worker implements MSWorker {
    id: string;
    name: string;
    slug: string;
    workflows: MSWorkflow[];
    constructor(id: string, name: string, slug: string, workflows: MSWorkflow[]);
    toString(): string;
}
export declare class Workflow implements MSWorkflow {
    id: string;
    name: string;
    slug: string;
    launchVariables: string[];
    outputVariables: string[];
    worker: Pick<MSWorker, "id" | "name" | "slug">;
    constructor(id: string, name: string, slug: string, launchVariables: string[], outputVariables: string[], worker: Pick<MSWorker, "id" | "name" | "slug">);
    toString(): string;
}
