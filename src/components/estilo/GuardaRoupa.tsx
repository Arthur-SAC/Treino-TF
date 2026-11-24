import { ITENS_ESTILO } from "../../data/estilo-degraus-seed";
import { precisaConferir, type ComprasEstilo } from "../../lib/estilo-degraus";
import { diaMes, textoLavagem } from "../../lib/estilo-texto";

export function GuardaRoupa({ compras, quadrilAtual }: { compras: ComprasEstilo; quadrilAtual: number | null }) {
  const itens = ITENS_ESTILO.filter((i) => compras[i.id]);
  return (
    <section className="space-y-2" aria-labelledby="guarda-roupa">
      <h2 id="guarda-roupa" className="text-nude-warm font-medium">Guarda-roupa</h2>
      {itens.length === 0 ? (
        <p className="text-muted text-sm">O que você comprar ou já tiver aparece aqui.</p>
      ) : (
        <ul className="space-y-2">
          {itens.map((i) => {
            const c = compras[i.id];
            const conferir = i.medida === "quadril" && precisaConferir(c, quadrilAtual);
            return (
              <li key={i.id} className="card text-sm space-y-0.5">
                <p className="text-nude-warm">{i.nome}</p>
                <p className="text-muted text-xs">
                  {textoLavagem(i)} · {diaMes(c.data)}
                  {c.valorPago != null && <> · R$ {c.valorPago}</>}
                </p>
                {conferir && <p className="text-xs text-verm-2">Confira se ainda serve</p>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
