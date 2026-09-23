import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";
import { VITALIDADE_GUIA } from "../../src/data/vitalidade-guide-seed";

const todasAsComidas = ALL_MEAL_PLANS.flatMap((p) => p.slots.flatMap((s) => s.variants.flatMap((v) => v.foods)));

describe("vitalidade no prato", () => {
  it("whey aparece em gramas de pó, nunca em 'scoop' — o scoop muda de marca pra marca", () => {
    const comScoop = todasAsComidas.filter((f) => /scoop/i.test(f.name) || /scoop/i.test(f.preparation ?? "")).map((f) => f.name);
    expect(comScoop).toEqual([]);
  });

  it("castanha-do-pará: no máximo 2 unidades por dia em qualquer combinação do cardápio", () => {
    for (const p of ALL_MEAL_PLANS) {
      const porSlot = p.slots.map((s) =>
        Math.max(0, ...s.variants.map((v) =>
          v.ingredients.filter((i) => /castanha-do-par[áa]/i.test(i.item)).reduce((a, i) => a + (i.unit === "un" ? i.qty : 99), 0),
        )),
      );
      expect({ plano: p.name, maxDia: porSlot.reduce((a, b) => a + b, 0) }).toEqual({ plano: p.name, maxDia: 2 });
    }
  });

  it("melancia entra em algum lanche", () => {
    const lanches = ALL_MEAL_PLANS[0].slots.find((s) => s.mealType === "lanche")!;
    expect(lanches.variants.some((v) => v.foods.some((f) => /melancia/i.test(f.name)))).toBe(true);
  });

  it("o guia diz que o efeito da comida é modesto, e aponta o que pesa de verdade", () => {
    const comida = VITALIDADE_GUIA.find((s) => s.id === "comida");
    expect(comida).toBeDefined();
    const t = JSON.stringify(comida).toLowerCase();
    expect(t).toMatch(/modesto/);
    expect(t).toMatch(/beterraba/);
    expect(t).toMatch(/castanha-do-par[áa]/);
    expect(t).toMatch(/nunca mais (que|de) (duas|2)/);
    expect(t).toMatch(/sono|dormir/);
  });
});
