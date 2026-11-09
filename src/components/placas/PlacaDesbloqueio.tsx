import {
  CONQUISTA_BOTAO, CONQUISTA_ROTULO, DESBLOQUEIO_BOTAO, etiquetaHorario, tituloDesbloqueio,
} from "../../lib/placas-texto";
import { BOTAO_PLACA, Placa } from "./Placa";

interface DesbloqueioProps {
  titulo: string;
  entra: string;
  praQue: string;
  minutos: number;
  horario: string | null;
  onFechar: () => void;
}

// Conquista e desbloqueio são as únicas placas com verde-água: a cor de "feito"
// (spec 2026-11-09, paleta).
const SELO = "mx-auto mb-3 h-1.5 w-12 rounded-pill bg-feito";
const ETIQUETA = "inline-block rounded-pill border border-feito/40 px-3 py-1 text-sm text-feito tabular-nums";

/** "Parabéns, X desbloqueado": o que entra no dia, pra que serve, quanto tempo
 *  e em que horário. */
export function PlacaDesbloqueio({ titulo, entra, praQue, minutos, horario, onFechar }: DesbloqueioProps) {
  const t = tituloDesbloqueio(titulo);
  return (
    <Placa rotulo={t} onFechar={onFechar}>
      <div className={SELO} aria-hidden="true" />
      <h2 className="font-serif text-2xl text-nude-warm">{t}</h2>
      <p className="text-sm text-nude-warm mt-3 text-left">{entra}</p>
      <p className="text-muted text-sm mt-2 text-left">{praQue}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span className={ETIQUETA}>{`${minutos} min`}</span>
        {horario && <span className={ETIQUETA}>{etiquetaHorario(horario)}</span>}
      </div>
      <button type="button" onClick={onFechar} className={BOTAO_PLACA}>
        {DESBLOQUEIO_BOTAO}
      </button>
    </Placa>
  );
}

export function PlacaConquista({ titulo, texto, onFechar }: { titulo: string; texto: string; onFechar: () => void }) {
  return (
    <Placa rotulo={titulo} onFechar={onFechar}>
      <div className={SELO} aria-hidden="true" />
      <p className="text-feito text-xs uppercase tracking-wider">{CONQUISTA_ROTULO}</p>
      <h2 className="font-serif text-2xl text-nude-warm mt-1">{titulo}</h2>
      <p className="text-muted text-sm mt-2">{texto}</p>
      <button type="button" onClick={onFechar} className={BOTAO_PLACA}>
        {CONQUISTA_BOTAO}
      </button>
    </Placa>
  );
}
