import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { RoutineItem } from "../lib/today-routine";

export interface RoutineRowProps {
  item: RoutineItem;
  done: boolean;
  onToggle: () => void;
  rightSlot?: ReactNode;
  navValue?: string;
  onOpen?: () => void; // itens control:"recipe": abre a receita ao tocar no corpo
  /** Horário já resolvido (ajuste da usuária ou padrão), formatado pra exibir. */
  hora?: string;
}

function Body({ item, done, hora }: { item: RoutineItem; done: boolean; hora?: string }) {
  return (
    <span className="flex-1 min-w-0">
      <span className="flex items-baseline gap-2">
        {hora && (
          <span className={`flex-none text-xs tabular-nums ${done ? "text-muted" : "text-nude"}`}>{hora}</span>
        )}
        <span className={`text-sm font-medium ${done ? "text-muted line-through" : "text-nude-warm"}`}>{item.label}</span>
      </span>
      {item.subtitle && <span className="block text-xs text-muted mt-0.5">{item.subtitle}</span>}
      {item.note && <span className="block text-[11px] text-muted opacity-80 mt-0.5">{item.note}</span>}
    </span>
  );
}

function Box({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex-none w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center text-xs ${done ? "bg-nude border-nude text-bg-deep" : "border-muted text-transparent"}`}
    >
      ✓
    </span>
  );
}

export function RoutineRow({ item, done, onToggle, rightSlot, navValue, onOpen, hora }: RoutineRowProps) {
  const isLink = item.control === "link";
  const cls = `card flex items-start gap-3 ${item.optional ? "opacity-90" : ""}`;

  if (isLink && item.to) {
    return (
      <Link to={item.to} role="link" aria-label={item.label} className={`${cls} hover:border-nude/40`}>
        <Box done={done} />
        <Body item={item} done={done} hora={hora} />
        <span className="flex-none self-center text-xs text-nude">{navValue ?? (done ? "feito ✓" : "ver →")}</span>
      </Link>
    );
  }

  // Refeição: a caixinha marca como feita; o corpo abre a receita num card.
  if (item.control === "recipe" && onOpen) {
    return (
      <div className={cls}>
        <button type="button" role="checkbox" aria-checked={done} aria-label={`marcar ${item.label}`} onClick={onToggle} className="flex-none">
          <Box done={done} />
        </button>
        <button type="button" onClick={onOpen} aria-label={item.label} className="flex-1 min-w-0 text-left">
          <Body item={item} done={done} hora={hora} />
        </button>
        <span className="flex-none self-center text-xs text-nude">receita →</span>
      </div>
    );
  }

  // Micro-pausas: a caixinha marca o bloco como feito manualmente; o corpo
  // abre o card com os movimentos da vez; o contador ao lado (rightSlot)
  // mostra quantas pausas já rolaram hoje.
  if (item.control === "breaks" && onOpen) {
    return (
      <div className={cls}>
        <button type="button" role="checkbox" aria-checked={done} aria-label={`marcar ${item.label}`} onClick={onToggle} className="flex-none">
          <Box done={done} />
        </button>
        <button type="button" onClick={onOpen} aria-label={item.label} className="flex-1 min-w-0 text-left">
          <Body item={item} done={done} hora={hora} />
        </button>
        {rightSlot && <span className="flex-none self-center">{rightSlot}</span>}
      </div>
    );
  }

  // Skincare: a linha inteira abre o roteiro guiado; o "feito" vem dos logs.
  if (item.control === "skincare" && onOpen) {
    return (
      <button type="button" onClick={onOpen} aria-label={item.label} className={`${cls} hover:border-nude/40 text-left w-full`}>
        <Box done={done} />
        <Body item={item} done={done} hora={hora} />
        <span className="flex-none self-center text-xs text-nude">{done ? "feito ✓" : "abrir →"}</span>
      </button>
    );
  }

  return (
    <div className={cls}>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={item.label}
        onClick={onToggle}
        className="flex items-start gap-3 flex-1 text-left"
      >
        <Box done={done} />
        <Body item={item} done={done} hora={hora} />
      </button>
      {item.to && !rightSlot && (
        <Link to={item.to} aria-label={`abrir ${item.label}`} className="flex-none self-center text-xs text-nude">ver →</Link>
      )}
      {rightSlot && <span className="flex-none self-center">{rightSlot}</span>}
    </div>
  );
}
