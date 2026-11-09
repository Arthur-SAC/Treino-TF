import { useEffect, useState } from "react";
import type { ProximaParte } from "../../lib/proxima-parte";
import {
  FIM_DE_SEMANA_NAO_CONTA, ROTULO_PROXIMA_PARTE, ROTULO_SEQUENCIA, VITORIA_BOTAO, VITORIA_TITULO, linhaFaltam,
} from "../../lib/placas-texto";
import { BOTAO_PLACA, BarraParte, Placa, prefereMenosMovimento } from "./Placa";

interface Props {
  treino: string;
  de: number;
  para: number;
  parte: ProximaParte;
  /** Sábado ou domingo: a sequência não sobe, então não tem faísca. */
  fimDeSemana?: boolean;
  onFechar: () => void;
}

// 8 faíscas saindo do número, alternando as duas cores; a direção vai no CSS
// (--fx/--fy) pra animar só transform/opacity.
const FAISCAS = Array.from({ length: 8 }, (_, i) => {
  const ang = (i / 8) * Math.PI * 2;
  return { fx: `${Math.round(Math.cos(ang) * 70)}px`, fy: `${Math.round(Math.sin(ang) * 70)}px`, cor: i % 2 ? "bg-verm" : "bg-feito" };
});

export function PlacaVitoria({ treino, de, para, parte, fimDeSemana = false, onFechar }: Props) {
  const reduz = prefereMenosMovimento();
  // Mostra o de e, quando a placa termina de entrar, sobe pro para.
  const [valor, setValor] = useState(reduz ? para : de);
  useEffect(() => {
    if (reduz || de === para) return;
    const t = setTimeout(() => setValor(para), 450);
    return () => clearTimeout(t);
  }, [reduz, de, para]);

  return (
    <Placa rotulo={VITORIA_TITULO} onFechar={onFechar}>
      <h2 className="font-serif text-2xl text-nude-warm">{VITORIA_TITULO}</h2>
      <p className="text-muted text-sm mt-1">{treino}</p>

      <p className="text-muted text-xs uppercase tracking-wider mt-5">{ROTULO_SEQUENCIA}</p>
      <div className="relative inline-block mt-1">
        <span key={valor} className="numero-salta inline-block font-serif text-6xl text-verm-2 leading-none">
          {valor}
        </span>
        {!reduz && !fimDeSemana && FAISCAS.map((f, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`faisca absolute left-1/2 top-1/2 -ml-1 -mt-1 h-2 w-2 rounded-pill ${f.cor}`}
            style={{ ["--fx" as string]: f.fx, ["--fy" as string]: f.fy }}
          />
        ))}
      </div>
      {fimDeSemana && <p className="text-muted text-sm mt-2">{FIM_DE_SEMANA_NAO_CONTA}</p>}

      <p className="text-muted text-xs uppercase tracking-wider mt-5">{ROTULO_PROXIMA_PARTE}</p>
      <p className="text-sm text-nude-warm mt-1">{linhaFaltam(parte.faltam, parte.proximoNome)}</p>
      <BarraParte progresso={parte.progresso} />

      <button type="button" onClick={onFechar} className={BOTAO_PLACA}>
        {VITORIA_BOTAO}
      </button>
    </Placa>
  );
}
