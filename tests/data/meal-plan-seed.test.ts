import { describe, it, expect } from "vitest";
import { INITIAL_PLAN, ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";

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

  // As três opções do lanche têm que ser intercambiáveis: escolher a 2 em vez
  // da 1 não pode custar o dia. A opção 2 somava 338 kcal contra o alvo de 350
  // porque o peito de peru declarava 83 kcal enquanto os próprios macros
  // (17P/2C/2G) somam 94. Este é o período que a leva anterior calibrou.
  it("as três opções do lanche ficam perto do alvo — trocar de opção não muda o dia", () => {
    const lanche = INITIAL_PLAN.slots.find((s) => s.mealType === "lanche")!;
    for (const v of lanche.variants) {
      const kcal = v.foods.reduce((s, f) => s + f.kcal, 0);
      expect({ opcao: v.label, dentroDoAlvo: Math.abs(kcal - lanche.targetKcal) <= 30, kcal })
        .toEqual({ opcao: v.label, dentroDoAlvo: true, kcal });
    }
  });

  // Generaliza a proteção que antes só existia pro lanche (teste acima, com
  // margem fixa de 30 kcal): as opções 4 e 5 do café passaram despercebidas
  // porque nada cobria a faixa calórica das OUTRAS refeições. Cobre os três
  // planos (déficit/manutenção/superávit) — o boost por fase soma o mesmo
  // kcal ao alvo e a cada variante, então a folga percentual só encolhe.
  it("toda variante de toda refeição, em todo plano, fica dentro de ±15% do targetKcal do seu slot", () => {
    const violacoes: Array<{ plano: string; refeicao: string; opcao: string; kcal: number; alvo: number; desvio: string }> = [];
    for (const plano of ALL_MEAL_PLANS) {
      for (const slot of plano.slots) {
        for (const v of slot.variants) {
          const kcal = v.foods.reduce((s, f) => s + f.kcal, 0);
          const desvio = Math.abs(kcal - slot.targetKcal) / slot.targetKcal;
          if (desvio > 0.15) {
            violacoes.push({
              plano: plano.name,
              refeicao: slot.mealType,
              opcao: v.label,
              kcal,
              alvo: slot.targetKcal,
              desvio: `${(desvio * 100).toFixed(1)}%`,
            });
          }
        }
      }
    }
    expect(violacoes).toEqual([]);
  });

  // As opções 4 e 5 migraram do lanche com porção de lanche (~355-360 kcal,
  // 10-15g proteína) — 145 kcal e até 32g de proteína a menos que as outras
  // três (~470-550 kcal, 21-42g proteína) num slot calibrado pra 500 kcal.
  // Proteína é a alavanca que ela menos pode perder (construção de glúteo).
  it("as cinco opções do café ficam parecidas em kcal, e nenhuma cai abaixo de 20g de proteína", () => {
    const cafe = INITIAL_PLAN.slots.find((s) => s.mealType === "cafe")!;
    for (const v of cafe.variants) {
      const kcal = v.foods.reduce((s, f) => s + f.kcal, 0);
      const protein = v.foods.reduce((s, f) => s + (f.proteinG ?? 0), 0);
      expect({ opcao: v.label, dentroDoAlvo: Math.abs(kcal - cafe.targetKcal) / cafe.targetKcal <= 0.15, kcal })
        .toEqual({ opcao: v.label, dentroDoAlvo: true, kcal });
      expect({ opcao: v.label, proteinaOk: protein >= 20, protein }).toEqual({ opcao: v.label, proteinaOk: true, protein });
    }
  });

  it("as kcal do peito de peru batem com os próprios macros", () => {
    const lanche = INITIAL_PLAN.slots.find((s) => s.mealType === "lanche")!;
    const peru = lanche.variants.flatMap((v) => v.foods).find((f) => f.name.includes("Peito de peru"))!;
    expect(peru.kcal).toBe((peru.proteinG ?? 0) * 4 + (peru.carbG ?? 0) * 4 + (peru.fatG ?? 0) * 9);
  });

  it("defaultMeals é derivado das variantes 0", () => {
    expect(INITIAL_PLAN.defaultMeals).toHaveLength(4);
    expect(INITIAL_PLAN.defaultMeals[0]).toEqual(INITIAL_PLAN.slots[0].variants[0].foods);
  });
});
