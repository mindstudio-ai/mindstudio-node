import { HttpClient } from "@internal/http/client";
import { MSWorker, MSWorkflow, Workflow, Worker } from "@internal/types";

export class WorkerDiscoveryService {
  static async fetchWorkerDefinitions(
    apiKey: string,
    baseUrl?: string
  ): Promise<MSWorker[]> {
    const httpClient = new HttpClient(apiKey, { baseUrl });
    const workers = await httpClient.get<{
      apps: Array<{ id: string; name: string; slug: string }>;
    }>("/workers/load");

    return await Promise.all(
      workers.apps.map(async (workerData) => {
        const workflowData = await httpClient.get<{ workflows: MSWorkflow[] }>(
          `/workers/${workerData.id}/workflows`
        );

        return new Worker(
          workerData.id,
          workerData.name,
          workerData.slug,
          workflowData.workflows.map(
            (wf) =>
              new Workflow(
                wf.id,
                wf.name,
                wf.slug,
                wf.launchVariables,
                wf.outputVariables,
                workerData
              )
          )
        );
      })
    );
  }
}