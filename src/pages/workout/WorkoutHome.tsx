import { Link } from "react-router-dom";

export function WorkoutHome() {
  return (
    <div className="p-4 pb-24 space-y-3">
      <h1 className="font-serif text-2xl text-nude mb-2">Treino</h1>
      <Link to="/treino/plano" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Plano semanal</h3>
        <p className="text-muted text-sm mt-1">Treinos do dia e da semana</p>
      </Link>
      <Link to="/treino/biblioteca" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Biblioteca de exercícios</h3>
        <p className="text-muted text-sm mt-1">Catálogo com técnica, erros, variações</p>
      </Link>
      <Link to="/treino/progressao" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Progressão</h3>
        <p className="text-muted text-sm mt-1">Histórico de cargas por exercício</p>
      </Link>
    </div>
  );
}
