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
import { PELVIC_ORDEM } from "./pelvic-progression";
import { ultimosDiasISO } from "./today-date";

/** Quantas práticas de assoalho pélvico ela concluiu. Move a progressão de
 *  fases, e é lida por duas telas — por isso mora aqui e não inline em cada
 *  uma: critério duplicado diverge em silêncio, e aí Hoje e Vitalidade
 *  mostram fases diferentes do mesmo treino. */
export async function contarPraticasPelvicas(): Promise<number> {
  const logs = await db.practiceLogs.toArray();
  return logs.filter((l) => l.completed && (PELVIC_ORDEM as readonly string[]).includes(l.sequenceId)).length;
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
