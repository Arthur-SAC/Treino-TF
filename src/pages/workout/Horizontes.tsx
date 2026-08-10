import { Link } from "react-router-dom";
import { GuideAccordion } from "../../components/GuideAccordion";
import { HORIZONTES } from "../../data/horizontes-seed";

export function Horizontes() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino" className="text-muted text-sm">&larr; Treino</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Até onde dá pra chegar</h1>
      </div>
      <p className="text-muted text-sm mb-4">
        Duas trilhas rodando ao mesmo tempo, com sinceridade pra não te iludir. A TRH não tem data —
        então nada aqui espera por ela: <span className="text-nude-warm">perder a barriga e construir glúteo agora</span> tem
        teto sem hormônio, e ainda assim é o que mais aproxima o corpo do que você quer, vestida e na cama.
      </p>
      <GuideAccordion sections={HORIZONTES} />
      <p className="text-muted text-[0.7rem] mt-4">
        Os números de WHR são estimativas pra dar um norte — cada corpo responde do seu jeito.
      </p>
    </div>
  );
}
