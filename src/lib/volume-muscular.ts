import type { WorkoutTemplate } from "./db";

// Séries semanais por grupo. É a régua da spec Chun-Li macia (2026-09-23):
// o programa antigo ia a 33 séries de glúteo máximo e deixava o glúteo médio
// (a largura do quadril de frente) parado em 12-15, quase tudo na quarta.
// Cada exercício conta para UM grupo, o primário. Composto não "vale em dobro":
// a spec foi escrita em séries diretas, e contar secundário inflaria a régua.
export type GrupoMuscular =
  | "gluteo-max" | "gluteo-medio" | "quadriceps" | "adutor" | "posterior"
  | "peito" | "costas" | "biceps" | "triceps";

const GRUPOS: readonly GrupoMuscular[] = [
  "gluteo-max", "gluteo-medio", "quadriceps", "adutor", "posterior",
  "peito", "costas", "biceps", "triceps",
];

export const GRUPO_DO_EXERCICIO: Readonly<Record<string, GrupoMuscular>> = {
  // glúteo máximo: projeção
  "hip-thrust-barra": "gluteo-max",
  "hip-thrust-unilateral": "gluteo-max",
  "ponte-gluteo-band": "gluteo-max",
  "ponte-gluteo-bola": "gluteo-max",
  "elevacao-pelvica-banco": "gluteo-max",
  "kickback": "gluteo-max",
  "kickback-cabo": "gluteo-max",
  "ativacao-gluteo-band-walks": "gluteo-max", // é coice em 4 apoios, não passada lateral
  "smith-squat": "gluteo-max", // leg press com pés ALTOS
  "kettlebell-swing": "gluteo-max",
  // glúteo médio: largura do quadril
  "abdutor-maquina": "gluteo-medio",
  "abdutor-band-em-pe": "gluteo-medio",
  "abdutor-deitada": "gluteo-medio",
  "abdutor-cabo-em-pe": "gluteo-medio",
  "clamshell": "gluteo-medio",
  // quadríceps
  "leg-press-pes-medios": "quadriceps",
  "cadeira-extensora": "quadriceps",
  "agachamento-goblet": "quadriceps",
  "agachamento-livre": "quadriceps",
  "agachamento-sumo": "quadriceps",
  "agachamento-bulgaro": "quadriceps",
  "step-up-gluteo": "quadriceps",
  // adutor
  "adutora-maquina": "adutor",
  // posterior: flexora por joelho + dobradiças
  "flexora-em-pe": "posterior",
  "stiff": "posterior",
  "stiff-unilateral": "posterior",
  "good-morning": "posterior",
  // peito
  "supino-inclinado-halteres": "peito",
  "cross-over-cabo": "peito",
  "cross-over-baixo": "peito",
  "voador-maquina": "peito",
  // costas
  "remada-baixa-maquina": "costas",
  "remada-unilateral-halter": "costas",
  "remada-curvada": "costas",
  "face-pull-polia": "costas",
  "face-pull": "costas",
  // braço
  "rosca-martelo": "biceps",
  "rosca-barra-w": "biceps",
  "triceps-testa-barra-w": "triceps",
};

type ComExercicios = Pick<WorkoutTemplate, "exercises">;

export function volumeSemanal(templates: readonly ComExercicios[]): Record<GrupoMuscular, number> {
  const total = Object.fromEntries(GRUPOS.map((g) => [g, 0])) as Record<GrupoMuscular, number>;
  for (const t of templates) {
    for (const e of t.exercises) {
      const g = GRUPO_DO_EXERCICIO[e.exerciseId];
      if (g) total[g] += e.sets;
    }
  }
  return total;
}

export function diasComExercicio(templates: readonly ComExercicios[], exerciseId: string): number {
  return templates.filter((t) => t.exercises.some((e) => e.exerciseId === exerciseId)).length;
}
