// Aplica o toque num botão da notificação. Não é puro (escreve no Dexie).
import { db } from "../db";
import { getSetting, setSetting } from "../settings-helpers";
import { addWater, registrarSono } from "../daily-log-helpers";
import { marcarFeito } from "../../hooks/useRoutineChecks";
import { horaMinuto } from "../today-date";
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
  // Ao reabrir pelo Recentes o Android recria a activity com o intent original e
  // o evento dispara de novo; sem esta chave, "Bebi" somaria 200 ml outra vez.
  const chave = `${a.notification.id}:${a.actionId}`;
  await db.transaction("rw", [db.settings, db.routineChecks, db.dailyLog], async () => {
    const tratadas = await getSetting("acoesTratadas");
    if (tratadas.includes(chave)) return;
    if (ef.tipo === "marcar") await marcarFeito(ef.dia, ef.itemId);
    else if (ef.tipo === "agua") await addWater(ef.dia, ef.ml);
    else {
      await registrarSono(ef.dia, horaMinuto(deps.agora));
      // O item "dormir" da rotina é o que o Hoje mostra como feito.
      await marcarFeito(ef.dia, "dormir");
    }
    await setSetting("acoesTratadas", [...tratadas, chave].slice(-GUARDAR));
  });
}
