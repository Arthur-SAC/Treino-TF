import { useLiveQuery } from "dexie-react-hooks";
import { db, type SkincareRoutine } from "../lib/db";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Roteiro de skincare consolidado do período (manhã/noite): junta TODAS as
 *  rotinas daquele horário numa sequência guiada — produto, técnica e o tempo
 *  de espera até o próximo passo — e marca tudo de uma vez. Abre por cima, na
 *  própria tela Hoje, pra não ter que ir aba por aba. */
export function SkincareRoutineModal({ time, onClose }: { time: SkincareRoutine["time"]; onClose: () => void }) {
  const routines = useLiveQuery(() => db.skincareRoutines.where("time").equals(time).toArray(), [time]);
  const logs = useLiveQuery(() => db.skincareLogs.where("date").equals(todayISO()).toArray(), []);
  const title = time === "morning" ? "Skincare manhã" : "Skincare noite";

  const allDone =
    !!routines && routines.length > 0 &&
    routines.every((r) => logs?.some((l) => l.routineId === r.id && l.completed));

  async function toggleAll() {
    if (!routines) return;
    const date = todayISO();
    const target = !allDone;
    const current = await db.skincareLogs.where("date").equals(date).toArray();
    for (const r of routines) {
      if (r.id === undefined) continue;
      const existing = current.find((l) => l.routineId === r.id);
      if (existing?.id !== undefined) {
        await db.skincareLogs.update(existing.id, { completed: target });
      } else {
        await db.skincareLogs.add({ date, routineId: r.id, completed: target });
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-serif text-xl text-nude">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-muted text-lg px-2">✕</button>
        </div>

        {!routines && <p className="text-muted text-sm">Carregando…</p>}

        {routines?.map((r, ri) => (
          <div key={r.id ?? ri} className="mb-4">
            <h3 className="text-nude text-sm font-medium mb-1.5">{ri + 1}. {r.name}</h3>
            <ol className="space-y-2.5 ml-1">
              {r.steps.map((s, si) => (
                <li key={si} className="border-l border-bg-border pl-3">
                  <p className="text-nude-warm text-sm">{s.productName}</p>
                  <p className="text-muted text-xs mt-0.5 leading-relaxed">{s.technique}</p>
                  {s.waitMin > 0 && (
                    <p className="text-nude/80 text-[11px] mt-0.5">⏱ espere {s.waitMin} min antes do próximo passo</p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        ))}

        {routines && routines.length > 0 && (
          <button
            type="button"
            onClick={() => void toggleAll()}
            className={`w-full rounded-md py-2 text-sm mt-1 ${allDone ? "border border-bg-border text-muted" : "bg-wine text-nude-warm"}`}
          >
            {allDone ? "Desfazer" : "Marcar rotina como feita ✓"}
          </button>
        )}
      </div>
    </div>
  );
}
