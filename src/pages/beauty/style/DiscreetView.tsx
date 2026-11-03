import { Voltar } from "../../../components/Voltar";
import { StyleTabs } from "../../../components/StyleTabs";
import { DisclaimerCard } from "../../../components/DisclaimerCard";
import { ESTILO_DISCRETO } from "../../../data/estilo-discreto-seed";
import { GuideAccordion } from "../../../components/GuideAccordion";

export function DiscreetView() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Voltar para="/beleza" rotulo="Beleza" />
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo · Público</h1>
      </div>
      <StyleTabs />

      <DisclaimerCard text="Andrógino, com o teto que o ambiente comporta — e o teto é do ambiente, não seu. A escada abaixo é o calibrador do dia: sobe e desce de degrau conforme onde você vai estar. Ficar num degrau o tempo que quiser não é atraso." />

      <GuideAccordion sections={ESTILO_DISCRETO} className="mt-3" />
    </div>
  );
}
