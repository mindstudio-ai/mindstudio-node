import * as fs from "fs";
import path from "path";
import { MSWorker, Worker, Workflow } from "../types";
import { MindStudio } from "../client/client";

export interface Config {
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
}

export class ConfigManager {
  write(config: Config): void {
    fs.writeFileSync(".mindstudio.json", JSON.stringify(config, null, 2));
  }

  writeTypes(types: string): void {
    try {
      // Try development path first
      const devTypesDir = path.join(__dirname, "../../dist");
      fs.mkdirSync(devTypesDir, { recursive: true });
      fs.writeFileSync(path.join(devTypesDir, "generated.d.ts"), types);
    } catch (error) {
      try {
        // Fall back to installed package path
        const packageDir = path.dirname(
          require.resolve("mindstudio/package.json")
        );
        const typesPath = path.join(packageDir, "dist", "generated.d.ts");
        fs.writeFileSync(typesPath, types);
      } catch (secondError) {
        // Final fallback to local node_modules
        const localPath = path.join(
          process.cwd(),
          "node_modules/mindstudio/dist/generated.d.ts"
        );
        fs.mkdirSync(path.dirname(localPath), { recursive: true });
        fs.writeFileSync(localPath, types);
      }
    }
  }

  load(): Config {
    try {
      const configFile = fs.readFileSync(".mindstudio.json", "utf-8");
      const config = JSON.parse(configFile);

      return {
        ...config,
      };
    } catch (error) {
      throw new Error(
        'Failed to load configuration. Run "mindstudio init" first.'
      );
    }
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

  convertToWorkerWorkflows(config: Config): MSWorker[] {
    return config.workers.map(
      (worker) =>
        new Worker(
          worker.id,
          worker.name,
          worker.slug,
          worker.workflows.map(
            (workflow) =>
              new Workflow(
                workflow.id,
                workflow.name,
                workflow.slug,
                workflow.launchVariables,
                workflow.outputVariables,
                worker
              )
          )
        )
    );
  }

  exists(): boolean {
    try {
      fs.accessSync(".mindstudio.json");
      return true;
    } catch {
      return false;
    }
  }

  clean(): void {
    fs.rmSync(".mindstudio.json", { force: true });
  }
}
