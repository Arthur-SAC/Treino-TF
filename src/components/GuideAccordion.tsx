export interface GuideSection {
  id: string;
  title: string;
  intro?: string;
  tips: string[];
}

interface Props {
  sections: GuideSection[];
  className?: string;
}

// Lista de seções de guia (cabelo, unhas, clareamento, estilo discreto) renderizada como
// cards expansíveis. Centraliza o markup que antes estava repetido em cada página.
export function GuideAccordion({ sections, className = "" }: Props) {
  return (
    <div className={`space-y-2 ${className}`.trim()}>
      {sections.map((section) => (
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
  );
}
