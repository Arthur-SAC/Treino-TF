import { Link } from "react-router-dom";
import { BeautyTabs } from "../../components/BeautyTabs";
import { NAILS_GUIDE } from "../../data/nails-guide-seed";
import { GuideAccordion } from "../../components/GuideAccordion";

export function NailsHome() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Unhas</h1>
      </div>
      <BeautyTabs />

      <p className="text-muted text-sm mb-4">
        Curtas por escolha — femininas pelo cuidado, formato e brilho, não pelo comprimento.
      </p>

      <GuideAccordion sections={NAILS_GUIDE} />
    </div>
  );
}
