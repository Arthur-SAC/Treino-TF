import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { StreakCard } from "../../components/StreakCard";
import { GuideAccordion } from "../../components/GuideAccordion";
import { VITALIDADE_GUIA } from "../../data/vitalidade-guide-seed";
import { registrarGastoAutomatico } from "../../lib/daily-log-helpers";
import { garantirInicioDoAcompanhamento } from "../../lib/vitalidade-adesao";
import { useStreakSono } from "../../hooks/useStreakSono";
import { useStreakVitalidade } from "../../hooks/useStreakVitalidade";
import { pelvicDoDia, ofertasDaVitalidade, SEQUENCIA_DE_SOLTURA } from "../../lib/pelvic-progression";
import {
  contarPraticasDaProgressao,
  contarPraticasDaSequencia,
  contarPraticasRecentes,
} from "../../lib/practice-log-helpers";
import { hojeISO, diaDoAno } from "../../lib/today-date";
import { buildDayRoutine } from "../../lib/today-routine";
import { resolverAlvoSono } from "../../lib/routine-times";
import { useSetting } from "../../hooks/useSetting";

/** Primeira frase do `focus`, pra a lista dar o que a sequência é sem virar
 *  parágrafo. O `focus` de intimidade é longo de propósito — a explicação
 *  completa mora na sequência, não no índice. */
function primeiraFrase(texto: string): string {
  const corte = texto.indexOf(". ");
  return corte === -1 ? texto : texto.slice(0, corte + 1);
}

