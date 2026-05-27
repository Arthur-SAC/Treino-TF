import type { Milestone } from "../lib/db";
import { formatDateBR, formatRelativeDays } from "../lib/format";

const CATEGORY_LABEL: Record<Milestone["category"], string> = {
  medico: "Médico",
  fisico: "Físico",
  social: "Social",
  fertilidade: "Fertilidade",
};

interface Props {
  milestone: Milestone;
  onComplete?: () => void;
  onDelete?: () => void;
}

export function MilestoneCard({ milestone, onComplete, onDelete }: Props) {
  const completed = Boolean(milestone.dateCompleted);
  const planned = new Date(milestone.datePlanned);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - planned.getTime()) / 86400000);

  return (
    <div className={`card ${completed ? "opacity-60" : ""}`}>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">{CATEGORY_LABEL[milestone.category]}</span>
        <span className="text-muted text-xs">
          {completed ? `concluído ${formatDateBR(new Date(milestone.dateCompleted!))}` : formatRelativeDays(daysDiff)}
        </span>
      </div>
      <h3 className={`font-medium ${completed ? "text-muted line-through" : "text-nude-warm"}`}>
        {milestone.title}
      </h3>
      <p className="text-muted text-xs mt-1">previsto: {formatDateBR(planned)}</p>
      {milestone.notes && <p className="text-muted text-sm mt-2">{milestone.notes}</p>}
      <div className="flex gap-3 mt-3">
        {!completed && onComplete && (
          <button onClick={onComplete} type="button" className="text-nude text-xs underline">
            marcar como concluído
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} type="button" className="text-muted text-xs hover:text-red-300">
            apagar
          </button>
        )}
      </div>
    </div>
  );
}
