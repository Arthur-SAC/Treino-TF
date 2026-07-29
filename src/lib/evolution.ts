import { hojeISO } from "./today-date";

// `iso + "T00:00:00"` (sem "Z") é meia-noite LOCAL; o deslocamento é em dias
// locais e a volta pra string também tem que ser local — com `toISOString()`
// a data escorregava um dia em qualquer fuso a leste de Greenwich.
function shiftISO(iso: string, deltaDays: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + deltaDays);
  return hojeISO(d);
}

export function distinctDays(dates: string[]): number {
  return new Set(dates).size;
}

export function daysInLast(dates: string[], todayISO: string, n: number): number {
  const set = new Set(dates);
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (set.has(shiftISO(todayISO, -i))) count++;
  }
  return count;
}

export function currentStreak(dates: string[], todayISO: string): number {
  const set = new Set(dates);
  let streak = 0;
  while (set.has(shiftISO(todayISO, -streak))) streak++;
  return streak;
}
