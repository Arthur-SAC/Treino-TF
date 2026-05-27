import { Link } from "react-router-dom";
import type { DanceSequence } from "../lib/db";

const LEVEL_LABEL: Record<DanceSequence["level"], string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

interface Props {
  sequence: DanceSequence;
  lastPracticed?: string;
}

export function SequenceCard({ sequence, lastPracticed }: Props) {
  return (
    <Link to={`/treino/movimento/${sequence.id}`} className="card block hover:border-nude/40 transition">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">{LEVEL_LABEL[sequence.level]}</span>
        <span className="text-muted text-xs">{sequence.durationMin} min · {sequence.moves.length} movimentos</span>
      </div>
      <h3 className="text-nude-warm font-medium">{sequence.name}</h3>
      <p className="text-muted text-sm mt-1">{sequence.focus}</p>
      {lastPracticed && (
        <p className="text-nude text-xs mt-2">última prática: {lastPracticed}</p>
      )}
    </Link>
  );
}
