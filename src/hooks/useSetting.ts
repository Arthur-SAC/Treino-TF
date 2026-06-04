import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import type { Settings } from "../lib/settings-helpers";

const DEFAULTS: Settings = {
  onboarded: false,
  seeded: false,
  beautySeeded: false,
  styleSeeded: false,
  pathSeeded: false,
  movementSeeded: false,
  movementVersion: 1,
  makeupSeeded: false,
  voiceSeeded: false,
  morningReminderTime: "08:00",
  eveningReminderTime: "22:00",
  workoutReminderTime: "18:00",
  activeBreakIntervalMin: 90,
  activeBreakStartHour: 9,
  activeBreakEndHour: 18,
  hydrationIntervalMin: 60,
  hydrationGoalMl: 2000,
  quietHours: { from: "22:00", to: "08:00" },
  focusModeUntil: null,
  notificationsEnabled: true,
  lastActiveBreakAt: 0,
  lastHydrationAt: 0,
  lastSkincareMorningAt: "",
  lastSkincareEveningAt: "",
  mealPlanVersion: 1,
  activeCycle: "adaptacao",
  cycleStartSessionCount: 0,
  cyclesSeeded: false,
  walkGoalMin: 30,
};

export function useSetting<K extends keyof Settings>(key: K): Settings[K] {
  const row = useLiveQuery(() => db.settings.get(key), [key]);
  if (row === undefined) return DEFAULTS[key];
  return row.value as Settings[K];
}
