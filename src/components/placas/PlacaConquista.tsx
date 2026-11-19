import { CONQUISTA_BOTAO, CONQUISTA_ROTULO } from "../../lib/placas-texto";
import { BOTAO_PLACA, Placa } from "./Placa";

// Conquista é a placa com verde-água: a cor de "feito" (spec 2026-11-09,
// paleta). A placa de desbloqueio saiu com a linha do tempo (2026-11-19): o
// desbloqueio agora chega como oferta (OfertaCard).
const SELO = "mx-auto mb-3 h-1.5 w-12 rounded-pill bg-feito";

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
