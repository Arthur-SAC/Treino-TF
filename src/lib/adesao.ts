// O que ela fez numa janela de dias, contado do banco. A contagem é pura
// (`contarAdesao`) e a leitura fica separada (`lerAdesao`), pra o teste não
// precisar de banco e pra o treinador e a revisão de domingo contarem igual.

import { db, type DailyLog, type PracticeLog, type RoutineCheck } from "./db";
import type { Adesao } from "./ritmo";
import { ITENS_CAMINHADA } from "./today-routine";
import { SEQUENCIAS_FLEX } from "./flex-progression";
import { noitesNoAlvo } from "./daily-log-helpers";
import { ultimosDiasISO } from "./today-date";

export interface AdesaoDetalhada extends Adesao {
  alongamentosNoite: number;
}

export interface DadosAdesao {
  sessoes: readonly { date: string }[];
  checks: readonly RoutineCheck[];
  logs: readonly DailyLog[];
  praticas: readonly PracticeLog[];
}

const CAMINHADAS = new Set<string>(ITENS_CAMINHADA);
const NOITE = new Set<string>(SEQUENCIAS_FLEX.noite);

/** Dias DISTINTOS de cada coisa: dois treinos no mesmo dia são um dia de
 *  treino, e o plano conta dias. */
export function contarAdesao(janela: readonly string[], dados: DadosAdesao, alvoSono: string): AdesaoDetalhada {
  const dentro = new Set(janela);
  const dias = (datas: string[]) => new Set(datas.filter((d) => dentro.has(d))).size;
  return {
    dias: janela.length,
    treinos: dias(dados.sessoes.map((s) => s.date)),
    diasCardio: dias(dados.checks.filter((c) => c.done && CAMINHADAS.has(c.itemId)).map((c) => c.date)),
    noitesNoAlvo: noitesNoAlvo(dados.logs.filter((l) => dentro.has(l.date)), alvoSono),
    alongamentosNoite: dias(dados.praticas.filter((p) => p.completed && NOITE.has(p.sequenceId)).map((p) => p.date)),
  };
}

export async function lerAdesao(hoje: string, dias: number, alvoSono: string): Promise<AdesaoDetalhada> {
  const janela = ultimosDiasISO(hoje, dias);
  const [sessoes, checks, logs, praticas] = await Promise.all([
    db.workoutSessions.toArray(),
    db.routineChecks.toArray(),
    db.dailyLog.where("date").anyOf(janela).toArray(),
    db.practiceLogs.toArray(),
  ]);
  return contarAdesao(janela, { sessoes, checks, logs, praticas }, alvoSono);
}
