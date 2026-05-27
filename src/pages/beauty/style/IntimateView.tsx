import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { GarmentCard } from "../../../components/GarmentCard";

export function IntimateView() {
  const garments = useLiveQuery(
    () => db.garments.where("category").equals("intimate").toArray(),
    [],
  );

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <div className="card mb-3 !bg-wine/20 !border-wine-light">
        <p className="text-nude-warm text-sm">
          Catálogo de peças íntimas e sensuais — alinhadas com a paleta amazona (vinho, preto, nude quente).
          Cada peça tem explicação do efeito visual e como usar.
        </p>
      </div>

      <div className="space-y-2">
        {garments?.map((g) => <GarmentCard key={g.id} garment={g} />)}
        {garments?.length === 0 && (
          <p className="text-muted text-sm text-center py-4">Catálogo carregando…</p>
        )}
      </div>
    </div>
  );
}
