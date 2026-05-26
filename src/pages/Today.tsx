import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../lib/db";
import { TodayCard } from "../components/TodayCard";
import { useSetting } from "../hooks/useSetting";
import { formatDateBR } from "../lib/format";

export function Today() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayISO = today.toISOString().slice(0, 10);

  const todayTemplate = useLiveQuery(
    async () => db.workoutTemplates.where("dayOfWeek").equals(dayOfWeek).first(),
    [dayOfWeek],
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
