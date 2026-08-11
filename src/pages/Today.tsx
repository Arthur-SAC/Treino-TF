import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../lib/db";
import { TodayCard } from "../components/TodayCard";
import { StreakCard } from "../components/StreakCard";
import { useSetting } from "../hooks/useSetting";
import { pelvicDoDia } from "../lib/pelvic-progression";
import { contarPraticasPelvicas } from "../lib/practice-log-helpers";
import { formatDateBR } from "../lib/format";
import { useCycleAdvice } from "../hooks/useCycleAdvice";
import { useResolvedGoal } from "../hooks/useResolvedGoal";
import { computeFocus, timeBlockFocus } from "../lib/today-priority";
import { waistGuard } from "../lib/silhouette";
import { buildDayRoutine, type RoutineItem, type RoutineMealType } from "../lib/today-routine";
import { resolveRoutineTime, resolverAlvoSono, formatHora } from "../lib/routine-times";
import { useRoutineChecks } from "../hooks/useRoutineChecks";
import {
  addWater,
  addWalk,
  creditarPasseio,
  registrarSono,
} from "../lib/daily-log-helpers";
import { useStreakSono } from "../hooks/useStreakSono";
import { useStreakVitalidade } from "../hooks/useStreakVitalidade";
import { RoutineRow } from "../components/RoutineRow";
import { RecipeModal } from "../components/RecipeModal";
import { SkincareRoutineModal } from "../components/SkincareRoutineModal";
import { MicroPausaModal } from "../components/MicroPausaModal";
import { ShortcutsGrid } from "../components/ShortcutsGrid";
import { hojeISO, diaDoAno } from "../lib/today-date";
import { metaDePausas } from "../lib/micro-pausas";

