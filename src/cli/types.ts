export interface SyncOptions {
  key?: string;
  baseUrl?: string;
  offline?: boolean;
}

export interface TestOptions {
  worker?: string;
  workflow?: string;
  input?: string;
  key?: string;
  baseUrl?: string;
}

export interface Config {
  version: string;
  workers: Array<{
    id: string;
    name: string;
    slug: string;
    workflows: Array<{
      id: string;
      name: string;
      slug: string;
      launchVariables: string[];
      outputVariables: string[];
    }>;
  }>;
}
