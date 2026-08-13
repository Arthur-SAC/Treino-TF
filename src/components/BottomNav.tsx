import { NavLink } from "react-router-dom";
import { HomeIcon } from "../icons/HomeIcon";
import { DumbbellIcon } from "../icons/DumbbellIcon";
import { RulerIcon } from "../icons/RulerIcon";
import { HeartIcon } from "../icons/HeartIcon";
import { RoseIcon } from "../icons/RoseIcon";
import { SparkIcon } from "../icons/SparkIcon";

// Vitalidade ganhou aba própria em 2026-08-13, depois de ela relatar que foi
// procurar o conteúdo de intimidade e não achou. O motivo era estrutural: as
// sequências viviam na 8ª seção de Treino → Movimento, o streak só era
// alcançável por um atalho da tela inicial (a página nem estava nas abas da
// Trilha), e a lingerie em Beleza → Estilo → Íntimo. Três abas diferentes pra
// montar uma noite. Conteúdo que existe e não é alcançável é a mesma falha que
// este projeto persegue no seed — aqui ela estava na navegação.
//
// O rótulo é "Vitalidade" pela mesma razão de sempre: ele fica visível pra quem
// olhar o celular dela, e o ambiente onde ela mora não é receptivo. O nome
// nunca descreve o que tem dentro.
const items = [
  { to: "/", label: "Hoje", Icon: HomeIcon, end: true },
  { to: "/treino", label: "Treino", Icon: DumbbellIcon },
  { to: "/corpo", label: "Corpo", Icon: RulerIcon },
  { to: "/beleza", label: "Beleza", Icon: HeartIcon },
  // Rota de primeiro nível (e não mais /trilha/vitalidade) porque agora ela é
  // uma aba irmã da Trilha, não uma página dentro dela: com o caminho aninhado,
  // as duas abas acendiam juntas.
  { to: "/vitalidade", label: "Vitalidade", Icon: SparkIcon },
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
                // 0.62rem e truncate: com seis abas, "Vitalidade" estoura a
                // largura da coluna num celular estreito e empurra as vizinhas.
                `flex flex-col items-center gap-0.5 py-2 px-0.5 text-[0.62rem] ${
                  isActive ? "text-nude" : "text-muted"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={isActive ? "text-nude" : "text-muted"} />
                  <span className="w-full text-center truncate">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
