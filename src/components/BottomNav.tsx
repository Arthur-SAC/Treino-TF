import { NavLink } from "react-router-dom";
import { HomeIcon } from "../icons/HomeIcon";
import { DumbbellIcon } from "../icons/DumbbellIcon";
import { RulerIcon } from "../icons/RulerIcon";
import { HeartIcon } from "../icons/HeartIcon";
import { RoseIcon } from "../icons/RoseIcon";

const items = [
  { to: "/", label: "Hoje", Icon: HomeIcon, end: true },
  { to: "/treino", label: "Treino", Icon: DumbbellIcon },
  { to: "/corpo", label: "Corpo", Icon: RulerIcon },
  { to: "/beleza", label: "Beleza", Icon: HeartIcon },
  { to: "/trilha", label: "Trilha", Icon: RoseIcon },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-bg-deep border-t border-bg-border z-50">
      <ul className="flex">
        {items.map(({ to, label, Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-[0.7rem] ${
                  isActive ? "text-nude" : "text-muted"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={isActive ? "text-nude" : "text-muted"} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
