export type SessionFeedback = "easy" | "medium" | "hard";

export interface ProgressionInput {
  lastLoad: number;
  feedback: SessionFeedback;
  /** Toda série bateu o MÍNIMO da faixa de reps (ver avaliarSeries). */
  completedAllReps: boolean;
  /** Toda série bateu o TOPO da faixa. Sem isso, "médio" mantém a carga. */
  hitTopOfRange?: boolean;
  category?: string;
  equipment?: readonly string[];
  /** Carga inicial do exercício — usada quando a última vez foi sem peso. */
  startLoadKg?: number;
}

// Só a postura fica leve (face pull, extensão lombar, retração): é trabalho de
// controle, não de carga. Peito e costas saíram daqui em 2026-09-23 — o
// objetivo pede peito cheio em cima e costas/braço com força de levantar, e a
// regra antiga travava supino e remadas pra sempre.
const HOLD_LIGHT_CATEGORIES = new Set(["postura"]);

export function isHoldLight(category: string): boolean {
  return HOLD_LIGHT_CATEGORIES.has(category);
}

/** O menor salto de carga que o equipamento dela permite. +1 kg não existe em
 *  halter nem em placa — a sugestão antiga pedia um peso que não havia. */
export function incrementoDoEquipamento(equipment: readonly string[] = []): number {
  const tem = (...ids: string[]) => equipment.some((e) => ids.some((i) => e === i || e.startsWith(i)));
  const SEM_CARGA = ["peso-corporal", "colchonete", "nenhum"];
  if (equipment.length > 0 && equipment.every((e) => SEM_CARGA.includes(e))) return 0;
  if (tem("caneleira")) return 1;
  if (tem("leg-press", "maquina-", "multiestacao", "polia")) return 5;
  return 2;
}

export function suggestNextLoad({
  lastLoad, feedback, completedAllReps, hitTopOfRange = false, category, equipment, startLoadKg,
}: ProgressionInput): number {
  const passo = incrementoDoEquipamento(equipment);
  // Saindo do "sem peso" (ex.: hip thrust da Entrada), o próximo degrau é a
  // carga inicial do exercício (a barra vazia), não "+2 kg".
  if (lastLoad === 0 && startLoadKg && completedAllReps && feedback !== "hard") return startLoadKg;
  if (category && isHoldLight(category)) {
    return completedAllReps ? lastLoad : Math.max(0, lastLoad - passo);
  }
  if (!completedAllReps) return Math.max(0, lastLoad - passo);
  if (feedback === "easy") return lastLoad + passo;
  if (feedback === "medium") return hitTopOfRange ? lastLoad + passo : lastLoad;
  return lastLoad; // hard
}

/** Faixa de reps do template ("10-12", "12 (LEVE)", "15 cada"). Sem número,
 *  não há régua — qualquer série conta como completa. */
function faixaDeReps(repsTarget: string): [number, number] | null {
  const m = repsTarget.match(/(\d+)(?:\s*-\s*(\d+))?/);
  if (!m) return null;
  const min = Number(m[1]);
  return [min, Number(m[2] ?? min)];
}

export function avaliarSeries(
  sets: ReadonlyArray<{ reps: number }>,
  repsTarget: string,
): { completou: boolean; topo: boolean } {
  const faixa = faixaDeReps(repsTarget);
  if (!faixa || sets.length === 0) return { completou: sets.length > 0, topo: false };
  return {
    completou: sets.every((s) => s.reps >= faixa[0]),
    topo: sets.every((s) => s.reps >= faixa[1]),
  };
}

/** Exercício medido por TEMPO (cardio, aquecimento, isometria) — sem reps nem
 *  carga. Detecta pelo alvo de repetições do template ("5-7min", "30-45s"). */
export function isTimeBased(repsTarget: string): boolean {
  const t = repsTarget.toLowerCase();
  // Metros NÃO: carregamento é o exercício de levantar a noiva e precisa
  // registrar carga (revisão da auditoria, 2026-09-23).
  return /min/.test(t) || /\d\s*s\b/.test(t);
}

export interface LastPerformance {
  date: string;
  sets: Array<{ reps: number; weight: number }>;
  feedback: SessionFeedback;
  /** O template daquela sessão — é contra o alvo DELE que a última vez se julga. */
  templateId?: string;
}

/** Acha a última vez que o exercício foi registrado (com séries). Espera a lista
 *  de sessões já ordenada da mais recente pra mais antiga. */
export function findLastPerformance(
  sessions: Array<{
    date: string;
    templateId?: string;
    difficultySelf?: SessionFeedback;
    exercises: Array<{ exerciseId: string; sets: Array<{ reps: number; weight: number }> }>;
  }>,
  exerciseId: string,
): LastPerformance | null {
  for (const s of sessions) {
    const found = s.exercises.find((e) => e.exerciseId === exerciseId);
    if (found && found.sets.length > 0) {
      return {
        date: s.date,
        sets: found.sets.map((x) => ({ reps: x.reps, weight: x.weight })),
        feedback: s.difficultySelf ?? "medium",
        ...(s.templateId ? { templateId: s.templateId } : {}),
      };
    }
  }
  return null;
}

const MAX_HOLD_SEC = 60;

/** Progressão por tempo de isometria (ex.: vacuum/transverso). */
export function suggestNextHoldTime(lastSec: number, feedback: SessionFeedback): number {
  if (feedback === "easy") return Math.min(MAX_HOLD_SEC, lastSec + 5);
  if (feedback === "medium") return Math.min(MAX_HOLD_SEC, lastSec + 2);
  return lastSec; // hard → mantém
}
