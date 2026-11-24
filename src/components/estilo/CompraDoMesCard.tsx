import { useState } from "react";
import { Link } from "react-router-dom";
import type { ItemEstilo } from "../../data/estilo-degraus-seed";
import { tamanhoPorQuadril } from "../../lib/estilo-degraus";
import { AVISO_TABELA, diaMes, faixaDePreco, temLavagem, textoLavagem } from "../../lib/estilo-texto";

type Medida = { cm: number; data: string; velha: boolean } | null;

export function CompraDoMesCard({ estado, medida, degrau = 1, onComprei, onPular }: {
  estado: { estado: "sugestao"; item: ItemEstilo } | { estado: "fechado"; acao: "comprei" | "pulei"; item: ItemEstilo | null } | { estado: "degrau-completo" };
  medida: Medida;
  degrau?: 1 | 2 | 3;
  onComprei: (item: ItemEstilo, valorPago?: number) => void;
  onPular: () => void;
}) {
  const [valor, setValor] = useState("");

  if (estado.estado === "degrau-completo") {
    return (
      <section className="card space-y-1">
        <h2 className="font-serif text-xl text-nude-warm">{degrau === 3 ? "Você completou todos os degraus" : "Este degrau está completo"}</h2>
        <p className="text-muted text-sm">
          {degrau === 3
            ? "Todas as peças da lista estão com você."
            : "Todas as peças da lista estão com você. O próximo degrau aparece quando você quiser."}
        </p>
      </section>
    );
  }
  if (estado.estado === "fechado") {
    return (
      <section className="card space-y-1">
        <h2 className="font-serif text-xl text-nude-warm">{estado.acao === "comprei" ? "Comprado este mês" : "Este mês"}</h2>
        {estado.acao === "comprei" && estado.item && <p className="text-sm text-nude-warm">{estado.item.nome}</p>}
        {estado.acao === "pulei" && (
          <p className="text-muted text-sm">Esse mês fica de fora. A mesma peça volta no mês que vem.</p>
        )}
      </section>
    );
  }

  const { item } = estado;
  return (
    <section className="card space-y-3" aria-labelledby="compra-mes">
      <p className="text-feito text-xs uppercase tracking-wider">Peça do mês</p>
      <h2 id="compra-mes" className="font-serif text-xl text-nude-warm">{item.nome}</h2>
      <p className="text-muted text-sm">{item.praQue}</p>
      <dl className="text-sm space-y-1">
        {item.cores.length > 0 && (
          <div><dt className="inline text-muted">Cores: </dt><dd className="inline">{item.cores.join(", ")}</dd></div>
        )}
        <div><dt className="inline text-muted">Faixa: </dt><dd className="inline tabular-nums">{faixaDePreco(item)}</dd></div>
        <div><dt className="inline text-muted">Onde: </dt><dd className="inline">{item.onde}</dd></div>
        {temLavagem(item) && (
          <div><dt className="inline text-muted">Lavagem: </dt><dd className="inline">{textoLavagem(item)}</dd></div>
        )}
      </dl>
      {item.dica && <p className="text-muted text-xs">{item.dica}</p>}
      {item.medida !== null && <Tamanho item={item} medida={medida} />}
      <label className="block text-sm">
        <span className="text-muted">Valor pago (opcional)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="mt-1 block w-full rounded-md bg-bg border border-bg-border px-3 py-2"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onComprei(item, valor.trim() === "" || Number.isNaN(Number(valor)) ? undefined : Number(valor))}
          className="flex-1 rounded-md py-2 text-sm font-medium bg-wine text-nude-warm"
        >
          Comprei
        </button>
        <button type="button" onClick={onPular} className="flex-1 rounded-md py-2 text-sm border border-bg-border text-muted">
          Pular este mês
        </button>
      </div>
    </section>
  );
}

function Tamanho({ item, medida }: { item: ItemEstilo; medida: Medida }) {
  const quadril = item.medida === "quadril";
  const rotulo = quadril ? "do quadril" : "da cintura";
  if (!medida) {
    return (
      <p className="text-sm">
        Sem medida {rotulo} ainda. <Link to="/corpo/medidas" className="underline text-verm-2">Medir {quadril ? "o quadril" : "a cintura"}</Link> pra saber o tamanho.
      </p>
    );
  }
  return (
    <div className="space-y-1 text-sm">
      <p>
        {item.medida === "quadril" ? (
          <>Tamanho: <strong className="text-nude-warm">{tamanhoPorQuadril(medida.cm)}</strong> · </>
        ) : (
          <>Cintura: </>
        )}
        <span className="tabular-nums">{medida.cm} cm</span>, medido em {diaMes(medida.data)}
      </p>
      {medida.velha && (
        <p className="text-muted">
          Essa medida é antiga. <Link to="/corpo/medidas" className="underline text-verm-2">Medir de novo</Link> antes de comprar.
        </p>
      )}
      <p className="text-muted text-xs">{AVISO_TABELA}</p>
    </div>
  );
}
