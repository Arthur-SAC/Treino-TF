import { describe, it, expect } from "vitest";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import { EXERCISES } from "../../src/data/exercises-seed";

const TETO: Record<string, number> = {
  "entrada-1": 2,
  "entrada-2": 3,
  "entrada-3": 4,
};

const nivel = new Map(EXERCISES.map((e) => [e.id, e.exposureLevel]));

describe("Fase de Entrada — rampa de exposição", () => {
  it("todo exercício respeita o teto de exposureLevel da sua semana", () => {
    const offenders = ENTRADA_TEMPLATES.flatMap((t) =>
      t.exercises
        .filter((e) => (nivel.get(e.exerciseId) ?? 99) > TETO[t.cycle as string])
        .map((e) => `${t.id} (teto ${TETO[t.cycle as string]}): ${e.exerciseId} é nível ${nivel.get(e.exerciseId)}`),
    );
    expect(offenders).toEqual([]);
  });

  it("todo exercício referenciado existe no catálogo", () => {
    const orfaos = ENTRADA_TEMPLATES.flatMap((t) =>
      t.exercises.filter((e) => !nivel.has(e.exerciseId)).map((e) => `${t.id}: ${e.exerciseId}`),
    );
    expect(orfaos).toEqual([]);
  });

  it("são 5 sessões por semana, de segunda a sexta, nas três semanas", () => {
    for (const cycle of ["entrada-1", "entrada-2", "entrada-3"]) {
      const dias = ENTRADA_TEMPLATES.filter((t) => t.cycle === cycle).map((t) => t.dayOfWeek).sort();
      expect(dias).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it("a semana 3 é a única que programa hip thrust", () => {
    const comHipThrust = ENTRADA_TEMPLATES.filter((t) =>
      t.exercises.some((e) => e.exerciseId.startsWith("hip-thrust")),
    );
    expect(comHipThrust.every((t) => t.cycle === "entrada-3")).toBe(true);
    expect(comHipThrust.length).toBeGreaterThan(0);
  });

  it("nenhuma sessão passa de 40 minutos (é fase de entrada, não de volume)", () => {
    for (const t of ENTRADA_TEMPLATES) {
      expect(t.durationMin).toBeLessThanOrEqual(40);
    }
  });
});
