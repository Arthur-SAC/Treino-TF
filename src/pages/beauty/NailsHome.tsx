import { Link } from "react-router-dom";
import { BeautyTabs } from "../../components/BeautyTabs";
import { NAILS_GUIDE } from "../../data/nails-guide-seed";

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

      <div className="space-y-2">
        {NAILS_GUIDE.map((section) => (
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
