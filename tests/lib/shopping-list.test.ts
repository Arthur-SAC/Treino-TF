import { describe, it, expect } from "vitest";
import { buildShoppingList } from "../../src/lib/shopping-list";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import type { MealPlan } from "../../src/lib/db";

const plan: MealPlan = {
  name: "teste",
  goal: "deficit",
  kcalDaily: 2200,
  proteinG: 180,
  carbG: 210,
  fatG: 70,
  defaultMeals: [],
  slots: [
    {
      mealType: "cafe",
      targetKcal: 500,
      variants: [
        {
          id: "cafe-1", label: "o1", foods: [],
          ingredients: [
            { item: "Ovos", qty: 3, unit: "un", category: "proteina" },
            { item: "Pão integral", qty: 60, unit: "g", category: "carboidrato" },
          ],
        },
        {
          id: "cafe-2", label: "o2", foods: [],
          ingredients: [{ item: "Ovos", qty: 2, unit: "un", category: "proteina" }],
        },
      ],
    },
  ],
};

describe("buildShoppingList", () => {
  it("soma quantidades do mesmo item+unidade entre variantes", () => {
    const list = buildShoppingList(plan);
    const ovos = list.find((i) => i.item === "Ovos");
    expect(ovos?.qty).toBe(5); // 3 + 2
    expect(ovos?.unit).toBe("un");
  });

  it("multiplica pelo fator repeats", () => {
    const list = buildShoppingList(plan, 2);
    expect(list.find((i) => i.item === "Ovos")?.qty).toBe(10); // (3+2)*2
  });

  it("ordena por categoria e depois por item", () => {
    const list = buildShoppingList(plan);
    expect(list.map((i) => i.item)).toEqual(["Pão integral", "Ovos"]); // carboidrato antes de proteina
  });
});

// `ingredients` tem que acompanhar `foods`: mudar alimento sem mudar o
// ingrediente correspondente faz a lista de compras divergir da receita — erro
// já cometido e pego na frente 1. A lista é o que ela leva pra feira; se o
// atum não estiver nela, o patê não existe na quarta-feira.
describe("a lista de compras acompanha o cardápio de Aracaju", () => {
  it("traz os ingredientes que esta frente introduziu e não traz os que ela tirou", () => {
    const lista = buildShoppingList({ ...INITIAL_PLAN, id: 1 } as MealPlan).map((i) =>
      i.item.toLowerCase(),
    );
    expect(lista.some((i) => i.includes("atum"))).toBe(true);
    expect(lista.some((i) => i.includes("castanha de caju"))).toBe(true);
    expect(lista.some((i) => i.includes("feijão de corda"))).toBe(true);
    expect(lista.filter((i) => i.includes("peito de peru"))).toEqual([]);
  });
});
