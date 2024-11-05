import fs from "fs/promises";
import path from "path";
import { MSWorker, Worker, Workflow } from "../types";
import { MindStudio, WorkerClient } from "../client";

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
  async write(config: Config): Promise<void> {
    await fs.writeFile(".mindstudio.json", JSON.stringify(config, null, 2));
  }

  async writeTypes(types: string): Promise<void> {
    try {
      // Try development path first
      const devTypesDir = path.join(__dirname, "../../dist");
      await fs.mkdir(devTypesDir, { recursive: true });
      await fs.writeFile(path.join(devTypesDir, "client.d.ts"), types);
    } catch (error) {
      try {
        // Fall back to installed package path
        const packageDir = path.dirname(
          require.resolve("mindstudio/package.json")
        );
        const clientDtsPath = path.join(packageDir, "dist", "client.d.ts");
        await fs.writeFile(clientDtsPath, types);
      } catch (secondError) {
        // Final fallback to local node_modules
        const localClientPath = path.join(
          process.cwd(),
          "node_modules/mindstudio/dist/client.d.ts"
        );
        await fs.mkdir(path.dirname(localClientPath), { recursive: true });
        await fs.writeFile(localClientPath, types);
      }
    }
  }

  async load(): Promise<Config> {
    try {
      const configFile = await fs.readFile(".mindstudio.json", "utf-8");
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
    const workers = Object.entries(
      client.workers as Record<string, WorkerClient>
    ).map(([workerStub, worker]) => {
      const workflows = Object.entries(worker).map(([_, workflowFn]) => {
        const info = workflowFn.__info;
        return {
          id: info.id,
          name: info.name,
          slug: info.slug,
          launchVariables: info.launchVariables || [],
          outputVariables: info.outputVariables || [],
        };
      });

      // Get the first workflow's worker info since it's the same for all workflows
      const firstWorkflow = Object.values(worker)[0];
      const workerInfo = firstWorkflow.__info.worker;

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

  async exists(): Promise<boolean> {
    try {
      await fs.access(".mindstudio.json");
      return true;
    } catch {
      return false;
    }
  }
}
