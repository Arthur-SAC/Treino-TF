// A semana em uma tela, no domingo. Módulo puro.
//
// O resumo do Hoje (`semana.ts`) responde "estou progredindo?" com números
// soltos; a revisão fecha a semana com UMA frase do que mudar na próxima — a
// alavanca mais fraca, pela mesma regra do treinador (`alavancaMaisFraca`).

import { alavancaMaisFraca } from "./ritmo";
import type { AdesaoDetalhada } from "./adesao";
import { TREINOS_POR_SEMANA, type ModoCaminhada } from "./objetivo";

export interface DadosDaSemana extends AdesaoDetalhada {
  cinturaUltima?: number;
  cinturaAnterior?: number;
}

export interface Revisao {
  linhas: string[];
  ajuste: string;
}

/** Acima disto em todas as alavancas a semana foi cheia — apontar "a mais
 *  fraca" numa semana boa seria inventar defeito. */
const SEMANA_CHEIA = 0.85;

const num = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
const sinal = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${num(Math.abs(n))}`;

export function revisarSemana(d: DadosDaSemana, modo: ModoCaminhada): Revisao {
  const linhas = [`Treinos: ${Math.min(d.treinos, TREINOS_POR_SEMANA)} de ${TREINOS_POR_SEMANA}`];
  if (modo !== "pausada") linhas.push(`Caminhada ou esteira: ${d.diasCardio} de ${d.dias} dias`);
  linhas.push(`Sono no horário: ${d.noitesNoAlvo} de ${d.dias} noites`);
  linhas.push(`Alongamento da noite: ${d.alongamentosNoite} de ${d.dias}`);
  if (d.cinturaUltima === undefined) {
    linhas.push("Cintura: sem medida ainda");
  } else if (d.cinturaAnterior === undefined) {
    linhas.push(`Cintura: ${num(d.cinturaUltima)} cm`);
  } else {
    linhas.push(`Cintura: ${num(d.cinturaUltima)} cm (${sinal(Math.round((d.cinturaUltima - d.cinturaAnterior) * 10) / 10)} desde a medida anterior)`);
  }

  const fraca = alavancaMaisFraca(d, modo);
  const ajuste =
    fraca.fracao >= SEMANA_CHEIA
      ? "Semana cheia. Repete a mesma na próxima."
      : `Pra semana que vem — ${fraca.frase}`;
  return { linhas, ajuste };
}
