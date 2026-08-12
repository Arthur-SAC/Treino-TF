import { Link } from "react-router-dom";
import type { Garment } from "../lib/db";

const CATEGORY_LABEL: Record<Garment["category"], string> = {
  top: "Top",
  bottom: "Calça/Saia",
  dress: "Vestido",
  outerwear: "Casaco/Acessório",
  intimate: "Íntimo",
};

const MODE_LABEL: Record<Garment["mode"], string> = {
  publico: "Público",
  casa: "Casa",
  intimo: "Íntimo",
};

/** Etiqueta do efeito, só no modo Casa. Justa marca por contato, folgada marca
 *  por contraste — duas técnicas para a mesma meta, por mecanismos opostos. */
const HOME_EFFECT_LABEL: Record<NonNullable<Garment["homeEffect"]>, string> = {
  contato: "marca por contato",
  contraste: "marca por contraste",
};

const INTIMATE_USE_LABEL: Record<NonNullable<Garment["intimateUse"]>, string> = {
  ver: "de ver",
  usar: "de usar",
};

export function GarmentCard({ garment }: { garment: Garment }) {
  const detalhe =
    (garment.homeEffect && HOME_EFFECT_LABEL[garment.homeEffect]) ??
    (garment.intimateUse && INTIMATE_USE_LABEL[garment.intimateUse]);

  return (
    <Link to={`/beleza/estilo/pecas/${garment.id}`} className="card block hover:border-nude/40 transition">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">{CATEGORY_LABEL[garment.category]}</span>
        <span className="text-nude text-xs">{MODE_LABEL[garment.mode]}</span>
      </div>
      <h3 className="text-nude-warm font-medium">{garment.name}</h3>
      <p className="text-muted text-xs mt-0.5">
        {garment.occasion.join(" · ")}
        {detalhe && <span className="text-nude"> · {detalhe}</span>}
      </p>
    </Link>
  );
}
