import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";

// Aperta pra 10% o guard de ±15% que vive em meal-plan-seed.test.ts. Os 15%
// eram margem herdada da frente 1, e sete variantes estavam ocupando a faixa
// dos 12-15% — trocar de opção custava até 100 kcal do dia sem nada avisar.
// Esta frente reaproxima essas variantes ao trocar alimentos, e o guard mais
// apertado é o que impede a folga de voltar sozinha.
describe("trocar de opção não muda o dia", () => {
  it("nenhuma variante, em nenhum plano, desvia mais de 10% do alvo do seu slot", () => {
    const violacoes = ALL_MEAL_PLANS.flatMap((plano) =>
      plano.slots.flatMap((slot) =>
        slot.variants.map((v) => {
          const kcal = v.foods.reduce((s, f) => s + f.kcal, 0);
          const desvio = Math.abs(kcal - slot.targetKcal) / slot.targetKcal;
          return {
            plano: plano.name,
            opcao: v.id,
            kcal,
            alvo: slot.targetKcal,
            desvio: `${(desvio * 100).toFixed(1)}%`,
            passa: desvio <= 0.1,
          };
        }),
      ),
    ).filter((r) => !r.passa);
    expect(violacoes).toEqual([]);
  });
});

describe("a castanha de caju entra pelo lugar certo", () => {
  const comCaju = (mealType: string) =>
    ALL_MEAL_PLANS.flatMap((p) =>
      p.slots
        .filter((s) => s.mealType === mealType)
        .flatMap((s) => s.variants.filter((v) => v.foods.some((f) => /castanha de caju/i.test(f.name)))),
    );

  it("está no café, que é a refeição sem pressa e sem treino em seguida", () => {
    expect(comCaju("cafe").length).toBeGreaterThanOrEqual(3);
  });

  // Não é preferência de sabor: o lanche tem teto de 5g de gordura porque ela
  // caminha 5 km e treina logo depois, e 15g de caju sozinhos são ~7g.
  it("não está em nenhuma opção de lanche", () => {
    expect(comCaju("lanche").map((v) => v.id)).toEqual([]);
  });
});
