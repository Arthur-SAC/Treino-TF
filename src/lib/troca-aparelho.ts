import type { WorkoutTemplate } from "./db";

/** Item do template, com o id original quando já foi trocado por substituto. */
export type ItemTemplate = WorkoutTemplate["exercises"][number] & { originalId?: string };

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
      return { ...item, exerciseId: item.substitutoId, originalId: item.exerciseId } as ItemTemplate;
    }),
  };
}

/** Só dá pra marcar ausente quem tem substituto e ainda não foi trocado —
 *  senão o app deixaria a sessão sem exercício nenhum no lugar. */
export function podeMarcarAusente(item: ItemTemplate): boolean {
  return !!item.substitutoId && item.originalId === undefined;
}
