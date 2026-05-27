import { useState, useEffect, useRef } from "react";
import type { DanceMove } from "../lib/db";

interface Props {
  move: DanceMove;
  active: boolean;
  onComplete?: () => void;
}

function formatSec(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}

export function MoveStep({ move, active, onComplete }: Props) {
  const [remaining, setRemaining] = useState(move.durationSec);
  const [running, setRunning] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setRemaining(move.durationSec);
      setRunning(false);
      completedRef.current = false;
    }
  }, [active, move.durationSec]);

  useEffect(() => {
    if (!running || !active) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, active, onComplete]);

  return (
    <div className={`card ${active ? "border-nude" : "opacity-60"}`}>
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="text-nude-warm font-medium">{move.name}</h3>
        <span className="text-nude text-sm">{formatSec(remaining)}</span>
      </div>
      <p className="text-sm text-muted mb-3">{move.description}</p>
      {move.repeat && (
        <p className="text-muted text-xs mb-3">Repetir {move.repeat}x</p>
      )}
      {active && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRunning((v) => !v)}
            className="flex-1 bg-wine-light text-nude-warm rounded-md py-2 text-sm"
          >
            {running ? "Pausar" : remaining === 0 ? "Pronto" : "Iniciar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setRemaining(move.durationSec);
              completedRef.current = false;
            }}
            className="px-3 bg-bg-deep border border-bg-border text-muted rounded-md text-sm"
          >
            ↻
          </button>
          {onComplete && (
            <button
              type="button"
              onClick={() => {
                if (!completedRef.current) {
                  completedRef.current = true;
                  onComplete();
                }
              }}
              className="px-3 bg-bg-deep border border-bg-border text-muted rounded-md text-sm"
            >
              pular →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
