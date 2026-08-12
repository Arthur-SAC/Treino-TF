// Horários da rotina do dia. Cada item do roteiro tem um horário PADRÃO
// (`defaultTime`), e a usuária pode ajustar qualquer um deles — os ajustes
// ficam no setting `routineTimes`, um mapa de id do item para "HH:MM".
//
// Existe porque a tela Hoje mostrava os blocos com horário ("Manhã ~6h") mas
// os itens dentro deles não, então não dava pra saber quando comer.

import { buildDayRoutine, type RoutineItem, type RoutineBlockGroup } from "./today-routine";

/** Ajustes da usuária: id do item -> "HH:MM". */
export type RoutineTimeOverrides = Record<string, string>;

/** Horário a exibir para um item: o ajuste da usuária vence o padrão. */
export function resolveRoutineTime(
  item: RoutineItem,
  overrides: RoutineTimeOverrides,
): string | undefined {
  return overrides[item.id] ?? item.defaultTime;
}

/** O alvo de sono é o horário do próprio item "dormir" da rotina, com o
 *  ajuste que ela fez em /hoje/horarios — nunca um número fixo no código.
 *  Já esteve fixo em "22:30" só dentro de Today.tsx, e dava três respostas
 *  pra mesma pergunta (linha, subtítulo e streak divergindo entre si); a
 *  Vitalidade duplicou esse mesmo fixo depois, e as duas TELAS passaram a
 *  divergir uma da outra. Recebe os blocos já montados (não o dia bruto) pra
 *  quem já tem `buildDayRoutine` calculado não precisar recalcular — e pra
 *  este módulo continuar puro, sem `new Date()` escondido aqui dentro. */
export function resolverAlvoSono(
  blocks: RoutineBlockGroup[],
  overrides: RoutineTimeOverrides,
): string {
  const itemDormir = blocks.flatMap((b) => b.items).find((i) => i.id === "dormir");
  return (itemDormir ? resolveRoutineTime(itemDormir, overrides) : undefined) ?? "22:30";
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

/** Une vários dias num conjunto único de blocos, sem repetir item (o mesmo id
 *  pode existir em mais de um dia). A união é por id de bloco, não por posição
 *  — um dia que não tivesse algum bloco não desalinharia o resto. */
function unirDias(dias: RoutineBlockGroup[][]): RoutineBlockGroup[] {
  const porId = new Map<string, RoutineBlockGroup>();
  const ordem: string[] = [];
  const itensVistos = new Set<string>();
  for (const blocos of dias) {
    for (const bloco of blocos) {
      if (!porId.has(bloco.id)) {
        porId.set(bloco.id, { ...bloco, items: [] });
        ordem.push(bloco.id);
      }
      const alvo = porId.get(bloco.id)!;
      for (const item of bloco.items) {
        if (itensVistos.has(item.id)) continue;
        itensVistos.add(item.id);
        alvo.items.push(item);
      }
    }
  }
  return ordem.map((id) => porId.get(id)!);
}

/** Todos os itens da semana inteira, num conjunto só — é daqui que a tela de
 *  ajuste tira a lista. Precisa dos sete dias porque a rotina muda de dia pra
 *  dia: a barba só aparece em dia do ano par, e dança/caminhada só no sábado.
 *  A tela dizia "todos ajustáveis" mas montava a lista só a partir de segunda,
 *  então os itens de sábado (que TÊM horário) nunca apareciam. */
export function blocosDaSemanaInteira(): RoutineBlockGroup[] {
  return unirDias([
    buildDayRoutine(1, 2).blocks, // segunda, dia do ano par — com barba
    buildDayRoutine(1, 1).blocks, // segunda, dia do ano ímpar — sem barba
    buildDayRoutine(6, 2).blocks, // sábado: dança e caminhada leve
    buildDayRoutine(0, 2).blocks, // domingo
  ]);
}

/** "19:00" -> "19h" · "16:40" -> "16h40" · "06:05" -> "6h05".
 *  Formato curto de relance, do jeito que se fala em pt-br. */
export function formatHora(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  const hora = String(Number(h));
  return m === "00" ? `${hora}h` : `${hora}h${m}`;
}
