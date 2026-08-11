import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { db, type Exercise, type WorkoutSession } from "../../lib/db";
import { ordenarPorBloco } from "../../lib/session-order";
import { textoDeAquecimento } from "../../lib/session-warmup";
import { SessionRecorder } from "../../components/SessionRecorder";
import { GuideAccordion } from "../../components/GuideAccordion";
import { hojeISO } from "../../lib/today-date";

export function SessionDetail() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const template = useLiveQuery(
    async () => (templateId ? await db.workoutTemplates.get(templateId) : undefined),
    [templateId],
  );
  const exercises = useLiveQuery(async () => {
    if (!template) return [];
    const ids = template.exercises.map((e) => e.exerciseId);
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
  const ordenados = useMemo(
    () => (template ? ordenarPorBloco(template.exercises, soloPrimeiro) : []),
    [template, soloPrimeiro],
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
    const next = [...recorded, entry];
    setRecorded(next);
    void persist(next, feedback);
  }

  async function finishSession() {
    await persist(recorded, feedback);
    navigate("/treino", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino/plano" className="text-muted text-sm">&larr; Plano</Link>
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
            intro: "Duas coisas rápidas ao fechar (o alongamento fica pro da noite).",
            tips: [
              "Sem cardio de zona 2 aqui no fim — a caminhada de 5 km do trabalho para casa, às 16h, já entrega os minutos contínuos nesse ritmo (ofegante mas dá pra conversar). Prescrever de novo alongaria o treino e empurraria o jantar pra depois das 20h.",
              "O passeio lento com os cães, depois da caminhada, é movimento bônus (bom pra saúde) em cima disso.",
              "Bebe água — você sua mais no calor de Aracaju.",
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
        const alreadyRecorded = recorded.some((r) => r.exerciseId === ex.id);
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
                <h3 className="text-nude-warm font-medium">{ex.name} ✓</h3>
                <p className="text-muted text-xs">Registrado</p>
              </div>
            ) : (
              <SessionRecorder
                exercise={ex}
                setsTarget={tplEx.sets}
                repsTarget={tplEx.repsTarget}
                restSec={tplEx.restSec}
                notes={tplEx.notes}
                onSave={handleSave}
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
