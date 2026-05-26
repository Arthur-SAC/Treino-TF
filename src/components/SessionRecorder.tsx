import { useState, useEffect } from "react";
import type { Exercise, WorkoutSession } from "../lib/db";
import { db } from "../lib/db";
import { suggestNextLoad, type SessionFeedback } from "../lib/progression";

interface Props {
  exercise: Exercise;
  setsTarget: number;
  repsTarget: string;
  onSave: (entry: WorkoutSession["exercises"][number]) => void;
}

export function SessionRecorder({ exercise, setsTarget, repsTarget, onSave }: Props) {
  const [sets, setSets] = useState<Array<{ reps: string; weight: string }>>(
    () => Array.from({ length: setsTarget }, () => ({ reps: "", weight: "" })),
  );
  const [feedback, setFeedback] = useState<SessionFeedback>("medium");
  const [suggested, setSuggested] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    db.workoutSessions
      .where("date")
      .below(new Date().toISOString().slice(0, 10) + "z")
      .reverse()
      .toArray()
      .then((prev) => {
        if (!mounted) return;
        for (const session of prev) {
          const found = session.exercises.find((e) => e.exerciseId === exercise.id);
          if (found && found.sets.length > 0) {
            const lastSet = found.sets[found.sets.length - 1];
            const prevWeight = lastSet.weight;
            const completedAllReps = found.sets.every((s) => s.reps > 0);
            const prevFeedback = session.difficultySelf ?? "medium";
            setSuggested(suggestNextLoad({ lastLoad: prevWeight, feedback: prevFeedback, completedAllReps }));
            break;
          }
        }
      });
    return () => { mounted = false; };
  }, [exercise.id]);

  function handleSetChange(i: number, field: "reps" | "weight", value: string) {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  function applySuggestion() {
    if (suggested === null) return;
    setSets((prev) => prev.map((s) => ({ ...s, weight: String(suggested) })));
  }

  function handleSave() {
    const entry: WorkoutSession["exercises"][number] = {
      exerciseId: exercise.id,
      sets: sets
        .filter((s) => s.reps.trim() !== "")
        .map((s) => ({
          reps: Number(s.reps),
          weight: Number(s.weight.replace(",", ".")) || 0,
        })),
    };
    if (entry.sets.length > 0) onSave(entry);
  }

  return (
    <div className="card mb-3">
      <div className="flex justify-between items-baseline mb-2">
        <h3 className="text-nude-warm font-medium">{exercise.name}</h3>
        <span className="text-muted text-xs">{setsTarget}x {repsTarget}</span>
      </div>

      {suggested !== null && (
        <button
          type="button"
          onClick={applySuggestion}
          className="text-xs text-nude underline mb-2"
        >
          Sugestão de carga: {suggested} kg (aplicar em todas)
        </button>
      )}

      <div className="space-y-2 mb-2">
        {sets.map((s, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-muted text-xs w-12">Série {i + 1}</span>
            <input
              type="text"
              inputMode="decimal"
              value={s.weight}
              onChange={(e) => handleSetChange(i, "weight", e.target.value)}
              placeholder="kg"
              className="flex-1 bg-bg-deep border border-bg-border rounded-md px-2 py-1.5 text-nude-warm text-sm"
            />
            <input
              type="text"
              inputMode="numeric"
              value={s.reps}
              onChange={(e) => handleSetChange(i, "reps", e.target.value)}
              placeholder="reps"
              className="flex-1 bg-bg-deep border border-bg-border rounded-md px-2 py-1.5 text-nude-warm text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-2">
        {(["easy", "medium", "hard"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFeedback(f)}
            className={`flex-1 py-1.5 rounded-md text-xs ${
              feedback === f ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
            }`}
          >
            {f === "easy" ? "Fácil" : f === "medium" ? "Médio" : "Difícil"}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full bg-wine text-nude-warm rounded-md py-2 text-sm"
      >
        Salvar exercício
      </button>
    </div>
  );
}
