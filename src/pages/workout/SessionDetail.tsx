import { Voltar } from "../../components/Voltar";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { db, type Exercise, type WorkoutSession } from "../../lib/db";
import { ordenarPorBloco, semCardioPosTreinoNaEsteira } from "../../lib/session-order";
import { textoDeAquecimento } from "../../lib/session-warmup";
import { SessionRecorder } from "../../components/SessionRecorder";
import { GuideAccordion } from "../../components/GuideAccordion";
import { hojeISO } from "../../lib/today-date";
import { useSetting } from "../../hooks/useSetting";
import type { ModoCaminhada } from "../../lib/objetivo";
import { aplicarAusentes, podeMarcarAusente, type ItemTemplate } from "../../lib/troca-aparelho";
import { setSetting } from "../../lib/settings-helpers";

// Os dois primeiros textos de "Ao terminar" dependem de a zona 2 vir de algum
// lugar hoje. Em "pausada" não vem — afirmar que a caminhada "já entrega" seria
// mentir sobre um dia em que ela não acontece.
function dicasZona2(modo: ModoCaminhada): string[] {
  if (modo === "pausada") {
    return [
      "A caminhada está pausada — a zona 2 de hoje não vem de lugar nenhum. Se quiser compensar, estica o cardio pós-treino pra 30 min, ainda no ritmo de conversa.",
      "O passeio com os cães continua, mas é movimento leve — não substitui a zona 2.",
      "Bebe água — você sua mais no calor de Aracaju.",
    ];
  }
  if (modo === "esteira") {
    // Sem a dica de água compartilhada: a segunda frase já manda levar água.
    return [
      "Agora a esteira inclinada: ~6% a 5 km/h, 1 h sem parar, ofegante mas falando em frases curtas. É ela a zona 2 de hoje.",
      "Leva água e não se segura no corrimão. A esteira acaba por volta das 19h, os cães vêm depois e o jantar é às 20:30 — deixa ele pronto de manhã.",
    ];
  }
  return [
    "O cardio pós-treino (15-20 min, último item) é leve e é o acelerador da fase 1. A zona 2 de verdade continua sendo a caminhada: ~4 km até a academia e ~1 km de volta pra casa depois do treino — não precisa de outra caminhada além dessa.",
    "O passeio lento com os cães, depois que você chega em casa, é movimento bônus (bom pra saúde) em cima disso.",
    "Bebe água — você sua mais no calor de Aracaju.",
  ];
}

