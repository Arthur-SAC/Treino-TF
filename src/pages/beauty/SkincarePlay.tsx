import { useState, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../lib/db";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatSec(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}

export function SkincarePlay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routine = useLiveQuery(
    async () => (id ? await db.skincareRoutines.get(Number(id)) : undefined),
    [id],
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = routine?.steps ?? [];
  const step = steps[activeIdx];
  const waitSec = (step?.waitMin ?? 0) * 60;

  // Reseta o cronômetro ao trocar de passo (ou quando a rotina carrega).
  useEffect(() => {
    setRemaining(waitSec);
    setRunning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, routine?.id]);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setRunning(false);
          if (navigator.vibrate) navigator.vibrate(200);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  if (!routine) return <div className="p-4 text-muted text-sm">Carregando…</div>;

  const isLast = activeIdx >= steps.length - 1;

  function next() {
    if (!isLast) setActiveIdx((i) => i + 1);
  }
  function prev() {
    if (activeIdx > 0) setActiveIdx((i) => i - 1);
  }

  async function finish() {
    if (!routine?.id) return;
    const today = todayISO();
    const existing = await db.skincareLogs
      .where("date").equals(today)
      .and((l) => l.routineId === routine.id)
      .first();
    if (existing?.id) {
      await db.skincareLogs.update(existing.id, { completed: true });
    } else {
      await db.skincareLogs.add({ date: today, routineId: routine.id, completed: true });
    }
    navigate("/beleza/pele-cabelo/skincare", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to={`/beleza/pele-cabelo/skincare/${routine.id}`} className="text-muted text-sm">
          &larr; {routine.name}
        </Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">Rotina guiada</h1>
      <p className="text-muted text-sm mb-4">
        {routine.time === "morning" ? "Manhã" : "Noite"} · passo {activeIdx + 1} de {steps.length}
      </p>

      <div className="h-1.5 bg-bg-deep rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-nude" style={{ width: `${((activeIdx + 1) / steps.length) * 100}%` }} />
      </div>

      <div className="card mb-3 border-nude">
        <h3 className="text-nude-warm font-medium mb-1">{step?.productName}</h3>
        <p className="text-sm mb-3">{step?.technique}</p>

        {waitSec > 0 ? (
          <div className="card !p-3 !bg-wine/20 !border-wine-light">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted text-xs uppercase tracking-wider">Esperar {step.waitMin} min</span>
              <span className="font-serif text-2xl text-nude tabular-nums">{formatSec(remaining)}</span>
            </div>
            <button
              type="button"
              onClick={() => setRunning((v) => !v)}
              className="w-full bg-wine-light text-nude-warm rounded-md py-1.5 text-sm"
            >
              {running ? "Pausar" : remaining === 0 ? "Tempo cumprido ✓" : "Iniciar espera"}
            </button>
          </div>
        ) : (
          <p className="text-muted text-xs">Sem espera — pode passar pro próximo.</p>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={prev}
          disabled={activeIdx === 0}
          className="flex-1 bg-bg-deep border border-bg-border text-muted rounded-md py-2 text-sm disabled:opacity-30"
        >
          ← anterior
        </button>
        {!isLast ? (
          <button type="button" onClick={next} className="flex-1 bg-wine text-nude-warm rounded-md py-2 text-sm">
            próximo →
          </button>
        ) : (
          <button type="button" onClick={() => void finish()} className="flex-1 bg-wine-light text-nude-warm rounded-md py-2 font-medium">
            Concluir ✓
          </button>
        )}
      </div>
    </div>
  );
}
