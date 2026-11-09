import { useEffect, useState, type ReactNode } from "react";

/** Com "reduzir movimento" ligado, nada conta nem pula: o número final aparece
 *  direto. O CSS já troca as animações por fade; isto cuida do que é JS. */
export function prefereMenosMovimento(): boolean {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface Props {
  rotulo: string;
  onFechar: () => void;
  children: ReactNode;
}

/** Moldura de toda placa: cobre a tela, trava o scroll do body e fecha no ESC,
 *  como o ExerciseInfoModal. Mora fora do `.tela-entra` (que tem transform e
 *  prenderia o `fixed` dentro da tela). */
export function Placa({ rotulo, onFechar, children }: Props) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onFechar]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={rotulo}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#2a1416]/40"
    >
      <div className="card placa-entra relative w-full max-w-sm text-center overflow-hidden">
        {children}
      </div>
    </div>
  );
}

/** Barra da próxima parte: nasce vazia e enche até `progresso` (0..1). */
export function BarraParte({ progresso }: { progresso: number }) {
  const [valor, setValor] = useState(() => (prefereMenosMovimento() ? progresso : 0));
  useEffect(() => {
    const t = setTimeout(() => setValor(progresso), 50);
    return () => clearTimeout(t);
  }, [progresso]);
  return (
    <div className="mt-2 h-2 rounded-pill bg-bg-deep overflow-hidden" aria-hidden="true">
      <div
        className="h-full w-full origin-left rounded-pill bg-feito barra-enche"
        style={{ transform: `scaleX(${valor})` }}
      />
    </div>
  );
}

export const BOTAO_PLACA =
  "w-full mt-5 rounded-md py-3 font-medium bg-verm-2 text-white";
