import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../lib/db";
import { TodayCard } from "../components/TodayCard";
import { StreakCard } from "../components/StreakCard";
import { useSetting, useSettingCarregada } from "../hooks/useSetting";
import { NUCLEO_IDS } from "../lib/nucleo";
import { pelvicDoDia, rotuloPelvicoDoDia } from "../lib/pelvic-progression";
import { flexDoDia } from "../lib/flex-progression";
import { contarPraticasDaProgressao, contarPraticasFlex, contarPraticasPostura, contarPraticasRebolado, praticadaHoje } from "../lib/practice-log-helpers";
import { reboladoDoDia, SEQUENCIAS_REBOLADO } from "../lib/rebolado-progression";
import { PROGRESSAO_PELVICA } from "../lib/pelvic-progression";
import { SEQUENCIAS_FLEX } from "../lib/flex-progression";
import { TREINOS_POR_SEMANA } from "../lib/objetivo";
import { posturaDoDia, SEQUENCIAS_POSTURA } from "../lib/postura-progression";
import { rotuloFlexDoDia } from "../lib/sequence-label";
import { formatDateBR } from "../lib/format";
import { useCycleAdvice } from "../hooks/useCycleAdvice";
import { useResolvedGoal } from "../hooks/useResolvedGoal";
import { computeFocus, timeBlockFocus } from "../lib/today-priority";
import { waistGuard } from "../lib/silhouette";
import { buildDayRoutine, metaCaminhadaMin, type RoutineItem, type RoutineMealType } from "../lib/today-routine";
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
import { hojeISO, diaDoAno, somarDiasISO, horaMinuto } from "../lib/today-date";
import { horariosDasPausas } from "../lib/micro-pausas";
import { usePartida } from "../hooks/usePartida";
import { PartidaCard } from "../components/PartidaCard";
import { RitmoCard } from "../components/RitmoCard";
import { RevisaoDomingoCard } from "../components/RevisaoDomingoCard";
import { revisarSemana } from "../lib/revisao-semanal";
import { avaliarRitmo, ultimaMedidaValida } from "../lib/ritmo";
import { useAdesao } from "../hooks/useAdesao";
import { SemanaCard } from "../components/SemanaCard";
import { treinosNaSemana, variacaoDesdePartida } from "../lib/semana";
import { subtituloCreatina, CREATINA_ITEM_ID } from "../lib/creatina";
import { DEFAULTS, getSetting, setSetting } from "../lib/settings-helpers";
import { AvisoLembretes } from "../components/AvisoLembretes";
import { AvisoApkNovo } from "../components/AvisoApkNovo";
import { AvisoBackup } from "../components/AvisoBackup";
import {
  DESBLOQUEIOS, estaAberto, filtrarRotina, idsTrancados, proximoDesbloqueio, SEQ_ASSOALHO_1,
  sequenciasDoNivel1, tempoDoDesbloqueio, type Desbloqueados,
} from "../lib/desbloqueios";
import { ajustarNoite, rodizioDaSemana, RODIZIO_NOITE } from "../lib/noite";
import { contagemLiberada, ofertaDaVez, type Oferta, type Trilha } from "../lib/ofertas";
import { linhaDoTempo, textoDoRodizio } from "../lib/linha-do-tempo";
import { sequenciaDoCatalogo } from "../lib/sequence-label";
import { OfertaCard } from "../components/OfertaCard";
import { SequenciaModal } from "../components/SequenciaModal";
import type { SkincareRoutine } from "../lib/db";
import { estadoSequencia } from "../lib/sequencia";
import { linhaProximoDesbloqueio } from "../lib/placas-texto";
import { sugestaoDoMes } from "../lib/estilo-degraus";

/** Minutos da sequência no catálogo (0 se não existir). */
function duracaoSeq(id: string): number {
  return sequenciaDoCatalogo(id)?.durationMin ?? 0;
}

/** Minutos típicos do skincare completo da noite NO BLOCO DO APP: o roteiro do
 *  rosto, 1 min por passo. A espera do sérum (5 min) corre junto com o
 *  alongamento, que vem logo depois — não ocupa o teto. Os clareamentos do
 *  corpo são do banho (18h–20h, antes do jantar), também fora do teto. Sem os
 *  roteiros carregados: os 3 passos do rosto. */
