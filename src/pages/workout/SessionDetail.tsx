import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { db, type Exercise, type WorkoutSession } from "../../lib/db";
import { SessionRecorder } from "../../components/SessionRecorder";
import { GuideAccordion } from "../../components/GuideAccordion";

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

  if (!template || !exercises) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  const exMap = new Map<string, Exercise>(exercises.map((e) => [e.id, e]));

  async function finishSession() {
    if (!template) return;
    const session: Omit<WorkoutSession, "id"> = {
      date: new Date().toISOString().slice(0, 10),
      templateId: template.id,
      exercises: recorded,
      durationMin: template.durationMin,
      difficultySelf: feedback,
    };
    await db.workoutSessions.add(session as WorkoutSession);
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
            intro: "Dois minutos que evitam lesão e fazem o treino render mais.",
            tips: [
              "Aqueça: 5-7 min de esteira leve + mobilidade articular (os dois primeiros itens do treino já fazem isso).",
              "Regra de ouro da dor: queimação e fadiga no músculo = normal, pode seguir. Dor aguda, em articulação ou uma fisgada = PARE na hora.",
              "Forma antes de carga: só sobe o peso quando o movimento sai redondo.",
              "Respira: solta o ar no esforço, puxa na volta.",
            ],
          },
        ]}
      />

      {template.exercises.map((tplEx, i) => {
        const ex = exMap.get(tplEx.exerciseId);
        if (!ex) return null;
        const alreadyRecorded = recorded.some((r) => r.exerciseId === ex.id);
        if (alreadyRecorded) {
          return (
            <div key={i} className="card mb-3 border-nude">
              <h3 className="text-nude-warm font-medium">{ex.name} ✓</h3>
              <p className="text-muted text-xs">Registrado</p>
            </div>
          );
        }
        return (
          <SessionRecorder
            key={i}
            exercise={ex}
            setsTarget={tplEx.sets}
            repsTarget={tplEx.repsTarget}
            restSec={tplEx.restSec}
            onSave={(entry) => setRecorded((prev) => [...prev, entry])}
          />
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
