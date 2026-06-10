import { Link } from "react-router-dom";
import { BeautyTabs } from "../../components/BeautyTabs";
import { DisclaimerCard } from "../../components/DisclaimerCard";

export function BeautyHome() {
  return (
    <div className="p-4 pb-24 space-y-3">
      <h1 className="font-serif text-2xl text-nude">Beleza</h1>
      <BeautyTabs />
      <DisclaimerCard text="Antes de começar tratamentos com ácidos/clareadores, vale uma consulta com dermatologista. O app sugere boas práticas, mas não substitui orientação profissional." />
      <Link to="/beleza/pele-cabelo/skincare" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Skincare</h3>
        <p className="text-muted text-sm mt-1">Rotinas manhã/noite, áreas específicas, checklist</p>
      </Link>
      <Link to="/beleza/pele-cabelo/haircare" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Cabelo</h3>
        <p className="text-muted text-sm mt-1">Jornada de crescimento dos cachos</p>
      </Link>
      <Link to="/beleza/pele-cabelo/unhas" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Unhas</h3>
        <p className="text-muted text-sm mt-1">Curtas e cuidadas: saúde, cutícula, esmalte discreto x ousado</p>
      </Link>
      <Link to="/beleza/pele-cabelo/produtos" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Produtos</h3>
        <p className="text-muted text-sm mt-1">Catálogo + estoque</p>
      </Link>
      <Link to="/beleza/pele-cabelo/clareamento" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Clareamento</h3>
        <p className="text-muted text-sm mt-1">Manchas de sol, axila, virilha, perianal — ativos seguros, prazo, FPS</p>
      </Link>
      <Link to="/beleza/depilacao" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Depilação</h3>
        <p className="text-muted text-sm mt-1">Registro de sessões (laser, cera, etc.) + custos + evolução</p>
      </Link>
      <Link to="/beleza/maquiagem" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Maquiagem</h3>
        <p className="text-muted text-sm mt-1">5 rotinas pra ocasiões diferentes + produtos brasileiros</p>
      </Link>
      <Link to="/beleza/voz" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Voz</h3>
        <p className="text-muted text-sm mt-1">Treino vocal (passing + sensual) com gravação</p>
      </Link>
    </div>
  );
}
