import type { WorkoutTemplate } from "../lib/db";

// Ciclo 2 — VARIAÇÃO (mês 5-6) — mesmos objetivos, exercícios variados
const VARIATION: WorkoutTemplate[] = [
  {
    id: "v-seg-gluteo-unilateral",
    name: "Glúteo unilateral + Mobilidade",
    dayOfWeek: 1,
    durationMin: 50,
    cycle: "variacao",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "10 cada", restSec: 30 },
      { exerciseId: "hip-thrust-unilateral", sets: 4, repsTarget: "8-10 cada", restSec: 75 },
      { exerciseId: "agachamento-bulgaro", sets: 3, repsTarget: "8 cada", restSec: 75 },
      { exerciseId: "abdutor-cabo-em-pe", sets: 3, repsTarget: "12 cada", restSec: 45 },
      { exerciseId: "mobilidade-quadril-90-90", sets: 1, repsTarget: "5min", restSec: 0 },
    ],
  },
  {
    id: "v-ter-cintura-costas",
    name: "Cintura funcional + Costas (var)",
    dayOfWeek: 2,
    durationMin: 45,
    cycle: "variacao",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "abdominal-prancha-instavel", sets: 3, repsTarget: "8 cada", restSec: 45 },
      { exerciseId: "bird-dog", sets: 3, repsTarget: "10 cada", restSec: 30 },
      { exerciseId: "prancha-lateral", sets: 3, repsTarget: "40s cada", restSec: 45 },
      { exerciseId: "remada-curvada", sets: 3, repsTarget: "10", restSec: 60 },
      { exerciseId: "face-pull", sets: 3, repsTarget: "15", restSec: 45 },
    ],
  },
  {
    id: "v-qua-mobilidade-danca",
    name: "Mobilidade + Dança (var)",
    dayOfWeek: 3,
    durationMin: 40,
    cycle: "variacao",
    exercises: [
      { exerciseId: "cat-cow", sets: 2, repsTarget: "10", restSec: 0 },
      { exerciseId: "borboleta", sets: 1, repsTarget: "2min", restSec: 0 },
      { exerciseId: "happy-baby", sets: 1, repsTarget: "1min", restSec: 0 },
      { exerciseId: "agachamento-profundo-pausa", sets: 1, repsTarget: "2min", restSec: 0 },
      { exerciseId: "rotacao-quadril-em-pe", sets: 2, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "rebolado-basico", sets: 3, repsTarget: "1min", restSec: 30 },
      { exerciseId: "isolamento-quadril-lateral", sets: 3, repsTarget: "30s cada", restSec: 30 },
    ],
  },
  {
    id: "v-qui-gluteo-stiff",
    name: "Glúteo posterior + Stiff",
    dayOfWeek: 4,
    durationMin: 50,
    cycle: "variacao",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "clamshell", sets: 2, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "smith-squat", sets: 4, repsTarget: "8-10", restSec: 90 },
      { exerciseId: "stiff-unilateral", sets: 3, repsTarget: "8 cada", restSec: 75 },
      { exerciseId: "kickback-cabo", sets: 3, repsTarget: "12 cada", restSec: 45 },
    ],
  },
  {
    id: "v-sex-peitoral-postura",
    name: "Peitoral leve + Postura (var)",
    dayOfWeek: 5,
    durationMin: 45,
    cycle: "variacao",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "cross-over-baixo", sets: 3, repsTarget: "12 (leve)", restSec: 60 },
      { exerciseId: "cross-over-cabo", sets: 3, repsTarget: "12 (leve)", restSec: 60 },
      { exerciseId: "face-pull", sets: 4, repsTarget: "15", restSec: 45 },
      { exerciseId: "retracao-escapular", sets: 3, repsTarget: "15", restSec: 30 },
      { exerciseId: "alongamento-flexor-quadril", sets: 1, repsTarget: "1min cada", restSec: 0 },
    ],
  },
];

