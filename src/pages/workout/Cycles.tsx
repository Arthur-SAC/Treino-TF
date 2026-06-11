import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { useSetting } from "../../hooks/useSetting";
import { setSetting } from "../../lib/settings-helpers";
import { CYCLES, type CycleId } from "../../data/cycles-seed";
import { useCycleAdvice } from "../../hooks/useCycleAdvice";

export function Cycles() {
  const activeCycle = useSetting("activeCycle");
  const cycleStart = useSetting("cycleStartSessionCount");
  const totalSessions = useLiveQuery(() => db.workoutSessions.count(), []);
  const sessionsInCycle = (totalSessions ?? 0) - cycleStart;
  const advice = useCycleAdvice();

  async function activate(cycleId: CycleId) {
    if (cycleId === activeCycle) return;
    if (!confirm(`Trocar pro ciclo "${CYCLES.find((c) => c.id === cycleId)?.name}"? Você pode voltar depois.`)) return;
    await setSetting("activeCycle", cycleId);
    await setSetting("cycleStartSessionCount", totalSessions ?? 0);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino" className="text-muted text-sm">&larr; Treino</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Ciclos de treino</h1>
      </div>

      {advice?.recommend && (
        <div className="card mb-4 !bg-wine/30 !border-nude">
          <h2 className="text-nude font-medium mb-1">Recomendação</h2>
          <p className="text-sm text-nude-warm mb-3">{advice.reason}</p>
          <button
            type="button"
            onClick={() => void activate(advice.toCycle)}
            className="w-full bg-wine text-nude-warm rounded-md py-2 text-sm"
          >
            Avançar pro ciclo "{CYCLES.find((c) => c.id === advice.toCycle)?.name}" agora
          </button>
        </div>
      )}

      <div className="card mb-4 !bg-wine/20 !border-wine-light">
        <h2 className="text-nude font-medium mb-1">Como funciona</h2>
        <p className="text-sm text-nude-warm">
          Cada ciclo tem um foco. O app recomenda avançar quando seus dados mostram que a fase
          cumpriu o papel (cintura no alvo, quadril crescido) — não só por número de sessões.
          Você sempre confirma, e pode trocar manualmente a qualquer momento.
        </p>
      </div>

      <div className="space-y-2">
        {CYCLES.map((c) => {
          const isActive = c.id === activeCycle;
          const progress = isActive ? sessionsInCycle : 0;
          const pct = isActive ? Math.min(100, (progress / c.threshold) * 100) : 0;
          return (
            <div
              key={c.id}
              className={`card ${isActive ? "border-nude" : ""}`}
            >
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-nude-warm font-medium">{c.name}</h3>
                {isActive && <span className="text-nude text-xs">ativo</span>}
              </div>
              <p className="text-muted text-sm mb-2">{c.description}</p>
              {isActive && (
                <>
                  <p className="text-muted text-xs mb-1">
                    {progress} / {c.threshold} sessões
                  </p>
                  <div className="h-1.5 bg-bg-deep rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-nude" style={{ width: `${pct}%` }} />
                  </div>
                </>
              )}
              {!isActive && (
                <button
                  type="button"
                  onClick={() => void activate(c.id)}
                  className="w-full mt-2 bg-bg-deep border border-bg-border text-muted rounded-md py-1.5 text-sm hover:text-nude transition"
                >
                  Ativar este ciclo
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
