import inquirer from "inquirer";
import { Config } from "@core/config/types";

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
        choices: Object.keys(config.workers),
      },
    ]);

    const { workflow } = await inquirer.prompt([
      {
        type: "list",
        name: "workflow",
        message: "Select a workflow:",
        choices: Object.keys(config.workers[worker].workflows),
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
