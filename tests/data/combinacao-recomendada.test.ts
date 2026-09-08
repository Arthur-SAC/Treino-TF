import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS, GORDURA_PISO_PCT } from "../../src/data/meal-plan-seed";
import { CONSUMO } from "../../src/lib/objetivo";
import type { MealPlan, MealVariant } from "../../src/lib/db";

const soma = (variantes: MealVariant[]) => {
  const foods = variantes.flatMap((v) => v.foods);
  const kcal = foods.reduce((s, f) => s + f.kcal, 0);
  return {
    kcal,
    proteinG: foods.reduce((s, f) => s + (f.proteinG ?? 0), 0),
    fatG: foods.reduce((s, f) => s + (f.fatG ?? 0), 0),
    gorduraPct: ((foods.reduce((s, f) => s + (f.fatG ?? 0), 0) * 9) / kcal) * 100,
  };
};

/** Todas as combinações de uma opção por refeição — 5 × 3 × 3 × 3 no déficit.
 *  É o espaço real de escolha dela: o app deixa trocar de opção em cada
 *  refeição, então qualquer garantia que só valha para uma combinação não é
 *  garantia nenhuma. Foi exatamente assim que o buraco de proteína passou. */
function todasAsCombinacoes(plan: MealPlan): MealVariant[][] {
  return plan.slots.reduce<MealVariant[][]>(
    (acc, slot) => acc.flatMap((parcial) => slot.variants.map((v) => [...parcial, v])),
    [[]],
  );
}

const diaRecomendado = (plan: MealPlan) =>
  plan.slots.map((s) => s.variants.find((v) => v.recomendada)).filter((v): v is MealVariant => !!v);

describe("piso de gordura do dia", () => {
  it("nenhuma combinação possível, em nenhum plano, cai abaixo do piso", () => {
    const violacoes = ALL_MEAL_PLANS.flatMap((plano) =>
      todasAsCombinacoes(plano).map((combo) => {
        const { gorduraPct, fatG, kcal } = soma(combo);
        return {
          plano: plano.name,
          combo: combo.map((v) => v.id).join(" + "),
          fatG,
          kcal,
          pct: `${gorduraPct.toFixed(1)}%`,
          passa: gorduraPct >= GORDURA_PISO_PCT,
        };
      }),
    ).filter((r) => !r.passa);
    expect(violacoes).toEqual([]);
  });
});

describe("a combinação recomendada", () => {
  it("existe exatamente uma opção recomendada por refeição, em todo plano", () => {
    const erradas = ALL_MEAL_PLANS.flatMap((plano) =>
      plano.slots
        .map((slot) => ({
          plano: plano.name,
          refeicao: slot.mealType,
          quantas: slot.variants.filter((v) => v.recomendada).length,
        }))
        .filter((r) => r.quantas !== 1),
    );
    expect(erradas).toEqual([]);
  });

  // As quatro afirmações que a tela do cardápio faz sobre essa combinação. Se
  // um alimento mudar e alguma deixar de valer, quebra aqui — em vez de a
  // marca continuar apontando para um dia que não cumpre mais o que promete.
  it("cumpre o que a tela promete: proteína no piso, gordura acima do piso e kcal no alvo", () => {
    const violacoes = ALL_MEAL_PLANS.map((plano) => {
      const { kcal, proteinG, gorduraPct } = soma(diaRecomendado(plano));
      return {
        plano: plano.name,
        proteinaOk: proteinG >= CONSUMO.proteinaGMin,
        gorduraOk: gorduraPct >= GORDURA_PISO_PCT,
        kcalOk: Math.abs(kcal - plano.kcalDaily) / plano.kcalDaily <= 0.03,
        proteinG,
        pct: `${gorduraPct.toFixed(1)}%`,
        kcal,
      };
    }).filter((r) => !r.proteinaOk || !r.gorduraOk || !r.kcalOk);
    expect(violacoes).toEqual([]);
  });

  // Nitrato da dieta é o mecanismo vascular, e beterraba é a maior fonte
  // alimentar dele. A tela diz "com beterraba no jantar"; isto é o que impede
  // a frase de sobreviver a uma troca de cardápio que tire a beterraba de lá.
  it("carrega beterraba, que é o motivo de ela estar no cardápio", () => {
    const semBeterraba = ALL_MEAL_PLANS.filter(
      (plano) =>
        !diaRecomendado(plano).some((v) => v.foods.some((f) => /beterraba/i.test(f.name))),
    ).map((p) => p.name);
    expect(semBeterraba).toEqual([]);
  });

  // A combinação recomendada precisa ser boa DE VERDADE, não só válida: entre
  // todas as combinações que cumprem os pisos, ela tem que estar no topo em
  // proteína. A folga de 5 g existe por um motivo concreto e único — a opção 2
  // do lanche (patê de atum) entrega 3 g a mais, mas dura só 3 dias na
  // geladeira, e a recomendação é pra repetir a semana inteira.
  it("está no topo em proteína entre as combinações que cumprem os pisos", () => {
    const deficit = ALL_MEAL_PLANS.find((p) => p.goal === "deficit")!;
    const validas = todasAsCombinacoes(deficit)
      .map(soma)
      .filter((d) => d.gorduraPct >= GORDURA_PISO_PCT && d.proteinG >= CONSUMO.proteinaGMin);
    const melhorProteina = Math.max(...validas.map((d) => d.proteinG));
    const escolhida = soma(diaRecomendado(deficit));
    expect({
      escolhida: escolhida.proteinG,
      melhorPossivel: melhorProteina,
      dentroDaFolga: melhorProteina - escolhida.proteinG <= 5,
    }).toEqual({ escolhida: escolhida.proteinG, melhorPossivel: melhorProteina, dentroDaFolga: true });
  });
});
