import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";

// Esta rede varre NOME DE ALIMENTO e NOME DE INGREDIENTE dos planos — nunca
// prosa de tela. A distinção é deliberada e já custou caro quatro vezes neste
// projeto: teste que proíbe uma palavra também proíbe negá-la, e uma varredura
// de `src/` apagaria a frase honesta "saiu o peito de peru do lanche" junto com
// o alimento. Aqui a afirmação proibida é servir o alimento, não citá-lo.
const BANIDOS = [
  "peito de peru",
  "presunto",
  "mortadela",
  "salsicha",
  "linguiça",
  "nugget",
  "hambúrguer congelado",
  "macarrão instantâneo",
  "empanado",
];

// Pão de forma e whey ficam de fora da lista de propósito. Pão de forma é o que
// torna o lanche do trabalho portátil e sem cheiro, e whey é suplemento de
// proteína isolada — nenhum dos dois é a categoria que esta frente combate
// (carne processada e prato pronto de micro-ondas).

const nomes = ALL_MEAL_PLANS.flatMap((p) =>
  p.slots.flatMap((s) =>
    s.variants.flatMap((v) => [
      ...v.foods.map((f) => ({ plano: p.name, opcao: v.id, texto: f.name })),
      ...v.ingredients.map((i) => ({ plano: p.name, opcao: v.id, texto: i.item })),
    ]),
  ),
);

describe("o cardápio não serve ultraprocessado", () => {
  it("nenhum alimento nem ingrediente, em nenhum plano, está na lista banida", () => {
    const achados = nomes.filter(({ texto }) =>
      BANIDOS.some((b) => texto.toLowerCase().includes(b)),
    );
    expect(achados).toEqual([]);
  });

  it("o lanche do trabalho tem proteína de verdade — ele segura 5 km, 1h de cães e o treino", () => {
    const fracos = ALL_MEAL_PLANS.flatMap((p) =>
      p.slots
        .filter((s) => s.mealType === "lanche")
        .flatMap((s) =>
          s.variants.map((v) => ({
            plano: p.name,
            opcao: v.id,
            proteina: v.foods.reduce((t, f) => t + (f.proteinG ?? 0), 0),
          })),
        ),
    ).filter((x) => x.proteina < 20);
    expect(fracos).toEqual([]);
  });
});
