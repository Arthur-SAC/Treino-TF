import { db } from "./db";

export interface Settings {
  onboarded: boolean;
  seeded: boolean;
  beautySeeded: boolean;
  styleSeeded: boolean;
  pathSeeded: boolean;
  movementSeeded: boolean;
  movementVersion: number;
  makeupSeeded: boolean;
  voiceSeeded: boolean;
  morningReminderTime: string; // "HH:MM"
  eveningReminderTime: string;
  workoutReminderTime: string;
  activeBreakIntervalMin: number;
  activeBreakStartHour: number; // 0-23
  activeBreakEndHour: number;
  hydrationIntervalMin: number;
  hydrationGoalMl: number;
  quietHours: { from: string; to: string };
  focusModeUntil: number | null; // timestamp ms
  notificationsEnabled: boolean;
  lastActiveBreakAt: number;
  lastHydrationAt: number;
  lastSkincareMorningAt: string; // "yyyy-mm-dd" or ""
  lastSkincareEveningAt: string;
  mealPlanVersion: number;
  activeCycle: "adaptacao" | "variacao" | "hipertrofia" | "refinamento" | "manutencao";
  cycleStartSessionCount: number;
  cyclesSeeded: boolean;
  walkGoalMin: number;
}

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

export async function getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]> {
  const row = await db.settings.get(key);
  if (row === undefined) return DEFAULTS[key];
  return row.value as Settings[K];
}

export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  await db.settings.put({ key, value });
}
