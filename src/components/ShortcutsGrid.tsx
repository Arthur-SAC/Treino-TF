import { Link } from "react-router-dom";

interface Shortcut { icon: string; label: string; sub: string; to: string }

const SHORTCUTS: Shortcut[] = [
  { icon: "✚", label: "Fertilidade & TRH", sub: "seu plano · perguntas pro médico", to: "/trilha/fertilidade" },
  { icon: "♡", label: "Apoio", sub: "dia difícil · disforia · rede", to: "/trilha/apoio" },
  { icon: "♪", label: "Voz", sub: "treino diário 15 min", to: "/beleza/voz" },
  { icon: "✦", label: "Depilação", sub: "registro + plano", to: "/beleza/depilacao" },
  { icon: "❋", label: "Cabelo", sub: "corte do cacho · cuidados", to: "/beleza/pele-cabelo/haircare" },
  { icon: "❖", label: "Estilo", sub: "discreto · combinações", to: "/beleza/estilo/pecas" },
  { icon: "◈", label: "Corpo", sub: "medidas · fotos", to: "/corpo/medidas" },
  { icon: "❀", label: "Maquiagem", sub: "rotinas", to: "/beleza/maquiagem" },
];

export function ShortcutsGrid() {
  return (
    <section className="space-y-2">
      <h2 className="text-muted text-xs uppercase tracking-wider pt-2">Quando precisar</h2>
      <div className="grid grid-cols-2 gap-2">
        {SHORTCUTS.map((s) => (
          <Link key={s.label} to={s.to} aria-label={s.label} className="card block">
            <span className="text-base">{s.icon}</span>
            <span className="block text-nude-warm text-sm font-medium mt-1.5">{s.label}</span>
            <span className="block text-muted text-[11px] mt-0.5">{s.sub}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
