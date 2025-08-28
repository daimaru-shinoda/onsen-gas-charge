import rewire from "rewire";
const __local__ = rewire("../src/toho-biznet");

describe("fixNumber", () => {
  const fixNumber = __local__.__get__("fixNumber");
  it("can parse to number", async () => {
    expect(fixNumber("¥2,084,234")).toBe(2084234);
    expect(fixNumber("¥2084234")).toBe(2084234);
    expect(fixNumber("¥189,475")).toBe(189475);
    expect(fixNumber("189,475")).toBe(189475);
  });
});
