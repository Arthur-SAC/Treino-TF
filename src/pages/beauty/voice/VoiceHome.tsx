import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type VoiceExercise } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { formatDateBR } from "../../../lib/format";

const CATEGORY_LABEL: Record<VoiceExercise["category"], string> = {
  aquecimento: "Aquecimento",
  passing: "Passing (feminilizar)",
  sensual: "Sensual",
  articulacao: "Articulação",
};

const CATEGORY_DESC: Record<VoiceExercise["category"], string> = {
  aquecimento: "5-10 min antes de qualquer treino vocal. Acorda corpo e respiração.",
  passing: "Pitch + ressonância + entonação. Pra falar como mulher no dia a dia.",
  sensual: "Sussurro, modulação emocional, suspiros. Pra vida íntima.",
  articulacao: "Clareza nas consoantes. Feminiliza fala mais do que parece.",
};

export function VoiceHome() {
  const exercises = useLiveQuery(() => db.voiceExercises.toArray(), []);
  const logs = useLiveQuery(() => db.voicePracticeLogs.orderBy("date").reverse().toArray(), []);
  const recordings = useLiveQuery(() => db.voiceRecordings.count(), []);

  const lastBySeq = new Map<string, string>();
  for (const log of logs ?? []) {
    if (!lastBySeq.has(log.exerciseId)) lastBySeq.set(log.exerciseId, log.date);
  }

  const byCategory = (exercises ?? []).reduce<Record<string, VoiceExercise[]>>((acc, ex) => {
    (acc[ex.category] ||= []).push(ex);
    return acc;
  }, {});

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Voz</h1>
        <Link to="/beleza/voz/gravacoes" className="text-muted text-sm">gravações ({recordings ?? 0})</Link>
      </div>
      <BeautyTabs />

      <div className="card mb-4 !bg-wine/20 !border-wine-light">
        <h2 className="text-nude font-medium mb-1">Como funciona</h2>
        <p className="text-sm text-nude-warm">
          Sem TRH, sua voz só muda com prática. 15 min/dia já transforma em 2-3 meses. Sempre começa com aquecimento (3-5 min) antes de passing/sensual.
          Grave-se a cada 2-4 semanas pra ouvir progresso.
        </p>
      </div>

      {(["aquecimento", "passing", "sensual", "articulacao"] as const).map((cat) => {
        const list = byCategory[cat] ?? [];
        return (
          <div key={cat} className="mb-4">
            <h2 className="text-muted text-xs uppercase tracking-wider">{CATEGORY_LABEL[cat]}</h2>
            <p className="text-muted text-xs mb-2">{CATEGORY_DESC[cat]}</p>
            <div className="space-y-2">
              {list.map((ex) => (
                <Link key={ex.id} to={`/beleza/voz/${ex.id}`} className="card block hover:border-nude/40 transition">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-muted text-xs">{ex.level} · {ex.durationMin} min</span>
                    {lastBySeq.has(ex.id) && (
                      <span className="text-nude text-xs">última: {formatDateBR(new Date(lastBySeq.get(ex.id)!))}</span>
                    )}
                  </div>
                  <h3 className="text-nude-warm font-medium">{ex.name}</h3>
                  <p className="text-muted text-sm mt-1">{ex.focus}</p>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
