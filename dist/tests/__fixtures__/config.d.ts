import { Worker } from "@core/types";
export declare const mockConfig: {
    version: string;
    workers: {
        id: string;
        name: string;
        slug: string;
        workflows: {
            id: string;
            name: string;
            slug: string;
            launchVariables: string[];
            outputVariables: string[];
        }[];
    }[];
};
export declare const mockWorkers: Worker[];
