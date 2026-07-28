import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";

const variantes = ALL_MEAL_PLANS.flatMap((p) => p.slots.flatMap((s) => s.variants.map((v) => ({ slot: s.mealType, v }))));

describe("praticidade das refeições", () => {
  it("toda variante declara o esforço de preparo", () => {
    const sem = variantes.filter(({ v }) => !v.effort).map(({ v }) => v.id);
    expect(sem).toEqual([]);
  });

  it("o lanche pré-treino é leve em gordura — ela caminha 1h e treina logo depois", () => {
    const pesados = variantes
      .filter(({ slot }) => slot === "lanche")
      .map(({ v }) => ({ id: v.id, gordura: v.foods.reduce((t, f) => t + (f.fatG ?? 0), 0) }))
      .filter((x) => x.gordura > 5);
    expect(pesados).toEqual([]);
  });

  it("todo lanche continua sendo portátil e tem ao menos duas opções", () => {
    const doLanche = variantes.filter(({ slot }) => slot === "lanche");
    expect(doLanche.length).toBeGreaterThanOrEqual(2);
  });

  it("as receitas com ovo/queijo coalho não sumiram — migraram pro café", () => {
    const cafe = variantes.filter(({ slot }) => slot === "cafe").map(({ v }) => v.label.toLowerCase()).join(" | ");
    expect(cafe).toMatch(/ovo|coalho/);
  });
});
