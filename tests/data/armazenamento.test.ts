import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";
import { ARMAZENAMENTO, comoGuardar } from "../../src/data/armazenamento";

const EMOJI = /\p{Extended_Pictographic}/u;

describe("como guardar cada item", () => {
  it("todo ingrediente de todos os planos tem a sua linha", () => {
    const faltando = new Set<string>();
    for (const plan of ALL_MEAL_PLANS)
      for (const slot of plan.slots)
        for (const v of slot.variants)
          for (const ing of v.ingredients) if (!comoGuardar(ing.item)) faltando.add(ing.item);
    expect([...faltando]).toEqual([]);
  });

  it("a melancia diz como durar inteira e cortada", () => {
    const t = comoGuardar("Melancia")!;
    expect(t).toMatch(/Inteira/);
    expect(t).toMatch(/Cortada/);
  });

  it("sem emoji", () => {
    for (const t of Object.values(ARMAZENAMENTO)) expect(t).not.toMatch(EMOJI);
  });
});
