import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { PathTabs } from "../../components/PathTabs";
import { StreakCard } from "../../components/StreakCard";
import { calculateWhr, classifyWhr } from "../../lib/waist-hip-ratio";
import { daysInLast, currentStreak } from "../../lib/evolution";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const WHR_LABEL: Record<string, string> = {
  "ampulheta-forte": "ampulheta forte",
  "ampulheta-moderada": "ampulheta moderada",
  transicao: "transição",
  "perfil-masculino": "perfil masculino",
};

export function EvolucaoView() {
  const voiceLogs = useLiveQuery(() => db.voicePracticeLogs.toArray(), []);
  const practiceLogs = useLiveQuery(() => db.practiceLogs.toArray(), []);
  const skincareLogs = useLiveQuery(() => db.skincareLogs.toArray(), []);
  const sessions = useLiveQuery(() => db.workoutSessions.toArray(), []);
  const measurements = useLiveQuery(() => db.measurements.orderBy("date").toArray(), []);
  const milestones = useLiveQuery(() => db.milestones.toArray(), []);

  const t = todayISO();
  const voiceDates = (voiceLogs ?? []).map((l) => l.date);
  const moveDates = (practiceLogs ?? []).map((l) => l.date);
  const skinDates = (skincareLogs ?? []).filter((l) => l.completed).map((l) => l.date);
  const workoutDates = (sessions ?? []).map((s) => s.date);

  const latest = measurements?.at(-1);
  const whr = latest?.waistCm && latest?.hipCm ? calculateWhr(latest.waistCm, latest.hipCm) : null;
  const milestonesDone = (milestones ?? []).filter((m) => m.dateCompleted).length;
  const milestonesTotal = milestones?.length ?? 0;

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <h1 className="font-serif text-2xl text-nude flex-1">Trilha</h1>
      </div>
      <PathTabs />

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Evolução · últimos 30 dias</h2>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <StreakCard label="Voz" count={daysInLast(voiceDates, t, 30)} total={30} />
        <StreakCard label="Movimento" count={daysInLast(moveDates, t, 30)} total={30} />
        <StreakCard label="Skincare" count={daysInLast(skinDates, t, 30)} total={30} />
        <StreakCard label="Treino" count={daysInLast(workoutDates, t, 30)} total={30} />
      </div>

      <div className="card mb-2 flex justify-between items-baseline">
        <span className="text-nude-warm text-sm">Sequência de voz</span>
        <span className="text-nude text-lg">{currentStreak(voiceDates, t)} dias</span>
      </div>

      <div className="card mb-2">
        <div className="flex justify-between items-baseline">
          <span className="text-nude-warm text-sm">WHR atual</span>
          <span className="text-nude text-lg">
            {whr !== null ? `${whr.toFixed(2)} · ${WHR_LABEL[classifyWhr(whr)]}` : "—"}
          </span>
        </div>
        <Link to="/corpo/silhueta" className="text-muted text-xs underline">ver silhueta</Link>
      </div>

      <div className="card">
        <div className="flex justify-between items-baseline">
          <span className="text-nude-warm text-sm">Marcos concluídos</span>
          <span className="text-nude text-lg">{milestonesDone} de {milestonesTotal}</span>
        </div>
        <Link to="/trilha" className="text-muted text-xs underline">ver marcos</Link>
      </div>
    </div>
  );
}
