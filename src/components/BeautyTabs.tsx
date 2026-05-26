import { NavLink } from "react-router-dom";

export function BeautyTabs() {
  return (
    <div className="flex gap-2 mb-4">
      <NavLink
        to="/beleza/pele-cabelo"
        className={({ isActive }) =>
          `flex-1 py-2 rounded-md text-sm text-center ${
            isActive ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
          }`
        }
      >
        Pele & cabelo
      </NavLink>
      <NavLink
        to="/beleza/estilo"
        className={({ isActive }) =>
          `flex-1 py-2 rounded-md text-sm text-center ${
            isActive ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
          }`
        }
      >
        Estilo
      </NavLink>
    </div>
  );
}
