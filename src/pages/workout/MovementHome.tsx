import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { SequenceCard } from "../../components/SequenceCard";
import { formatDateBR } from "../../lib/format";

export function MovementHome() {
  const sequences = useLiveQuery(() => db.danceSequences.toArray(), []);
  const logs = useLiveQuery(() => db.practiceLogs.orderBy("date").reverse().toArray(), []);

  const lastBySequence = new Map<string, string>();
  for (const log of logs ?? []) {
    if (!lastBySequence.has(log.sequenceId)) {
      lastBySequence.set(log.sequenceId, log.date);
    }
  }

  const mobilidade = sequences?.filter((s) => s.category === "mobilidade") ?? [];
  const pelvic = sequences?.filter((s) => s.category === "pelvic") ?? [];
  const danca = sequences?.filter((s) => s.category === "danca") ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino" className="text-muted text-sm">&larr; Treino</Link>
        <Link to="/treino/movimento/historico" className="text-muted text-sm">histórico</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Movimento</h1>
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Mobilidade</h2>
      <div className="space-y-2 mb-4">
        {mobilidade.map((s) => (
          <SequenceCard
            key={s.id}
            sequence={s}
            lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
          />
        ))}
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Pelvic floor · sensibilidade + controle</h2>
      <div className="space-y-2 mb-4">
        {pelvic.map((s) => (
          <SequenceCard
            key={s.id}
            sequence={s}
            lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
          />
        ))}
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Dança · 4 semanas progressivas</h2>
      <div className="space-y-2">
        {danca.map((s) => (
          <SequenceCard
            key={s.id}
            sequence={s}
            lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
