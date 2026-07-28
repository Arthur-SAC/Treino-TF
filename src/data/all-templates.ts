import type { WorkoutTemplate } from "../lib/db";
import { ENTRADA_TEMPLATES } from "./entrada-seed";
import { WORKOUT_PLAN } from "./workout-plan-seed";
import { CYCLE_TEMPLATES } from "./cycles-seed";

/** Todos os templates de treino do app, na ordem dos ciclos: Entrada (3
 *  semanas) → Adaptação → variação/hipertrofia/refinamento/manutenção.
 *  Fonte única pra quem precisa gravar ou varrer o plano inteiro — o seed
 *  repetia os três laços em três blocos e era fácil esquecer um. */
export const ALL_TEMPLATES: WorkoutTemplate[] = [
  ...ENTRADA_TEMPLATES,
  ...WORKOUT_PLAN,
  ...CYCLE_TEMPLATES,
];
