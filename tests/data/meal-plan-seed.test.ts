import { describe, it, expect } from "vitest";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";

describe("INITIAL_PLAN", () => {
  it("é um plano de déficit calibrado", () => {
    expect(INITIAL_PLAN.goal).toBe("deficit");
    expect(INITIAL_PLAN.kcalDaily).toBe(2200);
    expect(INITIAL_PLAN.proteinG).toBeGreaterThanOrEqual(175);
  });

  it("tem 4 períodos com 3 variantes cada, todas com ingredientes", () => {
    expect(INITIAL_PLAN.slots).toHaveLength(4);
    const types = INITIAL_PLAN.slots.map((s) => s.mealType);
    expect(types).toEqual(["cafe", "almoco", "lanche", "jantar"]);
    for (const slot of INITIAL_PLAN.slots) {
      expect(slot.variants.length).toBe(3);
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