// Ciclo 3 — HIPERTROFIA (mês 7-9) — volume maior, reps 8-12, descansos médios
const HYPERTROPHY: WorkoutTemplate[] = [
  {
    id: "h-seg-gluteo-volume",
    name: "Glúteo volume alto",
    dayOfWeek: 1,
    durationMin: 60,
    cycle: "hipertrofia",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 3, repsTarget: "12 cada", restSec: 30 },
      { exerciseId: "hip-thrust-barra", sets: 5, repsTarget: "8-10", restSec: 90 },
      { exerciseId: "agachamento-livre", sets: 4, repsTarget: "10", restSec: 90 },
      { exerciseId: "abdutor-maquina", sets: 4, repsTarget: "12-15", restSec: 60 },
      { exerciseId: "kickback-cabo", sets: 3, repsTarget: "12 cada", restSec: 45 },
    ],
  },
  {
    id: "h-ter-cintura-costas",
    name: "Cintura + Costas (volume)",
    dayOfWeek: 2,
    durationMin: 50,
    cycle: "hipertrofia",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "dead-bug", sets: 3, repsTarget: "12 cada", restSec: 30 },
      { exerciseId: "prancha", sets: 4, repsTarget: "45s", restSec: 45 },
      { exerciseId: "prancha-lateral", sets: 3, repsTarget: "30s cada", restSec: 30 },
      { exerciseId: "remada-baixa-maquina", sets: 4, repsTarget: "10-12", restSec: 75 },
      { exerciseId: "puxada-frente-maquina", sets: 3, repsTarget: "10", restSec: 60 },
      { exerciseId: "face-pull", sets: 3, repsTarget: "15", restSec: 45 },
    ],
  },
  {
    id: "h-qua-mobilidade-danca",
    name: "Mobilidade + Dança (recuperação ativa)",
    dayOfWeek: 3,
    durationMin: 40,
    cycle: "hipertrofia",
    exercises: [
      { exerciseId: "cat-cow", sets: 2, repsTarget: "10", restSec: 0 },
      { exerciseId: "borboleta", sets: 1, repsTarget: "2min", restSec: 0 },
      { exerciseId: "agachamento-profundo-pausa", sets: 1, repsTarget: "2min", restSec: 0 },
      { exerciseId: "alongamento-flexor-quadril", sets: 1, repsTarget: "1min cada", restSec: 0 },
      { exerciseId: "rebolado-basico", sets: 3, repsTarget: "1min", restSec: 30 },
      { exerciseId: "isolamento-quadril-lateral", sets: 3, repsTarget: "30s cada", restSec: 30 },
    ],
  },
  {
    id: "h-qui-gluteo-posterior",
    name: "Glúteo + Posterior (volume)",
    dayOfWeek: 4,
    durationMin: 60,
    cycle: "hipertrofia",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "clamshell", sets: 3, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "agachamento-bulgaro", sets: 4, repsTarget: "10 cada", restSec: 75 },
      { exerciseId: "stiff", sets: 4, repsTarget: "10-12", restSec: 75 },
      { exerciseId: "elevacao-pelvica-banco", sets: 3, repsTarget: "12 cada", restSec: 60 },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "15 cada", restSec: 30 },
    ],
  },
  {
    id: "h-sex-peitoral-postura",
    name: "Peitoral + Postura (volume controlado)",
    dayOfWeek: 5,
    durationMin: 50,
    cycle: "hipertrofia",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "supino-inclinado-halteres", sets: 4, repsTarget: "10 (LEVE)", restSec: 60 },
      { exerciseId: "cross-over-cabo", sets: 4, repsTarget: "12 (LEVE)", restSec: 60 },
      { exerciseId: "face-pull", sets: 4, repsTarget: "15", restSec: 45 },
      { exerciseId: "retracao-escapular", sets: 4, repsTarget: "15", restSec: 30 },
      { exerciseId: "prancha-lateral", sets: 3, repsTarget: "30s cada", restSec: 30 },
    ],
  },
];

