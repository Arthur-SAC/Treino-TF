import type { Meal, MealSlot, MealPlan } from "./db";
import { db } from "./db";
import { getSetting } from "./settings-helpers";
import { CYCLE_TO_GOAL } from "../data/cycles-seed";

/** Deriva `defaultMeals` (uma lista de foods por período) da variante 0 de cada slot. */
export function deriveDefaultMeals(slots: MealSlot[]): Meal["foods"][] {
  return slots.map((slot) => slot.variants[0]?.foods ?? []);
}

/** Plano alimentar da fase atual: mapeia o ciclo de treino ativo → meta
 *  (déficit/manutenção/superávit) → plano correspondente. Cai no primeiro
 *  plano se não achar a meta (retrocompat com instalações de plano único). */
export async function getActiveMealPlan(): Promise<MealPlan | undefined> {
  const cycle = await getSetting("activeCycle");
  const goal = CYCLE_TO_GOAL[cycle] ?? "deficit";
  const all = await db.mealPlans.toArray();
  return all.find((p) => p.goal === goal) ?? all[0];
}
