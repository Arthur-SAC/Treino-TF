import { Link, useLocation } from "react-router-dom";
import { HomeIcon } from "../icons/HomeIcon";
import { DumbbellIcon } from "../icons/DumbbellIcon";
import { RulerIcon } from "../icons/RulerIcon";
import { SparkIcon } from "../icons/SparkIcon";
import { abaDaRota, type Aba } from "../lib/abas";

// Quatro abas (eram seis) por decisão dela em 2026-10-02: ela gosta do Hoje e
// achava as outras abas confusas. Nenhuma rota mudou; Progresso e Guia são
// índices que apontam pras telas de sempre. Como as rotas antigas não seguem
// as abas novas (/trilha mistura Marcos e Alimentação), a aba acesa vem de
// abaDaRota, não do prefixo do NavLink.
//
// O rótulo é "Vitalidade" porque ele fica visível pra quem olhar o celular
// dela, e o ambiente onde ela mora não é receptivo. O nome nunca descreve o
// que tem dentro. A rota é de primeiro nível (/vitalidade, não
// /trilha/vitalidade) pra não acender junto com outra aba.
const items: { to: string; label: string; aba: Aba; Icon: typeof HomeIcon }[] = [
  { to: "/", label: "Hoje", aba: "hoje", Icon: HomeIcon },
  { to: "/progresso", label: "Progresso", aba: "progresso", Icon: RulerIcon },
  { to: "/guia", label: "Guia", aba: "guia", Icon: DumbbellIcon },
  { to: "/vitalidade", label: "Vitalidade", aba: "vitalidade", Icon: SparkIcon },
];

export function BottomNav() {
  const atual = abaDaRota(useLocation().pathname);
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-bg-deep border-t border-bg-border z-50">
      <ul className="flex">
        {items.map(({ to, label, aba, Icon }) => {
          const ativa = atual === aba;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-current={ativa ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 px-0.5 text-xs ${ativa ? "text-nude" : "text-muted"}`}
              >
                <Icon className={ativa ? "text-nude" : "text-muted"} />
                <span className="w-full text-center truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
