import type { Oferta } from "../lib/ofertas";
import { CYCLES } from "../data/cycles-seed";
import { etiquetaHorario } from "../lib/placas-texto";

const ETIQUETA = "inline-block rounded-pill border border-feito/40 px-3 py-1 text-xs text-feito tabular-nums";

/** "Pronta pra próxima" (spec 2026-11-19, seção 4): o critério bateu, o app
 *  oferece e ela decide. Nada avança sem o "Aceitar". `rodizio` é o que a
 *  parte nova faz com a noite (quem calcula é a tela, com os minutos reais);
 *  sem ele, vale o `oferta.rodizio` do desbloqueio, se houver. */
export function OfertaCard({ oferta, rodizio, onAceitar, onAgoraNao }: {
  oferta: Oferta;
  rodizio?: string;
  onAceitar: () => void;
  onAgoraNao: () => void;
}) {
  const entra =
    oferta.tipo === "desbloqueio" ? oferta.entra
      : oferta.tipo === "ciclo" ? `O treino passa pro ciclo ${CYCLES.find((c) => c.id === oferta.para)?.name ?? oferta.para}.`
        : undefined;
  const minutos = oferta.tipo === "ciclo" ? undefined : oferta.minutos;
  const horario = oferta.tipo === "desbloqueio" ? oferta.horario : null;
  const noite = rodizio ?? (oferta.tipo === "desbloqueio" ? oferta.rodizio : undefined);

  return (
    <section className="card border-feito/50 space-y-2" aria-labelledby="oferta-titulo">
      <p id="oferta-titulo" className="text-feito text-xs uppercase tracking-wider">Pronta pra próxima</p>
      <h2 className="font-serif text-xl text-nude-warm">{oferta.titulo}</h2>
      {entra && <p className="text-sm text-nude-warm">{entra}</p>}
      <p className="text-muted text-sm">{oferta.praQue}</p>
      {(minutos !== undefined || horario) && (
        <div className="flex flex-wrap gap-2">
          {minutos !== undefined && <span className={ETIQUETA}>{`${minutos} min`}</span>}
          {horario && <span className={ETIQUETA}>{etiquetaHorario(horario)}</span>}
        </div>
      )}
      {noite && <p className="text-muted text-xs">{noite}</p>}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onAceitar} className="flex-1 rounded-md py-2 text-sm font-medium bg-wine text-nude-warm">
          Aceitar
        </button>
        <button type="button" onClick={onAgoraNao} className="flex-1 rounded-md py-2 text-sm border border-bg-border text-muted">
          Agora não
        </button>
      </div>
    </section>
  );
}
