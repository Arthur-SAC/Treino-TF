import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/beleza/pele-cabelo", label: "Pele" },
  { to: "/beleza/estilo", label: "Estilo" },
  { to: "/beleza/maquiagem", label: "Maquiagem" },
  { to: "/beleza/voz", label: "Voz" },
];

export function BeautyTabs() {
  return (
    <div className="flex gap-2 mb-4">
      {ITEMS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 py-2 rounded-md text-xs text-center ${
              isActive ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </div>
  );
}
