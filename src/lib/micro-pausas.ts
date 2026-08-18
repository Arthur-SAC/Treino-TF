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

/** Quantas micro-pausas o dia pede, derivado das mesmas configurações que já
 *  disparam os lembretes: da hora de início à de fim do expediente, uma a cada
 *  `intervaloMin`. Com os padrões (9h→18h, 90 min) dá 6. Existe porque o
 *  contador na tela Hoje mostrava só "3 hoje", sem alvo — enquanto água mostra
 *  "X de Y ml" e o passeio "X / 120 min". Nunca devolve menos que 1: uma
 *  configuração torta não pode zerar o alvo e sugerir que já acabou. */
export function metaDePausas(horaInicio: number, horaFim: number, intervaloMin: number): number {
  if (intervaloMin <= 0) return 1;
  const minutosDeExpediente = (horaFim - horaInicio) * 60;
  return Math.max(1, Math.floor(minutosDeExpediente / intervaloMin));
}

/** A que horas cai cada pausa do dia. Existe porque o contador da tela dizia
 *  só "2 de 6" — quantas faltam, nunca quando —, e isso deixa pra ela a tarefa
 *  de lembrar sozinha de parar seis vezes no meio do expediente. Lembrar é
 *  exatamente o que não acontece num dia de trabalho.
 *
 *  Devolve "HH:MM" pra bater com o formato dos outros horários da rotina. */
export function horariosDasPausas(
  horaInicio: number,
  horaFim: number,
  intervaloMin: number,
): string[] {
  const quantas = metaDePausas(horaInicio, horaFim, intervaloMin);
  const passo = intervaloMin > 0 ? intervaloMin : 60;
  const saida: string[] = [];
  for (let i = 0; i < quantas; i++) {
    const min = horaInicio * 60 + i * passo;
    const hh = String(Math.floor(min / 60) % 24).padStart(2, "0");
    const mm = String(min % 60).padStart(2, "0");
    saida.push(`${hh}:${mm}`);
  }
  return saida;
}

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
