interface FormattableEntity {
    name: string;
    slug?: string;
    id?: string;
}
export declare class EntityFormatter {
    static formatWorker(worker: FormattableEntity): string;
    static formatWorkflow(workflow: FormattableEntity): string;
    private static formatEntity;
}
export {};
