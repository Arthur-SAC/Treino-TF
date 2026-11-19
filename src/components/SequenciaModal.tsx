import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { sequenciaDoCatalogo } from "../lib/sequence-label";
import { registrarPratica } from "../lib/practice-log-helpers";
import { MoveStep } from "./MoveStep";
import { VideoSection } from "./VideoSection";
import { NaFrente } from "./NaFrente";

/** O "como fazer" de uma sequência (alongamento, assoalho, postura, dança) na
 *  frente do Hoje (spec 2026-11-19, seção 5): passos com a execução e o
 *  cronômetro do MoveStep, o vídeo, e "Concluir" grava a prática com a mesma
 *  função da tela da sequência — o Hoje marca o item sozinho por ela. */
export function SequenciaModal({ sequenceId, onClose, onConcluir }: {
  sequenceId: string;
  onClose: () => void;
  onConcluir?: () => void;
}) {
  // O banco guarda o vídeo que ela colou; sem a sequência no banco, vale o catálogo.
  const doBanco = useLiveQuery(async () => (await db.danceSequences.get(sequenceId)) ?? null, [sequenceId]);
  const sequence = doBanco ?? (doBanco === null ? sequenciaDoCatalogo(sequenceId) : undefined);
  const [ativo, setAtivo] = useState(0);
  const [gravando, setGravando] = useState(false);

  async function concluir() {
    if (!sequence || gravando) return;
    setGravando(true);
    try {
      await registrarPratica(sequence);
      onConcluir?.();
      onClose();
    } finally {
      setGravando(false);
    }
  }

  return (
    <NaFrente>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#2a1416]/40 p-4"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={sequence?.name ?? "Sequência"}
          className="card w-full max-w-md max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start gap-2 mb-1">
            <h2 className="font-serif text-xl text-nude">{sequence?.name ?? "Carregando…"}</h2>
            <button type="button" onClick={onClose} aria-label="Fechar" className="text-muted text-lg px-2">✕</button>
          </div>
          {sequence && (
            <>
              <p className="text-muted text-sm mb-3">{sequence.focus} · {sequence.durationMin} min</p>
              {doBanco && (
                <VideoSection
                  url={doBanco.videoUrl}
                  onSave={(url) => { void db.danceSequences.update(doBanco.id, { videoUrl: url || undefined }); }}
                />
              )}
              {sequence.moves.length > 0 && (
                <p className="text-muted text-xs uppercase tracking-wider mb-2">
                  Passo {Math.min(ativo + 1, sequence.moves.length)} de {sequence.moves.length}
                </p>
              )}
              <div className="space-y-2 mb-4">
                {sequence.moves.map((move, i) => (
                  <MoveStep
                    key={i}
                    move={move}
                    active={i === ativo}
                    onComplete={i === ativo && i < sequence.moves.length - 1 ? () => setAtivo((n) => n + 1) : undefined}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => void concluir()}
                disabled={gravando}
                className="w-full rounded-md py-3 text-sm font-medium bg-wine text-nude-warm"
              >
                Concluir
              </button>
            </>
          )}
        </div>
      </div>
    </NaFrente>
  );
}
