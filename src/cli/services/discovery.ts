import { HttpClient } from "../../core/http/client";
import { MSWorker, MSWorkflow, Worker, Workflow } from "../../core/types";

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
      workers.apps
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(async (workerData) => {
          const workflowData = await httpClient.get<{
            workflows: MSWorkflow[];
          }>(`/workers/${workerData.id}/workflows`);

          return new Worker(
            workerData.id,
            workerData.name,
            workerData.slug,
            workflowData.workflows
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(
                (wf) =>
                  new Workflow(
                    wf.id,
                    wf.name,
                    wf.slug,
                    wf.launchVariables.map((v) => (v || '').replace(/[\W]+/g, '')).filter((v) => v),
                    wf.outputVariables.map((v) => (v || '').replace(/[\W]+/g, '')).filter((v) => v),
                    workerData
                  )
              )
          );
        })
    );
  }
}
