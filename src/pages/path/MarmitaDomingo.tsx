import { Link } from "react-router-dom";
import { PathTabs } from "../../components/PathTabs";
import { ROTEIRO_DOMINGO, MARMITA_TETO_MIN } from "../../data/marmita-domingo-seed";

export function MarmitaDomingo() {
  const maoNaMassa = ROTEIRO_DOMINGO.reduce((s, e) => s + e.maoNaMassaMin, 0);

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <h1 className="font-serif text-2xl text-nude flex-1">Trilha</h1>
        <Link to="/trilha/alimentacao" className="text-muted text-sm">&larr; Alimentação</Link>
      </div>
      <PathTabs />

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-1">Domingo · o lote da semana</h2>
        <p className="text-nude text-sm leading-relaxed">
          <span className="text-nude-warm">{maoNaMassa} min</span> de pé na cozinha, dentro do teto
          de {MARMITA_TETO_MIN}. O resto é panela trabalhando sozinha — por isso a ordem importa: o
          que demora mais vai ao fogo primeiro.
        </p>
        <p className="text-muted text-xs mt-2 leading-relaxed">
          Depois deste domingo, dia de semana é montar e esquentar. É o domingo que carrega a
          semana, não a força de vontade das 19h30.
        </p>
      </div>

      <ol className="space-y-3">
        {ROTEIRO_DOMINGO.map((etapa) => (
          <li key={etapa.id} className="card">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-nude text-xs">{etapa.ordem === 0 ? "véspera" : etapa.ordem}</span>
              <h3 className="text-nude-warm font-medium flex-1">{etapa.titulo}</h3>
            </div>
            <p className="text-muted text-xs mb-1.5">
              {etapa.maoNaMassaMin} min de mão na massa
              {etapa.sozinhoMin > 0 && ` · ${etapa.sozinhoMin} min cozinhando sozinho`}
            </p>
            <p className="text-nude text-sm leading-relaxed">{etapa.comoFazer}</p>
            <p className="text-nude-warm text-xs mt-1.5">Rende: {etapa.rende}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
