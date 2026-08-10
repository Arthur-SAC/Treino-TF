import { describe, it, expect } from "vitest";
import { BODY_GOAL_MILESTONES } from "../../src/data/milestones-seed";
import { MARCOS_CINTURA, FASES } from "../../src/lib/objetivo";

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

  it("as calorias citadas são as novas (2.300), não as antigas (2.200)", () => {
    expect(texto).not.toContain("2.200");
    expect(texto).toMatch(/2\.?300/);
  });
});
