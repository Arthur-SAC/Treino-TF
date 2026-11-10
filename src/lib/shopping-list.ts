import type { IngredientCategory, MealPlan } from "./db";

export interface ShoppingItem {
  item: string;
  qty: number;
  unit: string;
  category: IngredientCategory;
}

/**
 * Agrega os ingredientes de TODAS as variantes do plano (uma porção de cada),
 * somando por item+unidade. `repeats` escala tudo (ex: 2 = duas rodadas).
 * Representa "comprar pra cobrir uma rodada de todas as opções".
 */
export function buildShoppingList(plan: MealPlan, repeats = 1): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>();
  for (const slot of plan.slots) {
    for (const variant of slot.variants) {
      for (const ing of variant.ingredients) {
        const key = `${ing.item}__${ing.unit}`;
        const existing = map.get(key);
        if (existing) {
          existing.qty += ing.qty * repeats;
        } else {
          map.set(key, {
            item: ing.item,
            qty: ing.qty * repeats,
            unit: ing.unit,
            category: ing.category,
          });
        }
      }
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => a.category.localeCompare(b.category) || a.item.localeCompare(b.item),
  );
}

/** Uma refeição de cada período por dia. É o que "a semana" significa aqui. */
export const PORCOES_POR_SEMANA = 7;

export interface WeeklyShoppingItem extends ShoppingItem {
  /** A conta antes do arredondamento. Fica exposta porque a diferença entre ela
   *  e `qty` é sobra real na geladeira — esconder isso faria a lista parecer
   *  mais exata do que é. */
  qtyExata: number;
}

/** Arredonda para a unidade em que o produto de fato é vendido. Peso e volume
 *  sobem para o múltiplo de 50 mais próximo (é assim que balança de feira e
 *  embalagem de mercado funcionam); o resto sobe para o inteiro, porque não
 *  existe 2,3 ovos no carrinho. Sempre para cima: faltar comida na quinta-feira
 *  custa muito mais caro que sobrar. */
function arredondaParaCompra(qty: number, unit: string): number {
  if (unit === "g" || unit === "ml") return Math.ceil(qty / 50) * 50;
  return Math.ceil(qty);
}

/**
 * Quanto comprar para a semana inteira, item por item.
 *
 * A lista de uma rodada (`buildShoppingList`) soma uma porção de cada variante
 * e manda "multiplicar conforme a semana" — conta que ninguém faz de cabeça no
 * corredor do mercado, e que nem tem um multiplicador só: cada período tem um
 * número diferente de opções (o café tem 5, os demais 3), então uma rodada de
 * café já cobre 5 dias enquanto uma de almoço cobre 3.
 *
 * Com o cardápio montado por dia (`dias` em cada opção), o fator de cada
 * opção é o número de dias em que ela entra — a compra é a semana que o Hoje
 * vai mostrar. Período sem `dias` (plano antigo) usa `PORCOES_POR_SEMANA / nº
 * de variantes`: sete refeições distribuídas por igual entre as opções.
 */
export function buildWeeklyShoppingList(plan: MealPlan): WeeklyShoppingItem[] {
  const map = new Map<string, WeeklyShoppingItem>();
  for (const slot of plan.slots) {
    if (slot.variants.length === 0) continue;
    // Cardápio montado por dia (desde 2026-11-10): cada opção conta os dias em
    // que entra na semana, e a opção sem dia fixo (troca livre) não entra na
    // compra. Sem nenhum `dias` no período, vale a divisão por igual de antes.
    const porDia = slot.variants.some((v) => v.dias && v.dias.length > 0);
    for (const variant of slot.variants) {
      const fator = porDia ? (variant.dias?.length ?? 0) : PORCOES_POR_SEMANA / slot.variants.length;
      if (fator === 0) continue;
      for (const ing of variant.ingredients) {
        const key = `${ing.item}__${ing.unit}`;
        const existing = map.get(key);
        if (existing) {
          existing.qtyExata += ing.qty * fator;
        } else {
          map.set(key, {
            item: ing.item,
            qty: 0, // preenchido depois: arredondar por parcela infla o total
            qtyExata: ing.qty * fator,
            unit: ing.unit,
            category: ing.category,
          });
        }
      }
    }
  }
  return Array.from(map.values())
    .map((i) => ({ ...i, qtyExata: Math.round(i.qtyExata * 10) / 10, qty: arredondaParaCompra(i.qtyExata, i.unit) }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.item.localeCompare(b.item));
}
