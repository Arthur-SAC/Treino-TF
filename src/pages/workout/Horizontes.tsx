import { Link } from "react-router-dom";
import { GuideAccordion } from "../../components/GuideAccordion";
import { HORIZONTES } from "../../data/horizontes-seed";

export function Horizontes() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino" className="text-muted text-sm">&larr; Treino</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Até onde dá pra chegar</h1>
      </div>
      <p className="text-muted text-sm mb-4">
        Três horizontes do seu corpo, com sinceridade pra não te iludir e carinho pra te motivar.
        O fio condutor: <span className="text-nude-warm">perder a barriga e construir glúteo agora</span> é
        pré-requisito de tudo — melhora o presente e multiplica o resultado da TRH e de uma cirurgia, se você quiser.
      </p>
      <GuideAccordion sections={HORIZONTES} />
      <p className="text-muted text-[0.7rem] mt-4">
        Os números de WHR são estimativas pra dar um norte — cada corpo responde do seu jeito.
      </p>
    </div>
  );
}
