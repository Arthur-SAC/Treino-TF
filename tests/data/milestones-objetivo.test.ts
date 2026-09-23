import { describe, it, expect } from "vitest";
import { BODY_GOAL_MILESTONES, MILESTONES_MESES } from "../../src/data/milestones-seed";
import { MARCOS_CINTURA, FASES, CONSUMO } from "../../src/lib/objetivo";

const texto = JSON.stringify(BODY_GOAL_MILESTONES);

describe("marcos do objetivo", () => {
  it("existe um marco para cada trava de cintura", () => {
    for (const m of MARCOS_CINTURA) {
      expect(texto).toContain(String(m.cinturaCm));
    }
  });

  it("nenhum marco existe para alinhar com a TRH", () => {
    expect(texto).not.toMatch(/TRH/i);
  });

  it("avisa que na fase 2 a balança sobe de propósito", () => {
    expect(texto).toMatch(/sobe/i);
    expect(texto).toContain(String(FASES[1].pesoKgMin));
  });

  it("as calorias citadas são as da meta atual de objetivo.ts — nunca um número solto", () => {
    expect(texto).toContain(CONSUMO.metaKcal.toLocaleString("pt-BR"));
    expect(texto).not.toMatch(/2\.300/);
  });

  it("as faixas citadas no texto contêm os valores pontuais do módulo — texto e dado não podem derivar", () => {
    const fase2 = FASES.find((f) => f.id === "fase-2")!;
    const limites = (s: string) => s.split("-").map((n) => Number(n.replace(",", ".")));
    const [provMin, provMax] = limites("0,75-0,78");
    const [excMin, excMax] = limites("0,72-0,74");

    expect(texto).toContain("0,75-0,78");
    expect(texto).toContain("0,72-0,74");

    expect(fase2.whrProvavel).toBeGreaterThanOrEqual(provMin);
    expect(fase2.whrProvavel).toBeLessThanOrEqual(provMax);
    expect(fase2.whrExcelente!).toBeGreaterThanOrEqual(excMin);
    expect(fase2.whrExcelente!).toBeLessThanOrEqual(excMax);
  });

  it("os meses dos marcos saem de objetivo.ts — cintura 88, cintura 84 e fase 2", () => {
    expect(MILESTONES_MESES.cintura88).toBe(MARCOS_CINTURA[0].mesMin);
    expect(MILESTONES_MESES.cintura84).toBe(MARCOS_CINTURA[1].mesMin);
    expect(MILESTONES_MESES.fase2).toBe(FASES.find((f) => f.id === "fase-2")!.mesInicio);
  });

  it("os pesos citados nos marcos são os das fases", () => {
    const f1 = FASES.find((f) => f.id === "fase-1")!;
    expect(texto).toContain(`${f1.pesoKgMin}-${f1.pesoKgMax} kg`);
    expect(texto).not.toMatch(/~81|por volta de 81/);
  });
});
