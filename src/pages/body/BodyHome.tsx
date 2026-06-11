import { Link } from "react-router-dom";

export function BodyHome() {
  return (
    <div className="p-4 pb-24 space-y-3">
      <h1 className="font-serif text-2xl text-nude mb-2">Corpo</h1>
      <Link to="/corpo/silhueta" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Silhueta</h3>
        <p className="text-muted text-sm mt-1">Estratégia ampulheta: WHR, ombro/quadril, %BF, alavanca do ciclo</p>
      </Link>
      <Link to="/corpo/medidas" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Medidas</h3>
        <p className="text-muted text-sm mt-1">Registrar e ver evolução</p>
      </Link>
      <Link to="/corpo/fotos" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Fotos</h3>
        <p className="text-muted text-sm mt-1">Progresso por imagem</p>
      </Link>
      <Link to="/corpo/comparacao" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Comparação</h3>
        <p className="text-muted text-sm mt-1">Atual × objetivo × antiga</p>
      </Link>
    </div>
  );
}
