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
  "hip-thrust-maquina": "gluteo-max",
  "extensao-45-gluteo": "gluteo-max",
  "coice-maquina": "gluteo-max",
  "coice-gluteo-polia": "gluteo-max",
  "pull-through-polia": "gluteo-max",
  // glúteo médio: largura do quadril
  "abdutor-maquina": "gluteo-medio",
  "abdutor-band-em-pe": "gluteo-medio",
  "abdutor-deitada": "gluteo-medio",
  "abdutor-cabo-em-pe": "gluteo-medio",
  "abducao-quadril-polia": "gluteo-medio",
  "clamshell": "gluteo-medio",
  // quadríceps
  "leg-press-pes-medios": "quadriceps",
  "cadeira-extensora": "quadriceps",
  "hack-machine": "quadriceps",
  "agachamento-goblet": "quadriceps",
  "agachamento-livre": "quadriceps",
  "agachamento-bulgaro": "quadriceps",
  "step-up-gluteo": "quadriceps",
  // adutor
  "adutora-maquina": "adutor",
  // O sumô de base larga tem o adutor magno como motor principal. Conta aqui
  // (e não no quadríceps) porque é o substituto da adutora quando ela está
  // ocupada: sem isso, "Não tem aqui" zerava o adutor da semana (2026-11-09).
  "agachamento-sumo": "adutor",
  // posterior: flexora por joelho + dobradiças
  "flexora-em-pe": "posterior",
  "flexora-sentada": "posterior",
  "stiff": "posterior",
  "stiff-unilateral": "posterior",
  "good-morning": "posterior",
  // peito
  "supino-inclinado-halteres": "peito",
  "cross-over-cabo": "peito",
  "cross-over-baixo": "peito",
  "voador-maquina": "peito",
  "crucifixo-polia": "peito", // de baixo pra cima: peito de cima, substituto do voador
  // costas
  "remada-baixa-maquina": "costas",
  "remada-unilateral-halter": "costas",
  "remada-curvada": "costas",
  "face-pull-polia": "costas",
  "face-pull": "costas",
  // braço
  "rosca-martelo": "biceps",
  "rosca-barra-w": "biceps",
  "rosca-polia": "biceps",
  "triceps-testa-barra-w": "triceps",
  "triceps-polia-corda": "triceps",
  // pallof-polia fica fora de propósito: core não entra na contagem de volume.
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
