// src/lib/micro-pausas.ts
// Rotação do catálogo de micro-pausas: qual conjunto de movimentos mostrar na
// pausa nº `n` do dia. Módulo puro — sem Date, sem Math.random — pra ficar
// estável e testável.

import { MICRO_PAUSAS, type MicroPausa } from "../data/micro-pausas-seed";

/** Janela deslizante sobre o catálogo. */
const WINDOW = 3;
/** Passo entre pausas consecutivas — menor que a janela, pra sempre sobrar
 *  pelo menos um movimento repetido entre uma pausa e a próxima (efeito de
 *  continuidade) mas ainda assim girar o catálogo inteiro. */
const STEP = 2;

/** Os movimentos da pausa nº `n` do dia (0-indexado). Rotativo e estável: a
 *  mesma pausa devolve sempre o mesmo conjunto, e ao longo do dia o rodízio
 *  cobre o catálogo inteiro (ver teste "cobre todos os movimentos"). */
export function pausaDaVez(n: number): MicroPausa[] {
  const len = MICRO_PAUSAS.length;
  const start = ((n * STEP) % len + len) % len;
  const result: MicroPausa[] = [];
  for (let i = 0; i < WINDOW; i++) {
    result.push(MICRO_PAUSAS[(start + i) % len]);
  }
  return result;
}
