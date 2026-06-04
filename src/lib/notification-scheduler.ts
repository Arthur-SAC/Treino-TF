import { db } from "./db";
import { shouldNotifyNow, isWithinWorkingHours, notify, shouldRemindOncePerDay } from "./notifications";
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

  // Skincare matinal/noturno (uma vez por dia)
  const morningTime = await getSetting("morningReminderTime");
  const eveningTime = await getSetting("eveningReminderTime");
  const todayISO = now.toISOString().slice(0, 10);
  const lastMorning = await getSetting("lastSkincareMorningAt");
  const lastEvening = await getSetting("lastSkincareEveningAt");

  const [mH, mM] = morningTime.split(":").map(Number);
  const [eH, eM] = eveningTime.split(":").map(Number);
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const morningMin = mH * 60 + mM;
  const eveningMin = eH * 60 + eM;

  // Se ultrapassou o horário hoje e ainda não notificou hoje
  if (currentMin >= morningMin && lastMorning !== todayISO) {
    notify("Skincare matinal", "Comece o dia com a sua rotina de rosto");
    await setSetting("lastSkincareMorningAt", todayISO);
  }
  if (currentMin >= eveningMin && lastEvening !== todayISO) {
    notify("Skincare noturno", "Hora da rotina noturna antes de dormir");
    await setSetting("lastSkincareEveningAt", todayISO);
  }

  // Postura (uma vez/dia, se não praticou hoje)
  const posturaTime = await getSetting("posturaReminderTime");
  const lastPostura = await getSetting("lastPosturaReminderAt");
  const [pH, pM] = posturaTime.split(":").map(Number);
  const posturaDone =
    (await db.practiceLogs.where("date").equals(todayISO).and((p) => p.sequenceId === "postura-silhueta-diaria").count()) > 0;
  if (shouldRemindOncePerDay({ currentMin, targetMin: pH * 60 + pM, lastNotifiedDate: lastPostura, todayISO, done: posturaDone })) {
    notify("Postura & silhueta", "7 min de rotina de postura — abre o peito, ativa o glúteo");
    await setSetting("lastPosturaReminderAt", todayISO);
  }

  // Caminhada (uma vez/dia, se não bateu a meta)
  const walkTime = await getSetting("walkReminderTime");
  const lastWalk = await getSetting("lastWalkReminderAt");
  const [wH, wM] = walkTime.split(":").map(Number);
  const walkGoal = await getSetting("walkGoalMin");
  const walkLog = await db.dailyLog.get(todayISO);
  const walkDone = (walkLog?.walkMin ?? 0) >= walkGoal;
  if (shouldRemindOncePerDay({ currentMin, targetMin: wH * 60 + wM, lastNotifiedDate: lastWalk, todayISO, done: walkDone })) {
    notify("Caminhada", `Bora caminhar · meta ${walkGoal} min hoje`);
    await setSetting("lastWalkReminderAt", todayISO);
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
