import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { useSetting } from "../../hooks/useSetting";

export function WorkoutHome() {
  // A aba abre pelo treino de hoje (auditoria 2026-09-23: eram seis cartões e
  // nenhum dizia o que fazer hoje). Mesma regra do Hoje: dia da semana + ciclo.
  const activeCycle = useSetting("activeCycle");
  const dayOfWeek = new Date().getDay();
  const deHoje = useLiveQuery(
    async () => (await db.workoutTemplates.where("dayOfWeek").equals(dayOfWeek).toArray()).find((t) => (t.cycle ?? "adaptacao") === activeCycle) ?? null,
    [dayOfWeek, activeCycle],
  );
  return (
    <div className="p-4 pb-24 space-y-3">
      <h1 className="font-serif text-2xl text-nude mb-2">Treino</h1>
      {deHoje === undefined ? null : deHoje ? (
        <Link to={`/treino/sessao/${deHoje.id}`} className="card block bg-wine/40 border-wine-light">
          <h3 className="text-nude-warm font-medium">Treino de hoje · {deHoje.name}</h3>
          <p className="text-muted text-sm mt-1">~{deHoje.durationMin} min{deHoje.purpose ? ` · ${deHoje.purpose}` : ""}</p>
        </Link>
      ) : (
        <div className="card">
          <h3 className="text-nude-warm font-medium">Hoje é descanso da academia</h3>
          <p className="text-muted text-sm mt-1">A caminhada e a mobilidade do Hoje continuam.</p>
        </div>
      )}
      <Link to="/treino/horizontes" className="card block hover:border-nude/40 transition border-nude/40">
        <h3 className="text-nude-warm font-medium">Até onde dá pra chegar ✦</h3>
        <p className="text-muted text-sm mt-1">Duas trilhas ao mesmo tempo — o corpo vestida e o corpo na cama, com os números reais e o teto dito</p>
      </Link>
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
      <Link to="/treino/movimento" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Movimento (dança + mobilidade)</h3>
        <p className="text-muted text-sm mt-1">Sequências guiadas, dança progressiva 4 semanas</p>
      </Link>
      <Link to="/treino/ciclos" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Ciclos de treino</h3>
        <p className="text-muted text-sm mt-1">Adaptação · Variação · Hipertrofia · Refinamento</p>
      </Link>
    </div>
  );
}
