import { useLiveQuery } from "dexie-react-hooks";
import { Link, useParams, useNavigate } from "react-router-dom";

import { db } from "../../lib/db";

export function SkincareDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routine = useLiveQuery(
    async () => (id ? await db.skincareRoutines.get(Number(id)) : undefined),
    [id],
  );

  if (!routine) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  async function handleDelete() {
    if (!routine?.id) return;
    if (!confirm(`Apagar a rotina "${routine.name}"?`)) return;
    await db.skincareRoutines.delete(routine.id);
    navigate("/beleza/pele-cabelo/skincare", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/pele-cabelo/skincare" className="text-muted text-sm">&larr; Skincare</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{routine.name}</h1>
      <p className="text-muted text-xs mb-4">
        {routine.time === "morning" ? "Manhã" : "Noite"} · {routine.target}
      </p>

      <ol className="space-y-2">
        {routine.steps.map((step, i) => (
          <li key={i} className="card">
            <div className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-wine text-nude-warm flex items-center justify-center text-sm font-medium flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-nude-warm font-medium">{step.productName}</h3>
                <p className="text-sm text-muted mt-1">{step.technique}</p>
                {step.waitMin > 0 && (
                  <p className="text-xs text-nude mt-1">Aguardar {step.waitMin} min antes do próximo</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => void handleDelete()}
        className="mt-6 text-muted text-xs hover:text-red-300"
      >
        Apagar rotina
      </button>
    </div>
  );
}
