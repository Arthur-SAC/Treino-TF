import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db, type PracticeLog } from "../../lib/db";
import { MoveStep } from "../../components/MoveStep";
import { VideoSection } from "../../components/VideoSection";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function SequenceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sequence = useLiveQuery(
    async () => (id ? await db.danceSequences.get(id) : undefined),
    [id],
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [notes, setNotes] = useState("");

  if (!sequence) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  function nextMove() {
    if (!sequence) return;
    if (activeIdx < sequence.moves.length - 1) {
      setActiveIdx((i) => i + 1);
    }
  }

  async function finish() {
    if (!sequence) return;
    await db.practiceLogs.add({
      date: todayISO(),
      sequenceId: sequence.id,
      completed: true,
      durationMin: sequence.durationMin,
      notes: notes.trim() || undefined,
    } as PracticeLog);
    navigate("/treino/movimento", { replace: true });
  }

  const allDone = activeIdx >= sequence.moves.length - 1;

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/treino/movimento" className="text-muted text-sm">&larr; Movimento</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{sequence.name}</h1>
      <p className="text-muted text-sm mb-4">{sequence.focus}</p>

      <VideoSection
        url={sequence.videoUrl}
        onSave={(url) => { void db.danceSequences.update(sequence.id, { videoUrl: url || undefined }); }}
      />

      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-muted text-xs uppercase tracking-wider">
            Passo {activeIdx + 1} de {sequence.moves.length}
          </span>
          <span className="text-muted text-xs">
            {Math.round(((activeIdx + 1) / sequence.moves.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-bg-deep rounded-full overflow-hidden">
          <div
            className="h-full bg-nude"
            style={{ width: `${((activeIdx + 1) / sequence.moves.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {sequence.moves.map((move, i) => (
          <MoveStep
            key={i}
            move={move}
            active={i === activeIdx}
            onComplete={i === activeIdx ? nextMove : undefined}
          />
        ))}
      </div>

      {allDone && (
        <div className="card mt-4 space-y-2">
          <h2 className="text-nude-warm font-medium">Como foi?</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Notas (opcional)"
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
          <button
            type="button"
            onClick={() => void finish()}
            className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium"
          >
            Marcar como feito
          </button>
        </div>
      )}
    </div>
  );
}
