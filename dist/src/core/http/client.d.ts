import { HttpClientConfig } from "./types";
export declare class HttpClient {
    private readonly http;
    constructor(apiKey: string, config?: HttpClientConfig);
    get<T>(path: string): Promise<T>;
    post<T>(path: string, data?: unknown): Promise<T>;
    private handleError;
}
