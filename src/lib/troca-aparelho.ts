import type { WorkoutTemplate } from "./db";

/** Item do template, com o id original quando já foi trocado por substituto. */
export type ItemTemplate = WorkoutTemplate["exercises"][number] & { originalId?: string };

/** Exercícios feitos um lado de cada vez. Quando um deles entra como
 *  substituto de um bilateral, o alvo herdado ("15-20") vale pra cada lado —
 *  ela faz as duas pernas, e a sessão leva o dobro naquele item. Sem o " cada",
 *  a tela mostraria metade do trabalho e o estimador mentiria a duração. */
export const UNILATERAIS: ReadonlySet<string> = new Set([
  "abdutor-band-em-pe",
  "abducao-quadril-polia",
  "abdutor-deitada",
  "abdutor-cabo-em-pe",
  "clamshell",
  "flexora-em-pe",
  "remada-unilateral-halter",
  "kickback",
  "kickback-cabo",
  "coice-gluteo-polia",
  "coice-maquina",
  "ativacao-gluteo-band-walks",
  "step-up-gluteo",
  "agachamento-bulgaro",
  "stiff-unilateral",
  "hip-thrust-unilateral",
  "elevacao-pelvica-banco",
]);

/** Alvo de reps do substituto: se ele é feito um lado por vez, o alvo herdado
 *  vale pra cada lado. Único lugar com essa regra — usado pela ausência
 *  permanente e pelo "Ocupado" da sessão. */
export function repsDoSubstituto(repsTarget: string, substitutoId: string): string {
  return UNILATERAIS.has(substitutoId) && !/cada/.test(repsTarget) ? `${repsTarget} cada` : repsTarget;
}

/** Troca cada item ausente pelo seu substituto. Um nível só: se o substituto
 *  também está ausente, ele fica mesmo assim (não há terceira opção, e seguir
 *  a cadeia poderia girar em laço). Devolve cópia; a entrada não é mutada. */
export function aplicarAusentes(
  t: WorkoutTemplate,
  ausentes: readonly string[],
): WorkoutTemplate {
  return {
    ...t,
    exercises: t.exercises.map((item) => {
      if (!item.substitutoId || !ausentes.includes(item.exerciseId)) return { ...item };
      const repsTarget = repsDoSubstituto(item.repsTarget, item.substitutoId);
      return { ...item, exerciseId: item.substitutoId, originalId: item.exerciseId, repsTarget } as ItemTemplate;
    }),
  };
}

/** Só dá pra marcar ausente quem tem substituto e ainda não foi trocado —
 *  senão o app deixaria a sessão sem exercício nenhum no lugar. */
export function podeMarcarAusente(item: ItemTemplate): boolean {
  return !!item.substitutoId && item.originalId === undefined;
}
