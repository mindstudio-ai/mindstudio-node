export const mockConfig = {
  version: "1.0.0",
  workers: [
    {
      id: "test-worker-id",
      name: "Test Worker",
      slug: "test-worker",
      workflows: [
        {
          id: "test-workflow-id",
          name: "Generate Text",
          slug: "generateText",
          launchVariables: ["prompt"],
          outputVariables: [],
        },
      ],
    },
  ],
};