export function Vitalidade() {
  const today = new Date();
  const todayISO = hojeISO(today);

  // Abrir esta página é a adesão ao protocolo, e é ela que marca o dia zero do
  // streak. Antes o marco era o dia mais antigo do `dailyLog` — que existe
  // desde muito antes desta frente —, então o app abria mostrando um recorde
  // de meses que ela nunca fez. Grava uma vez só (ver
  // `garantirInicioDoAcompanhamento`); reabrir a tela não reinicia nada.
  useEffect(() => {
    void garantirInicioDoAcompanhamento(todayISO);
  }, [todayISO]);

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

  // Alvo de sono = o horário do item "dormir" da rotina de hoje, com o ajuste
  // que ela fez em /hoje/horarios — MESMO cálculo que a tela Hoje usa
  // (`resolverAlvoSono`, em routine-times.ts). Antes esta tela tinha uma
  // segunda cópia fixa em "22:30": no dia em que ela mudasse o horário de
  // dormir, Hoje e Vitalidade passariam a contar streaks diferentes para a
  // mesma noite. Reusar o helper fecha essa divergência nas duas pontas.
  const routineTimes = useSetting("routineTimes");
  const alvoSono = resolverAlvoSono(buildDayRoutine(today.getDay(), diaDoAno(today)).blocks, routineTimes);

  // Streak de sono dos últimos 7 dias contra o alvo acima — mesmo hook que a
  // tela Hoje usa, janela e consulta incluídas.
  const streakSono = useStreakSono(alvoSono, todayISO);

  // Quantas práticas DA PROGRESSÃO ela já concluiu — mesmo helper que o Hoje
  // usa pra decidir a fase (identificar o músculo -> soltura -> Kegel ->
  // variações). Extraído pra `practice-log-helpers.ts` porque as duas telas
  // precisam do mesmo critério — duplicado, ele diverge em silêncio. As três
  // sequências desta tela NÃO entram nesta conta, e o rótulo abaixo diz isso
  // com todas as letras: são práticas de outra coisa, e contá-las pulava a
  // identificação e a soltura inteiras.
  const praticasDaProgressao = useLiveQuery(() => contarPraticasDaProgressao(), []);
  const pelvicHoje = pelvicDoDia(praticasDaProgressao ?? 0);

  // As três sequências sexuais explícitas ou pré-íntimas saem POR AQUI, não
  // pela rotina do Hoje, que toca às 10h no trabalho. A contagem da semana
  // existe pro alvo declarado no topo desta tela ("pelo menos uma sessão de
  // start-stop") ser medido contra o registro real; a de soltura existe porque
  // o preparo pra receber só pode abrir depois de soltura TREINADA.
  const startStopNaSemana = useLiveQuery(
    () => contarPraticasRecentes("pelvic-start-stop", todayISO),
    [todayISO],
  );
  const solturasFeitas = useLiveQuery(() => contarPraticasDaSequencia(SEQUENCIA_DE_SOLTURA), []);
  // Lidas do banco, não de uma lista escrita aqui: sequência nova de intimidade
  // aparece sozinha, sem depender de alguém lembrar de vir editar esta tela.
  const sequenciasIntimas = useLiveQuery(
    () => db.danceSequences.where("category").equals("intimidade").toArray(),
    [],
  );
  const ofertas = ofertasDaVitalidade({
    praticasDaProgressao: praticasDaProgressao ?? 0,
    solturasFeitas: solturasFeitas ?? 0,
    startStopNaSemana: startStopNaSemana ?? 0,
  });

  const streak = useStreakVitalidade(todayISO);
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
        {/* "dias", não "dias limpos": três centímetros abaixo desta linha a
            tela diz "não é abstinência", e "limpo" implica que o resto é
            sujo. O risco assumido nesta decisão é justamente vergonha — o
            vocabulário de pureza é o que a alimenta. */}
        <StreakCard label="Atual" count={streak.atual} unit="dias" />
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
        {/* O rótulo acompanha o que é contado: só a progressão. As sessões do
            card abaixo são práticas de verdade, mas de outra coisa — dizer
            "sequências concluídas" e somar tudo é o que fazia dez start-stops
            valerem como identificação e soltura. */}
        <p className="text-muted text-xs mt-1">
          {praticasDaProgressao ?? 0} sequências da progressão concluídas até agora
        </p>
        <Link to={`/treino/movimento/${pelvicHoje.sequenceId}`} className="text-xs text-nude mt-2 inline-block">
          Ver sequência de hoje →
        </Link>
      </div>

      {/* As três sequências que precisam de privacidade. Ficam aqui, e não na
          rotina do Hoje, porque aquele item cai às 10h — no trabalho. */}
      <div className="card my-3">
        <h2 className="text-nude font-medium mb-1">Sessões desta tela</h2>
        <p className="text-muted text-xs mb-2">
          Precisam de privacidade — por isso não entram na rotina do Hoje, que cai no meio do expediente.
        </p>
        <ul className="space-y-3">
          {ofertas.map((oferta) => (
            <li key={oferta.sequenceId}>
              {oferta.disponivel ? (
                <Link to={`/treino/movimento/${oferta.sequenceId}`} className="text-sm text-nude-warm font-medium">
                  {oferta.titulo} →
                </Link>
              ) : (
                <p className="text-sm text-muted">{oferta.titulo}</p>
              )}
              <p className="text-muted text-xs mt-1">{oferta.nota}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* A dois. Esta seção existe porque ela foi procurar este conteúdo e não
          achou: as sequências viviam na oitava e última seção de Treino →
          Movimento, e nada nesta tela apontava pra elas. Lista TODAS as de
          `category: "intimidade"`, derivadas do banco — não uma seleção escrita
          à mão, que envelheceria calada na próxima sequência nova. */}
      <div className="card my-3">
        <h2 className="text-nude font-medium mb-1">A dois</h2>
        <p className="text-muted text-xs mb-2">
          Técnica, não clima: o que fazer, com que ritmo e por quanto tempo.
        </p>
        <ul className="space-y-2">
          {(sequenciasIntimas ?? []).map((s) => (
            <li key={s.id}>
              <Link to={`/treino/movimento/${s.id}`} className="text-sm text-nude-warm font-medium">
                {s.name} →
              </Link>
              <p className="text-muted text-xs mt-0.5 leading-relaxed">{primeiraFrase(s.focus)}</p>
            </li>
          ))}
        </ul>
        <p className="text-muted text-xs mt-3 pt-2 border-t border-bg-border">
          <Link to="/beleza/estilo/intimo" className="text-nude">
            Lingerie · de ver × de usar →
          </Link>
          <br />
          Renda é peça de ver. Pro atrito, peça lisa sem costura frontal.
        </p>
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
          <li>Sono no alvo ({alvoSono}): {streakSono} de 7 noites</li>
          <li>
            Cintura na última medição: {cinturaRecente !== undefined ? `${cinturaRecente} cm` : "ainda sem medida registrada"}
          </li>
          <li>Assoalho pélvico: {praticasDaProgressao ?? 0} sequências da progressão concluídas</li>
        </ul>
      </div>

      <GuideAccordion sections={VITALIDADE_GUIA} />
    </div>
  );
}
