import type { WorkoutTemplate } from "../lib/db";
import { ENTRADA_TEMPLATES } from "./entrada-seed";
import { WORKOUT_PLAN } from "./workout-plan-seed";
import { CYCLE_TEMPLATES, CYCLE_TO_GOAL, type CycleId } from "./cycles-seed";
import { CARDIO_POS_TREINO } from "../lib/session-order";

/** Acelerador da fase 1 (pedido dela em 2026-11-04): todo treino de déficit
 *  fecha com 15-20 min de cardio leve. Na construção e na manutenção não — lá
 *  a balança sobe de propósito. Somado aqui, e não à mão em cada template,
 *  pra nenhum ciclo de déficit ficar de fora. */
function comCardioPosTreino(t: WorkoutTemplate): WorkoutTemplate {
  if (CYCLE_TO_GOAL[t.cycle as CycleId] !== "deficit") return t;
  if (t.exercises.some((e) => e.exerciseId === CARDIO_POS_TREINO)) return t;
  return {
    ...t,
    durationMin: t.durationMin + 15,
    exercises: [
      ...t.exercises,
      { exerciseId: CARDIO_POS_TREINO, sets: 1, repsTarget: "15-20min", restSec: 0, block: "final" },
    ],
  };
}

/** Todos os templates de treino do app, na ordem dos ciclos: Entrada (3
 *  semanas) → Adaptação → variação/hipertrofia/refinamento/manutenção.
 *  Fonte única pra quem precisa gravar ou varrer o plano inteiro — o seed
 *  repetia os três laços em três blocos e era fácil esquecer um. */
export const ALL_TEMPLATES: WorkoutTemplate[] = [
  ...ENTRADA_TEMPLATES,
  ...WORKOUT_PLAN,
  ...CYCLE_TEMPLATES,
].map(comCardioPosTreino);
