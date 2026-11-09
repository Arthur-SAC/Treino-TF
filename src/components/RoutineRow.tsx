import { Link } from "react-router-dom";
import { useState, type AnimationEvent, type ReactNode } from "react";
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

// A caixinha pula e solta um "+1" quando ela marca agora (clique em item não
// feito) — item que já abre feito não anima toda vez que o Hoje é desenhado.
// Sem vibração e sem som.
function Box({ done, pula, maisUm, onFimPulo, onFimMaisUm }: { done: boolean; pula: boolean; maisUm: boolean; onFimPulo: () => void; onFimMaisUm: () => void }) {
  return (
    <span
      aria-hidden="true"
      data-caixa
      onAnimationEnd={(e) => { if (e.target === e.currentTarget) onFimPulo(); }}
      className={`relative flex-none w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center text-xs transition-colors duration-200 ${done ? "bg-feito border-feito text-white" : "border-muted text-transparent"} ${pula ? "caixa-pula" : ""}`}
    >
      ✓
      {maisUm && (
        <span
          aria-hidden="true"
          onAnimationEnd={(e) => { e.stopPropagation(); onFimMaisUm(); }}
          className="mais-um absolute -top-1 left-full ml-1 text-xs font-semibold text-feito"
        >
          +1
        </span>
      )}
    </span>
  );
}

// Movimento da linha: balanço do card ao toque e pulo da caixinha ao marcar.
// Nada disso segura a navegação nem o toggle — só liga e desliga classes.
function useMovimento(done: boolean) {
  const [balanca, setBalanca] = useState(false);
  const [pula, setPula] = useState(false);
  const [maisUm, setMaisUm] = useState(false);
  const cartaProps = {
    onClick: () => setBalanca(true),
    onAnimationEnd: (e: AnimationEvent<HTMLElement>) => {
      if (e.target === e.currentTarget) setBalanca(false);
    },
  };
  return {
    cartaProps,
    balancaCls: balanca ? "carta-balanca" : "",
    pula,
    maisUm,
    fimPulo: () => setPula(false),
    fimMaisUm: () => setMaisUm(false),
    marcar: (toggle: () => void) => () => {
      if (!done) { setPula(true); setMaisUm(true); }
      toggle();
    },
  };
}

export function RoutineRow({ item, done, onToggle, rightSlot, navValue, onOpen, hora }: RoutineRowProps) {
  const isLink = item.control === "link";
  const m = useMovimento(done);
  const cls = `card flex items-start gap-3 ${item.optional ? "opacity-90" : ""} ${m.balancaCls}`;
  const box = <Box done={done} pula={m.pula} maisUm={m.maisUm} onFimPulo={m.fimPulo} onFimMaisUm={m.fimMaisUm} />;
  const toggle = m.marcar(onToggle);

  if (isLink && item.to) {
    return (
      <Link to={item.to} role="link" aria-label={item.label} className={`${cls} hover:border-nude/40`} {...m.cartaProps}>
        {box}
        <Body item={item} done={done} hora={hora} />
        <span className="flex-none self-center text-xs text-nude">{navValue ?? (done ? "feito ✓" : "ver →")}</span>
      </Link>
    );
  }

  // Refeição: a caixinha marca como feita; o corpo abre a receita num card.
  if (item.control === "recipe" && onOpen) {
    return (
      <div className={cls} {...m.cartaProps}>
        <button type="button" role="checkbox" aria-checked={done} aria-label={`marcar ${item.label}`} onClick={toggle} className="flex-none p-3 -m-3">
          {box}
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
      <div className={cls} {...m.cartaProps}>
        <button type="button" role="checkbox" aria-checked={done} aria-label={`marcar ${item.label}`} onClick={toggle} className="flex-none p-3 -m-3">
          {box}
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
      <button type="button" onClick={() => { m.cartaProps.onClick(); onOpen(); }} onAnimationEnd={m.cartaProps.onAnimationEnd} aria-label={item.label} className={`${cls} hover:border-nude/40 text-left w-full`}>
        {box}
        <Body item={item} done={done} hora={hora} />
        <span className="flex-none self-center text-xs text-nude">{done ? "feito ✓" : "abrir →"}</span>
      </button>
    );
  }

  // Item com destino e sem botão no canto: o CORPO abre, a caixinha marca.
  // Antes o corpo marcava e só a setinha "ver →" navegava — um alvo minúsculo
  // na borda. A usuária foi abrir o alongamento da noite, tocou no nome e o
  // item só ficou riscado. Mesmo padrão do jantar e do skincare, que já abrem
  // ao toque no corpo.
  // Com botão no canto (a caminhada tem "+10 min"), o nome continua abrindo o
  // destino — antes o botão ganhava e a prescrição de zona 2 ficava sem porta.
  if (item.to) {
    return (
      <div className={cls} {...m.cartaProps}>
        <button type="button" role="checkbox" aria-checked={done} aria-label={`marcar ${item.label}`} onClick={toggle} className="flex-none p-3 -m-3">
          {box}
        </button>
        <Link to={item.to} aria-label={item.label} className="flex-1 min-w-0">
          <Body item={item} done={done} hora={hora} />
        </Link>
        {rightSlot ? <span className="flex-none self-center">{rightSlot}</span> : <span className="flex-none self-center text-xs text-nude">ver →</span>}
      </div>
    );
  }

  return (
    <div className={cls} {...m.cartaProps}>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={item.label}
        onClick={toggle}
        className="flex items-start gap-3 flex-1 text-left"
      >
        {box}
        <Body item={item} done={done} hora={hora} />
      </button>
      {rightSlot && <span className="flex-none self-center">{rightSlot}</span>}
    </div>
  );
}
