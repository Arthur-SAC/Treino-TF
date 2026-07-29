import { pausaDaVez } from "../lib/micro-pausas";
import type { MicroPausa } from "../data/micro-pausas-seed";

const DISCRICAO_LABEL: Record<MicroPausa["discricao"], string> = {
  invisivel: "Discreto — dá pra fazer na mesa",
  "precisa-de-canto": "Precisa de um cantinho",
  normal: "Envolve se levantar",
};

/** Card com os movimentos da pausa nº `n` do dia — o que fazer, de fato, na
 *  micro-pausa de postura. Segue o mesmo padrão visual de RecipeModal e
 *  SkincareRoutineModal. "Feito" grava a pausa (incrementa o contador do dia)
 *  e fecha. */
export function MicroPausaModal({ n, onClose, onFeito }: { n: number; onClose: () => void; onFeito: () => void }) {
  const movimentos = pausaDaVez(n);

  function feito() {
    onFeito();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-serif text-xl text-nude">Micro-pausa</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-muted text-lg px-2">✕</button>
        </div>

        <ol className="space-y-3 mb-4">
          {movimentos.map((m) => (
            <li key={m.id} className="border-l border-bg-border pl-3">
              <p className="text-nude-warm text-sm font-medium">
                {m.nome} <span className="text-muted text-xs font-normal">· {m.duracao}</span>
              </p>
              <p className="text-nude/80 text-[11px] mt-0.5">{DISCRICAO_LABEL[m.discricao]}</p>
              <p className="text-muted text-xs mt-1 leading-relaxed">{m.como}</p>
              <p className="text-muted text-xs mt-1 leading-relaxed italic">{m.porque}</p>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={feito}
          className="w-full rounded-md py-2 text-sm mt-1 bg-wine text-nude-warm"
        >
          Feito ✓
        </button>
      </div>
    </div>
  );
}
