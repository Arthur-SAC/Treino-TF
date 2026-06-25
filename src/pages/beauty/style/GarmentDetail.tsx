import { useLiveQuery } from "dexie-react-hooks";
import { Link, useParams } from "react-router-dom";
import { db } from "../../../lib/db";

export function GarmentDetail() {
  const { id } = useParams<{ id: string }>();
  const garment = useLiveQuery(
    async () => (id ? await db.garments.get(id) : undefined),
    [id],
  );

  if (!garment) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/estilo/pecas" className="text-muted text-sm">&larr; Peças</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{garment.name}</h1>
      <p className="text-muted text-xs mb-4">{garment.occasion.join(" · ")}</p>

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Por que funciona pra você</h2>
        <p className="text-sm">{garment.whyItWorks}</p>
      </div>

      {garment.fitTip && (
        <div className="card mb-3">
          <h2 className="text-nude-warm font-medium mb-2">Caimento / corte</h2>
          <p className="text-sm">{garment.fitTip}</p>
        </div>
      )}

      {garment.cautions && (
        <div className="card !bg-wine/20 !border-wine-light">
          <h2 className="text-nude font-medium mb-2">Cuidado</h2>
          <p className="text-sm text-nude-warm">{garment.cautions}</p>
        </div>
      )}
    </div>
  );
}
