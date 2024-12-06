export interface CommandOptions {
  key?: string;
  baseUrl?: string;
  verbose?: boolean;
  [key: string]: any;
}

export interface SyncOptions extends CommandOptions {
  key?: string;
  baseUrl?: string;
  offline?: boolean;
}

export interface TestOptions extends CommandOptions {
  worker?: string;
  workflow?: string;
  input?: string;
  key?: string;
  baseUrl?: string;
}

export interface ListOptions extends CommandOptions {}

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
