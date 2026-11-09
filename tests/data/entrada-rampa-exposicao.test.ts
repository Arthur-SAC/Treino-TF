import { describe, it, expect } from "vitest";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import { EXERCISES } from "../../src/data/exercises-seed";

// A rampa de exposição (teto de exposureLevel por semana) saiu em 2026-11-09:
// na Smartfit a Entrada virou rampa de carga e aprendizado — as réguas novas
// estão em tests/data/fase1-chun-li.test.ts.
const ids = new Set(EXERCISES.map((e) => e.id));

describe("Fase de Entrada", () => {
  it("todo exercício referenciado existe no catálogo", () => {
    const orfaos = ENTRADA_TEMPLATES.flatMap((t) =>
      t.exercises
        .flatMap((e) => [e.exerciseId, ...(e.substitutoId ? [e.substitutoId] : [])])
        .filter((id) => !ids.has(id))
        .map((id) => `${t.id}: ${id}`),
    );
    expect(orfaos).toEqual([]);
  });

  it("nenhuma sessão passa de 40 minutos (é fase de entrada, não de volume)", () => {
    for (const t of ENTRADA_TEMPLATES) {
      expect(t.durationMin).toBeLessThanOrEqual(40);
    }
  });
});
