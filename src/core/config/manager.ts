import * as fs from "fs";
import path from "path";
import { ConfigPaths } from "./paths";
import { Config } from "./types";
import { MindStudio } from "../../client";

export class ConfigManager {
  write(config: Config): void {
    fs.writeFileSync(
      ConfigPaths.getConfigPath(),
      JSON.stringify(config, null, 2)
    );
  }

  writeTypes(types: string): void {
    const typesDir = ConfigPaths.getTypesPath();
    fs.mkdirSync(typesDir, { recursive: true });
    fs.writeFileSync(path.join(typesDir, "workers.d.ts"), types);
  }

  readConfig(): Config {
    try {
      const configFile = fs.readFileSync(ConfigPaths.getConfigPath(), "utf-8");
      return JSON.parse(configFile);
    } catch (error) {
      throw new Error(
        'Failed to load configuration. Run "mindstudio sync" first.'
      );
    }
  }

  exists(): boolean {
    return fs.existsSync(ConfigPaths.getConfigPath());
  }

  clean(): void {
    fs.rmSync(ConfigPaths.getConfigPath(), { force: true });
  }

  generateConfig(client: MindStudio): Config {
    const workers = Object.values(client.workers).map((worker) => {
      const workflows = Object.values(worker).map((workflowFn) => {
        const info = workflowFn.__info;
        if (!info) {
          throw new Error("Workflow function missing metadata");
        }
        return {
          id: info.id,
          name: info.name,
          slug: info.slug,
          launchVariables: info.launchVariables || [],
          outputVariables: info.outputVariables || [],
        };
      });

      const firstWorkflowFn = Object.values(worker)[0];
      if (!firstWorkflowFn.__info?.worker) {
        throw new Error("Worker function missing metadata");
      }
      const workerInfo = firstWorkflowFn.__info.worker;

      return {
        id: workerInfo.id,
        name: workerInfo.name,
        slug: workerInfo.slug,
        workflows,
      };
    });

    return {
      version: "1.0.0",
      workers,
    };
  }
}
