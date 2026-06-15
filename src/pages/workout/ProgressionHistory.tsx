import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { ProgressionChart } from "../../components/ProgressionChart";
import { formatDateBR } from "../../lib/format";
import { GuideAccordion } from "../../components/GuideAccordion";

export function ProgressionHistory() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const sessions = useLiveQuery(() => db.workoutSessions.orderBy("date").toArray(), []);

  const data = (() => {
    if (!selectedId || !sessions) return [];
    const points: Array<{ date: string; weight: number }> = [];
    for (const s of sessions) {
      const found = s.exercises.find((e) => e.exerciseId === selectedId);
      if (found && found.sets.length > 0) {
        const maxWeight = Math.max(...found.sets.map((set) => set.weight));
        points.push({ date: s.date, weight: maxWeight });
      }
    }
    return points;
  })();

  const exMap = new Map(exercises?.map((e) => [e.id, e]) ?? []);

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino" className="text-muted text-sm">&larr; Treino</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Progressão</h1>
      </div>

      <GuideAccordion
        className="mb-3"
        sections={[
          {
            id: "quando-subir",
            title: "Quando aumentar a carga",
            intro: "A bunda cresce quando o estímulo aumenta com o tempo — mas no ritmo certo.",
            tips: [
              "Completou todas as séries e reps com forma boa e ainda sobrou fôlego? Sobe o menor incremento (1-2 kg ou o próximo furo) no próximo treino.",
              "Não fechou as reps ou a forma piorou? Mantém a carga até dominar.",
              "Doeu articulação ou lombar? Baixa a carga e revê a técnica.",
              "Não precisa subir todo treino — semana sim, semana não já é progresso ótimo.",
            ],
          },
        ]}
      />

      <div className="card mb-3">
        <label className="block text-muted text-xs uppercase tracking-wider mb-1">Exercício</label>
        <select
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(e.target.value || null)}
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
        >
          <option value="">Escolha...</option>
          {exercises?.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>

      {selectedId && (
        <>
          <div className="card mb-3">
            <h2 className="text-nude-warm font-medium mb-2">{exMap.get(selectedId)?.name}</h2>
            <ProgressionChart data={data} />
          </div>

          {data.length > 0 && (
            <div className="card">
              <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Histórico</h2>
              <ul className="space-y-1 text-sm">
                {data.map((p, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-muted">{formatDateBR(new Date(p.date))}</span>
                    <span className="text-nude-warm">{p.weight} kg</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
