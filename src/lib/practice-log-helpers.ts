// Helpers do log de práticas (`practiceLogs`) que cruzam página.
//
// Hoje só existe uma consulta assim — a contagem de assoalho pélvico —, mas
// já é lida por duas telas (Hoje e Vitalidade) e decide a fase de progressão
// nas duas. Não mora em `pelvic-progression.ts` porque aquele módulo é puro
// (sem `db`) por contrato: `pelvicDoDia` recebe o número já contado, não
// busca ele. E não fica inline em cada página porque um critério duplicado
// diverge em silêncio — muda o filtro de um lado, esquece o outro, e Hoje e
// Vitalidade passam a mostrar fases diferentes do mesmo treino.
import { db } from "./db";
import { PROGRESSAO_PELVICA } from "./pelvic-progression";
import { SEQUENCIAS_FLEX, type MomentoFlex } from "./flex-progression";
import { ultimosDiasISO } from "./today-date";

/** Quantas práticas DA PROGRESSÃO ela concluiu. Move as fases, e é lida por
 *  duas telas — por isso mora aqui e não inline em cada uma: critério
 *  duplicado diverge em silêncio, e aí Hoje e Vitalidade mostram fases
 *  diferentes do mesmo treino.
 *
 *  Conta `PROGRESSAO_PELVICA`, não `PELVIC_ORDEM`: as três sequências
 *  oferecidas pela própria página Vitalidade são prática de outra coisa e não
 *  constroem esta escada. Contá-las fazia dez sessões de start-stop — cinco
 *  semanas no alvo declarado — pularem identificação e soltura inteiras e
 *  destrancarem o preparo pra receber, que é justamente o que dói sem soltura
 *  treinada. */
export async function contarPraticasDaProgressao(): Promise<number> {
  const logs = await db.practiceLogs.toArray();
  return logs.filter((l) => l.completed && PROGRESSAO_PELVICA.includes(l.sequenceId)).length;
}

/** Práticas concluídas de uma trilha de flexibilidade (manhã ou noite). Cada
 *  momento tem progressão própria: `SEQUENCIAS_FLEX[momento]` só contém os
 *  ids daquela trilha, então praticar de manhã não avança a noite, e
 *  vice-versa — são qualidades diferentes (abertura pro dia vs. flexão
 *  profunda e rotação) e misturar a contagem faria uma mascarar a outra. */
export async function contarPraticasFlex(momento: MomentoFlex): Promise<number> {
  const ids = SEQUENCIAS_FLEX[momento] as readonly string[];
  const logs = await db.practiceLogs.toArray();
  return logs.filter((l) => l.completed && ids.includes(l.sequenceId)).length;
}

/** Quantas vezes uma sequência foi concluída, sem janela de tempo. Existe pro
 *  portão do preparo pra receber poder exigir soltura DE VERDADE: "fase 2
 *  construída" tem que significar sessões da sequência de soltura, não um
 *  total genérico que qualquer outra prática empurra. */
export async function contarPraticasDaSequencia(sequenceId: string): Promise<number> {
  const logs = await db.practiceLogs.where("sequenceId").equals(sequenceId).toArray();
  return logs.filter((l) => l.completed).length;
}

/** Quantas vezes uma sequência específica foi concluída nos últimos `dias`
 *  dias terminando em `hoje`. Existe pro alvo declarado da Vitalidade ("pelo
 *  menos uma sessão de start-stop por semana") ser medido contra o registro
 *  real, e não virar frase que a tela repete sem saber se aconteceu. */
export async function contarPraticasRecentes(
  sequenceId: string,
  hoje: string,
  dias = 7,
): Promise<number> {
  const datas = ultimosDiasISO(hoje, dias);
  const logs = await db.practiceLogs.where("date").anyOf(datas).toArray();
  return logs.filter((l) => l.completed && l.sequenceId === sequenceId).length;
}
