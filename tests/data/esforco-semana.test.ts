import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";

// As duas refeições que decidem o resultado são o lanche das 15h30 e o jantar
// das 19h30 — os dois pontos de falha dela, ambos déficit agudo depois de
// esforço, não fraqueza. Plano que pede decisão com fome perde; plano que pede
// receita com fome perde mais rápido ainda. Por isso o esforço declarado dessas
// duas refeições é rede de teste, não etiqueta decorativa.
const ACEITOS = ["zero-preparo", "5-min", "lote-domingo"] as const;

describe("dia de semana é montar e esquentar", () => {
  it("toda opção de lanche e de jantar, em todo plano, declara um esforço de dia útil", () => {
    const fora = ALL_MEAL_PLANS.flatMap((p) =>
      p.slots
        .filter((s) => s.mealType === "lanche" || s.mealType === "jantar")
        .flatMap((s) =>
          s.variants.map((v) => ({ plano: p.name, refeicao: s.mealType, opcao: v.id, effort: v.effort })),
        ),
    ).filter((x) => !x.effort || !(ACEITOS as readonly string[]).includes(x.effort));
    expect(fora).toEqual([]);
  });

  it("o jantar nunca depende só de improviso — ao menos uma opção sai pronta do lote de domingo", () => {
    const semLote = ALL_MEAL_PLANS.filter(
      (p) =>
        !p.slots
          .find((s) => s.mealType === "jantar")!
          .variants.some((v) => v.effort === "lote-domingo"),
    ).map((p) => p.name);
    expect(semLote).toEqual([]);
  });
});
