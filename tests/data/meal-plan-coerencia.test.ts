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

  it("a comida de verdade soma a meta declarada, com 3% de tolerância", () => {
    const { kcal } = somaDaVariante0(deficit);
    const desvio = Math.abs(kcal - deficit.kcalDaily) / deficit.kcalDaily;
    // Era 5% (115 kcal de folga em cima de 2300) — folga grande o bastante
    // pra um alimento inteiro mal contado passar batido sem o teste notar.
    // O desvio real é 1,3%, então 3% (69 kcal) ainda sobra margem confortável
    // pra comida de verdade nunca bater no grama, sem abrir mão de detectar erro.
    expect({ kcal, alvo: deficit.kcalDaily, dentroDe3pct: desvio <= 0.03 })
      .toMatchObject({ dentroDe3pct: true });
  });

  it("a proteína entregue respeita o piso — exceder é bom, ficar abaixo não", () => {
    const { proteinG } = somaDaVariante0(deficit);
    expect(proteinG).toBeGreaterThanOrEqual(CONSUMO.proteinaGMin);
  });

  it("o nome do plano não contradiz o número", () => {
    expect(deficit.name).not.toContain("2200");
    expect(deficit.name).toContain(String(CONSUMO.metaKcal));
  });

  // Fix round 1: MealPlanView mostra plan.kcalDaily no topo do cartão e a
  // soma dos slot.targetKcal (um por refeição) logo abaixo, na mesma tela
  // (src/pages/path/MealPlanView.tsx:115 e :158). Se as duas somas não
  // baterem, a usuária lê duas metas diferentes rolando a mesma tela — a
  // contradição que esta frente existe pra eliminar, agora dentro do próprio
  // plano em vez de entre telas.
  it("a soma dos alvos por refeição é o alvo do dia — os dois aparecem na mesma tela", () => {
    const somaDosSlots = deficit.slots.reduce((s, slot) => s + slot.targetKcal, 0);
    expect(somaDosSlots).toBe(deficit.kcalDaily);
  });
});
