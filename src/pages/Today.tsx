import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../lib/db";
import { TodayCard } from "../components/TodayCard";
import { StreakCard } from "../components/StreakCard";
import { useSetting } from "../hooks/useSetting";
import { formatDateBR } from "../lib/format";
import { CYCLE_TO_GOAL } from "../data/cycles-seed";
import { useCycleAdvice } from "../hooks/useCycleAdvice";
import { computeFocus } from "../lib/today-priority";
import { waistGuard } from "../lib/silhouette";
import { careItemsFor, presenceSuggestionForDay } from "../lib/daily-routine";

export function Today() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayISO = today.toISOString().slice(0, 10);

  const presencaSeq = presenceSuggestionForDay(dayOfWeek);
  const morningCare = careItemsFor("morning");
  const nightCare = careItemsFor("night");

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
  const mealsToday = useLiveQuery(() => db.meals.where("date").equals(todayISO).toArray(), [todayISO]);
  const mealsDone = mealsToday?.filter((m) => m.checked).length ?? 0;

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

  return (
    <div className="p-4 pb-24 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted text-xs uppercase tracking-wider">Hoje · {formatDateBR(today)}</p>
          <h1 className="font-serif text-2xl text-nude">Bom dia</h1>
        </div>
        <Link to="/configuracoes" className="text-muted text-xs underline">configurações</Link>
      </div>

      {focus && (
        <TodayCard title={`✦ ${focus.title}`} subtitle={focus.subtitle} to={focus.to} variant="highlight" />
      )}

      <div className="grid grid-cols-3 gap-2">
        <StreakCard label="Treino" count={last7DaysTraining ?? 0} total={7} />
        <StreakCard label="Skincare" count={last7DaysSkincare ?? 0} total={7} />
        <StreakCard label="Pausas" count={dailyLog?.activeBreakCount ?? 0} unit="hoje" />
      </div>

      {/* BLOCO 1 — Cuidados ao acordar */}
      <h2 className="text-muted text-xs uppercase tracking-wider pt-2">Cuidados ao acordar</h2>
      <TodayCard
        title="Skincare manhã"
        subtitle={
          morningRoutines && morningRoutines.length > 0
            ? `${morningRoutines.length} rotina${morningRoutines.length > 1 ? "s" : ""} · ${morningDone ? "concluído ✓" : "pendente"}`
            : "sem rotina configurada"
        }
        to="/beleza/pele-cabelo/skincare"
        variant={!morningDone && morningRoutines && morningRoutines.length > 0 ? "highlight" : "default"}
      />
      {morningCare.map((c) => (
        <TodayCard key={c.id} title={c.label} subtitle={c.cadence ?? (c.optional ? "se quiser" : "diário")} to={c.to} />
      ))}

      {/* BLOCO 2 — Treino + cardio */}
      <h2 className="text-muted text-xs uppercase tracking-wider pt-2">Treino + cardio</h2>
      {todayTemplate ? (
        <TodayCard
          title={todayTemplate.name}
          subtitle={`Treino + cardio · ${todayTemplate.durationMin} min + zona 2 · ${(sessionsToday ?? 0) > 0 ? "concluído ✓" : "ainda não feito"}`}
          note="Aquece curto → levanta peso → fecha com a zona 2 na MESMA esteira (cardio é finalizador, não aquecimento). Bater o cardio aqui já cumpre a caminhada do dia."
          to={`/treino/sessao/${todayTemplate.id}`}
          variant={(sessionsToday ?? 0) > 0 ? "default" : "highlight"}
        />
      ) : (
        <TodayCard title="Descanso" subtitle="Hoje não tem treino — se quiser, faça só a caminhada zona 2" />
      )}
      <TodayCard
        title="Caminhada / cardio zona 2"
        subtitle={`${dailyLog?.walkMin ?? 0} / ${walkGoalMin} min`}
        note="Esteira inclinada 8–12% · ~5 km/h · zona 2 (ofegante, mas ainda conversando)"
        rightSlot={
          <button type="button" onClick={() => void addWalk(10)} className="text-xs bg-wine text-nude-warm px-2 py-1 rounded-md">
            +10 min
          </button>
        }
      />

      {/* APOIO */}
      <h2 className="text-muted text-xs uppercase tracking-wider pt-2">Apoio</h2>
      <TodayCard
        title="Hidratação"
        subtitle={`${dailyLog?.waterMl ?? 0} ml de ${goalMl} ml`}
        rightSlot={
          <button type="button" onClick={() => void addWater(200)} className="text-xs bg-wine text-nude-warm px-2 py-1 rounded-md">
            +200ml
          </button>
        }
      />
      <TodayCard title="Refeições" subtitle={`${mealsDone}/4 do plano`} to="/refeicoes-hoje" />
      <TodayCard title="Diário" subtitle={dailyLog?.mood ? "humor registrado" : "como foi o dia?"} to="/trilha/diario" />

      {daysSinceMeasurement !== null && daysSinceMeasurement > 28 && (
        <TodayCard title="Hora de medir" subtitle={`Última medida há ${daysSinceMeasurement} dias`} to="/corpo/medidas" variant="highlight" />
      )}
      {daysSincePhoto !== null && daysSincePhoto > 14 && (
        <TodayCard title="Hora de tirar fotos" subtitle={`Última foto há ${daysSincePhoto} dias`} to="/corpo/fotos" variant="highlight" />
      )}

      {/* BLOCO 3 — Antes de dormir */}
      <h2 className="text-muted text-xs uppercase tracking-wider pt-2">Antes de dormir</h2>
      <TodayCard
        title="Skincare noite"
        subtitle={
          eveningRoutines && eveningRoutines.length > 0
            ? `${eveningRoutines.length} rotina${eveningRoutines.length > 1 ? "s" : ""} · ${eveningDone ? "concluído ✓" : "pendente"}`
            : "sem rotina configurada"
        }
        to="/beleza/pele-cabelo/skincare"
        variant={!eveningDone && eveningRoutines && eveningRoutines.length > 0 ? "highlight" : "default"}
      />
      {nightCare.map((c) => (
        <TodayCard key={c.id} title={c.label} subtitle={c.cadence ?? "diário"} to={c.to} />
      ))}
      <TodayCard
        title="Presença & intimidade"
        subtitle={`Sugestão de hoje: ${presencaSeq.label}`}
        note="Opcional, sem pressa. Postura, gingado, dança, mobilidade ou intimidade — pegue o que pedir o corpo."
        to={presencaSeq.to}
      />
      <TodayCard title="Ver tudo de movimento" subtitle="postura · dança · gingado · intimidade · voz" to="/treino/movimento" />
    </div>
  );
}
