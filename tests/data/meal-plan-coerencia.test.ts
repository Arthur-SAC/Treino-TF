import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";
import { CONSUMO } from "../../src/lib/objetivo";

const somaDaVariante0 = (plan: (typeof ALL_MEAL_PLANS)[number]) =>
  plan.slots.reduce(
    (acc, slot) => {
      const foods = slot.variants[0]?.foods ?? [];
      return {
        kcal: acc.kcal + foods.reduce((s, f) => s + (f.kcal ?? 0), 0),
        proteinG: acc.proteinG + foods.reduce((s, f) => s + (f.proteinG ?? 0), 0),
      };
    },
    { kcal: 0, proteinG: 0 },
  );

describe("plano de déficit bate com a meta declarada em objetivo.ts", () => {
  const deficit = ALL_MEAL_PLANS.find((p) => p.goal === "deficit")!;

  it("a meta declarada do plano é a meta do módulo de objetivo", () => {
    expect(deficit.kcalDaily).toBe(CONSUMO.metaKcal);
  });

  it("a comida de verdade soma a meta declarada, com 5% de tolerância", () => {
    const { kcal } = somaDaVariante0(deficit);
    const desvio = Math.abs(kcal - deficit.kcalDaily) / deficit.kcalDaily;
    expect({ kcal, alvo: deficit.kcalDaily, dentroDe5pct: desvio <= 0.05 })
      .toMatchObject({ dentroDe5pct: true });
  });

  it("a proteína entregue respeita o piso — exceder é bom, ficar abaixo não", () => {
    const { proteinG } = somaDaVariante0(deficit);
    expect(proteinG).toBeGreaterThanOrEqual(CONSUMO.proteinaGMin);
  });

  it("o nome do plano não contradiz o número", () => {
    expect(deficit.name).not.toContain("2200");
    expect(deficit.name).toContain(String(CONSUMO.metaKcal));
  });
});
