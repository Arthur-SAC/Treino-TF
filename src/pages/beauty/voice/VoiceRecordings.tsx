import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../../lib/db";
import { formatDateBR } from "../../../lib/format";
import { useSetting } from "../../../hooks/useSetting";
import { classifyPitch } from "../../../lib/pitch";

function RecordingPlayer({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  if (!url) return null;
  return <audio controls src={url} className="w-full mt-2" />;
}

export function VoiceRecordings() {
  const recordings = useLiveQuery(
    async () => {
      const all = await db.voiceRecordings.orderBy("date").toArray();
      return all.reverse();
    },
    [],
  );
  const exercises = useLiveQuery(() => db.voiceExercises.toArray(), []);
  const exMap = new Map(exercises?.map((e) => [e.id, e]) ?? []);
  const targetLow = useSetting("voicePitchTargetLowHz");
  const targetHigh = useSetting("voicePitchTargetHighHz");

  async function remove(id?: number) {
    if (id === undefined) return;
    if (!confirm("Apagar essa gravação?")) return;
    await db.voiceRecordings.delete(id);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/voz" className="text-muted text-sm">&larr; Voz</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Gravações</h1>
      </div>

      <div className="card mb-4 !bg-wine/20 !border-wine-light">
        <p className="text-sm text-nude-warm">
          Compare gravações de meses diferentes pra ouvir evolução. Tente fazer 1 gravação por exercício a cada 2-4 semanas.
        </p>
      </div>

      <div className="space-y-3">
        {recordings?.map((r) => (
          <div key={r.id} className="card">
            <div className="flex justify-between items-baseline">
              <span className="text-nude-warm text-sm">{exMap.get(r.exerciseId ?? "")?.name ?? "Sem exercício"}</span>
              <span className="text-muted text-xs">{formatDateBR(new Date(r.date))}</span>
            </div>
            <p className="text-muted text-xs">
              {r.durationSec}s
              {r.avgPitchHz !== undefined && ` · ~${r.avgPitchHz} Hz · ${classifyPitch(r.avgPitchHz, targetLow, targetHigh)}`}
            </p>
            <RecordingPlayer blob={r.blob} />
            <button onClick={() => void remove(r.id)} type="button" className="text-muted text-xs hover:text-red-300 mt-1">
              apagar
            </button>
          </div>
        ))}
        {recordings?.length === 0 && (
          <p className="text-muted text-sm text-center py-6">Sem gravações ainda. Faz a primeira agora!</p>
        )}
      </div>
    </div>
  );
}
