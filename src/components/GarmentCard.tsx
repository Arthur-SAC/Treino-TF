import { Link } from "react-router-dom";
import type { Garment } from "../lib/db";

const CATEGORY_LABEL: Record<Garment["category"], string> = {
  top: "Top",
  bottom: "Calça/Saia",
  dress: "Vestido",
  outerwear: "Casaco/Acessório",
  intimate: "Íntimo",
};

const DISCRETION_LABEL: Record<Garment["discretion"], string> = {
  discreto: "Discreto",
  livre: "Casa/Livre",
};

export function GarmentCard({ garment }: { garment: Garment }) {
  return (
    <Link to={`/beleza/estilo/pecas/${garment.id}`} className="card block hover:border-nude/40 transition">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">{CATEGORY_LABEL[garment.category]}</span>
        <span className="text-nude text-xs">{DISCRETION_LABEL[garment.discretion]}</span>
      </div>
      <h3 className="text-nude-warm font-medium">{garment.name}</h3>
      <p className="text-muted text-xs mt-0.5">{garment.occasion.join(" · ")}</p>
    </Link>
  );
}
