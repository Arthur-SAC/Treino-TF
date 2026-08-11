import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { StreakCard } from "../../components/StreakCard";
import { GuideAccordion } from "../../components/GuideAccordion";
import { VITALIDADE_GUIA } from "../../data/vitalidade-guide-seed";
import { calcularStreak } from "../../lib/vitalidade";
import { diasComGasto, inicioDoAcompanhamento, noitesNoAlvo, registrarGastoAutomatico } from "../../lib/daily-log-helpers";
import { pelvicDoDia } from "../../lib/pelvic-progression";
import { contarPraticasPelvicas } from "../../lib/practice-log-helpers";
import { hojeISO } from "../../lib/today-date";
import { useSetting } from "../../hooks/useSetting";

export function Vitalidade() {
  const todayISO = hojeISO(new Date());

  const inicio = useLiveQuery(() => inicioDoAcompanhamento(), []);
  const marcados = useLiveQuery(() => diasComGasto(), []);
  const dailyLog = useLiveQuery(() => db.dailyLog.get(todayISO), [todayISO]);
  const goalMl = useSetting("hydrationGoalMl");

  // Última cintura medida — mesma tabela que Silhueta e o card de foco do
  // Hoje leem. É o dado que ancora a seção "sono e gordura abdominal": texto
  // solto sobre barriga vale menos que a medida real dela.
  const medidaRecente = useLiveQuery(
    () => db.measurements.orderBy("date").reverse().limit(1).toArray(),
    [],
  );
  const cinturaRecente = medidaRecente?.[0]?.waistCm;

  // Streak de sono dos últimos 7 dias contra o alvo fixo de 22:30 declarado
  // pela rotina — mesma conta que a tela Hoje faz com `noitesNoAlvo`. Não
  // duplica o alvo dinâmico de horários daqui: aqui é só o painel de
  // vitalidade citando o mesmo critério, não a rotina do dia.
  const streakSono = useLiveQuery(async () => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(hojeISO(d));
    }
    const logs = await db.dailyLog.where("date").anyOf(dates).toArray();
    return noitesNoAlvo(logs, "22:30");
  }, []);

  // Quantas práticas de assoalho pélvico ela já concluiu — mesmo helper que o
  // Hoje usa pra decidir a fase (identificar o músculo -> soltura -> Kegel ->
  // variações). Extraído pra `practice-log-helpers.ts` porque as duas telas
  // precisam do mesmo critério — duplicado, ele diverge em silêncio.
  const pelvicFeitas = useLiveQuery(() => contarPraticasPelvicas(), []);
  const pelvicHoje = pelvicDoDia(pelvicFeitas ?? 0);

  // `inicio` fica `undefined` enquanto a consulta carrega e `null` quando o
  // banco não tem nenhum registro diário ainda (Dexie vazio). Nos dois casos,
  // caindo em `todayISO` o streak nasce em "hoje é o primeiro dia" — 1 dia
  // limpo — em vez de quebrar a conta com uma data inexistente ou mostrar NaN.
  const streak = calcularStreak(marcados ?? [], todayISO, inicio ?? todayISO);
  const marcadoHoje = dailyLog?.gastoAutomatico ?? false;

  async function toggleHoje() {
    await registrarGastoAutomatico(todayISO, !marcadoHoje);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/" className="text-muted text-sm">&larr; Hoje</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Vitalidade</h1>
      </div>

      <div className="card my-3 !bg-wine/20 !border-wine-light">
        <p className="text-sm text-nude-warm">
          Alvo: 2 a 3 vezes por semana, com pelo menos uma sendo start-stop, sem tela.
          Não é abstinência — um streak sem alvo declarado vira corrida pro zero, e
          isso trabalha contra a fisiologia (intervalo demais também não ajuda ereção
          nem controle).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 my-3">
        <StreakCard label="Atual" count={streak.atual} unit="dias limpos" />
        <StreakCard label="Recorde" count={streak.recorde} unit="dias" />
      </div>

      <div className="card my-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={marcadoHoje}
          aria-label="marcar hoje como gasto automático"
          onClick={toggleHoje}
          className="text-sm text-nude-warm font-medium"
        >
          {marcadoHoje ? "Hoje teve gasto automático ✓" : "Marcar hoje como gasto automático"}
        </button>
        <p className="text-muted text-xs mt-2">
          Pornografia e masturbação no automático quebram o streak. Sessão de
          start-stop não quebra — ela é o tratamento, não a recaída.
        </p>
      </div>

      <div className="card my-3">
        <h2 className="text-nude font-medium mb-1">Assoalho pélvico</h2>
        <p className="text-sm text-nude-warm">{pelvicHoje.etapa}</p>
        <p className="text-muted text-xs mt-1">{pelvicFeitas ?? 0} sequências concluídas até agora</p>
        <Link to={`/treino/movimento/${pelvicHoje.sequenceId}`} className="text-xs text-nude mt-2 inline-block">
          Ver sequência de hoje →
        </Link>
      </div>

      <div className="card my-3">
        <h2 className="text-nude font-medium mb-1">Firmeza, controle e volume</h2>
        <p className="text-sm text-nude-warm">
          Quase toda alavanca de volume já está no seu plano — a maior delas é o
          streak acima. O que muda o resultado são os números abaixo, não um
          suplemento novo.
        </p>
        <ul className="text-xs text-muted mt-2 space-y-1">
          <li>Água hoje: {dailyLog?.waterMl ?? 0} ml de {goalMl} ml</li>
          <li>Sono no alvo (22:30): {streakSono ?? 0} de 7 noites</li>
          <li>
            Cintura na última medição: {cinturaRecente !== undefined ? `${cinturaRecente} cm` : "ainda sem medida registrada"}
          </li>
          <li>Assoalho pélvico: {pelvicFeitas ?? 0} sequências concluídas</li>
        </ul>
      </div>

      <GuideAccordion sections={VITALIDADE_GUIA} />
    </div>
  );
}
