import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function WeeklyPlan() {
  const templates = useLiveQuery(() => db.workoutTemplates.orderBy("dayOfWeek").toArray(), []);
  const today = new Date().getDay();

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino" className="text-muted text-sm">&larr; Treino</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Plano semanal</h1>
      </div>
      <div className="space-y-3">
        {templates?.map((tpl) => {
          const isToday = tpl.dayOfWeek === today;
          return (
            <Link
              key={tpl.id}
              to={`/treino/sessao/${tpl.id}`}
              className={`card block transition ${
                isToday ? "border-nude bg-wine/20" : "hover:border-nude/40"
              }`}
            >
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-muted text-xs uppercase tracking-wider">
                  {DAYS[tpl.dayOfWeek]} {isToday && "· hoje"}
                </span>
                <span className="text-muted text-xs">{tpl.durationMin} min</span>
              </div>
              <h3 className="text-nude-warm font-medium">{tpl.name}</h3>
              <p className="text-muted text-sm mt-1">{tpl.exercises.length} exercícios</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
