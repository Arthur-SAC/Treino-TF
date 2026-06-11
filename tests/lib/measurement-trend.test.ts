import { describe, it, expect } from "vitest";
import { waistTrend, hipTrend } from "../../src/lib/measurement-trend";
import type { Measurement } from "../../src/lib/db";

const m = (date: string, waistCm?: number, hipCm?: number): Measurement => ({ date, waistCm, hipCm });

describe("waistTrend", () => {
  it("detecta queda além do limiar", () => {
    const t = waistTrend([m("2026-01-01", 80), m("2026-02-01", 78), m("2026-03-01", 76)]);
    expect(t.dir).toBe("down");
    expect(t.deltaCm).toBe(-4);
    expect(t.points).toBe(3);
  });
  it("detecta estável dentro do limiar (<=0,5cm)", () => {
    const t = waistTrend([m("2026-01-01", 76.3), m("2026-02-01", 76.0)]);
    expect(t.dir).toBe("stable");
  });
  it("detecta subida", () => {
    expect(waistTrend([m("2026-01-01", 76), m("2026-02-01", 78)]).dir).toBe("up");
  });
  it("usa só a janela das últimas n medidas com o campo", () => {
    const t = waistTrend([m("2026-01-01", 90), m("2026-02-01", 80), m("2026-03-01", 79), m("2026-04-01", 78)], 3);
    expect(t.deltaCm).toBe(-2); // 80 -> 78, ignora o 90
  });
  it("stable quando há menos de 2 pontos", () => {
    expect(waistTrend([m("2026-01-01", 80)]).dir).toBe("stable");
    expect(waistTrend([m("2026-01-01")]).points).toBe(0);
  });
});

describe("hipTrend", () => {
  it("detecta crescimento de quadril", () => {
    expect(hipTrend([m("2026-01-01", undefined, 100), m("2026-02-01", undefined, 102)]).dir).toBe("up");
  });
});
