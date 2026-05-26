import { Link } from "react-router-dom";
import type { Exercise } from "../lib/db";

const CATEGORY_LABEL: Record<string, string> = {
  gluteo: "Glúteo",
  cintura: "Cintura",
  costas: "Costas",
  postura: "Postura",
  peitoral: "Peitoral",
  mobilidade: "Mobilidade",
  danca: "Dança",
  aquecimento: "Aquecimento",
};

const DIFFICULTY_LABEL: Record<Exercise["difficulty"], string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export function ExerciseCard({ ex }: { ex: Exercise }) {
  return (
    <Link to={`/treino/exercicio/${ex.id}`} className="card block hover:border-nude/40 transition">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">{CATEGORY_LABEL[ex.category] ?? ex.category}</span>
        <span className="text-muted text-xs">{DIFFICULTY_LABEL[ex.difficulty]} · exp {ex.exposureLevel}/5</span>
      </div>
      <h3 className="text-nude-warm font-medium">{ex.name}</h3>
    </Link>
  );
}
