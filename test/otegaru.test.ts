import rewire from "rewire";
const __local__ = rewire("../src/otegaru");

describe("fixNumber", () => {
  const fixNumber = __local__.__get__("fixNumber");
  it("can trim number", async () => {
    expect(fixNumber("234.1m3")).toBe("234.1");
    expect(fixNumber("234.m3")).toBe("234");
    expect(fixNumber("234.")).toBe("234");
    expect(fixNumber("3,345,234")).toBe("3345234");
    expect(fixNumber(" 3,234.m3 ")).toBe("3234");
  });
});

describe("getName", () => {
  const getName = __local__.__get__("getName");
  it("can get name", () => {
    expect(
      getName(`
								1542682 ＞＞
							
								岐阜県関市武芸川町八幡１５５８－７武芸川温泉 ボイラー１
							`)
    ).toBe("武芸川温泉 ボイラー１");
  });
  it("can get name", () => {
    expect(
      getName(`
								1667843 ＞＞
							
								岐阜県土岐市土岐津町土岐口字中山１３７２とき温泉ＫＡＭＡＢＡ ボイラー
							`)
    ).toBe("とき温泉ＫＡＭＡＢＡ ボイラー");
  });
  it("can get name", () => {
    expect(getName()).toBe("");
  });
});
