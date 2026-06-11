function shiftISO(iso: string, deltaDays: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
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
