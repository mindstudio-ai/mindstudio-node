import inquirer from "inquirer";
import { Config } from "../../core/config/types";

export class Prompts {
  async selectWorkerAndWorkflow(config: Config): Promise<{
    worker: string;
    workflow: string;
  }> {
    const { worker } = await inquirer.prompt([
      {
        type: "list",
        name: "worker",
        message: "Select a worker:",
        choices: config.workers.map((worker) => ({
          name: worker.name || worker.id, // Display name if available, fallback to id
          value: worker.id,
        })),
      },
    ]);

    const selectedWorker = config.workers.find((w) => w.id === worker);
    const { workflow } = await inquirer.prompt([
      {
        type: "list",
        name: "workflow",
        message: "Select a workflow:",
        choices: selectedWorker?.workflows.map((wf) => ({
          name: wf.name || wf.id, // Display name if available, fallback to id
          value: wf.id,
        })),
      },
    ]);

    return { worker, workflow };
  }

  async getWorkflowInput(
    config: Config,
    worker: string,
    workflow: string
  ): Promise<Record<string, string>> {
    const workflowConfig = config.workers
      .find(({ id }) => id === worker)
      ?.workflows.find(({ id }) => id === workflow);
    const input: Record<string, string> = {};

    for (const key of workflowConfig?.launchVariables || []) {
      const { value } = await inquirer.prompt([
        {
          type: "input",
          name: "value",
          message: `Enter value for ${key}:`,
        },
      ]);
      input[key] = value;
    }

    return input;
  }
}
