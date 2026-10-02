// Só no APK: reagenda ao abrir, ao voltar pro app e quando muda qualquer
// tabela que o planejador lê (marcar alongamento, beber água, treinar, medir,
// mudar um horário). Debounce de 2 s: marcar três coisas seguidas agenda uma vez.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { liveQuery } from "dexie";
import { App as CapApp } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";
import { db } from "../db";
import { isNativo } from "../plataforma";
import { reagendar } from "./agendar";
import { efeitoDaAcao } from "./acao";
import { marcarFeito } from "../../hooks/useRoutineChecks";
import { addWater, registrarSono } from "../daily-log-helpers";

export function useLembretes(): void {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isNativo()) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const agendarLogo = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void reagendar().catch(() => {}), 2000);
    };
    const sub = liveQuery(async () => {
      // Conta linhas das tabelas que o planejador lê: qualquer escrita muda o retrato.
      const [a, b, c, d, e, f] = await Promise.all([
        db.routineChecks.toArray(), db.practiceLogs.count(), db.dailyLog.toArray(),
        db.workoutSessions.count(), db.measurements.count(), db.settings.toArray(),
      ]);
      return JSON.stringify([a.length, a.filter((x) => x.done).length, b, c.map((x) => x.waterMl), d, e, f.map((x) => x.value)]);
    }).subscribe({ next: agendarLogo });
    const resume = CapApp.addListener("appStateChange", ({ isActive }) => { if (isActive) agendarLogo(); });
    const toque = LocalNotifications.addListener("localNotificationActionPerformed", (a) => {
      // No Android o botão abre o app por um instante; o registro acontece aqui,
      // no dia do lembrete (extra.dia). Notificação antiga, sem extra, não faz nada.
      const ef = efeitoDaAcao(a.actionId, a.notification.extra);
      if (!ef) return;
      if (ef.tipo === "marcar") void marcarFeito(ef.dia, ef.itemId);
      else if (ef.tipo === "agua") void addWater(ef.dia, ef.ml);
      else if (ef.tipo === "sono") {
        const agora = new Date();
        const hhmm = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
        void registrarSono(ef.dia, hhmm);
      } else navigate(ef.rota);
    });
    return () => {
      clearTimeout(timer);
      sub.unsubscribe();
      void resume.then((h) => h.remove());
      void toque.then((h) => h.remove());
    };
  }, [navigate]);
}
