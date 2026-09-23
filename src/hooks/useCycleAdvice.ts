import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { useSetting } from "./useSetting";
import { CYCLES } from "../data/cycles-seed";
import { useResolvedGoal } from "./useResolvedGoal";
import { FASES } from "../lib/objetivo";
import { waistGuard } from "../lib/silhouette";
import { waistTrend, hipTrend } from "../lib/measurement-trend";
import { recommendCycleChange, type CycleAdvice } from "../lib/cycle-advisor";

export function useCycleAdvice(): CycleAdvice | null {
  const activeCycle = useSetting("activeCycle");
  const cycleStart = useSetting("cycleStartSessionCount");
  // Meta concedida, não a que o ciclo pediria: sem isso o conselho recomenda
  // sair da hipertrofia dizendo "a cintura subiu no superávit" — um superávit
  // que o app negou por causa da própria cintura.
  const goal = useResolvedGoal();
  const totalSessions = useLiveQuery(() => db.workoutSessions.count(), []);
  const measurements = useLiveQuery(() => db.measurements.orderBy("date").toArray(), []);

  if (totalSessions === undefined || measurements === undefined) return null;

  const sessionsInCycle = totalSessions - cycleStart;
  const threshold = CYCLES.find((c) => c.id === activeCycle)?.threshold ?? Number.POSITIVE_INFINITY;
  const latest = measurements.at(-1);
  const prev = measurements.at(-2);
  const guard =
    latest?.waistCm && prev?.waistCm
      ? waistGuard({ cycleGoal: goal, waistStartCm: prev.waistCm, waistNowCm: latest.waistCm })
      : { triggered: false, deltaCm: 0 };

  return recommendCycleChange({
    activeCycle,
    sessionsInCycle,
    threshold,
    waistCm: latest?.waistCm ?? null,
    cinturaFimFase1: FASES.find((f) => f.id === "fase-1")!.cinturaCm,
    waistTrend: waistTrend(measurements),
    hipTrend: hipTrend(measurements),
    waistGuardTriggered: guard.triggered,
  });
}
