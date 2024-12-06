import { MSWorker } from "@core/types";
export declare class TypeGenerator {
    generateTypes(workers: MSWorker[]): string;
    private generateWorkerInterfaces;
    private generateInputType;
    private generateOutputType;
    private getWorkerInterfaceName;
}
