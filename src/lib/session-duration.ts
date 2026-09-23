import type { WorkoutTemplate } from "./db";

// Estimador de duração. Existe porque os `durationMin` eram escritos à mão e
// derivavam (v-qua dizia 54, levava ~30). Não é cronômetro: é uma régua
// estável para travar "≤ 60 min" e o número que a tela anuncia.
// Premissas: 3 s por repetição; "cada" dobra (um lado e depois o outro);
// carregamento em metros ≈ 30 s; 1 min de troca/ajuste por exercício.
const SEG_POR_REP = 3;
const SEG_CARREGAMENTO = 30;
const SEG_TROCA = 60;
const SEG_SEM_NUMERO = 30;

const maior = (m: RegExpMatchArray) => Number(m[2] ?? m[1]);

export function segundosDeTrabalho(repsTarget: string): number {
  const r = repsTarget.toLowerCase();
  const min = r.match(/(\d+)(?:\s*-\s*(\d+))?\s*min/);
  if (min) return maior(min) * 60;
  const seg = r.match(/(\d+)(?:\s*-\s*(\d+))?\s*s\b/);
  if (seg) return maior(seg);
  if (/\d+\s*m\b/.test(r)) return SEG_CARREGAMENTO;
  const reps = r.match(/(\d+)(?:\s*-\s*(\d+))?/);
  if (!reps) return SEG_SEM_NUMERO;
  return maior(reps) * SEG_POR_REP * (/cada/.test(r) ? 2 : 1);
}

export function estimarDuracaoMin(t: Pick<WorkoutTemplate, "exercises">): number {
  const seg = t.exercises.reduce(
    (acc, e) => acc + e.sets * (segundosDeTrabalho(e.repsTarget) + e.restSec) + SEG_TROCA,
    0,
  );
  return Math.round(seg / 60);
}
