import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";

export async function toggleRoutineCheck(date: string, itemId: string): Promise<void> {
  const current = await db.routineChecks.get([date, itemId]);
  await db.routineChecks.put({ date, itemId, done: !(current?.done ?? false) });
}

export function useRoutineChecks(date: string): { done: Set<string>; toggle: (itemId: string) => Promise<void> } {
  const rows = useLiveQuery(() => db.routineChecks.where("date").equals(date).toArray(), [date]);
  const done = new Set((rows ?? []).filter((r) => r.done).map((r) => r.itemId));
  return { done, toggle: (itemId: string) => toggleRoutineCheck(date, itemId) };
}
