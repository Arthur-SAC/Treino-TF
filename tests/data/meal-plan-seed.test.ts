import { describe, it, expect } from "vitest";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";

describe("INITIAL_PLAN", () => {
  it("é um plano de déficit calibrado", () => {
    expect(INITIAL_PLAN.goal).toBe("deficit");
    expect(INITIAL_PLAN.kcalDaily).toBe(2200);
    expect(INITIAL_PLAN.proteinG).toBeGreaterThanOrEqual(175);
  });

  it("tem 4 períodos, cada um com a contagem exata de variantes esperada (café 5, os demais 3), todas com ingredientes", () => {
    expect(INITIAL_PLAN.slots).toHaveLength(4);
    const types = INITIAL_PLAN.slots.map((s) => s.mealType);
    expect(types).toEqual(["cafe", "almoco", "lanche", "jantar"]);
    // Café tem 5: as 3 opções originais + as 2 que migraram do lanche das 16h
    // (gordura não atrapalha de manhã, atrapalha antes do treino das 17h45).
    const expectedVariants: Record<string, number> = { cafe: 5, almoco: 3, lanche: 3, jantar: 3 };
    for (const slot of INITIAL_PLAN.slots) {
      expect(slot.variants.length).toBe(expectedVariants[slot.mealType]);
      for (const v of slot.variants) {
        expect(v.foods.length).toBeGreaterThan(0);
        expect(v.ingredients.length).toBeGreaterThan(0);
      }
    }
  });

  it("a variante 0 de cada período soma ~2200 kcal e ~180g proteína no dia", () => {
    let kcal = 0;
    let protein = 0;
    for (const slot of INITIAL_PLAN.slots) {
      for (const f of slot.variants[0].foods) {
        kcal += f.kcal;
        protein += f.proteinG ?? 0;
      }
    }
    expect(kcal).toBeGreaterThanOrEqual(2100);
    expect(kcal).toBeLessThanOrEqual(2300);
    expect(protein).toBeGreaterThanOrEqual(165);
  });

  it("defaultMeals é derivado das variantes 0", () => {
    expect(INITIAL_PLAN.defaultMeals).toHaveLength(4);
    expect(INITIAL_PLAN.defaultMeals[0]).toEqual(INITIAL_PLAN.slots[0].variants[0].foods);
  });
});
