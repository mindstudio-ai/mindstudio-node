import { MindStudio } from "../../src/client";

describe("MindStudio Client Initialization", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    delete process.env.MINDSTUDIO_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should throw error when API key is missing", () => {
    expect(() => new MindStudio()).toThrow();
  });

  it("should initialize with custom base URL", () => {
    const customUrl = "https://custom-api.example.com";
    const client = new MindStudio("test-api-key", {
      baseUrl: customUrl,
    });

    expect(client).toBeInstanceOf(MindStudio);
  });

  it("should use API key from environment", () => {
    process.env.MINDSTUDIO_KEY = "env-api-key";
    const client = new MindStudio();
    expect(client).toBeInstanceOf(MindStudio);
  });

  it("should prioritize provided API key over environment", () => {
    process.env.MINDSTUDIO_KEY = "env-api-key";
    const providedKey = "provided-api-key";
    const client = new MindStudio(providedKey);
    expect(client).toBeInstanceOf(MindStudio);
  });
});
