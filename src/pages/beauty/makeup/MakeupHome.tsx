import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type MakeupRoutine } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { DisclaimerCard } from "../../../components/DisclaimerCard";

const OCCASION_LABEL: Record<MakeupRoutine["occasion"], string> = {
  diario: "Diário",
  trabalho: "Trabalho",
  sensual: "Sensual",
  saida: "Saída",
  festa: "Festa",
};

export function MakeupHome() {
  const routines = useLiveQuery(() => db.makeupRoutines.toArray(), []);
  const products = useLiveQuery(
    () => db.products.where("category").equals("makeup").toArray(),
    [],
  );

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Maquiagem</h1>
      </div>
      <BeautyTabs />

      <DisclaimerCard text="Comece com as rotinas mais simples (diário, trabalho) e vai evoluindo. Maquiagem é prática — quanto mais você faz, melhor fica." />

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2 mt-3">Rotinas</h2>
      <div className="space-y-2 mb-4">
        {routines?.map((r) => (
          <Link key={r.id} to={`/beleza/maquiagem/${r.id}`} className="card block hover:border-nude/40 transition">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-muted text-xs uppercase tracking-wider">{OCCASION_LABEL[r.occasion]}</span>
              <span className="text-muted text-xs">{r.durationMin} min · {r.steps.length} passos</span>
            </div>
            <h3 className="text-nude-warm font-medium">{r.name}</h3>
            {r.notes && <p className="text-muted text-sm mt-1">{r.notes}</p>}
          </Link>
        ))}
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Produtos sugeridos ({products?.length ?? 0})</h2>
      <Link to="/beleza/pele-cabelo/produtos" className="text-nude text-sm underline">
        Ver catálogo completo →
      </Link>
    </div>
  );
}
