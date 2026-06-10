import { Link } from "react-router-dom";
import { BeautyTabs } from "../../components/BeautyTabs";
import { DisclaimerCard } from "../../components/DisclaimerCard";
import { CLAREAMENTO_GUIDE } from "../../data/clareamento-guide-seed";
import { GuideAccordion } from "../../components/GuideAccordion";

export function ClareamentoHome() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Clareamento</h1>
      </div>
      <BeautyTabs />

      <DisclaimerCard text="Boas práticas gerais, não substituem dermatologista — sobretudo para a região anal e para ativos potentes (hidroquinona, peelings). As aplicações passo a passo de axila e íntima ficam no Skincare." />

      <GuideAccordion sections={CLAREAMENTO_GUIDE} className="mt-3" />
    </div>
  );
}
