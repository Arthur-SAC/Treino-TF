import { useLiveQuery } from "dexie-react-hooks";
import { Link, useParams } from "react-router-dom";
import { db } from "../../lib/db";

export function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const ex = useLiveQuery(async () => (id ? await db.exercises.get(id) : undefined), [id]);

  if (!ex) {
    return (
      <div className="p-4 pb-24">
        <p className="text-muted text-sm text-center py-8">Exercício não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino/biblioteca" className="text-muted text-sm">&larr; Biblioteca</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{ex.name}</h1>
      <p className="text-muted text-xs mb-4">
        {ex.category} · {ex.difficulty} · exposição {ex.exposureLevel}/5
      </p>

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Como fazer</h2>
        <p className="text-sm">{ex.description}</p>
      </div>

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Erros comuns</h2>
        <ul className="space-y-1 text-sm list-disc pl-5">
          {ex.commonMistakes.map((m) => <li key={m}>{m}</li>)}
        </ul>
      </div>

      {ex.equipment.length > 0 && (
        <div className="card mb-3">
          <h2 className="text-nude-warm font-medium mb-2">Equipamento</h2>
          <p className="text-sm">{ex.equipment.join(", ")}</p>
        </div>
      )}

      {ex.easierVariation && (
        <div className="card mb-3">
          <h2 className="text-nude-warm font-medium mb-2">Se for muito difícil</h2>
          <p className="text-sm">{ex.easierVariation}</p>
        </div>
      )}

      {ex.harderVariation && (
        <div className="card mb-3">
          <h2 className="text-nude-warm font-medium mb-2">Se ficar fácil demais</h2>
          <p className="text-sm">{ex.harderVariation}</p>
        </div>
      )}

      {ex.videoUrl && (
        <a href={ex.videoUrl} target="_blank" rel="noreferrer" className="card block text-center text-nude">
          Ver vídeo →
        </a>
      )}
    </div>
  );
}
