// src/lib/rebolado-progression.ts
// Qual sessão de rebolado fazer hoje. Módulo puro — sem I/O, sem Date.
//
// A queixa dela não é de técnica: é que ela desiste antes da noiva. Isso não é
// falta de tesão, é condicionamento — manter 20 minutos por cima, em espaço
// apertado, é tarefa de resistência de lombar, flexor de quadril e glúteo. O
// que o app tinha era um bloco de 3×1 min dentro da dança, que ensina o
// movimento e não constrói fôlego nenhum.
//
// Isto NÃO soma tempo de academia: mora nas sequências de movimento, que são
// separadas do treino de força (a sessão de academia não cresce — restrição
// antiga do programa).

export interface ReboladoDoDia {
  sequenceId: string;
  /** Em que fase ela está, pro item não virar exercício cego. */
  etapa: string;
  /** Minutos contínuos que a fase pede. É o número que ela persegue. */
  alvoMin: number;
}

/** Ordem da trilha, fase 1 → 4. */
export const SEQUENCIAS_REBOLADO: readonly string[] = [
  "rebolado-resistencia-1",
  "rebolado-resistencia-2",
  "rebolado-resistencia-3",
  "rebolado-resistencia-4",
];

// Os nomes carregam REBOLADO de propósito. `flex-progression.ts` e
// `pelvic-progression.ts` já exportam cortes de fase; nomes genéricos fariam o
// import errado devolver um número plausível, e corte de fase errado não
// estoura — só serve a fase errada, em silêncio, por semanas.
/** ~2 semanas praticando quase todo dia. */
export const ATE_REBOLADO_FASE_2 = 12;
/** ~1 mês. */
export const ATE_REBOLADO_FASE_3 = 30;
/** ~2 meses. */
export const ATE_REBOLADO_FASE_4 = 60;

/** O tempo que a coisa dura de verdade — a fase 4 é o degrau, este é o alvo.
 *  Bate com o tempo declarado em `intimidade-grinding`, e há teste amarrando os
 *  dois: se um mudar sem o outro, a trilha passa a construir para um número que
 *  o conteúdo não pede mais. */
export const ALVO_REAL_MIN = 20;

const FASES: ReadonlyArray<{ etapa: string; alvoMin: number }> = [
  { etapa: "Fase 1 · o movimento — 3 × 1 min, aprendendo a mover só a pélvis", alvoMin: 1 },
  { etapa: "Fase 2 · continuidade — 3 × 2 min sem parar dentro do bloco", alvoMin: 2 },
  { etapa: "Fase 3 · carga — 2 × 4 min contínuos, já sob fadiga", alvoMin: 4 },
  { etapa: "Fase 4 · resistência — 5+ min contínuos sem perder o ritmo", alvoMin: 5 },
];

export function reboladoDoDia(praticasFeitas: number): ReboladoDoDia {
  const n = Number.isFinite(praticasFeitas) && praticasFeitas > 0 ? Math.floor(praticasFeitas) : 0;
  const i =
    n < ATE_REBOLADO_FASE_2 ? 0 : n < ATE_REBOLADO_FASE_3 ? 1 : n < ATE_REBOLADO_FASE_4 ? 2 : 3;
  return { sequenceId: SEQUENCIAS_REBOLADO[i], ...FASES[i] };
}
