import { MSWorker } from "@core/types";
export declare class WorkerDiscoveryService {
    static fetchWorkerDefinitions(apiKey: string, baseUrl?: string): Promise<MSWorker[]>;
}
