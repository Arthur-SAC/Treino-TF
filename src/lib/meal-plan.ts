import type { Meal, MealSlot } from "./db";

/** Deriva `defaultMeals` (uma lista de foods por período) da variante 0 de cada slot. */
export function deriveDefaultMeals(slots: MealSlot[]): Meal["foods"][] {
  return slots.map((slot) => slot.variants[0]?.foods ?? []);
}
