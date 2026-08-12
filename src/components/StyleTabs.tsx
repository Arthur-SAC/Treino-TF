import { NavLink } from "react-router-dom";

// A ordem é a do dia dela, não a do banco: ela não se veste por tipo de peça,
// se veste por contexto. Paleta, Peças, Combinações, Looks e Wishlist continuam
// existindo — são ferramentas que atravessam os três modos (a mesma cor vale em
// público e no íntimo), e por isso vêm depois, não antes.
const ITEMS = [
  { to: "/beleza/estilo/publico", label: "Público" },
  { to: "/beleza/estilo/casa", label: "Casa" },
  { to: "/beleza/estilo/intimo", label: "Íntimo" },
  { to: "/beleza/estilo", label: "Paleta", end: true },
  { to: "/beleza/estilo/pecas", label: "Peças" },
  { to: "/beleza/estilo/combinacoes", label: "Combinações" },
  { to: "/beleza/estilo/looks", label: "Looks" },
  { to: "/beleza/estilo/wishlist", label: "Wishlist" },
];

export function StyleTabs() {
  return (
    <div className="overflow-x-auto -mx-4 px-4 mb-4">
      <div className="flex gap-2 w-max">
        {ITEMS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
                isActive ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
