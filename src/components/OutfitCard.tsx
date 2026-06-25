import { Link } from "react-router-dom";
import type { Outfit } from "../lib/db";

const STATUS_LABEL: Record<Outfit["status"], string> = {
  ideia: "Ideia",
  comprando: "Comprando",
  tenho: "Tenho",
  testei: "Testei",
};

const CONTEXT_LABEL: Record<Outfit["context"], string> = {
  discreto: "Discreto",
  livre: "Casa/Livre",
};

export function OutfitCard({ outfit }: { outfit: Outfit }) {
  return (
    <Link
      to={`/beleza/estilo/combinacoes/${outfit.id}`}
      className="card block hover:border-nude/40 transition"
    >
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">
          {CONTEXT_LABEL[outfit.context]} · {outfit.occasion}
        </span>
        <span className="text-nude text-xs">{STATUS_LABEL[outfit.status]}</span>
      </div>
      <h3 className="text-nude-warm font-medium">{outfit.name}</h3>
      <p className="text-muted text-xs mt-1">{outfit.pieces.join(" · ")}</p>
      <p className="text-nude-warm/80 text-xs mt-1">{outfit.silhouetteNote}</p>
    </Link>
  );
}
