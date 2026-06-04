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