export function Today() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayISO = hojeISO(today);

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

  // Quantas práticas de assoalho pélvico ela já concluiu — define em que fase
  // da progressão ela está (identificar o músculo -> Kegel -> variações).
  // Mesmo helper que a Vitalidade usa: critério duplicado divergiria em
  // silêncio e as duas telas passariam a mostrar fases diferentes.
  const pelvicFeitas = useLiveQuery(() => contarPraticasPelvicas(), []);
  const pelvicHoje = pelvicDoDia(pelvicFeitas ?? 0);

  const walkGoalMin = useSetting("walkGoalMin");

  // Alvo de micro-pausas derivado da mesma configuração que dispara os
  // lembretes — 9h→18h a cada 90 min = 6. Sem alvo, "3 hoje" não dizia se era
  // pouco ou muito.
  const pausaInicio = useSetting("activeBreakStartHour");
  const pausaFim = useSetting("activeBreakEndHour");
  const pausaIntervalo = useSetting("activeBreakIntervalMin");
  const metaPausas = metaDePausas(pausaInicio, pausaFim, pausaIntervalo);

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
      dates.push(hojeISO(d));
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
      dates.push(hojeISO(d));
    }
    const sessions = await db.workoutSessions.where("date").anyOf(dates).toArray();
    const uniqueDates = new Set(sessions.map((s) => s.date));
    return uniqueDates.size;
  }, []);

  const routine = buildDayRoutine(dayOfWeek, diaDoAno(today));
  const routineTimes = useSetting("routineTimes");

  // Alvo do sono = o horário do próprio item "Dormir", com o ajuste que ela
  // fez em /hoje/horarios. Era uma constante "22:30" aqui: se ela mudasse o
  // item pra 23h, a linha mostrava 23h, o subtítulo continuava dizendo "alvo
  // 22:30" e o streak media contra 22:30 — três respostas pra mesma pergunta.
  // `resolverAlvoSono` mora em routine-times.ts porque a Vitalidade também
  // precisa deste número (streak de sono do painel de volume) — cálculo
  // duplicado nas duas telas é exatamente o mesmo bug, agora entre telas.
  const alvoSono = resolverAlvoSono(routine.blocks, routineTimes);

  // Conta noites dos últimos 7 dias em que ela deitou até o alvo — sono é a
  // alavanca que ela mais subestima, e o card só existe pra tornar a melhora
  // (ou piora) visível semana a semana. A janela e a consulta moram no hook
  // porque a Vitalidade mostra este mesmo número (ver useStreakSono).
  const last7DaysSleep = useStreakSono(alvoSono, todayISO);

  // Streak de Vitalidade — mesmo hook que a página Vitalidade usa, pra não
  // abrir uma segunda fonte de verdade pro mesmo número.
  const streakVitalidade = useStreakVitalidade(todayISO);

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
  const resolvedGoal = useResolvedGoal();
  const measurementsAsc = useLiveQuery(() => db.measurements.orderBy("date").toArray(), []);
  const latestM = measurementsAsc?.at(-1);
  const prevM = measurementsAsc?.at(-2);
  const guardTriggered = !!(latestM?.waistCm && prevM?.waistCm) &&
    waistGuard({
      cycleGoal: resolvedGoal,
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

  async function addBreak() {
    const log = await db.dailyLog.get(todayISO);
    if (log) {
      await db.dailyLog.update(todayISO, { activeBreakCount: log.activeBreakCount + 1 });
    } else {
      await db.dailyLog.put({ date: todayISO, waterMl: 0, activeBreakCount: 1 });
    }
  }

  const horaDe = (item: RoutineItem) => {
    const hhmm = resolveRoutineTime(item, routineTimes);
    return hhmm ? formatHora(hhmm) : undefined;
  };
  const { done, toggle } = useRoutineChecks(todayISO);
  const [recipeMealType, setRecipeMealType] = useState<RoutineMealType | null>(null);
  const [skincareTime, setSkincareTime] = useState<"morning" | "evening" | null>(null);
  const [pausaAberta, setPausaAberta] = useState(false);

  const linkDone = (item: RoutineItem): boolean => {
    if (item.linkKey === "workout") return (sessionsToday ?? 0) > 0;
    if (item.linkKey === "skincareMorning") return !!morningDone;
    if (item.linkKey === "skincareNight") return !!eveningDone;
    return false;
  };

  const isDone = (item: RoutineItem): boolean =>
    item.control === "link" || item.control === "skincare" ? linkDone(item) : done.has(item.id);

  // Passear com os cães credita (ou devolve, se desmarcado) 1h de movimento;
  // marcar "Dormir" registra a hora real do relógio como hora de deitar, e
  // desmarcar apaga esse registro. Os demais itens só viram o check comum —
  // por isso o switch é local aqui e não em useRoutineChecks (que não sabe
  // nada de dailyLog).
  //
  // O estado novo vem do RETORNO de `toggle`, não do Set `done`: o Set é o do
  // render anterior, então dois toques rápidos liam o mesmo valor e somavam
  // 60 + 60 = 120 min com a caixinha desmarcada, sem caminho de volta ao zero.
  async function handleToggle(item: RoutineItem) {
    const marcado = await toggle(item.id);
    if (item.control === "walk") {
      // O passeio dos cães tem ids diferentes por tipo de dia (`caes` na
      // semana, `caes-fds` no fim de semana — ver today-routine.ts). Em dia
      // de semana existe ainda um SEGUNDO item control:"walk"
      // (`caminhada-trabalho`, os 5 km do trabalho para casa) — duas
      // caminhadas reais e distintas, cada uma creditando os seus 60 min. É
      // exatamente por isso que checar o control em vez do id está certo
      // desde o início: cobre qualquer quantidade de itens de caminhada do
      // dia sem duplicar lógica por id.
      await creditarPasseio(todayISO, marcado);
    } else if (item.id === "dormir") {
      const agora = new Date();
      const hhmm = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
      await registrarSono(todayISO, marcado ? hhmm : undefined);
    }
  }

  const rightSlotFor = (item: RoutineItem) => {
    if (item.control === "water") {
      return (
        <button type="button" onClick={() => void addWater(todayISO, 200)} className="text-xs bg-wine text-nude-warm px-2 py-1 rounded-md">+200 ml</button>
      );
    }
    if (item.control === "walk") {
      return (
        <button type="button" onClick={() => void addWalk(todayISO, 10)} className="text-xs bg-wine text-nude-warm px-2 py-1 rounded-md">+10 min</button>
      );
    }
    if (item.control === "breaks") {
      return <span className="text-[11px] text-nude">{dailyLog?.activeBreakCount ?? 0} de {metaPausas}</span>;
    }
    return undefined;
  };

  const subtitleFor = (item: RoutineItem): string | undefined => {
    if (item.linkKey === "pelvic") return `${item.subtitle} · ${pelvicHoje.etapa}`;
    if (item.id === "agua") return `${dailyLog?.waterMl ?? 0} ml de ${goalMl} ml`;
    if (item.id === "dormir") {
      const alvo = `alvo ${alvoSono}`;
      return dailyLog?.sleepAt
        ? `Você deitou às ${dailyLog.sleepAt} · ${alvo}`
        : [alvo, item.subtitle].filter(Boolean).join(" · ");
    }
    // Todo item que soma movimento (cães, caminhadas) abre com o total do dia
    // contra a meta — uma meta que não aparece na tela não existe.
    if (item.control === "walk") {
      return [`${dailyLog?.walkMin ?? 0} / ${walkGoalMin} min`, item.subtitle].filter(Boolean).join(" · ");
    }
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

      {/* grid-cols-2 (duas linhas), não grid-cols-4: cada StreakCard é um
          `.card` com padding e borda próprios — em 4 colunas numa tela
          estreita "Skincare" e "Vitalidade" espremem contra a borda do
          próprio card. Em 2 colunas cada rótulo cabe numa linha só. */}
      <div className="grid grid-cols-2 gap-2">
        <StreakCard label="Treino" count={last7DaysTraining ?? 0} total={7} />
        <StreakCard label="Skincare" count={last7DaysSkincare ?? 0} total={7} />
        <StreakCard label="Sono" count={last7DaysSleep} total={7} />
        {/* Rótulo é só "Vitalidade" — o nome do módulo, nunca o que ele
            conta. Ela escolheu o streak visível nesta tela, que fica aberta
            em ambiente não receptivo; a mitigação combinada é exatamente
            este rótulo neutro, não um esconderijo atrás do atalho. Sem
            `total`: os outros três são "de 7 dias", este não tem teto — "19
            / 7" seria absurdo. */}
        <StreakCard label="Vitalidade" count={streakVitalidade.atual} />
      </div>

      <div className="flex justify-end pt-2">
        <Link to="/hoje/horarios" className="text-xs text-muted underline decoration-dotted">
          Ajustar horários
        </Link>
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
              item={{
                ...item,
                subtitle: subtitleFor(item),
                // O item de treino leva direto pra sessão do dia (não pra aba Treino)
                to:
                  item.linkKey === "workout" && todayTemplate
                    ? `/treino/sessao/${todayTemplate.id}`
                    : item.linkKey === "pelvic"
                      ? `/treino/movimento/${pelvicHoje.sequenceId}`
                      : item.to,
              }}
              hora={horaDe(item)}
              done={isDone(item)}
              onToggle={() => void handleToggle(item)}
              rightSlot={rightSlotFor(item)}
              navValue={item.control === "link" ? (isDone(item) ? "feito ✓" : "ver →") : undefined}
              onOpen={
                item.control === "recipe" && item.mealType
                  ? () => setRecipeMealType(item.mealType!)
                  : item.control === "skincare" && item.skincareTime
                    ? () => setSkincareTime(item.skincareTime!)
                    : item.control === "breaks"
                      ? () => setPausaAberta(true)
                      : undefined
              }
            />
          ))}
        </section>
      ))}

      <ShortcutsGrid />

      {recipeMealType && <RecipeModal mealType={recipeMealType} onClose={() => setRecipeMealType(null)} />}
      {skincareTime && <SkincareRoutineModal time={skincareTime} onClose={() => setSkincareTime(null)} />}
      {pausaAberta && (
        <MicroPausaModal
          n={dailyLog?.activeBreakCount ?? 0}
          onClose={() => setPausaAberta(false)}
          onFeito={() => void addBreak()}
        />
      )}
    </div>
  );
}
