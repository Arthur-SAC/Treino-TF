import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { ExerciseCard } from "../../components/ExerciseCard";

// Exportado pra testes: um exercício com `category` fora desta lista some do
// filtro (só aparece em "Todos") e mostra o texto cru no card em vez de um
// rótulo em pt-BR — já aconteceu de conteúdo existir e não chegar até ela por
// exatamente esse motivo, então a taxonomia é testada contra o catálogo real.
export const CATEGORIES = ["gluteo", "cintura", "costas", "postura", "peitoral", "mobilidade", "danca", "aquecimento", "cardio"];
const CATEGORY_LABELS: Record<string, string> = {
  gluteo: "Glúteo",
  cintura: "Cintura",
  costas: "Costas",
  postura: "Postura",
  peitoral: "Peitoral",
  mobilidade: "Mobilidade",
  danca: "Dança",
  aquecimento: "Aquecimento",
  cardio: "Cardio",
};

export function ExerciseLibrary() {
  const [category, setCategory] = useState<string | null>(null);
  const exercises = useLiveQuery(async () => {
    if (category) {
      return db.exercises.where("category").equals(category).toArray();
    }
    return db.exercises.toArray();
  }, [category]);

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino" className="text-muted text-sm">&larr; Treino</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Biblioteca</h1>
      </div>
      <p className="text-muted text-[0.7rem] mb-3">
        "Exposição X/5" = quão à mostra o corpo fica no exercício (1 discreto → 5 aparente).
      </p>
      <div className="overflow-x-auto -mx-4 px-4 mb-4">
        <div className="flex gap-2 w-max">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
              category === null ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
                category === c ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {exercises?.map((ex) => <ExerciseCard key={ex.id} ex={ex} />)}
        {exercises?.length === 0 && (
          <p className="text-muted text-sm text-center py-4">Nenhum exercício nessa categoria.</p>
        )}
      </div>
    </div>
  );
}
