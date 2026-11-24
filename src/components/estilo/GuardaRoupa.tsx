import { ITENS_ESTILO, type Degrau, type ItemEstilo } from "../../data/estilo-degraus-seed";
import { precisaConferir, type ComprasEstilo } from "../../lib/estilo-degraus";
import { diaMes, temLavagem, textoLavagem } from "../../lib/estilo-texto";

const DEGRAUS: Degrau[] = [1, 2, 3];

export function GuardaRoupa({ compras, quadrilAtual, cinturaAtual = null }: {
  compras: ComprasEstilo;
  quadrilAtual: number | null;
  cinturaAtual?: number | null;
}) {
  const itens = ITENS_ESTILO.filter((i) => compras[i.id]);
  const atualDe = (i: ItemEstilo) => (i.medida === "quadril" ? quadrilAtual : i.medida === "cintura" ? cinturaAtual : null);
  return (
    <section className="space-y-2" aria-labelledby="guarda-roupa">
      <h2 id="guarda-roupa" className="text-nude-warm font-medium">Guarda-roupa</h2>
      {itens.length === 0 ? (
        <p className="text-muted text-sm">O que você comprar ou já tiver aparece aqui.</p>
      ) : (
        DEGRAUS.map((d) => {
          const doDegrau = itens.filter((i) => i.degrau === d).sort((a, b) => a.ordem - b.ordem);
          if (doDegrau.length === 0) return null;
          return (
            <div key={d} className="space-y-2">
              <h3 className="text-muted text-xs uppercase tracking-wider">Degrau {d}</h3>
              <ul className="space-y-2">
                {doDegrau.map((i) => {
                  const c = compras[i.id];
                  const conferir = precisaConferir(c, atualDe(i));
                  return (
                    <li key={i.id} className="card text-sm space-y-0.5">
                      <p className="text-nude-warm">{i.nome}</p>
                      <p className="text-muted text-xs">
                        {temLavagem(i) && <>{textoLavagem(i)} · </>}
                        {diaMes(c.data)}
                        {c.valorPago != null && c.valorPago >= 0 && <> · R$ {c.valorPago.toLocaleString("pt-BR")}</>}
                      </p>
                      {conferir && <p className="text-xs text-verm-2">Confira se ainda serve</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}
    </section>
  );
}
