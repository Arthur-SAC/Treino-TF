import type { Meal, MealSlot, MealPlan } from "./db";
import { db } from "./db";
import { getSetting } from "./settings-helpers";
import { CYCLE_TO_GOAL, type CycleId } from "../data/cycles-seed";

/** Deriva `defaultMeals` (uma lista de foods por período) da variante 0 de cada slot. */
export function deriveDefaultMeals(slots: MealSlot[]): Meal["foods"][] {
  return slots.map((slot) => slot.variants[0]?.foods ?? []);
}

/** Cintura a partir da qual o superávit calórico passa a fazer sentido.
 *  Acima disso, superávit deposita gordura abdominal — que é justamente a
 *  métrica-rei e hoje o ponto mais largo do corpo. Com o percentual de gordura
 *  atual e sendo iniciante, o glúteo cresce em manutenção (recomposição). */
export const CINTURA_LIBERA_SUPERAVIT_CM = 88;

/** Meta nutricional da fase. Só a hipertrofia é condicional: ela pediria
 *  superávit, mas só o recebe se a cintura já estiver abaixo do limiar.
 *  Sem medição (`null`), assume o caminho conservador. */
export function resolveGoal(
  cycle: CycleId,
  cinturaCm: number | null,
): "deficit" | "manutencao" | "superavit" {
  const base = CYCLE_TO_GOAL[cycle] ?? "deficit";
  if (base !== "superavit") return base;
  if (cinturaCm === null) return "manutencao";
  return cinturaCm <= CINTURA_LIBERA_SUPERAVIT_CM ? "superavit" : "manutencao";
}

/** Cintura da medição mais recente que a tenha registrado, ou null. */
export async function getLatestWaist(): Promise<number | null> {
  const todas = await db.measurements.orderBy("date").reverse().toArray();
  const comCintura = todas.find((m) => typeof m.waistCm === "number" && m.waistCm > 0);
  return comCintura?.waistCm ?? null;
}

/** Plano alimentar da fase atual. Cai no primeiro plano se não achar a meta
 *  (retrocompat com instalações de plano único). */
export async function getActiveMealPlan(): Promise<MealPlan | undefined> {
  const cycle = await getSetting("activeCycle");
  const goal = resolveGoal(cycle as CycleId, await getLatestWaist());
  const all = await db.mealPlans.toArray();
  return all.find((p) => p.goal === goal) ?? all[0];
}