export function SessionDetail() {
  const modoCaminhada = useSetting("modoCaminhada");
  const ausentes = useSetting("aparelhosAusentes");
  // "Ocupado": original → substituto, SÓ nesta visita à sessão. Nada vai pro db:
  // amanhã o aparelho pode estar livre.
  const [ocupados, setOcupados] = useState<Record<string, string>>({});
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const template = useLiveQuery(
    async () => (templateId ? await db.workoutTemplates.get(templateId) : undefined),
    [templateId],
  );
  const exercises = useLiveQuery(async () => {
    if (!template) return [];
    // Inclui os substitutos: a troca por "Ocupado" precisa do nome deles já na mão.
    const ids = template.exercises.flatMap((e) => (e.substitutoId ? [e.exerciseId, e.substitutoId] : [e.exerciseId]));
    return db.exercises.where("id").anyOf(ids).toArray();
  }, [template]);

  const [recorded, setRecorded] = useState<WorkoutSession["exercises"]>([]);
  const [feedback, setFeedback] = useState<WorkoutSession["difficultySelf"]>("medium");
  const sessionIdRef = useRef<number | undefined>(undefined);
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const todayISO = hojeISO();
  const [soloPrimeiro, setSoloPrimeiro] = useState(false);

  // Templates antigos (de outros ciclos) não têm `block` — a UI segue igual pra
  // eles: sem card explicativo, sem botão, ordem original do template. E dias
  // sem os DOIS blocos do miolo (só máquina, ou só solo) também não entram
  // aqui: não há o que trocar, então o card/botão não podem existir.
  const temBlocos =
    (template?.exercises.some((e) => e.block === "maquina") ?? false) &&
    (template?.exercises.some((e) => e.block === "solo") ?? false);
  // Ausência permanente e "Ocupado" usam a mesma troca (mesma regra do " cada").
  const efetivo = useMemo(() => {
    if (!template) return undefined;
    const equipPorId = new Map((exercises ?? []).map((e) => [e.id, e.equipment]));
    return aplicarAusentes(template, [...ausentes, ...Object.keys(ocupados)], (id) => equipPorId.get(id));
  }, [template, exercises, ausentes, ocupados]);
  const ordenados = useMemo(
    () => (efetivo ? ordenarPorBloco(semCardioPosTreinoNaEsteira(efetivo.exercises, modoCaminhada), soloPrimeiro) as ItemTemplate[] : []),
    [efetivo, soloPrimeiro, modoCaminhada],
  );

  // Carrega o treino em andamento de hoje (se a usuária saiu e voltou): mostra o
  // que já foi registrado em vez de começar do zero.
  useEffect(() => {
    if (!templateId) return;
    let mounted = true;
    db.workoutSessions
      .where("date")
      .equals(todayISO)
      .toArray()
      .then((rows) => {
        if (!mounted) return;
        const existing = rows.find((r) => r.templateId === templateId);
        if (existing) {
          sessionIdRef.current = existing.id;
          setRecorded(existing.exercises);
          if (existing.difficultySelf) setFeedback(existing.difficultySelf);
        }
      });
    return () => {
      mounted = false;
    };
  }, [templateId, todayISO]);

  if (!template || !exercises) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  const exMap = new Map<string, Exercise>(exercises.map((e) => [e.id, e]));

  // O texto do "Antes de começar" é derivado da sessão REAL. Era fixo e
  // prometia "bike ou esteira leve", mas as quartas e quintas da Entrada
  // aquecem só com mobilidade — e a usuária foi procurar a esteira que não
  // existia naquele dia.
  const introAquecimento = textoDeAquecimento(template.exercises, (id) => exMap.get(id)?.name);

  // Cabeçalho de seção no primeiro exercício de cada bloco do miolo: os blocos
  // precisam ser identificáveis na tela, não só reordenáveis.
  const tituloDoBloco = new Map<string, string>();
  let blocoAnterior: string | undefined;
  for (const e of ordenados) {
    if ((e.block === "maquina" || e.block === "solo") && e.block !== blocoAnterior) {
      tituloDoBloco.set(e.exerciseId, e.block === "maquina" ? "Na área de aparelhos" : "Na área livre");
      blocoAnterior = e.block;
    }
  }

  // Persiste o estado atual da sessão (upsert). As chamadas são SERIALIZADAS num
  // encadeamento de promise pra não criar linhas duplicadas se "salvar" e
  // "finalizar" dispararem quase juntos (o id real só existe após o 1º put).
  function persist(
    nextRecorded: WorkoutSession["exercises"],
    nextFeedback: WorkoutSession["difficultySelf"],
  ): Promise<void> {
    if (!template) return saveChain.current;
    const tplId = template.id;
    const durationMin = template.durationMin;
    saveChain.current = saveChain.current.then(async () => {
      // Sem nenhum exercício (o "Corrigir" tirou o único), a sessão some: vazia,
      // ela contava como treino feito na semana.
      if (nextRecorded.length === 0) {
        if (sessionIdRef.current !== undefined) await db.workoutSessions.delete(sessionIdRef.current);
        sessionIdRef.current = undefined;
        return;
      }
      const id = (await db.workoutSessions.put({
        id: sessionIdRef.current,
        date: todayISO,
        templateId: tplId,
        exercises: nextRecorded,
        durationMin,
        difficultySelf: nextFeedback,
      })) as number;
      sessionIdRef.current = id;
    });
    return saveChain.current;
  }

  function handleSave(entry: WorkoutSession["exercises"][number]) {
    // Substitui se o exercício já estava registrado (veio do "Corrigir").
    const next = [...recorded.filter((r) => r.exerciseId !== entry.exerciseId), entry];
    setRecorded(next);
    void persist(next, feedback);
  }

  // Registrou errado? Tira o exercício da sessão e reabre o registro dele
  // (auditoria 2026-09-23: antes, salvo era salvo pra sempre).
  function corrigir(exerciseId: string) {
    const next = recorded.filter((r) => r.exerciseId !== exerciseId);
    setRecorded(next);
    void persist(next, feedback);
  }

  async function finishSession() {
    await persist(recorded, feedback);
    // Volta pro Hoje: é de lá que ela abre o treino, e é lá que o dia continua.
    navigate("/", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Voltar para="/treino/plano" rotulo="Plano" />
        <h1 className="font-serif text-2xl text-nude flex-1">{template.name}</h1>
      </div>

      {template.purpose && (
        <p className="text-sm text-nude/90 mb-3">✦ {template.purpose}</p>
      )}

      <GuideAccordion
        className="mb-4"
        sections={[
          {
            id: "antes-de-comecar",
            title: "Antes de começar",
            intro: introAquecimento,
            tips: [
              "Regra de ouro da dor: queimação e fadiga no músculo = normal, pode seguir. Dor aguda, em articulação ou uma fisgada = PARE na hora.",
              "Forma antes de carga: só sobe o peso quando o movimento sai redondo.",
              "Respira: solta o ar no esforço, puxa na volta.",
            ],
          },
          {
            id: "ao-terminar",
            title: "Ao terminar",
            intro: "Ao fechar (o alongamento fica pro da noite):",
            tips: [
              ...dicasZona2(modoCaminhada),
            ],
          },
        ]}
      />

      {temBlocos && (
        <div className="card mb-4">
          <p className="text-sm text-nude-warm">
            O miolo desta sessão tem dois blocos independentes — área de aparelhos e área livre. Se um dos dois estiver ocupado, troca a ordem e faz o outro primeiro. O aquecimento e o cardio do fim ficam no lugar.
          </p>
          <button
            type="button"
            onClick={() => setSoloPrimeiro((v) => !v)}
            className="w-full mt-3 py-2 rounded-md text-sm bg-bg-deep text-muted border border-bg-border"
          >
            {soloPrimeiro ? "Começar pelos aparelhos" : "Começar pela área livre"}
          </button>
        </div>
      )}

      {ordenados.map((tplEx) => {
        const ex = exMap.get(tplEx.exerciseId);
        if (!ex) return null;
        // Sessão reaberta não lembra do "Ocupado" (é só da visita): o item volta
        // ao original, mas se ela registrou o substituto, ele conta como feito.
        const idsDoItem = [tplEx.exerciseId];
        if (tplEx.originalId) idsDoItem.push(tplEx.originalId);
        if (tplEx.substitutoId && !template.exercises.some((o) => o.exerciseId === tplEx.substitutoId)) {
          idsDoItem.push(tplEx.substitutoId);
        }
        const registro = recorded.find((r) => idsDoItem.includes(r.exerciseId));
        const alreadyRecorded = registro !== undefined;
        const exRegistrado = registro ? exMap.get(registro.exerciseId) ?? ex : ex;
        const original = tplEx.originalId ? exMap.get(tplEx.originalId) : undefined;
        const voltavel = tplEx.originalId !== undefined && ocupados[tplEx.originalId] !== undefined && !ausentes.includes(tplEx.originalId);
        const titulo = tituloDoBloco.get(tplEx.exerciseId);
        // Key por exerciseId (não pelo índice): ao trocar a ordem com
        // soloPrimeiro, o mesmo índice passa a apontar pra outro exercício, e um
        // key posicional faria o React reaproveitar o SessionRecorder errado —
        // vazando reps/peso digitados de um exercício pra outro.
        return (
          <Fragment key={tplEx.exerciseId}>
            {titulo && (
              <h2 className="text-muted text-xs uppercase tracking-wider mb-2 mt-4">{titulo}</h2>
            )}
            {alreadyRecorded ? (
              <div className="card mb-3 border-nude">
                <h3 className="text-nude-warm font-medium">{exRegistrado.name} ✓</h3>
                <div className="flex justify-between items-baseline">
                  <p className="text-muted text-xs">Registrado</p>
                  <button
                    type="button"
                    onClick={() => corrigir(exRegistrado.id)}
                    aria-label={`Corrigir ${exRegistrado.name}`}
                    className="text-muted text-xs underline"
                  >
                    Corrigir
                  </button>
                </div>
              </div>
            ) : (
              <SessionRecorder
                exercise={ex}
                setsTarget={tplEx.sets}
                repsTarget={tplEx.repsTarget}
                restSec={tplEx.restSec}
                // As notas descrevem o aparelho ORIGINAL ("polia no chão, tornozeleira…");
                // no substituto seriam instrução errada.
                notes={tplEx.originalId ? undefined : tplEx.notes}
                onSave={handleSave}
                onOcupado={tplEx.substitutoId && !tplEx.originalId
                  ? () => setOcupados((o) => ({ ...o, [tplEx.exerciseId]: tplEx.substitutoId as string }))
                  : undefined}
                onNaoTemAqui={podeMarcarAusente(tplEx)
                  ? () => void setSetting("aparelhosAusentes", [...ausentes, tplEx.exerciseId])
                  : undefined}
                onVoltarAoOriginal={voltavel
                  ? () => setOcupados((o) => {
                      const { [tplEx.originalId as string]: _, ...resto } = o;
                      return resto;
                    })
                  : undefined}
                nomeOriginal={original?.name}
              />
            )}
          </Fragment>
        );
      })}

      <div className="card">
        <h2 className="text-nude-warm font-medium mb-2">Como foi o treino?</h2>
        <div className="flex gap-2 mb-3">
          {(["easy", "medium", "hard"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFeedback(f)}
              className={`flex-1 py-2 rounded-md text-sm ${
                feedback === f ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {f === "easy" ? "Fácil" : f === "medium" ? "Médio" : "Difícil"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={finishSession}
          disabled={recorded.length === 0}
          className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium disabled:opacity-50"
        >
          Finalizar treino ({recorded.length} exercícios)
        </button>
      </div>
    </div>
  );
}
