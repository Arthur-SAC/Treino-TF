import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { GarmentCard } from "../../../components/GarmentCard";

export function HomeModeView() {
  const garments = useLiveQuery(
    async () => (await db.garments.toArray()).filter((g) => g.mode === "casa"),
    [],
  );
  const porContato = garments?.filter((g) => g.homeEffect === "contato") ?? [];
  const porContraste = garments?.filter((g) => g.homeEffect === "contraste") ?? [];
  // Cinto e salto caem aqui: são de casa e não marcam por nenhuma das duas —
  // um cria ponto focal, o outro muda a postura.
  const resto = garments?.filter((g) => !g.homeEffect) ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo · Casa</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <div className="card mb-3">
        <p className="text-nude-warm text-sm leading-relaxed">
          Sem teto de segurança aqui. O eixo não é esconder ou mostrar — é o que valoriza o que você
          está construindo: bunda, cintura, perna.
        </p>
        <p className="text-muted text-xs mt-2 leading-relaxed">
          Você nomeou duas técnicas sem separar que eram duas.{" "}
          <span className="text-nude-warm">Justa marca por contato</span>: a peça adere e mostra a
          forma do corpo. <span className="text-nude-warm">Folgada marca por contraste</span>: a peça
          cria a forma com o próprio tecido — ombro solto sobre cintura marcada faz o quadril parecer
          maior. Servem à mesma coisa por caminhos opostos, e escolher pelo efeito é diferente de
          escolher pelo caimento.
        </p>
      </div>

      {[
        { titulo: "Marca por contato (justa)", itens: porContato },
        { titulo: "Marca por contraste (folgada)", itens: porContraste },
        { titulo: "Outras peças de casa", itens: resto },
      ].map(({ titulo, itens }) =>
        itens.length === 0 ? null : (
          <div key={titulo} className="mb-4">
            <h2 className="text-muted text-xs uppercase tracking-wider mb-2">{titulo}</h2>
            <div className="space-y-2">
              {itens.map((g) => <GarmentCard key={g.id} garment={g} />)}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
