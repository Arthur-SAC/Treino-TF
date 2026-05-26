export function isWithinQuietHours(now: Date, from: string, to: string): boolean {
  const [fromH, fromM] = from.split(":").map(Number);
  const [toH, toM] = to.split(":").map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const fromMin = fromH * 60 + fromM;
  const toMin = toH * 60 + toM;
  if (fromMin === toMin) return false;
  if (fromMin < toMin) {
    return nowMin >= fromMin && nowMin < toMin;
  }
  return nowMin >= fromMin || nowMin < toMin;
}

export function isWithinWorkingHours(now: Date, startHour: number, endHour: number): boolean {
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  const h = now.getHours();
  return h >= startHour && h < endHour;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function notify(title: string, body: string): void {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  new Notification(title, { body, icon: "/icons/icon-192.svg" });
}

export function shouldNotifyNow(
  now: Date,
  opts: {
    notificationsEnabled: boolean;
    focusModeUntil: number | null;
    quietHours: { from: string; to: string };
  },
): boolean {
  if (!opts.notificationsEnabled) return false;
  if (opts.focusModeUntil && opts.focusModeUntil > now.getTime()) return false;
  if (isWithinQuietHours(now, opts.quietHours.from, opts.quietHours.to)) return false;
  return true;
}