// Ciclo 4 — REFINAMENTO (mês 10-12) — cargas menores, reps altas, conexão músculo-mente
const REFINEMENT: WorkoutTemplate[] = [
  {
    id: "r-seg-gluteo-densidade",
    name: "Glúteo densidade (alta rep)",
    dayOfWeek: 1,
    durationMin: 50,
    cycle: "refinamento",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "ponte-gluteo-band", sets: 4, repsTarget: "20", restSec: 30 },
      { exerciseId: "hip-thrust-barra", sets: 4, repsTarget: "15-20 (carga média)", restSec: 45 },
      { exerciseId: "kickback-cabo", sets: 4, repsTarget: "20 cada (leve)", restSec: 30 },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "20 cada", restSec: 30 },
    ],
  },
  {
    id: "r-ter-cintura-postura",
    name: "Cintura + Postura (densidade)",
    dayOfWeek: 2,
    durationMin: 40,
    cycle: "refinamento",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "dead-bug", sets: 3, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "bird-dog", sets: 3, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "prancha", sets: 3, repsTarget: "60s", restSec: 30 },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "15 (leve)", restSec: 45 },
      { exerciseId: "face-pull", sets: 4, repsTarget: "20", restSec: 30 },
      { exerciseId: "retracao-escapular", sets: 4, repsTarget: "20", restSec: 30 },
    ],
  },
  {
    id: "r-qua-mobilidade-danca",
    name: "Mobilidade + Dança (livre)",
    dayOfWeek: 3,
    durationMin: 45,
    cycle: "refinamento",
    exercises: [
      { exerciseId: "cat-cow", sets: 2, repsTarget: "10", restSec: 0 },
      { exerciseId: "borboleta", sets: 1, repsTarget: "2min", restSec: 0 },
      { exerciseId: "happy-baby", sets: 1, repsTarget: "1min", restSec: 0 },
      { exerciseId: "agachamento-profundo-pausa", sets: 1, repsTarget: "3min", restSec: 0 },
      { exerciseId: "alongamento-piriforme", sets: 1, repsTarget: "1min cada", restSec: 0 },
      { exerciseId: "rebolado-basico", sets: 4, repsTarget: "1min", restSec: 30 },
      { exerciseId: "isolamento-quadril-lateral", sets: 3, repsTarget: "1min cada", restSec: 30 },
    ],
  },
  {
    id: "r-qui-gluteo-simetria",
    name: "Glúteo simetria (unilateral)",
    dayOfWeek: 4,
    durationMin: 50,
    cycle: "refinamento",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "clamshell", sets: 2, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "hip-thrust-unilateral", sets: 4, repsTarget: "15 cada", restSec: 45 },
      { exerciseId: "agachamento-bulgaro", sets: 3, repsTarget: "15 cada (sem peso)", restSec: 45 },
      { exerciseId: "stiff-unilateral", sets: 3, repsTarget: "15 cada (leve)", restSec: 45 },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "20 cada", restSec: 30 },
    ],
  },
  {
    id: "r-sex-peitoral-refinamento",
    name: "Peitoral + Postura (refinamento)",
    dayOfWeek: 5,
    durationMin: 45,
    cycle: "refinamento",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "15 (BEM LEVE)", restSec: 45 },
      { exerciseId: "cross-over-baixo", sets: 3, repsTarget: "15 (leve)", restSec: 45 },
      { exerciseId: "face-pull", sets: 4, repsTarget: "20", restSec: 30 },
      { exerciseId: "retracao-escapular", sets: 4, repsTarget: "20", restSec: 30 },
      { exerciseId: "prancha-lateral", sets: 3, repsTarget: "45s cada", restSec: 30 },
      { exerciseId: "alongamento-flexor-quadril", sets: 1, repsTarget: "1min cada", restSec: 0 },
    ],
  },
];

export const CYCLE_TEMPLATES: WorkoutTemplate[] = [...VARIATION, ...HYPERTROPHY, ...REFINEMENT];

export const CYCLES = [
  { id: "adaptacao", name: "Adaptação", description: "Aprende movimentos, ativa glúteo, cargas leves", threshold: 80 },
  { id: "variacao", name: "Variação", description: "Mesmos objetivos, exercícios variados, estímulo novo", threshold: 60 },
  { id: "hipertrofia", name: "Hipertrofia", description: "Volume alto, reps 8-12, foco em crescimento", threshold: 60 },
  { id: "refinamento", name: "Refinamento", description: "Cargas leves, reps altas, simetria e densidade", threshold: 60 },
] as const;

export type CycleId = typeof CYCLES[number]["id"];
