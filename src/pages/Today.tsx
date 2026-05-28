import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../lib/db";
import { TodayCard } from "../components/TodayCard";
import { StreakCard } from "../components/StreakCard";
import { useSetting } from "../hooks/useSetting";
import { formatDateBR } from "../lib/format";
import { CYCLES } from "../data/cycles-seed";

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
  const cycleStart = useSetting("cycleStartSessionCount");
  const totalSessions = useLiveQuery(() => db.workoutSessions.count(), []);
  const sessionsInCycle = (totalSessions ?? 0) - cycleStart;
  const currentCycleInfo = CYCLES.find((c) => c.id === activeCycle);
  const shouldSuggestChange = !!currentCycleInfo && sessionsInCycle >= currentCycleInfo.threshold;
  const dailyLog = useLiveQuery(async () => db.dailyLog.get(todayISO), [todayISO]);
  const mealsToday = useLiveQuery(() => db.meals.where("date").equals(todayISO).toArray(), [todayISO]);
  const mealsDone = mealsToday?.filter((m) => m.checked).length ?? 0;

  const sequences = useLiveQuery(() => db.danceSequences.toArray(), []);
  const practiceToday = useLiveQuery(
    () => db.practiceLogs.where("date").equals(todayISO).count(),
    [todayISO],
  );

  const suggestedSeq = (() => {
    if (!sequences || sequences.length === 0) return null;
    if (dayOfWeek === 1) return sequences.find((s) => s.id === "danca-semana-1");
    if (dayOfWeek === 3) return sequences.find((s) => s.id === "danca-semana-2");
    if (dayOfWeek === 5) return sequences.find((s) => s.id === "danca-semana-3");
    if (dayOfWeek === 2 || dayOfWeek === 4) return sequences.find((s) => s.id === "mobilidade-pelvica-matinal");
    if (dayOfWeek === 6) return sequences.find((s) => s.id === "alongamento-pelvico-profundo");
    if (dayOfWeek === 0) return sequences.find((s) => s.id === "pelvic-kegel-classico"); // domingo livre → pelvic
    return null;
  })();

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

  async function addWater(ml: number) {
    const log = await db.dailyLog.get(todayISO);
    if (log) {
      await db.dailyLog.update(todayISO, { waterMl: log.waterMl + ml });
    } else {
      await db.dailyLog.put({ date: todayISO, waterMl: ml, activeBreakCount: 0 });
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

      <div className="grid grid-cols-3 gap-2 mb-3">
        <StreakCard label="Treino" count={last7DaysTraining ?? 0} total={7} />
        <StreakCard label="Skincare" count={last7DaysSkincare ?? 0} total={7} />
        <StreakCard label="Pausas" count={dailyLog?.activeBreakCount ?? 0} unit="hoje" />
      </div>

      {shouldSuggestChange && (
        <TodayCard
          title="Hora de avançar o treino"
          subtitle={`Você completou ${sessionsInCycle} sessões do ciclo "${currentCycleInfo?.name}". Veja o próximo ciclo.`}
          to="/treino/ciclos"
          variant="highlight"
        />
      )}

      {todayTemplate ? (
        <TodayCard
          title={todayTemplate.name}
          subtitle={`Treino · ${todayTemplate.durationMin} min · ${(sessionsToday ?? 0) > 0 ? "concluído ✓" : "ainda não feito"}`}
          to={`/treino/sessao/${todayTemplate.id}`}
          variant={(sessionsToday ?? 0) > 0 ? "default" : "highlight"}
        />
      ) : (
        <TodayCard title="Descanso" subtitle="Hoje não tem treino programado" />
      )}

      <TodayCard
        title="Hidratação"
        subtitle={`${dailyLog?.waterMl ?? 0} ml de ${goalMl} ml`}
        rightSlot={
          <button
            type="button"
            onClick={() => void addWater(200)}
            className="text-xs bg-wine text-nude-warm px-2 py-1 rounded-md"
          >
            +200ml
          </button>
        }
      />

      <TodayCard
        title="Refeições"
        subtitle={`${mealsDone}/4 do plano`}
        to="/refeicoes-hoje"
        variant={mealsDone < 4 ? "highlight" : "default"}
      />
      <TodayCard
        title="Diário"
        subtitle={dailyLog?.mood ? `humor registrado` : "como foi o dia?"}
        to="/trilha/diario"
      />

      {suggestedSeq && (
        <TodayCard
          title="Movimento"
          subtitle={`${suggestedSeq.name} · ${suggestedSeq.durationMin} min · ${(practiceToday ?? 0) > 0 ? "feito ✓" : "pendente"}`}
          to={`/treino/movimento/${suggestedSeq.id}`}
          variant={(practiceToday ?? 0) === 0 ? "highlight" : "default"}
        />
      )}

      {daysSinceMeasurement !== null && daysSinceMeasurement > 28 && (
        <TodayCard
          title="Hora de medir"
          subtitle={`Última medida há ${daysSinceMeasurement} dias`}
          to="/corpo/medidas"
          variant="highlight"
        />
      )}
      {daysSincePhoto !== null && daysSincePhoto > 14 && (
        <TodayCard
          title="Hora de tirar fotos"
          subtitle={`Última foto há ${daysSincePhoto} dias`}
          to="/corpo/fotos"
          variant="highlight"
        />
      )}

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
    </div>
  );
}
