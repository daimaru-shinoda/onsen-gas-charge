import {
  loadJsonOtegaru,
  loadJsonGas,
  formatDate,
  zenkakuToHankaku,
  convertYMtoYYYYMM01,
  isExecDate,
  loadJsonToho,
} from "../src/utils";

describe("loadJsonOtegaru", () => {
  it("should not throw error", () => {
    const json = loadJsonOtegaru();
    expect(json.id).toBeDefined();
    expect(json.password).toBeDefined();
  });
});

describe("loadJsonToho", () => {
  it("should not throw error", () => {
    const json = loadJsonToho();
    expect(json.id).toBeDefined();
    expect(json.password).toBeDefined();
  });
});

describe("loadJsonGas", () => {
  it("should not throw error", () => {
    const json = loadJsonGas();
    expect(json.url).toBeDefined();
    expect(json.apiKey).toBeDefined();
  });
});

describe("formatDate", () => {
  it("should formated", () => {
    const actual = formatDate(new Date(2023, 9, 10));
    expect(actual).toBe("2023-10-10");
  });
  it("should be padding 0", () => {
    const actual = formatDate(new Date(2023, 0, 1));
    expect(actual).toBe("2023-01-01");
  });
});

describe("zenkakuToHankaku", () => {
  it("can convert", () => {
    expect(zenkakuToHankaku("１２３４５６７８９０")).toBe("1234567890");
  });
});

describe("convertYMtoYYYYMM01", () => {
  it("can convert", () => {
    expect(convertYMtoYYYYMM01("2025年8月")).toBe("2025/08/01");
    expect(convertYMtoYYYYMM01("2024年12月")).toBe("2024/12/01");
    expect(convertYMtoYYYYMM01("2025年07月")).toBe("2025/07/01");
    expect(convertYMtoYYYYMM01("   2025年8月 ")).toBe("2025/08/01");
  });
});

describe("isExecDate", () => {
  it("can be desicion", () => {
    expect(isExecDate(new Date(`2024-11-10`))).toBe(true);
    expect(isExecDate(new Date(`2024-11-30`))).toBe(true);
    expect(isExecDate(new Date(`2024-12-31`))).toBe(true);
    expect(isExecDate(new Date(`2024-2-29`))).toBe(true);
    expect(isExecDate(new Date(`2023-2-28`))).toBe(true);

    expect(isExecDate(new Date(`2024-12-30`))).toBe(false);
    expect(isExecDate(new Date(`2024-2-28`))).toBe(false);
    expect(isExecDate(new Date(`2024-2-27`))).toBe(false);
  });
});
