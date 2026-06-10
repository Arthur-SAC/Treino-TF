import { Link } from "react-router-dom";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { DisclaimerCard } from "../../../components/DisclaimerCard";
import { ESTILO_DISCRETO } from "../../../data/estilo-discreto-seed";

export function DiscreetView() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo · Discreto</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <DisclaimerCard text="Vá no seu ritmo — sua segurança vem primeiro. Deixe o ousado pros espaços seguros (casa, com a amada, ambientes queer). Não é corrida: dá pra ficar em cada nível o tempo que quiser." />

      <div className="space-y-2 mt-3">
        {ESTILO_DISCRETO.map((section) => (
          <details key={section.id} className="card !py-3">
            <summary className="text-nude-warm font-medium cursor-pointer list-none flex justify-between items-center">
              <span>{section.title}</span>
              <span className="text-muted text-xs">ver</span>
            </summary>
            {section.intro && <p className="text-muted text-sm mt-2">{section.intro}</p>}
            <ul className="space-y-1 text-sm list-disc pl-5 mt-2">
              {section.tips.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
