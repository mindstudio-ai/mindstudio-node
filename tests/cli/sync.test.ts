import { setupApiMock } from "../utils/mocks/api";

describe("sync command", () => {
  const apiMock = setupApiMock();

  beforeEach(() => {
    apiMock.reset();
  });

  it("should sync worker types", async () => {
    // Test CLI sync command
  });
});
