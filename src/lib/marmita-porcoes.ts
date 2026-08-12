import type { MealPlan, MealVariant } from "./db";

// Módulo puro — sem db e sem Date.
//
// O roteiro de domingo (marmita-domingo-seed.ts) fala em RENDIMENTO do lote:
// "1 kg de frango", "arroz de 5 a 6 refeições". É a informação certa para
// comprar e para pôr no fogo, e a errada para porcionar — na hora de fechar os
// potes o que importa é quanto vai em CADA um.
//
// Esse número já existe no cardápio: é o `qtyG` de cada alimento. Derivar dele
// aqui, em vez de reescrever as porções dentro do roteiro, é o que impede os
// dois de divergirem em silêncio quando uma porção mudar — o modo de falha mais
// caro deste projeto é regra de negócio escrita em dois lugares.

export interface PorcaoDaMarmita {
  mealType: "almoco" | "jantar";
  opcaoId: string;
  label: string;
  effort: MealVariant["effort"];
  itens: Array<{ name: string; qtyG: number }>;
  /** Soma dos itens — o número que a balança mostra com o pote cheio. */
  totalG: number;
}

/** As marmitas que o domingo produz: as opções de almoço e jantar marcadas
 *  como saídas do lote, com a porção pesada de cada alimento. */
export function porcoesDoLote(plan: MealPlan): PorcaoDaMarmita[] {
  const porcoes: PorcaoDaMarmita[] = [];
  for (const slot of plan.slots) {
    if (slot.mealType !== "almoco" && slot.mealType !== "jantar") continue;
    for (const v of slot.variants) {
      if (v.effort !== "lote-domingo") continue;
      const itens = v.foods.map((f) => ({ name: f.name, qtyG: f.qtyG }));
      porcoes.push({
        mealType: slot.mealType,
        opcaoId: v.id,
        label: v.label,
        effort: v.effort,
        itens,
        totalG: itens.reduce((s, i) => s + i.qtyG, 0),
      });
    }
  }
  return porcoes;
}
