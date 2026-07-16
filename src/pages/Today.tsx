import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../lib/db";
import { TodayCard } from "../components/TodayCard";
import { StreakCard } from "../components/StreakCard";
import { useSetting } from "../hooks/useSetting";
import { formatDateBR } from "../lib/format";
import { CYCLE_TO_GOAL } from "../data/cycles-seed";
import { useCycleAdvice } from "../hooks/useCycleAdvice";
import { computeFocus, timeBlockFocus } from "../lib/today-priority";
import { waistGuard } from "../lib/silhouette";
import { buildDayRoutine, type RoutineItem } from "../lib/today-routine";
import { useRoutineChecks } from "../hooks/useRoutineChecks";
import { RoutineRow } from "../components/RoutineRow";
import { ShortcutsGrid } from "../components/ShortcutsGrid";

export function Today() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayISO = today.toISOString().slice(0, 10);

  const activeCycle = useSetting("activeCycle");
  const todayTemplate = useLiveQuery(
    async () => {
      const all = await db.workoutTemplates.where("dayOfWeek").equals(dayOfWeek).toArray();
      return all.find((t) => (t.cycle ?? "adaptacao") === activeCycle);
    },
    [dayOfWeek, activeCycle],
  );
  const sessionsToday = useLiveQuery(
    async () => db.workoutSessions.where("date").equals(todayISO).count(),
    [todayISO],
  );
  const measurementsRecent = useLiveQuery(
    async () => db.measurements.orderBy("date").reverse().limit(1).toArray(),
    [],
  );
  const photosRecent = useLiveQuery(
    async () => {
      const arr = await db.photos.where("category").equals("self").sortBy("date");
      return arr.slice(-1);
    },
    [],
  );
  const goalMl = useSetting("hydrationGoalMl");
  const dailyLog = useLiveQuery(async () => db.dailyLog.get(todayISO), [todayISO]);

  const walkGoalMin = useSetting("walkGoalMin");

  const morningRoutines = useLiveQuery(
    () => db.skincareRoutines.where("time").equals("morning").toArray(),
    [],
  );
  const eveningRoutines = useLiveQuery(
    () => db.skincareRoutines.where("time").equals("evening").toArray(),
    [],
  );
  const todaySkincareLogs = useLiveQuery(
    () => db.skincareLogs.where("date").equals(todayISO).toArray(),
    [todayISO],
  );

  // Conta últimos 7 dias com pelo menos 1 skincare feita
  const last7DaysSkincare = useLiveQuery(async () => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    const logs = await db.skincareLogs.where("date").anyOf(dates).and((l) => l.completed).toArray();
    const uniqueDates = new Set(logs.map((l) => l.date));
    return uniqueDates.size;
  }, []);

  // Conta últimas 7 sessões de treino
  const last7DaysTraining = useLiveQuery(async () => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    const sessions = await db.workoutSessions.where("date").anyOf(dates).toArray();
    const uniqueDates = new Set(sessions.map((s) => s.date));
    return uniqueDates.size;
  }, []);

  const morningDone = todaySkincareLogs && morningRoutines && morningRoutines.length > 0 &&
    morningRoutines.every((r) => todaySkincareLogs.some((l) => l.routineId === r.id && l.completed));
  const eveningDone = todaySkincareLogs && eveningRoutines && eveningRoutines.length > 0 &&
    eveningRoutines.every((r) => todaySkincareLogs.some((l) => l.routineId === r.id && l.completed));

  const daysSinceMeasurement = measurementsRecent?.[0]
    ? Math.floor((today.getTime() - new Date(measurementsRecent[0].date).getTime()) / 86400000)
    : null;
  const daysSincePhoto = photosRecent?.[0]
    ? Math.floor((today.getTime() - new Date(photosRecent[0].date).getTime()) / 86400000)
    : null;

  const advice = useCycleAdvice();
  const measurementsAsc = useLiveQuery(() => db.measurements.orderBy("date").toArray(), []);
  const latestM = measurementsAsc?.at(-1);
  const prevM = measurementsAsc?.at(-2);
  const guardTriggered = !!(latestM?.waistCm && prevM?.waistCm) &&
    waistGuard({
      cycleGoal: CYCLE_TO_GOAL[activeCycle],
      waistStartCm: prevM!.waistCm!,
      waistNowCm: latestM!.waistCm!,
    }).triggered;
  const focus = computeFocus({
    cycleAdvice: advice ? { recommend: advice.recommend, reason: advice.reason } : null,
    waistGuardTriggered: guardTriggered,
    workoutToday: todayTemplate
      ? { done: (sessionsToday ?? 0) > 0, name: todayTemplate.name, to: `/treino/sessao/${todayTemplate.id}` }
      : null,
    daysSinceMeasurement,
    daysSincePhoto,
  });

  async function addWater(ml: number) {
    const log = await db.dailyLog.get(todayISO);
    if (log) {
      await db.dailyLog.update(todayISO, { waterMl: log.waterMl + ml });
    } else {
      await db.dailyLog.put({ date: todayISO, waterMl: ml, activeBreakCount: 0 });
    }
  }

  async function addWalk(min: number) {
    const log = await db.dailyLog.get(todayISO);
    if (log) {
      await db.dailyLog.update(todayISO, { walkMin: (log.walkMin ?? 0) + min });
    } else {
      await db.dailyLog.put({ date: todayISO, waterMl: 0, activeBreakCount: 0, walkMin: min });
    }
  }

  const routine = buildDayRoutine(dayOfWeek);
  const { done, toggle } = useRoutineChecks(todayISO);

  const linkDone = (item: RoutineItem): boolean => {
    if (item.linkKey === "workout") return (sessionsToday ?? 0) > 0;
    if (item.linkKey === "skincareMorning") return !!morningDone;
    if (item.linkKey === "skincareNight") return !!eveningDone;
    return false;
  };

  const isDone = (item: RoutineItem): boolean =>
    item.control === "link" ? linkDone(item) : done.has(item.id);

  const rightSlotFor = (item: RoutineItem) => {
    if (item.control === "water") {
      return (
        <button type="button" onClick={() => void addWater(200)} className="text-xs bg-wine text-nude-warm px-2 py-1 rounded-md">+200 ml</button>
      );
    }
    if (item.control === "walk") {
      return (
        <button type="button" onClick={() => void addWalk(10)} className="text-xs bg-wine text-nude-warm px-2 py-1 rounded-md">+10 min</button>
      );
    }
    if (item.control === "invert") {
      return <span className="text-[11px] text-nude border border-bg-border rounded-full px-2 py-1">⇄ trocar</span>;
    }
    if (item.control === "breaks") {
      return <span className="text-[11px] text-nude">{dailyLog?.activeBreakCount ?? 0} hoje</span>;
    }
    return undefined;
  };

  const subtitleFor = (item: RoutineItem): string | undefined => {
    if (item.id === "agua") return `${dailyLog?.waterMl ?? 0} ml de ${goalMl} ml`;
    if (item.control === "walk") return `${dailyLog?.walkMin ?? 0} / ${walkGoalMin} min`;
    return item.subtitle;
  };

  const activeFocus = focus ?? timeBlockFocus(today.getHours(), dayOfWeek);

  return (
    <div className="p-4 pb-24 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted text-xs uppercase tracking-wider">Hoje · {formatDateBR(today)}</p>
          <h1 className="font-serif text-2xl text-nude">{today.getHours() < 12 ? "Bom dia" : today.getHours() < 18 ? "Boa tarde" : "Boa noite"}</h1>
        </div>
        <Link to="/configuracoes" className="text-muted text-xs underline">configurações</Link>
      </div>

      <TodayCard title={`✦ ${activeFocus.title}`} subtitle={activeFocus.subtitle} to={activeFocus.to} variant="highlight" />

      <div className="grid grid-cols-3 gap-2">
        <StreakCard label="Treino" count={last7DaysTraining ?? 0} total={7} />
        <StreakCard label="Skincare" count={last7DaysSkincare ?? 0} total={7} />
        <StreakCard label="Pausas" count={dailyLog?.activeBreakCount ?? 0} unit="hoje" />
      </div>

      {routine.blocks.map((block) => (
        <section key={block.id} className="space-y-2">
          <div className="flex items-center gap-2 pt-2">
            <h2 className="text-muted text-xs uppercase tracking-wider">{block.label}</h2>
            {block.timeHint && <span className="text-nude text-xs ml-auto opacity-80">{block.timeHint}</span>}
          </div>
          {block.items.map((item) => (
            <RoutineRow
              key={item.id}
              item={{ ...item, subtitle: subtitleFor(item) }}
              done={isDone(item)}
              onToggle={() => void toggle(item.id)}
              rightSlot={rightSlotFor(item)}
              navValue={item.control === "link" ? (isDone(item) ? "feito ✓" : "ver →") : undefined}
            />
          ))}
        </section>
      ))}

      <ShortcutsGrid />
    </div>
  );
}
