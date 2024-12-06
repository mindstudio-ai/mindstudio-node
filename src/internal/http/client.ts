import { MindStudioError } from "@public/errors";
import axios, { AxiosInstance } from "axios";
import { version } from "os";
import { HttpClientConfig } from "./types";

export class HttpClient {
  private readonly http: AxiosInstance;

  constructor(apiKey: string, config: HttpClientConfig = {}) {
    if (!apiKey) {
      throw new MindStudioError("API key is required", "missing_api_key", 400);
    }

    const baseURL = config.baseUrl || "https://api.mindstudio.ai/developer/v2";
    this.http = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": `MindStudio-NPM/v${version}`,
      },
    });
  }

  async get<T>(path: string): Promise<T> {
    try {
      const response = await this.http.get<T>(path);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    try {
      const response = await this.http.post<T>(path, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const code = error.response?.data?.code || "unknown_error";
      const message = error.response?.data?.message || error.message;
      return new MindStudioError(message, code, status, error.response?.data);
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
