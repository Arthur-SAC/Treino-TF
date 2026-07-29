import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";

/** Vira o check e DEVOLVE o novo estado. Quem chama precisa do retorno, não do
 *  Set renderizado: o Set só muda no próximo render do `useLiveQuery`, então
 *  dois toques rápidos liam o mesmo valor antigo e creditavam o efeito colateral
 *  (ex.: os 60 min do passeio) duas vezes na mesma direção. A leitura e a
 *  escrita ficam numa transação pra que os toques se enfileirem de verdade. */
export async function toggleRoutineCheck(date: string, itemId: string): Promise<boolean> {
  return db.transaction("rw", db.routineChecks, async () => {
    const current = await db.routineChecks.get([date, itemId]);
    const novo = !(current?.done ?? false);
    await db.routineChecks.put({ date, itemId, done: novo });
    return novo;
  });
}

export function useRoutineChecks(date: string): { done: Set<string>; toggle: (itemId: string) => Promise<boolean> } {
  const rows = useLiveQuery(() => db.routineChecks.where("date").equals(date).toArray(), [date]);
  const done = new Set((rows ?? []).filter((r) => r.done).map((r) => r.itemId));
  return { done, toggle: (itemId: string) => toggleRoutineCheck(date, itemId) };
}
