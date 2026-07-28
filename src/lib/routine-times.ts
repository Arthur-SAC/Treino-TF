// Horários da rotina do dia. Cada item do roteiro tem um horário PADRÃO
// (`defaultTime`), e a usuária pode ajustar qualquer um deles — os ajustes
// ficam no setting `routineTimes`, um mapa de id do item para "HH:MM".
//
// Existe porque a tela Hoje mostrava os blocos com horário ("Manhã ~6h") mas
// os itens dentro deles não, então não dava pra saber quando comer.

import type { RoutineItem, RoutineBlockGroup } from "./today-routine";

/** Ajustes da usuária: id do item -> "HH:MM". */
export type RoutineTimeOverrides = Record<string, string>;

/** Horário a exibir para um item: o ajuste da usuária vence o padrão. */
export function resolveRoutineTime(
  item: RoutineItem,
  overrides: RoutineTimeOverrides,
): string | undefined {
  return overrides[item.id] ?? item.defaultTime;
}

/** Itens que a tela de ajuste oferece — os que têm horário padrão, sem repetir
 *  id (o mesmo item pode aparecer em mais de um dia da semana). */
export function itensAjustaveis(blocks: RoutineBlockGroup[]): RoutineItem[] {
  const vistos = new Set<string>();
  const lista: RoutineItem[] = [];
  for (const bloco of blocks) {
    for (const item of bloco.items) {
      if (!item.defaultTime || vistos.has(item.id)) continue;
      vistos.add(item.id);
      lista.push(item);
    }
  }
  return lista;
}

/** "19:00" -> "19h" · "16:40" -> "16h40" · "06:05" -> "6h05".
 *  Formato curto de relance, do jeito que se fala em pt-br. */
export function formatHora(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  const hora = String(Number(h));
  return m === "00" ? `${hora}h` : `${hora}h${m}`;
}
