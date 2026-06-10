import { Link } from "react-router-dom";
import { BeautyTabs } from "../../components/BeautyTabs";
import { DisclaimerCard } from "../../components/DisclaimerCard";
import { CLAREAMENTO_GUIDE } from "../../data/clareamento-guide-seed";

export function ClareamentoHome() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Clareamento</h1>
      </div>
      <BeautyTabs />

      <DisclaimerCard text="Boas práticas gerais, não substituem dermatologista — sobretudo para a região anal e para ativos potentes (hidroquinona, peelings). As aplicações passo a passo de axila e íntima ficam no Skincare." />

      <div className="space-y-2 mt-3">
        {CLAREAMENTO_GUIDE.map((section) => (
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
