import { MindStudio } from "../../src/client";

describe("MindStudio Client Initialization", () => {
  const TEST_API_KEY = "test-api-key-123";

  it("should throw error when API key is missing", () => {
    expect(() => new MindStudio("")).toThrow("API key is required");
  });

  it("should initialize with custom base URL", () => {
    const client = new MindStudio(TEST_API_KEY, {
      baseUrl: "https://custom-api.example.com",
    });
    expect(client).toBeInstanceOf(MindStudio);
  });
});