function minutosSkincareNoiteCompleto(noite: readonly SkincareRoutine[] | undefined): number {
  return noite?.find((r) => r.target === "face")?.steps.length ?? 3;
}

/** Item da noite que cada oferta põe ou muda — é o que entra na conta do rodízio. */
const ITEM_NOITE_DO_DESBLOQUEIO: Partial<Record<string, string>> = {
  "voz-1": "voz", "voz-2": "voz", postura: "postura",
  "assoalho-1": "assoalho-pelvico", "assoalho-2": "assoalho-pelvico",
  "skincare-2": "skincare-noite", "skincare-3": "skincare-noite",
};
const ITEM_NOITE_DA_TRILHA: Partial<Record<Trilha, string>> = {
  flexNoite: "alongamento-noite", pelvica: "assoalho-pelvico", postura: "postura",
};

/** "/treino/movimento/<id>" -> id: esses itens abrem a sequência na frente. */
function sequenciaDoDestino(to: string | undefined): string | undefined {
  return to?.match(/^\/treino\/movimento\/([^/?#]+)$/)?.[1];
}

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
  // Primeira vez que ela marcou a creatina: é daqui que contam as 2 semanas
  // do aviso de água. Dia da primeira marcação, gravado uma vez no toque (antes varria a tabela
  // inteira de marcações a cada toque em qualquer caixinha do Hoje).
  const creatinaInicio = useSetting("creatinaInicio");

  // Quantas práticas DA PROGRESSÃO ela já concluiu — define em que fase ela
  // está (identificar o músculo -> soltura -> Kegel -> variações). Mesmo
  // helper que a Vitalidade usa: critério duplicado divergiria em silêncio e
  // as duas telas passariam a mostrar fases diferentes. As sequências
  // oferecidas pela página Vitalidade não entram nesta conta — elas treinam
  // outra coisa e não podem pular fases desta escada.
  const pelvicFeitas = useLiveQuery(() => contarPraticasDaProgressao(), []);
  // A fase só sobe quando ela aceita (spec 2026-11-19, seção 4): as trilhas
  // recebem a contagem cortada no fim da fase aceita; a oferta recebe a crua.
  // `fasesAceitasDesde`: a fase aceita começa do início dela, contando do aceite.
  const fasesAceitasCarregadas = useSettingCarregada("fasesAceitas");
  // "Estilo do mês": só aparece com tudo carregado e sugestão aberta (sem piscar).
  const estiloCompras = useSettingCarregada("estiloCompras");
  const estiloMes = useSettingCarregada("estiloMes");
  const estiloDegrau = useSettingCarregada("estiloDegrau");
  const estiloDoMes =
    estiloCompras !== undefined && estiloMes !== undefined && estiloDegrau !== undefined &&
    sugestaoDoMes({ hoje: todayISO, degrau: estiloDegrau, compras: estiloCompras, mesFechado: estiloMes }).estado === "sugestao";
  const fasesAceitasDesdeCarregadas = useSettingCarregada("fasesAceitasDesde");
  const fasesAceitas = fasesAceitasCarregadas ?? DEFAULTS.fasesAceitas;
  const fasesAceitasDesde = fasesAceitasDesdeCarregadas ?? DEFAULTS.fasesAceitasDesde;
  const pelvicHoje = pelvicDoDia(contagemLiberada("pelvica", pelvicFeitas ?? 0, fasesAceitas, fasesAceitasDesde));
  // Duração e lugar vêm da sequência do dia, não de texto fixo no item: a
  // rotina tem sequências de 3 a 7 min, e "dá pra fazer sentada" é falso na
  // identificação (deitada) e na integração com o quadril (em pé).
  // `today-routine.ts` é puro e não conhece o catálogo — quem aplica é esta
  // camada, a mesma que já reescreve o `to` deste item.
  const pelvicRotulo = rotuloPelvicoDoDia(pelvicHoje);

  // Os dois alongamentos (manhã e noite) têm progressão própria, uma trilha
  // cada — mesmo padrão do pélvico acima, com `contarPraticasFlex` no lugar
  // de `contarPraticasDaProgressao`. As contagens são independentes de
  // propósito: `contarPraticasFlex` só enxerga os ids da trilha pedida, então
  // praticar de manhã não pode empurrar a fase da noite.
  const praticasFlexManha = useLiveQuery(() => contarPraticasFlex("manha"), []);
  const praticasFlexNoite = useLiveQuery(() => contarPraticasFlex("noite"), []);
  const flexManhaLiberada = contagemLiberada("flexManha", praticasFlexManha ?? 0, fasesAceitas, fasesAceitasDesde);
  const flexManhaHoje = flexDoDia("manha", flexManhaLiberada);
  const flexNoiteHoje = flexDoDia("noite", contagemLiberada("flexNoite", praticasFlexNoite ?? 0, fasesAceitas, fasesAceitasDesde));
  const flexManhaRotulo = rotuloFlexDoDia("Alongamento manhã", flexManhaHoje);
  const flexNoiteRotulo = rotuloFlexDoDia("Alongamento noite", flexNoiteHoje);
  // Rebolado de sábado com a progressão de resistência (auditoria 2026-09-23:
  // a trilha existia e nenhuma tela a servia).
  const praticasRebolado = useLiveQuery(() => contarPraticasRebolado(), []);
  const reboladoHoje = reboladoDoDia(contagemLiberada("rebolado", praticasRebolado ?? 0, fasesAceitas, fasesAceitasDesde));
  // Postura (andar → 8 → gingado), com o gingado liberado pela contagem —
  // mesmo padrão dos alongamentos. Conta até ONTEM: a prática de hoje não
  // pode virar o item do dia depois de marcada.
  const praticasPostura = useLiveQuery(() => contarPraticasPostura(todayISO), [todayISO]);
  const posturaHoje = posturaDoDia(diaDoAno(today), contagemLiberada("postura", praticasPostura ?? 0, fasesAceitas, fasesAceitasDesde));
  const posturaRotulo = rotuloFlexDoDia("Postura", posturaHoje);
  // Práticas de hoje: concluir a sequência do dia marca o item sozinho.
  const praticasDeHoje = useLiveQuery(() => db.practiceLogs.where("date").equals(todayISO).toArray(), [todayISO]);

  const walkGoalMin = useSetting("walkGoalMin");
  const modoCaminhada = useSetting("modoCaminhada");

  // Alvo de micro-pausas derivado da mesma configuração que dispara os
  // lembretes — 7h→16h a cada 90 min = 6. Sem alvo, "3 hoje" não dizia se era
  // pouco ou muito; sem os HORÁRIOS, ela precisava lembrar sozinha de parar
  // seis vezes no meio do expediente, que é o que não acontece num dia de
  // trabalho (pedido dela, 2026-08-18).
  const pausaInicio = useSetting("activeBreakStartHour");
  const pausaFim = useSetting("activeBreakEndHour");
  const pausaIntervalo = useSetting("activeBreakIntervalMin");
  const horasDasPausas = horariosDasPausas(pausaInicio, pausaFim, pausaIntervalo);

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

  // Níveis de desbloqueio (spec 2026-11-09, seção 8): o trancado sai e o que
  // está no nível mínimo vem na versão mínima — antes de tudo o que lê a rotina.
  const desbloqueiosCarregados = useSettingCarregada("desbloqueios");
  const desbloqueios = desbloqueiosCarregados ?? DEFAULTS.desbloqueios;
  const rotinaDoDia = buildDayRoutine(dayOfWeek, diaDoAno(today), horasDasPausas, modoCaminhada);
  // Minutos reais do bloco do app à noite, pra o teto de 30 min (noite.ts):
  // sequência do dia de cada trilha, voz pela tabela de desbloqueios, skincare
  // 3 min no nível 2 e o roteiro do rosto no completo. Item trancado vale 0.
  const skincareNoiteCompleto = minutosSkincareNoiteCompleto(eveningRoutines);
  const minutosDaNoite = (ja: Desbloqueados) => (itemId: string): number => {
    switch (itemId) {
      case "skincare-noite":
        return !estaAberto(ja, "skincare-2") ? 0 : estaAberto(ja, "skincare-3") ? skincareNoiteCompleto : 3;
      case "alongamento-noite":
        return estaAberto(ja, "alongamento-noite") ? duracaoSeq(flexNoiteHoje.sequenceId) : 0;
      case "postura":
        return duracaoSeq(posturaHoje.sequenceId);
      case "assoalho-pelvico":
        return duracaoSeq(estaAberto(ja, "assoalho-2") ? pelvicHoje.sequenceId : SEQ_ASSOALHO_1);
      case "voz":
        return DESBLOQUEIOS.find((d) => d.id === (estaAberto(ja, "voz-2") ? "voz-2" : "voz-1"))!.minutos;
      default:
        return 0;
    }
  };
  // O bloco da noite é sequencial e cabe em 30 min: ajusta DEPOIS do filtro de
  // níveis (só o que está aberto entra na conta) e ANTES da linha do tempo.
  // Com os ajustes dela de /hoje/horarios: o item que ela moveu fica onde ela
  // pôs, e o resto do bloco segue a partir dele.
  const routineTimes = useSetting("routineTimes");
  const noiteDoDia = (ja: Desbloqueados) => ajustarNoite(filtrarRotina(rotinaDoDia, ja), minutosDaNoite(ja), routineTimes);
  const routine = noiteDoDia(desbloqueios);

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
    // O ciclo vem pelo card "Pronta pra próxima" (com o "Agora não" dela); o
    // destaque repetindo o mesmo aviso ignorava a recusa.
    cycleAdvice: null,
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
  // Qual pausa está aberta (índice), não um booleano: cada linha do dia serve
  // os movimentos da SUA pausa, num rodízio do catálogo. Com um booleano, as
  // seis abriam os mesmos três movimentos.
  const [pausaAberta, setPausaAberta] = useState<number | null>(null);
  const [sequenciaAberta, setSequenciaAberta] = useState<string | null>(null);

  const linkDone = (item: RoutineItem): boolean => {
    if (item.linkKey === "workout") return (sessionsToday ?? 0) > 0;
    if (item.linkKey === "skincareMorning") return !!morningDone;
    if (item.linkKey === "skincareNight") return !!eveningDone;
    return false;
  };

  // Assoalho, alongamentos, rebolado e postura: feitos também quando qualquer prática
  // da trilha foi concluída hoje (revisão da auditoria 2026-09-23).
  const trilhaDoItem: Partial<Record<string, readonly string[]>> = {
    pelvic: PROGRESSAO_PELVICA,
    flexManha: SEQUENCIAS_FLEX.manha,
    flexNoite: SEQUENCIAS_FLEX.noite,
    rebolado: SEQUENCIAS_REBOLADO,
    postura: SEQUENCIAS_POSTURA,
  };
  // Item no nível mínimo (sem linkKey): a sequência curta dele conta também.
  const praticadaNaTrilha = (item: RoutineItem): boolean => {
    const trilha = item.linkKey ? trilhaDoItem[item.linkKey] : sequenciasDoNivel1(item);
    return !!trilha && trilha.length > 0 && praticadaHoje(praticasDeHoje ?? [], trilha, todayISO);
  };
  const isDone = (item: RoutineItem): boolean =>
    item.control === "link" || item.control === "skincare"
      ? linkDone(item)
      : done.has(item.id) || praticadaNaTrilha(item);

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
    if (item.id === CREATINA_ITEM_ID && marcado && !creatinaInicio) {
      await setSetting("creatinaInicio", todayISO);
    }
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
      await registrarSono(todayISO, marcado ? horaMinuto(agora) : undefined);
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
    // As pausas não têm mais contador ao lado: cada uma virou uma linha com
    // caixinha e hora, então "3 de 6" seria repetir o que as próprias caixinhas
    // já mostram — e pior, sem dizer QUAIS faltam.
    return undefined;
  };

  const subtitleFor = (item: RoutineItem): string | undefined => {
    if (item.linkKey === "pelvic") return pelvicRotulo.subtitle;
    if (item.linkKey === "flexManha") return flexManhaRotulo.subtitle;
    if (item.linkKey === "flexNoite") return flexNoiteRotulo.subtitle;
    if (item.linkKey === "rebolado") return reboladoHoje.etapa;
    if (item.linkKey === "postura") return posturaRotulo.subtitle;
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
      return [`${dailyLog?.walkMin ?? 0} / ${metaCaminhadaMin(walkGoalMin, modoCaminhada)} min`, item.subtitle].filter(Boolean).join(" · ");
    }
    if (item.id === CREATINA_ITEM_ID) {
      return subtituloCreatina(item.subtitle ?? "", creatinaInicio || null, todayISO);
    }
    return item.subtitle;
  };

  // Rótulo e destino dos itens com progressão (pélvico, os dois
  // alongamentos e a postura): today-routine.ts guarda só o fallback honesto, quem sabe a
  // sequência do dia é esta camada — mesmo motivo do subtitleFor acima.
  const labelFor = (item: RoutineItem): string => {
    if (item.linkKey === "pelvic") return pelvicRotulo.label;
    if (item.linkKey === "flexManha") return flexManhaRotulo.label;
    if (item.linkKey === "flexNoite") return flexNoiteRotulo.label;
    if (item.linkKey === "postura") return posturaRotulo.label;
    return item.label;
  };

  const toFor = (item: RoutineItem): string | undefined => {
    // O item de treino leva direto pra sessão do dia (não pra aba Treino).
    if (item.linkKey === "workout" && todayTemplate) return `/treino/sessao/${todayTemplate.id}`;
    if (item.linkKey === "pelvic") return `/treino/movimento/${pelvicHoje.sequenceId}`;
    if (item.linkKey === "flexManha") return `/treino/movimento/${flexManhaHoje.sequenceId}`;
    if (item.linkKey === "flexNoite") return `/treino/movimento/${flexNoiteHoje.sequenceId}`;
    if (item.linkKey === "rebolado") return `/treino/movimento/${reboladoHoje.sequenceId}`;
    if (item.linkKey === "postura") return `/treino/movimento/${posturaHoje.sequenceId}`;
    return item.to;
  };

  const activeFocus = focus ?? timeBlockFocus(today.getHours(), dayOfWeek);
  const { projecao, invalida: partidaInvalida, carregando: partidaCarregando } = usePartida();
  const datasDeTreino = useLiveQuery(async () => (await db.workoutSessions.toArray()).map((x) => x.date), []);
  const treinosSemana = treinosNaSemana(datasDeTreino ?? [], todayISO);
  const sequenciaDesde = useSetting("sequenciaDesde");
  // Só com as datas carregadas: antes disso a sequência seria 0 e a linha
  // piscaria um "faltam" errado.
  const proximo = datasDeTreino
    ? proximoDesbloqueio(estadoSequencia(datasDeTreino, sequenciaDesde, todayISO).atual, desbloqueios)
    : null;
  // "Pronta pra próxima" (spec 2026-11-19, seção 4): um aviso por vez, e só
  // com tudo o que ele lê já carregado (sem piscar um aviso errado).
  // As configurações também: `useSetting` devolve o padrão enquanto lê, e o
  // padrão (nada aceito, nada recusado) piscava uma oferta já resolvida.
  const ofertasRecusadasCarregadas = useSettingCarregada("ofertasRecusadas");
  const ofertasRecusadas = ofertasRecusadasCarregadas ?? DEFAULTS.ofertasRecusadas;
  const carregadoPraOferta = !!datasDeTreino && pelvicFeitas !== undefined && praticasFlexManha !== undefined &&
    praticasFlexNoite !== undefined && praticasRebolado !== undefined && praticasPostura !== undefined &&
    fasesAceitasCarregadas !== undefined && fasesAceitasDesdeCarregadas !== undefined &&
    desbloqueiosCarregados !== undefined && ofertasRecusadasCarregadas !== undefined;
  // Disse "Agora não" hoje: nenhum outro aviso até amanhã (o próximo pode vir no dia seguinte).
  const recusouHoje = Object.values(ofertasRecusadas).includes(todayISO);
  const ofertaCrua: Oferta | null = carregadoPraOferta && !recusouHoje
    ? ofertaDaVez({
        hoje: todayISO,
        ciclo: advice,
        sequencia: estadoSequencia(datasDeTreino!, sequenciaDesde, todayISO).atual,
        ja: desbloqueios,
        recusadas: ofertasRecusadas,
        contagens: {
          flexManha: praticasFlexManha!, flexNoite: praticasFlexNoite!, pelvica: pelvicFeitas!,
          rebolado: praticasRebolado!, postura: praticasPostura!,
        },
        fasesAceitas,
        fasesAceitasDesde,
      })
    : null;
  // Horário e minutos do desbloqueio no dia dela (modo, ajustes, fase da manhã):
  // o horário sai da noite como fica DEPOIS de aceitar (sequencial e cortada).
  const oferta: Oferta | null = ofertaCrua?.tipo === "desbloqueio"
    ? {
        ...ofertaCrua,
        ...tempoDoDesbloqueio(
          DESBLOQUEIOS.find((d) => d.id === ofertaCrua.id)!, rotinaDoDia, routineTimes, flexManhaLiberada,
          noiteDoDia({ ...desbloqueios, [ofertaCrua.id]: todayISO }),
        ),
      }
    : ofertaCrua;
  // O que a parte nova faz com a noite: rodízio de antes × depois de aceitar.
  const rodizioDaOferta = ((): string | undefined => {
    if (!oferta || oferta.tipo === "ciclo") return undefined;
    const item = oferta.tipo === "desbloqueio" ? ITEM_NOITE_DO_DESBLOQUEIO[oferta.id] : ITEM_NOITE_DA_TRILHA[oferta.trilha];
    if (!item) return undefined;
    const jaDepois = oferta.tipo === "desbloqueio" ? { ...desbloqueios, [oferta.id]: todayISO } : desbloqueios;
    const abertos = (ja: Desbloqueados) => RODIZIO_NOITE.filter((id) => !idsTrancados(ja).has(id));
    const minAntes = minutosDaNoite(desbloqueios);
    const minBase = minutosDaNoite(jaDepois);
    const minDepois = oferta.tipo === "fase" ? (id: string) => (id === item ? oferta.minutos : minBase(id)) : minBase;
    return textoDoRodizio(
      rodizioDaSemana(abertos(desbloqueios), minAntes),
      rodizioDaSemana(abertos(jaDepois), minDepois),
      item,
    );
  })();

  async function aceitar(o: Oferta) {
    if (o.tipo === "desbloqueio") {
      const ja = await getSetting("desbloqueios");
      await setSetting("desbloqueios", { ...ja, [o.id]: todayISO });
    } else if (o.tipo === "fase") {
      const f = await getSetting("fasesAceitas");
      if ((f[o.trilha] ?? 1) >= o.fase) return;
      // A fase nova começa do início dela: grava a contagem crua de agora.
      const crua: Record<Trilha, number> = {
        flexManha: praticasFlexManha ?? 0, flexNoite: praticasFlexNoite ?? 0, pelvica: pelvicFeitas ?? 0,
        rebolado: praticasRebolado ?? 0, postura: praticasPostura ?? 0,
      };
      const desde = await getSetting("fasesAceitasDesde");
      await setSetting("fasesAceitasDesde", { ...desde, [o.trilha]: crua[o.trilha] });
      await setSetting("fasesAceitas", { ...f, [o.trilha]: o.fase });
    } else {
      // Mesmo que o "Ativar" da tela Ciclos, sem o confirm: o "Aceitar" já é ela confirmando.
      await setSetting("activeCycle", o.para);
      await setSetting("cycleStartSessionCount", await db.workoutSessions.count());
    }
  }

  async function agoraNao(o: Oferta) {
    const r = await getSetting("ofertasRecusadas");
    await setSetting("ofertasRecusadas", { ...r, [o.id]: todayISO });
  }

  const ultimaMedida = measurementsAsc?.at(-1);
  // 14 dias de adesão pro treinador: a mesma janela do lembrete de medir.
  const adesao14 = useAdesao(todayISO, 14, alvoSono);
  // Domingo fecha a semana de segunda a domingo: 7 dias terminando hoje.
  const adesao7 = useAdesao(todayISO, 7, alvoSono);
  const cinturas = (measurementsAsc ?? []).filter((m) => !!m.waistCm).map((m) => m.waistCm!);
  // Só avalia com a lista de medidas resolvida: com `?? []` o card piscava
  // "cedo" antes de a consulta voltar.
  const veredito = adesao14 && measurementsAsc ? avaliarRitmo(projecao, measurementsAsc, adesao14, modoCaminhada, todayISO) : null;
  // A janela de 14 dias conta da última medida com peso E cintura — a mesma que
  // o veredito usa; uma medida só de peso não renova o card.
  const medidaDoRitmo = measurementsAsc ? ultimaMedidaValida(measurementsAsc) : null;
  // O card aparece por 14 dias depois de cada medida — é quando o número é
  // novo — e sempre enquanto ainda é cedo pra comparar.
  const mostrarRitmo =
    !!veredito &&
    (veredito.estado === "cedo" ||
      (veredito.estado !== "sem-partida" && !!medidaDoRitmo && todayISO <= somarDiasISO(medidaDoRitmo.date, 14)));
  const variacaoSemana =
    projecao && ultimaMedida && ultimaMedida.date > projecao.partida.data
      ? variacaoDesdePartida(projecao.partida, ultimaMedida)
      : null;

  // Linha do tempo (spec 2026-11-19): uma lista só, na ordem das horas. O
  // núcleo (pedido dela em 2026-11-03, ver src/lib/nucleo.ts) continua sendo o
  // que conta pro prazo — aparece no horário dele, com a contagem em cima.
  const { diaInteiro, horas, semana } = linhaDoTempo(routine, routineTimes);
  const nucleo = [...diaInteiro, ...horas, ...semana].filter((i) => NUCLEO_IDS.has(i.id));
  const nucleoFeitos = nucleo.filter(isDone).length;
  const linha = (item: RoutineItem) => {
    const to = toFor(item);
    const sequenciaId = sequenciaDoDestino(to);
    return (
      <li key={item.id} data-item={item.id} className={NUCLEO_IDS.has(item.id) ? "border-l-2 border-verm/60 pl-2" : undefined}>
        <RoutineRow
          item={{
            ...item,
            subtitle: subtitleFor(item),
            label: labelFor(item),
            to,
          }}
          hora={horaDe(item)}
          done={isDone(item)}
          onToggle={() => void handleToggle(item)}
          rightSlot={rightSlotFor(item)}
          navValue={item.control === "link" ? (isDone(item) ? "feito ✓" : "ver →") : undefined}
          sequenciaId={sequenciaId}
          onOpen={
            item.control === "recipe" && item.mealType
              ? () => setRecipeMealType(item.mealType!)
              : item.control === "skincare" && item.skincareTime
                ? () => setSkincareTime(item.skincareTime!)
                : item.control === "breaks"
                  ? () => setPausaAberta(item.breakIndex ?? 0)
                  : sequenciaId
                    ? () => setSequenciaAberta(sequenciaId)
                    : undefined
          }
        />
      </li>
    );
  };

  return (
    <div className="p-4 pb-24 space-y-3">
      <AvisoLembretes />
      <AvisoApkNovo />
      <AvisoBackup />
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted text-xs uppercase tracking-wider">Hoje · {formatDateBR(today)}</p>
          <h1 className="font-serif text-2xl text-nude">{today.getHours() < 12 ? "Bom dia" : today.getHours() < 18 ? "Boa tarde" : "Boa noite"}</h1>
        </div>
        <Link to="/configuracoes" className="text-muted text-xs underline">configurações</Link>
      </div>

      {oferta && (
        <OfertaCard
          oferta={oferta}
          rodizio={rodizioDaOferta}
          onAceitar={() => void aceitar(oferta)}
          onAgoraNao={() => void agoraNao(oferta)}
        />
      )}

      <TodayCard title={`✦ ${activeFocus.title}`} subtitle={activeFocus.subtitle} to={activeFocus.to} variant="highlight" />

      {/* Enquanto a medida chega do aparelho, um bloco do mesmo tamanho pulsa no
          lugar — sem ele o card surgia depois e empurrava a tela inteira. */}
      {partidaCarregando ? <div className="esqueleto h-28" aria-hidden="true" /> : <PartidaCard projecao={projecao} invalida={partidaInvalida} />}
      {mostrarRitmo && veredito && <RitmoCard veredito={veredito} />}
      {dayOfWeek === 0 && adesao7 && (
        <RevisaoDomingoCard
          revisao={revisarSemana({ ...adesao7, cinturaUltima: cinturas.at(-1), cinturaAnterior: cinturas.at(-2) }, modoCaminhada, idsTrancados(desbloqueios))}
        />
      )}
      {/* Uma caixa só: a semana em cima e as contagens dos últimos 7 dias
          embaixo, lado a lado. Eram cinco cards empilhados e a primeira
          tarefa do dia só aparecia depois de uma tela inteira de rolagem. */}
      <SemanaCard treinos={treinosSemana} variacao={variacaoSemana}>
        <StreakCard compacto label="Treino" count={Math.min(last7DaysTraining ?? 0, TREINOS_POR_SEMANA)} total={TREINOS_POR_SEMANA} />
        <StreakCard compacto label="Skincare" count={last7DaysSkincare ?? 0} total={7} />
        <StreakCard compacto label="Sono" count={last7DaysSleep} total={7} />
        {/* Rótulo é só "Vitalidade" — o nome do módulo, nunca o que ele
            conta. Ela escolheu o streak visível nesta tela, que fica aberta
            em ambiente não receptivo; a mitigação combinada é exatamente
            este rótulo neutro, não um esconderijo atrás do atalho. Sem
            `total`: os outros três são "de 7 dias", este não tem teto — "19
            / 7" seria absurdo. */}
        <StreakCard compacto label="Vitalidade" count={streakVitalidade.atual} />
      </SemanaCard>

      <div className="flex justify-end pt-2">
        <Link to="/hoje/horarios" className="text-xs text-muted underline decoration-dotted">
          Ajustar horários
        </Link>
      </div>

      <div className="px-1 flex items-baseline justify-between gap-2">
        <p className="text-muted text-xs">
          O que decide o seu prazo <span className="opacity-80">· marcado com a linha vermelha</span>
        </p>
        <span className="text-nude-warm text-sm tabular-nums">{nucleoFeitos} de {nucleo.length}</span>
      </div>

      {diaInteiro.length > 0 && (
        <section className="space-y-2" aria-labelledby="dia-todo-titulo">
          <h2 id="dia-todo-titulo" className="text-muted text-xs uppercase tracking-wider pt-1">O dia todo</h2>
          <ul className="space-y-2">{diaInteiro.map(linha)}</ul>
        </section>
      )}

      <ol aria-label="Linha do tempo" className="space-y-2">
        {horas.map(linha)}
      </ol>

      {(semana.length > 0 || estiloDoMes) && (
        <section className="space-y-2" aria-labelledby="semana-titulo">
          <h2 id="semana-titulo" className="text-muted text-xs uppercase tracking-wider pt-3">Esta semana</h2>
          <ul className="space-y-2">
            {semana.map(linha)}
            {estiloDoMes && (
              <li>
                <Link to="/estilo" aria-label="Estilo do mês" className="rounded-card border border-vital/30 bg-vital/10 p-4 flex items-start gap-3">
                  <span className="flex-1 min-w-0 text-sm font-medium text-nude-warm">Estilo do mês</span>
                  <span className="flex-none self-center text-xs text-nude">ver →</span>
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}

      {/* Só como informação do que ainda está longe: o que já está pronto
          vem pelo card "Pronta pra próxima" (ou foi recusado por ela). */}
      {proximo && proximo.faltam > 0 && !oferta && (
        <p className="text-muted text-sm pt-2">
          {linhaProximoDesbloqueio(proximo.d.titulo, proximo.faltam)}
        </p>
      )}

      <ShortcutsGrid />

      {recipeMealType && <RecipeModal mealType={recipeMealType} onClose={() => setRecipeMealType(null)} />}
      {skincareTime && <SkincareRoutineModal time={skincareTime} onClose={() => setSkincareTime(null)} />}
      {sequenciaAberta && <SequenciaModal sequenceId={sequenciaAberta} onClose={() => setSequenciaAberta(null)} />}
      {pausaAberta !== null && (
        <MicroPausaModal
          n={pausaAberta}
          diaDoAno={diaDoAno(today)}
          mostrarSentar={Object.prototype.hasOwnProperty.call(desbloqueios, "sentar")}
          onClose={() => setPausaAberta(null)}
          onFeito={() => void addBreak()}
        />
      )}
    </div>
  );
}
