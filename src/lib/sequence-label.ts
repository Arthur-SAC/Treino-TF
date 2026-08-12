// Rótulo de um item da rotina que serve uma SEQUÊNCIA do catálogo.
//
// Existe porque a mesma regra estava escrita duas vezes, em camadas
// diferentes: `rotuloPelvicoDoDia` (pelvic-progression.ts) e `rotuloFlexDoDia`
// (Today.tsx). A regra é uma só — a duração vem SEMPRE do catálogo, nunca de um
// número cravado no item, e quando a sequência não existe o rótulo fica nu em
// vez de mentir uma duração. Duas cópias da mesma regra divergem em silêncio, e
// aqui a divergência apareceria como dois itens do Hoje afirmando durações de
// origens diferentes.
//
// Mora neste módulo, e não em `today-routine.ts`, pela mesma razão de antes:
// aquele módulo é puro e não conhece o catálogo.
import { SEQUENCES } from "../data/sequences-seed";

/** A sequência do catálogo, por id. Uma busca só, num lugar só — era o
 *  `SEQUENCES.find` repetido nas duas camadas. */
export function sequenciaDoCatalogo(sequenceId: string) {
  return SEQUENCES.find((s) => s.id === sequenceId);
}

/** `"Assoalho pélvico · 5 min"`, `"Alongamento manhã · 12 min"`. Sem sequência
 *  no catálogo, devolve o rótulo nu: melhor um rótulo sem duração do que uma
 *  duração inventada. */
export function rotuloDaSequencia(baseLabel: string, sequenceId: string): string {
  const seq = sequenciaDoCatalogo(sequenceId);
  return seq ? `${baseLabel} · ${seq.durationMin} min` : baseLabel;
}
