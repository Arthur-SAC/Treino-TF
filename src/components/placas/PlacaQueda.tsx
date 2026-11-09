import { useEffect, useState } from "react";
import type { ProximaParte } from "../../lib/proxima-parte";
import {
  QUEDA_BOTAO, QUEDA_NOTA_PARTE, QUEDA_TITULO, ROTULO_PROXIMA_PARTE, ROTULO_SEQUENCIA, linhaFaltam, linhaQueda,
} from "../../lib/placas-texto";
import { BOTAO_PLACA, BarraParte, Placa, prefereMenosMovimento } from "./Placa";

interface Props {
  de: number;
  diasPerdidos: number;
  parte: ProximaParte;
  onFechar: () => void;
}

const PASSO_MS = 120;

export function PlacaQueda({ de, diasPerdidos, parte, onFechar }: Props) {
  const reduz = prefereMenosMovimento();
  // A sequência desce de um em um até zero; a próxima parte fica onde estava.
  const [valor, setValor] = useState(reduz ? 0 : de);
  useEffect(() => {
    if (reduz || de <= 0) return;
    const id = setInterval(() => {
      setValor((v) => {
        if (v <= 1) clearInterval(id);
        return Math.max(0, v - 1);
      });
    }, PASSO_MS);
    return () => clearInterval(id);
  }, [reduz, de]);

  return (
    <Placa rotulo={QUEDA_TITULO} onFechar={onFechar}>
      <div className="placa-treme">
        <h2 className="font-serif text-2xl text-nude-warm">{QUEDA_TITULO}</h2>
        <p className="text-muted text-sm mt-1">{linhaQueda(diasPerdidos)}</p>

        <p className="text-muted text-xs uppercase tracking-wider mt-5">{ROTULO_SEQUENCIA}</p>
        <span key={valor} className="numero-salta inline-block mt-1 font-serif text-6xl text-verm-3 leading-none">
          {valor}
        </span>
      </div>

      <p className="text-muted text-xs uppercase tracking-wider mt-5">{ROTULO_PROXIMA_PARTE}</p>
      <p className="text-sm text-nude-warm mt-1">{linhaFaltam(parte.faltam, parte.proximoNome)}</p>
      <BarraParte progresso={parte.progresso} />
      <p className="text-muted text-xs mt-1">{QUEDA_NOTA_PARTE}</p>

      <button type="button" onClick={onFechar} className={BOTAO_PLACA}>
        {QUEDA_BOTAO}
      </button>
    </Placa>
  );
}
