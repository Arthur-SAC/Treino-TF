import { db } from "./db";
import { shouldNotifyNow, isWithinWorkingHours, notify } from "./notifications";
import { getSetting, setSetting } from "./settings-helpers";

let intervalId: ReturnType<typeof setInterval> | null = null;

async function tick() {
  const now = new Date();
  const settings = {
    notificationsEnabled: await getSetting("notificationsEnabled"),
    focusModeUntil: await getSetting("focusModeUntil"),
    quietHours: await getSetting("quietHours"),
  };
  if (!shouldNotifyNow(now, settings)) return;

  const activeBreakInterval = await getSetting("activeBreakIntervalMin");
  const activeBreakStart = await getSetting("activeBreakStartHour");
  const activeBreakEnd = await getSetting("activeBreakEndHour");
  const hydrationInterval = await getSetting("hydrationIntervalMin");
  const lastActiveBreak = await getSetting("lastActiveBreakAt");
  const lastHydration = await getSetting("lastHydrationAt");

  const t = now.getTime();

  if (
    isWithinWorkingHours(now, activeBreakStart, activeBreakEnd) &&
    lastActiveBreak > 0 &&
    t - lastActiveBreak >= activeBreakInterval * 60_000
  ) {
    notify("Levanta da cadeira", "2 min de mobilidade de quadril");
    await setSetting("lastActiveBreakAt", t);
  } else if (lastActiveBreak === 0 && isWithinWorkingHours(now, activeBreakStart, activeBreakEnd)) {
    // primeiro tick — registra timestamp sem notificar
    await setSetting("lastActiveBreakAt", t);
  }

  const hH = now.getHours();
  if (
    hH >= activeBreakStart && hH < activeBreakEnd &&
    lastHydration > 0 &&
    t - lastHydration >= hydrationInterval * 60_000
  ) {
    const todayISO = now.toISOString().slice(0, 10);
    const log = await db.dailyLog.get(todayISO);
    const drunk = log?.waterMl ?? 0;
    const goal = await getSetting("hydrationGoalMl");
    notify("Bebe água", `${drunk} ml de ${goal} ml hoje`);
    await setSetting("lastHydrationAt", t);
  } else if (lastHydration === 0 && hH >= activeBreakStart && hH < activeBreakEnd) {
    await setSetting("lastHydrationAt", t);
  }
}

export function startScheduler() {
  if (intervalId !== null) return;
  intervalId = setInterval(() => void tick(), 60_000);
}

export function stopScheduler() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
