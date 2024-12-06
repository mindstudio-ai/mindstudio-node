import { MindStudio } from "../../src/public/client";
import { setupApiMock } from "../utils/mocks/api";

describe("MindStudio Client", () => {
  const apiMock = setupApiMock();
  const TEST_API_KEY = "test-api-key-123";

  beforeEach(() => {
    apiMock.reset();
  });

  describe("Public API", () => {
    it("should throw error when API key is missing", () => {
      expect(() => new MindStudio("")).toThrow("API key is required");
    });

    it("should execute workflow", async () => {
      apiMock.mockWorkflowExecution({
        result: "Generated text",
        billingCost: "0.01",
      });

      const client = new MindStudio(TEST_API_KEY);
      const result = await client.run({
        workerId: "test-worker",
        workflow: "generateText",
        variables: { prompt: "Hello" },
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe("Generated text");
    });
  });
});
