import { describe, it, expect } from "vitest";
import { recommendCycleChange } from "../../src/lib/cycle-advisor";
import type { Trend } from "../../src/lib/measurement-trend";

const stable: Trend = { dir: "stable", deltaCm: 0, points: 3 };
const down: Trend = { dir: "down", deltaCm: -2, points: 3 };
const up: Trend = { dir: "up", deltaCm: 2, points: 3 };

const base = {
  activeCycle: "variacao" as const,
  sessionsInCycle: 60,
  threshold: 60,
  whr: 0.85,
  targetWhr: 0.72,
  waistTrend: down,
  hipTrend: up,
  waistGuardTriggered: false,
};

describe("recommendCycleChange", () => {
  it("manutencao não tem próximo", () => {
    expect(recommendCycleChange({ ...base, activeCycle: "manutencao" })).toBeNull();
  });

  it("não recomenda antes do piso de sessões", () => {
    expect(recommendCycleChange({ ...base, sessionsInCycle: 10 })).toBeNull();
  });

  it("adaptacao -> variacao pelo piso de sessões", () => {
    const r = recommendCycleChange({ ...base, activeCycle: "adaptacao" });
    expect(r?.recommend).toBe(true);
    expect(r?.toCycle).toBe("variacao");
  });

  it("variacao -> hipertrofia quando WHR atinge o alvo", () => {
    const r = recommendCycleChange({ ...base, whr: 0.72, waistTrend: down });
    expect(r?.toCycle).toBe("hipertrofia");
    expect(r?.reason).toMatch(/alvo/i);
  });

  it("variacao -> hipertrofia quando a cintura estabiliza (platô)", () => {
    const r = recommendCycleChange({ ...base, whr: 0.85, waistTrend: stable });
    expect(r?.toCycle).toBe("hipertrofia");
    expect(r?.reason).toMatch(/estabiliz/i);
  });

  it("variacao NÃO avança se cintura ainda cai e WHR longe do alvo", () => {
    expect(recommendCycleChange({ ...base, whr: 0.85, waistTrend: down })).toBeNull();
  });

  it("hipertrofia -> refinamento quando a trava de cintura dispara (override do piso)", () => {
    const r = recommendCycleChange({ ...base, activeCycle: "hipertrofia", sessionsInCycle: 5, waistGuardTriggered: true });
    expect(r?.toCycle).toBe("refinamento");
    expect(r?.reason).toMatch(/cintura/i);
  });

  it("hipertrofia -> refinamento quando o quadril estabiliza (com piso)", () => {
    const r = recommendCycleChange({ ...base, activeCycle: "hipertrofia", hipTrend: stable });
    expect(r?.toCycle).toBe("refinamento");
  });

  it("hipertrofia NÃO avança se quadril ainda cresce e sem trava", () => {
    expect(recommendCycleChange({ ...base, activeCycle: "hipertrofia", hipTrend: up })).toBeNull();
  });
});
