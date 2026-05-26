import { Link } from "react-router-dom";
import type { SkincareRoutine } from "../lib/db";

const TIME_LABEL: Record<SkincareRoutine["time"], string> = {
  morning: "Manhã",
  evening: "Noite",
};

const TARGET_LABEL: Record<SkincareRoutine["target"], string> = {
  face: "Rosto",
  back: "Costas",
  armpit: "Axila",
  intimate: "Íntima",
  general: "Geral",
};

interface Props {
  routine: SkincareRoutine;
  done?: boolean;
  onToggle?: () => void;
}

export function RoutineCard({ routine, done, onToggle }: Props) {
  return (
    <div className="card flex items-center gap-3">
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className={`w-6 h-6 rounded-md flex-shrink-0 border ${
            done ? "bg-nude border-nude" : "bg-bg-deep border-bg-border"
          }`}
          aria-label={done ? "Feito" : "Não feito"}
        >
          {done && <span className="text-bg-base text-xs">✓</span>}
        </button>
      )}
      <Link to={`/beleza/pele-cabelo/skincare/${routine.id}`} className="flex-1 min-w-0">
        <h3 className={`font-medium ${done ? "text-muted line-through" : "text-nude-warm"}`}>
          {routine.name}
        </h3>
        <p className="text-muted text-xs mt-0.5">
          {TIME_LABEL[routine.time]} · {TARGET_LABEL[routine.target]} · {routine.steps.length} passos
        </p>
      </Link>
    </div>
  );
}
