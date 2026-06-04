import { describe, it, expect } from "vitest";
import { deriveDefaultMeals } from "../../src/lib/meal-plan";
import type { MealSlot } from "../../src/lib/db";

const slots: MealSlot[] = [
  {
    mealType: "cafe",
    targetKcal: 500,
    variants: [
      { id: "cafe-1", label: "Opção 1", ingredients: [], foods: [{ name: "Ovos", qtyG: 165, kcal: 230 }] },
      { id: "cafe-2", label: "Opção 2", ingredients: [], foods: [{ name: "Tapioca", qtyG: 100, kcal: 240 }] },
    ],
  },
  {
    mealType: "almoco",
    targetKcal: 650,
    variants: [
      { id: "almoco-1", label: "Opção 1", ingredients: [], foods: [{ name: "Frango", qtyG: 180, kcal: 297 }] },
    ],
  },
];

describe("deriveDefaultMeals", () => {
  it("pega os foods da variante 0 de cada slot", () => {
    const result = deriveDefaultMeals(slots);
    expect(result).toHaveLength(2);
    expect(result[0][0].name).toBe("Ovos");
    expect(result[1][0].name).toBe("Frango");
  });

  it("retorna array vazio pra slot sem variantes", () => {
    const result = deriveDefaultMeals([{ mealType: "lanche", targetKcal: 350, variants: [] }]);
    expect(result).toEqual([[]]);
  });
});
