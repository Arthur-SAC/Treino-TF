import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { useSetting } from "./useSetting";
import { CYCLES, CYCLE_TO_GOAL } from "../data/cycles-seed";
import { calculateWhr } from "../lib/waist-hip-ratio";
import { waistGuard } from "../lib/silhouette";
import { waistTrend, hipTrend } from "../lib/measurement-trend";
import { recommendCycleChange, type CycleAdvice } from "../lib/cycle-advisor";

export function useCycleAdvice(): CycleAdvice | null {
  const activeCycle = useSetting("activeCycle");
  const cycleStart = useSetting("cycleStartSessionCount");
  const targetWhr = useSetting("targetWhr");
  const totalSessions = useLiveQuery(() => db.workoutSessions.count(), []);
  const measurements = useLiveQuery(() => db.measurements.orderBy("date").toArray(), []);

  if (totalSessions === undefined || measurements === undefined) return null;

  const sessionsInCycle = totalSessions - cycleStart;
  const threshold = CYCLES.find((c) => c.id === activeCycle)?.threshold ?? Number.POSITIVE_INFINITY;
  const latest = measurements.at(-1);
  const prev = measurements.at(-2);
  const whr = latest?.waistCm && latest?.hipCm ? calculateWhr(latest.waistCm, latest.hipCm) : null;
  const goal = CYCLE_TO_GOAL[activeCycle];
  const guard =
    latest?.waistCm && prev?.waistCm
      ? waistGuard({ cycleGoal: goal, waistStartCm: prev.waistCm, waistNowCm: latest.waistCm })
      : { triggered: false, deltaCm: 0 };

  return recommendCycleChange({
    activeCycle,
    sessionsInCycle,
    threshold,
    whr,
    targetWhr,
    waistTrend: waistTrend(measurements),
    hipTrend: hipTrend(measurements),
    waistGuardTriggered: guard.triggered,
  });
}
