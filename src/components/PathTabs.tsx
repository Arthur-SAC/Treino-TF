import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/trilha", label: "Marcos", end: true },
  { to: "/trilha/alimentacao", label: "Alimentação" },
  { to: "/trilha/diario", label: "Diário" },
  { to: "/trilha/direitos", label: "Direitos" },
];

export function PathTabs() {
  return (
    <div className="flex gap-2 mb-4">
      {ITEMS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 py-2 rounded-md text-sm text-center ${
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
