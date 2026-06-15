import { useState, useEffect, useRef } from "react";
import type { Exercise, WorkoutSession } from "../lib/db";
import { db } from "../lib/db";
import { suggestNextLoad, isHoldLight } from "../lib/progression";
import { ExerciseInfoModal } from "./ExerciseInfoModal";
import { InfoIcon } from "./InfoIcon";

interface Props {
  exercise: Exercise;
  setsTarget: number;
  repsTarget: string;
  restSec: number;
  onSave: (entry: WorkoutSession["exercises"][number]) => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function SessionRecorder({ exercise, setsTarget, repsTarget, restSec, onSave }: Props) {
  const [sets, setSets] = useState<Array<{ reps: string; weight: string; done: boolean }>>(
    () => Array.from({ length: setsTarget }, () => ({ reps: "", weight: "", done: false })),
  );
  const [suggested, setSuggested] = useState<number | null>(null);
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [restRunning, setRestRunning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
            setSuggested(suggestNextLoad({ lastLoad: prevWeight, feedback: prevFeedback, completedAllReps, category: exercise.category }));
            break;
          }
        }
      });
    return () => { mounted = false; };
  }, [exercise.id]);

  useEffect(() => {
    if (!restRunning || restRemaining === null) return;
    intervalRef.current = setInterval(() => {
      setRestRemaining((r) => {
        if (r === null || r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRestRunning(false);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [restRunning, restRemaining]);

  function handleSetChange(i: number, field: "reps" | "weight", value: string) {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  function toggleDone(i: number) {
    const wasNotDone = !sets[i].done;
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, done: !s.done } : s)));
    // Inicia descanso automaticamente quando marca como feita (e não é a última)
    if (wasNotDone && i < sets.length - 1 && restSec > 0) {
      setRestRemaining(restSec);
      setRestRunning(true);
    }
  }

  function startRest() {
    setRestRemaining(restSec);
    setRestRunning(true);
  }

  function pauseRest() {
    setRestRunning(false);
  }

  function skipRest() {
    setRestRunning(false);
    setRestRemaining(null);
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
      {/* Header — quebra em linha 2 se nome longo */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <h3 className="text-nude-warm font-medium break-words flex-1 min-w-0">{exercise.name}</h3>
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            className="text-muted hover:text-nude transition flex-shrink-0"
            aria-label="Como fazer este exercício"
          >
            <InfoIcon />
          </button>
        </div>
        <p className="text-muted text-xs mt-0.5">
          {setsTarget}x {repsTarget} {restSec > 0 && `· descanso ${restSec}s`}
        </p>
      </div>

      {isHoldLight(exercise.category) && (
        <p className="text-xs text-muted mb-2">Manter leve — não subir a carga (silhueta).</p>
      )}
      {exercise.successCue && (
        <p className="text-xs text-nude/80 mb-2">✦ {exercise.successCue}</p>
      )}
      {suggested !== null ? (
        <button
          type="button"
          onClick={applySuggestion}
          className="text-xs text-nude underline mb-3 block"
        >
          Sugestão: {suggested} kg (aplicar em todas)
        </button>
      ) : exercise.startLoadKg ? (
        <button
          type="button"
          onClick={() => setSets((prev) => prev.map((s) => ({ ...s, weight: String(exercise.startLoadKg) })))}
          className="text-xs text-nude underline mb-3 block"
        >
          Sugestão inicial: {exercise.startLoadKg} kg (aplicar em todas)
        </button>
      ) : (
        <p className="text-xs text-muted mb-3">Peso corporal</p>
      )}

      {/* Sets — grid pra controlar largura exata, sem flex-1 sobrando */}
      <div className="space-y-2 mb-3">
        {sets.map((s, i) => (
          <div
            key={i}
            className={`grid grid-cols-[2.5rem_1fr_1fr_2rem] gap-1.5 items-center ${
              s.done ? "opacity-50" : ""
            }`}
          >
            <span className="text-muted text-xs">#{i + 1}</span>
            <div className="relative min-w-0">
              <input
                type="text"
                inputMode="decimal"
                value={s.weight}
                onChange={(e) => handleSetChange(i, "weight", e.target.value)}
                placeholder="kg"
                disabled={s.done}
                className="w-full bg-bg-deep border border-bg-border rounded-md px-2 py-1.5 pr-7 text-nude-warm text-sm"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted text-[0.65rem]">kg</span>
            </div>
            <div className="relative min-w-0">
              <input
                type="text"
                inputMode="numeric"
                value={s.reps}
                onChange={(e) => handleSetChange(i, "reps", e.target.value)}
                placeholder="reps"
                disabled={s.done}
                className="w-full bg-bg-deep border border-bg-border rounded-md px-2 py-1.5 pr-9 text-nude-warm text-sm"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted text-[0.65rem]">reps</span>
            </div>
            <button
              type="button"
              onClick={() => toggleDone(i)}
              className={`w-7 h-7 rounded-md flex items-center justify-center text-sm ${
                s.done ? "bg-nude text-bg-base" : "bg-bg-deep border border-bg-border text-muted"
              }`}
              aria-label={s.done ? "Feita" : "Marcar feita"}
            >
              {s.done ? "✓" : ""}
            </button>
          </div>
        ))}
      </div>

      {/* Timer de descanso */}
      {restSec > 0 && restRemaining !== null && (
        <div className="card !p-3 !bg-wine/20 !border-wine-light mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted text-xs uppercase tracking-wider">Descanso</span>
            <span className="font-serif text-2xl text-nude tabular-nums">
              {formatTime(restRemaining)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={restRunning ? pauseRest : () => setRestRunning(true)}
              className="flex-1 bg-wine-light text-nude-warm rounded-md py-1.5 text-xs"
            >
              {restRunning ? "Pausar" : restRemaining === 0 ? "Pronto" : "Retomar"}
            </button>
            <button
              type="button"
              onClick={skipRest}
              className="px-3 bg-bg-deep border border-bg-border text-muted rounded-md text-xs"
            >
              Pular
            </button>
          </div>
        </div>
      )}

      {restSec > 0 && restRemaining === null && (
        <button
          type="button"
          onClick={startRest}
          className="w-full bg-bg-deep border border-bg-border text-muted rounded-md py-1.5 text-xs mb-3"
        >
          ↻ Iniciar descanso ({restSec}s)
        </button>
      )}

      <button
        type="button"
        onClick={handleSave}
        className="w-full bg-wine text-nude-warm rounded-md py-2 text-sm"
      >
        Salvar exercício
      </button>

      {showInfo && (
        <ExerciseInfoModal exercise={exercise} onClose={() => setShowInfo(false)} />
      )}
    </div>
  );
}
