// src/lib/lembretes/estado.ts
// Retrato do que o planejador precisa saber, lido do Dexie. "Feito" segue a
// regra do Hoje: check marcado ou prática concluída de qualquer sequência da
// trilha (praticadaHoje com a trilha inteira).
import { db } from "../db";
import { getSetting } from "../settings-helpers";
import { hojeISO, ultimosDiasISO } from "../today-date";
import { praticadaHoje } from "../practice-log-helpers";
import { SEQUENCIAS_FLEX } from "../flex-progression";
import type { ConfigLembretes, EstadoLembretes } from "./planejar";

export async function carregarEstado(agora: Date): Promise<EstadoLembretes> {
  const hoje = hojeISO(agora);
  const checks = await db.routineChecks.where("date").equals(hoje).toArray();
  const marcado = (id: string) => checks.some((c) => c.itemId === id && c.done);
  const praticas = await db.practiceLogs.where("date").equals(hoje).toArray();
  const concluidas = praticas.filter((p) => p.completed);

  const feitosHoje = new Set<string>();
  if (marcado("alongamento-manha") || praticadaHoje(concluidas, SEQUENCIAS_FLEX.manha, hoje)) feitosHoje.add("alongamento-manha");
  if (marcado("alongamento-noite") || praticadaHoje(concluidas, SEQUENCIAS_FLEX.noite, hoje)) feitosHoje.add("alongamento-noite");

  const log = await db.dailyLog.get(hoje);
  const treinouHoje = (await db.workoutSessions.where("date").equals(hoje).count()) > 0;

  const activeCycle = await getSetting("activeCycle");
  const templates = await db.workoutTemplates.toArray();
  const treinoPorDia = new Map<number, string>();
  for (const t of templates) {
    if ((t.cycle ?? "adaptacao") === activeCycle && !treinoPorDia.has(t.dayOfWeek)) treinoPorDia.set(t.dayOfWeek, t.name);
  }

  const datasMedida = (await db.measurements.toArray()).map((m) => m.date).sort();
  const ultimaMedida = datasMedida.length > 0 ? datasMedida[datasMedida.length - 1] : null;

  const ultimos = ultimosDiasISO(hoje, 7);
  const vitD = await db.routineChecks.where("date").anyOf(ultimos).toArray();
  const vitaminaDFeitaEm = vitD.filter((c) => c.itemId === "vitamina-d" && c.done).map((c) => c.date).sort();

  return { feitosHoje, aguaHojeMl: log?.waterMl ?? 0, treinouHoje, treinoPorDia, ultimaMedida, vitaminaDFeitaEm, ultimoBackupEm: await getSetting("ultimoBackupEm") };
}

export async function carregarConfig(): Promise<ConfigLembretes> {
  return {
    notificationsEnabled: await getSetting("notificationsEnabled"),
    quietHours: await getSetting("quietHours"),
    focusModeUntil: await getSetting("focusModeUntil"),
    alongamentoManhaTime: await getSetting("alongamentoManhaTime"),
    alongamentoNoiteTime: await getSetting("alongamentoNoiteTime"),
    workoutReminderTime: await getSetting("workoutReminderTime"),
    dormirReminderTime: await getSetting("dormirReminderTime"),
    vitaminaDTime: await getSetting("vitaminaDTime"),
    activeBreakStartHour: await getSetting("activeBreakStartHour"),
    activeBreakEndHour: await getSetting("activeBreakEndHour"),
    activeBreakIntervalMin: await getSetting("activeBreakIntervalMin"),
    hydrationIntervalMin: await getSetting("hydrationIntervalMin"),
    hydrationGoalMl: await getSetting("hydrationGoalMl"),
  };
}
