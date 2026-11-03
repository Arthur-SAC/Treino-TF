// O núcleo do Hoje: os itens que decidem o prazo da cintura 99 → 84. Puro.
//
// Pedido dela em 2026-11-03, depois de eu mostrar que o Hoje pedia ~25 itens
// com o mesmo peso — a barba competia com o treino. Só quatro coisas movem a
// cintura: treino, comida (2.200 kcal, 150–160 g de proteína: as refeições
// do cardápio), caminhada/esteira e sono. O resto continua no Hoje, como
// extras: tem valor, não muda a data.
//
// Por id, não por rótulo: o id é o que o check do dia guarda, e o mesmo id
// troca de copy por modo (`caminhada-trabalho` vira esteira) e de bloco.

import type { DayRoutine, RoutineBlockGroup, RoutineItem } from "./today-routine";

export const NUCLEO_IDS: ReadonlySet<string> = new Set([
  // comida
  "cafe-marmita", "almoco", "lanche-saida", "jantar",
  // no domingo a marmita carrega a comida da semana inteira
  "marmita-domingo",
  // movimento que gasta
  "caminhada-trabalho", "caminhada-fds", "treino",
  // sono
  "dormir",
]);

export interface HojeSeparado {
  /** Na ordem do dia (a ordem dos blocos), não agrupado por tipo. */
  nucleo: RoutineItem[];
  /** Os blocos de sempre sem os itens do núcleo; bloco que esvazia sai. */
  extras: RoutineBlockGroup[];
}

export function separarNucleo(routine: DayRoutine): HojeSeparado {
  const nucleo: RoutineItem[] = [];
  const extras: RoutineBlockGroup[] = [];
  for (const bloco of routine.blocks) {
    const resto: RoutineItem[] = [];
    for (const item of bloco.items) (NUCLEO_IDS.has(item.id) ? nucleo : resto).push(item);
    if (resto.length > 0) extras.push({ ...bloco, items: resto });
  }
  return { nucleo, extras };
}
