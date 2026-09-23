import { Link } from "react-router-dom";

interface Shortcut { icon: string; label: string; sub: string; to: string }

// Rótulos neutros de propósito (2026-09-23): o Hoje fica aberto na tela, e o
// ambiente onde ela mora não é receptivo. O conteúdo de cada página não mudou —
// só o que aparece do lado de fora. Rede em tests/lib/discricao-rotulos.test.ts.
export const SHORTCUTS: Shortcut[] = [
  { icon: "◉", label: "Vitalidade", sub: "rotina diária · progresso", to: "/vitalidade" },
  { icon: "✚", label: "Saúde · planos", sub: "consultas · perguntas pro médico", to: "/trilha/fertilidade" },
  { icon: "♡", label: "Apoio", sub: "dia difícil · rede de apoio", to: "/trilha/apoio" },
  { icon: "❋", label: "Cabelo", sub: "corte do cacho · cuidados", to: "/beleza/pele-cabelo/haircare" },
  { icon: "❖", label: "Estilo", sub: "peças · combinações", to: "/beleza/estilo/pecas" },
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
