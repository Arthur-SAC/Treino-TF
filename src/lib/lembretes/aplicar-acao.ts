// Aplica o toque num botão da notificação. Não é puro (escreve no Dexie).
import { db } from "../db";
import { getSetting, setSetting } from "../settings-helpers";
import { addWater, registrarSono } from "../daily-log-helpers";
import { marcarFeito } from "../../hooks/useRoutineChecks";
import { horaMinuto, hojeISO, somarDiasISO } from "../today-date";
import { efeitoDaAcao } from "./acao";

const GUARDAR = 50;

export async function aplicarAcao(
  a: { actionId: string; notification: { id: number; extra?: unknown } },
  deps: { navigate: (r: string) => void; agora: Date },
): Promise<void> {
  const ef = efeitoDaAcao(a.actionId, a.notification.extra);
  if (!ef) return;
  // Tocar na notificação só navega: repetir é inofensivo.
  if (ef.tipo === "abrir") { deps.navigate(ef.rota); return; }
  // Replay tardio: o Android pode reentregar o intent de partida a frio por dias
  // (singleTask sem setIntent; a HyperOS mata o processo) e as 50 chaves só cobrem
  // ~5 dias. Toque legítimo é no dia do lembrete ou na manhã seguinte.
  const hoje = hojeISO(deps.agora);
  if (ef.dia < somarDiasISO(hoje, -1)) return;
  // "Deitei" na manhã seguinte inventaria uma hora de deitar tipo 07:00.
  if (ef.tipo === "sono" && ef.dia !== hoje && horaMinuto(deps.agora) >= "06:00") return;
  // Ao reabrir pelo Recentes o Android recria a activity com o intent original e
  // o evento dispara de novo; sem esta chave, "Bebi" somaria 200 ml outra vez.
  const chave = `${a.notification.id}:${a.actionId}`;
  await db.transaction("rw", [db.settings, db.routineChecks, db.dailyLog], async () => {
    const tratadas = await getSetting("acoesTratadas");
    if (tratadas.includes(chave)) return;
    if (ef.tipo === "marcar") await marcarFeito(ef.dia, ef.itemId);
    else if (ef.tipo === "agua") await addWater(ef.dia, ef.ml);
    else {
      // Não sobrescreve a hora que ela já anotou à mão.
      if (!(await db.dailyLog.get(ef.dia))?.sleepAt) await registrarSono(ef.dia, horaMinuto(deps.agora));
      // O item "dormir" da rotina é o que o Hoje mostra como feito.
      await marcarFeito(ef.dia, "dormir");
    }
    await setSetting("acoesTratadas", [...tratadas, chave].slice(-GUARDAR));
  });
}
