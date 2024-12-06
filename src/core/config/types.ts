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

export interface ConfigPaths {
  configFile: string;
  typesDir: string;
}
