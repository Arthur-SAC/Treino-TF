import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS, PROTEINA_PISO_POR_REFEICAO } from "../../src/data/meal-plan-seed";
import { CONSUMO } from "../../src/lib/objetivo";

// A rede irmã de tests/data/variantes-proximas-do-alvo.test.ts, que guarda a
// CALORIA de cada opção. A proteína não tinha equivalente: o único teste que a
// olhava (meal-plan-coerencia) somava a variante 0 de cada slot, que é a
// combinação mais rica do cardápio e passava sempre.
//
// O buraco que isso deixava, medido no cardápio anterior: café 21 + almoço 44 +
// lanche 21 + jantar 39 = 125g num dia inteiramente dentro do plano, contra os
// 150g que o app declara. Mesmas 2300 kcal, 83g de diferença, e nada na tela
// avisando. Em déficit de 600-800 kcal com cinco treinos por semana, esse
// buraco sai como massa magra perdida meses depois.
describe("trocar de opção não custa proteína", () => {
  it("a soma dos pisos por refeição é o piso do dia declarado em objetivo.ts", () => {
    const soma = Object.values(PROTEINA_PISO_POR_REFEICAO).reduce((s, g) => s + g, 0);
    expect(soma).toBeGreaterThanOrEqual(CONSUMO.proteinaGMin);
  });

  it("toda opção, de toda refeição, em todo plano, entrega o piso da sua refeição", () => {
    const violacoes = ALL_MEAL_PLANS.flatMap((plano) =>
      plano.slots.flatMap((slot) =>
        slot.variants.map((v) => {
          const proteinG = v.foods.reduce((s, f) => s + (f.proteinG ?? 0), 0);
          const piso = PROTEINA_PISO_POR_REFEICAO[slot.mealType];
          return { plano: plano.name, opcao: v.id, refeicao: slot.mealType, proteinG, piso, passa: proteinG >= piso };
        }),
      ),
    ).filter((r) => !r.passa);
    expect(violacoes).toEqual([]);
  });

  // O teste acima garante o piso opção a opção; este garante a consequência que
  // interessa: o PIOR dia possível — a opção mais pobre de cada refeição, todas
  // no mesmo dia — ainda respeita a meta de proteína do plano.
  it("o pior dia possível do cardápio de déficit ainda bate o piso de proteína", () => {
    const deficit = ALL_MEAL_PLANS.find((p) => p.goal === "deficit")!;
    const piorDia = deficit.slots.reduce((total, slot) => {
      const menor = Math.min(
        ...slot.variants.map((v) => v.foods.reduce((s, f) => s + (f.proteinG ?? 0), 0)),
      );
      return total + menor;
    }, 0);
    expect({ piorDia, bateOPiso: piorDia >= CONSUMO.proteinaGMin }).toEqual({ piorDia, bateOPiso: true });
  });
});

// A regra que o cabeçalho do slot `lanche` já declarava em prosa desde a frente
// 5 ("≤5g de gordura em toda opção") e que nenhum teste cobrava. Gordura atrasa
// o esvaziamento gástrico, e o lanche das 15h30 é seguido de 5 km a pé, 1h de
// cães e o treino — a regra vale mesmo depois do slot subir para 500 kcal, e
// vale nos três planos, porque o acréscimo por fase também passa por aqui.
describe("o lanche continua leve o bastante para a janela em que é comido", () => {
  it("nenhuma opção de lanche passa de 5g de gordura, em nenhum plano", () => {
    const violacoes = ALL_MEAL_PLANS.flatMap((plano) =>
      plano.slots
        .filter((s) => s.mealType === "lanche")
        .flatMap((slot) =>
          slot.variants.map((v) => {
            const fatG = v.foods.reduce((s, f) => s + (f.fatG ?? 0), 0);
            return { plano: plano.name, opcao: v.id, fatG, passa: fatG <= 5 };
          }),
        ),
    ).filter((r) => !r.passa);
    expect(violacoes).toEqual([]);
  });
});
