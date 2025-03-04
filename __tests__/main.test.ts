/**
 * Basic tests for helper functions
 */

describe("helper file structure", () => {
  it("should pass a basic test", () => {
    expect(true).toBe(true);
  });

  it("can run an async test", async () => {
    const result = await Promise.resolve("test");
    expect(result).toBe("test");
  });
});
