import { describe, it, expect } from "vitest";
import { distinctDays, daysInLast, currentStreak } from "../../src/lib/evolution";

describe("distinctDays", () => {
  it("conta dias únicos", () => {
    expect(distinctDays(["2026-06-10", "2026-06-10", "2026-06-11"])).toBe(2);
    expect(distinctDays([])).toBe(0);
  });
});

describe("daysInLast", () => {
  it("conta dias distintos dentro da janela", () => {
    expect(daysInLast(["2026-06-11", "2026-06-05", "2026-04-01"], "2026-06-11", 30)).toBe(2);
  });
  it("zero quando tudo fora da janela", () => {
    expect(daysInLast(["2026-01-01"], "2026-06-11", 30)).toBe(0);
  });
});

describe("currentStreak", () => {
  it("conta dias consecutivos terminando hoje", () => {
    expect(currentStreak(["2026-06-11", "2026-06-10", "2026-06-09", "2026-06-07"], "2026-06-11")).toBe(3);
  });
  it("zero se hoje não tem atividade", () => {
    expect(currentStreak(["2026-06-10"], "2026-06-11")).toBe(0);
  });
});
