// tests/lib/silhouette.test.ts
import { describe, it, expect } from "vitest";
import {
  shoulderHipRatio,
  whrGap,
  shoulderHipGap,
  leverGuidance,
  waistGuard,
} from "../../src/lib/silhouette";

describe("shoulderHipRatio", () => {
  it("calcula ombro/quadril", () => {
    expect(shoulderHipRatio(105, 110)).toBeCloseTo(0.9545, 3);
  });
  it("null se quadril inválido", () => {
    expect(shoulderHipRatio(105, 0)).toBeNull();
  });
});

describe("whrGap", () => {
  it("devolve as duas rotas (cintura ou quadril) quando acima do alvo", () => {
    expect(whrGap(0.8, 0.72, 80, 100)).toEqual({ waistDeltaCm: 8, hipDeltaCm: 11.1 });
  });
  it("zera quando já no alvo ou abaixo", () => {
    expect(whrGap(0.7, 0.72, 70, 100)).toEqual({ waistDeltaCm: 0, hipDeltaCm: 0 });
  });
});

describe("shoulderHipGap", () => {
  it("calcula quanto crescer de quadril pra baixar a razão", () => {
    expect(shoulderHipGap(1.05, 1.0, 105, 100)).toEqual({ hipDeltaCm: 5 });
  });
  it("zera quando já no alvo", () => {
    expect(shoulderHipGap(0.95, 1.0, 95, 100)).toEqual({ hipDeltaCm: 0 });
  });
});

describe("leverGuidance", () => {
  it("déficit foca cintura", () => {
    expect(leverGuidance("deficit").focus).toBe("cintura");
  });
  it("superávit foca quadril", () => {
    expect(leverGuidance("superavit").focus).toBe("quadril");
  });
  it("manutenção mantém", () => {
    expect(leverGuidance("manutencao").focus).toBe("manter");
  });
});

describe("leverGuidance não trata a ausência de TRH como provisório", () => {
  // Cobre a sigla e as variações da palavra — "hormônio", "hormonizar" etc.
  // voltariam a prometer o mesmo horizonte condicional por outra porta.
  const MENCAO_HORMONIO = /TRH|hormon/i;

  it("o conselho de superávit explica a vigilância da cintura sem prometer hormônio", () => {
    const g = leverGuidance("superavit");
    expect(g.why).not.toMatch(MENCAO_HORMONIO);
    expect(g.why).toMatch(/cintura/i);
  });

  it("nenhum dos três conselhos cita TRH ou variações de hormônio", () => {
    for (const meta of ["deficit", "manutencao", "superavit"] as const) {
      expect(leverGuidance(meta).why).not.toMatch(MENCAO_HORMONIO);
    }
  });
});

describe("waistGuard", () => {
  it("dispara no superávit quando cintura subiu >= 1,5cm", () => {
    expect(waistGuard({ cycleGoal: "superavit", waistStartCm: 75, waistNowCm: 77 }))
      .toEqual({ triggered: true, deltaCm: 2 });
  });
  it("não dispara no superávit com subida pequena", () => {
    expect(waistGuard({ cycleGoal: "superavit", waistStartCm: 75, waistNowCm: 75.5 }))
      .toEqual({ triggered: false, deltaCm: 0.5 });
  });
  it("nunca dispara fora do superávit", () => {
    expect(waistGuard({ cycleGoal: "deficit", waistStartCm: 75, waistNowCm: 80 }))
      .toEqual({ triggered: false, deltaCm: 5 });
  });
});
