import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../../lib/db";

export function MakeupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routine = useLiveQuery(
    async () => (id ? await db.makeupRoutines.get(Number(id)) : undefined),
    [id],
  );

  if (!routine) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  async function handleDelete() {
    if (!routine?.id) return;
    if (!confirm(`Apagar a rotina "${routine.name}"?`)) return;
    await db.makeupRoutines.delete(routine.id);
    navigate("/beleza/maquiagem", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/maquiagem" className="text-muted text-sm">&larr; Maquiagem</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{routine.name}</h1>
      <p className="text-muted text-sm mb-4">{routine.durationMin} min · {routine.steps.length} passos</p>

      {routine.notes && (
        <div className="card !bg-wine/20 !border-wine-light mb-3">
          <p className="text-nude-warm text-sm">{routine.notes}</p>
        </div>
      )}

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
                {step.areaOfFace && (
                  <p className="text-nude text-xs mt-1">área: {step.areaOfFace}</p>
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
