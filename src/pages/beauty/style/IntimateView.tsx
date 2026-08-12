import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { GarmentCard } from "../../../components/GarmentCard";

export function IntimateView() {
  // Filtra por `mode`, não por `category`: o modo é o eixo agora, e é ele que
  // carrega a peça que ela criou e classificou como íntima.
  const garments = useLiveQuery(
    async () => (await db.garments.toArray()).filter((g) => g.mode === "intimo"),
    [],
  );
  const deUsar = garments?.filter((g) => g.intimateUse === "usar") ?? [];
  const deVer = garments?.filter((g) => g.intimateUse !== "usar") ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo · Íntimo</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <div className="card mb-3 !bg-wine/20 !border-wine-light">
        <p className="text-nude-warm text-sm">Duas prateleiras, e elas não se substituem.</p>
        <p className="text-muted text-xs mt-2 leading-relaxed">
          <span className="text-nude-warm">De ver</span> é pra você se olhar: renda, transparência,
          detalhe. <span className="text-nude-warm">De usar</span> é pro atrito: microfibra lisa, sem
          costura frontal, cós alto. Renda em 20 minutos de contato contínuo rala — e quem sente
          primeiro é ela, não você. A peça mais funcional é a menos bonita de perto, e isso não é
          defeito da peça.
        </p>
      </div>

      {[
        { titulo: "De usar", itens: deUsar },
        { titulo: "De ver", itens: deVer },
      ].map(({ titulo, itens }) =>
        itens.length === 0 ? null : (
          <div key={titulo} className="mb-4">
            <h2 className="text-muted text-xs uppercase tracking-wider mb-2">{titulo}</h2>
            <div className="space-y-2">
              {itens.map((g) => <GarmentCard key={g.id} garment={g} />)}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
