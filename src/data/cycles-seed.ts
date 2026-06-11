import type { WorkoutTemplate } from "../lib/db";

// ═══════════════════════════════════════════════════════════════════════════
// Todos os ciclos mantêm glúteo como PRIORIDADE Nº 1 (4 estímulos/semana) e
// vão progredindo: variação (estímulo novo) → hipertrofia (volume/superávit) →
// refinamento (alta rep/densidade) → manutenção (segura a forma; fase ideal
// pra alinhar com o início da TRH).
// Regras fixas: dias de força (seg/ter/qui/sex) começam com cardio + articular;
// quarta começa com articular e tem o circuito de glúteo médio (ponte + abdução).
// ═══════════════════════════════════════════════════════════════════════════

// Ciclo 2 — VARIAÇÃO — mesmos objetivos, exercícios variados
const VARIATION: WorkoutTemplate[] = [
  {
    id: "v-seg-gluteo-unilateral",
    name: "🍑 Glúteo A · Força (variação)",
    dayOfWeek: 1,
    durationMin: 60,
    cycle: "variacao",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "12 cada", restSec: 30 },
      { exerciseId: "hip-thrust-barra", sets: 4, repsTarget: "10", restSec: 90 },
      { exerciseId: "agachamento-sumo", sets: 4, repsTarget: "10-12", restSec: 75, notes: "Glúteo + coxa interna" },
      { exerciseId: "stiff", sets: 3, repsTarget: "10", restSec: 75 },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 60 },
    ],
  },
  {
    id: "v-ter-cintura-costas",
    name: "Superior + Cintura (variação)",
    dayOfWeek: 2,
    durationMin: 52,
    cycle: "variacao",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "10 (leve)", restSec: 60 },
      { exerciseId: "cross-over-cabo", sets: 3, repsTarget: "12 (leve)", restSec: 60, notes: "Crucifixo inclinado — busto" },
      { exerciseId: "remada-curvada", sets: 3, repsTarget: "10", restSec: 60 },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15-20", restSec: 45, notes: "Postura ereta = busto mais cheio" },
      { exerciseId: "prancha-lateral", sets: 3, repsTarget: "40s cada", restSec: 45 },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Transverso — afina a cintura, sem engrossar" },
    ],
  },
  {
    id: "v-qua-mobilidade-danca",
    name: "Mobilidade + Dança + 🍑 Glúteo médio (var)",
    dayOfWeek: 3,
    durationMin: 54,
    cycle: "variacao",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "borboleta", sets: 1, repsTarget: "2min", restSec: 0 },
      { exerciseId: "happy-baby", sets: 1, repsTarget: "1min", restSec: 0 },
      { exerciseId: "abdutor-cabo-em-pe", sets: 3, repsTarget: "15 cada", restSec: 30, notes: "Fire hydrant — arredonda" },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "clamshell", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30 },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "rebolado-basico", sets: 3, repsTarget: "1min", restSec: 30 },
      { exerciseId: "isolamento-quadril-lateral", sets: 3, repsTarget: "30s cada", restSec: 30 },
    ],
  },
  {
    id: "v-qui-gluteo-stiff",
    name: "🍑 Glúteo B · Posterior (variação)",
    dayOfWeek: 4,
    durationMin: 58,
    cycle: "variacao",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "12 cada", restSec: 30 },
      { exerciseId: "smith-squat", sets: 4, repsTarget: "10", restSec: 90, notes: "Leg press 45° pés altos" },
      { exerciseId: "pull-through-polia", sets: 3, repsTarget: "12-15", restSec: 60, notes: "Dobradiça de quadril na polia — estímulo novo do ciclo" },
      { exerciseId: "coice-gluteo-polia", sets: 3, repsTarget: "15 cada", restSec: 30, notes: "Pico de glúteo com tensão constante" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45 },
    ],
  },
  {
    id: "v-sex-peitoral-postura",
    name: "🍑 Glúteo C · Volume (variação)",
    dayOfWeek: 5,
    durationMin: 52,
    cycle: "variacao",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "hip-thrust-unilateral", sets: 4, repsTarget: "12 cada", restSec: 45 },
      { exerciseId: "coice-gluteo-polia", sets: 3, repsTarget: "15 cada", restSec: 30, notes: "Pico de glúteo com tensão constante" },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "ponte-gluteo-bola", sets: 3, repsTarget: "15", restSec: 45, notes: "Instabilidade recruta mais glúteo + core" },
      { exerciseId: "prancha-lateral", sets: 3, repsTarget: "30s cada", restSec: 30 },
    ],
  },
];

// Ciclo 3 — HIPERTROFIA — volume alto, reps 8-12, sai do déficit (manutenção/leve superávit)
const HYPERTROPHY: WorkoutTemplate[] = [
  {
    id: "h-seg-gluteo-volume",
    name: "🍑 Glúteo A · Volume alto",
    dayOfWeek: 1,
    durationMin: 70,
    cycle: "hipertrofia",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 3, repsTarget: "12 cada", restSec: 30 },
      { exerciseId: "hip-thrust-barra", sets: 5, repsTarget: "8-10", restSec: 90, notes: "Fase de ouro — empurra a carga, glúteo cresce" },
      { exerciseId: "smith-squat", sets: 4, repsTarget: "10-12", restSec: 90 },
      { exerciseId: "agachamento-livre", sets: 3, repsTarget: "10", restSec: 90 },
      { exerciseId: "abdutor-maquina", sets: 4, repsTarget: "12-15", restSec: 60 },
    ],
  },
  {
    id: "h-ter-cintura-costas",
    name: "Superior + Cintura (volume)",
    dayOfWeek: 2,
    durationMin: 57,
    cycle: "hipertrofia",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "supino-inclinado-halteres", sets: 4, repsTarget: "10 (leve)", restSec: 60 },
      { exerciseId: "cross-over-cabo", sets: 3, repsTarget: "12 (leve)", restSec: 60 },
      { exerciseId: "remada-baixa-maquina", sets: 4, repsTarget: "10-12", restSec: 75 },
      { exerciseId: "puxada-frente-maquina", sets: 3, repsTarget: "10", restSec: 60 },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15-20", restSec: 45, notes: "Postura ereta = busto mais cheio" },
    ],
  },
  {
    id: "h-qua-mobilidade-danca",
    name: "Mobilidade + Dança + 🍑 Glúteo médio (volume)",
    dayOfWeek: 3,
    durationMin: 54,
    cycle: "hipertrofia",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "cat-cow", sets: 2, repsTarget: "10", restSec: 0 },
      { exerciseId: "agachamento-profundo-pausa", sets: 1, repsTarget: "2min", restSec: 0 },
      { exerciseId: "abdutor-cabo-em-pe", sets: 3, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "clamshell", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30 },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "rebolado-basico", sets: 3, repsTarget: "1min", restSec: 30 },
    ],
  },
  {
    id: "h-qui-gluteo-posterior",
    name: "🍑 Glúteo B · Posterior + Coxa (volume)",
    dayOfWeek: 4,
    durationMin: 68,
    cycle: "hipertrofia",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "12 cada", restSec: 30 },
      { exerciseId: "agachamento-bulgaro", sets: 4, repsTarget: "10 cada", restSec: 75 },
      { exerciseId: "stiff", sets: 4, repsTarget: "10-12", restSec: 75 },
      { exerciseId: "hip-thrust-unilateral", sets: 3, repsTarget: "12 cada", restSec: 60 },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45 },
    ],
  },
  {
    id: "h-sex-peitoral-postura",
    name: "🍑 Glúteo C · Volume + Coxa",
    dayOfWeek: 5,
    durationMin: 58,
    cycle: "hipertrofia",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "hip-thrust-barra", sets: 4, repsTarget: "15", restSec: 60 },
      { exerciseId: "agachamento-sumo", sets: 4, repsTarget: "12", restSec: 60 },
      { exerciseId: "coice-gluteo-polia", sets: 4, repsTarget: "15 cada", restSec: 30, notes: "Tensão constante na polia" },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "prancha-lateral", sets: 3, repsTarget: "30s cada", restSec: 30 },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Transverso — afina a cintura, sem engrossar" },
    ],
  },
];

// Ciclo 4 — REFINAMENTO — cargas menores, reps altas, simetria e densidade
const REFINEMENT: WorkoutTemplate[] = [
  {
    id: "r-seg-gluteo-densidade",
    name: "🍑 Glúteo densidade (alta rep)",
    dayOfWeek: 1,
    durationMin: 58,
    cycle: "refinamento",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "hip-thrust-barra", sets: 4, repsTarget: "15-20 (média)", restSec: 45 },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "15", restSec: 60 },
      { exerciseId: "coice-gluteo-polia", sets: 4, repsTarget: "20 cada", restSec: 30, notes: "Densidade — tensão constante na polia" },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "20 cada", restSec: 30 },
    ],
  },
  {
    id: "r-ter-cintura-postura",
    name: "Cintura + Postura (densidade)",
    dayOfWeek: 2,
    durationMin: 48,
    cycle: "refinamento",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "15 (bem leve)", restSec: 45 },
      { exerciseId: "face-pull-polia", sets: 4, repsTarget: "20", restSec: 30, notes: "Abre os ombros, levanta o busto" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "15 (leve)", restSec: 45 },
      { exerciseId: "dead-bug", sets: 3, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "prancha", sets: 3, repsTarget: "60s", restSec: 30 },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Transverso — afina a cintura, sem engrossar" },
    ],
  },
  {
    id: "r-qua-mobilidade-danca",
    name: "Mobilidade + Dança + 🍑 Glúteo médio (livre)",
    dayOfWeek: 3,
    durationMin: 56,
    cycle: "refinamento",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "cat-cow", sets: 2, repsTarget: "10", restSec: 0 },
      { exerciseId: "borboleta", sets: 1, repsTarget: "2min", restSec: 0 },
      { exerciseId: "agachamento-profundo-pausa", sets: 1, repsTarget: "3min", restSec: 0 },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30 },
      { exerciseId: "clamshell", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "rebolado-basico", sets: 4, repsTarget: "1min", restSec: 30 },
      { exerciseId: "isolamento-quadril-lateral", sets: 3, repsTarget: "1min cada", restSec: 30 },
    ],
  },
  {
    id: "r-qui-gluteo-simetria",
    name: "🍑 Glúteo simetria (unilateral)",
    dayOfWeek: 4,
    durationMin: 57,
    cycle: "refinamento",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "hip-thrust-unilateral", sets: 4, repsTarget: "15 cada", restSec: 45 },
      { exerciseId: "agachamento-bulgaro", sets: 3, repsTarget: "15 cada (leve)", restSec: 45 },
      { exerciseId: "stiff-unilateral", sets: 3, repsTarget: "15 cada (leve)", restSec: 45 },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "20", restSec: 30 },
    ],
  },
  {
    id: "r-sex-peitoral-refinamento",
    name: "🍑 Glúteo densidade + Core",
    dayOfWeek: 5,
    durationMin: 52,
    cycle: "refinamento",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "hip-thrust-barra", sets: 4, repsTarget: "20", restSec: 45 },
      { exerciseId: "abdutor-cabo-em-pe", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "ponte-gluteo-bola", sets: 3, repsTarget: "15", restSec: 30, notes: "Instabilidade recruta mais glúteo + core" },
      { exerciseId: "prancha-lateral", sets: 3, repsTarget: "45s cada", restSec: 30 },
    ],
  },
];

// Ciclo 5 — MANUTENÇÃO — segura a forma com volume reduzido. Fase ideal pra
// alinhar com o início da TRH: o estrogênio arredonda e amacia por cima da base
// muscular já construída.
const MAINTENANCE: WorkoutTemplate[] = [
  {
    id: "m-seg-gluteo",
    name: "🍑 Glúteo · Manutenção (força leve)",
    dayOfWeek: 1,
    durationMin: 48,
    cycle: "manutencao",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "hip-thrust-barra", sets: 3, repsTarget: "10-12", restSec: 75, notes: "Mantém a carga — não precisa subir sempre" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "12", restSec: 75 },
      { exerciseId: "stiff", sets: 3, repsTarget: "12", restSec: 60 },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45 },
    ],
  },
  {
    id: "m-ter-superior",
    name: "Superior + Cintura (manutenção)",
    dayOfWeek: 2,
    durationMin: 45,
    cycle: "manutencao",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "12 (leve)", restSec: 60 },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 60 },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15-20", restSec: 45, notes: "Postura ereta = busto mais cheio" },
      { exerciseId: "prancha", sets: 3, repsTarget: "45s", restSec: 30 },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Transverso — afina a cintura, sem engrossar" },
    ],
  },
  {
    id: "m-qua-mobilidade",
    name: "Mobilidade + Dança + 🍑 Glúteo médio (manutenção)",
    dayOfWeek: 3,
    durationMin: 48,
    cycle: "manutencao",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "cat-cow", sets: 2, repsTarget: "10", restSec: 0 },
      { exerciseId: "borboleta", sets: 1, repsTarget: "2min", restSec: 0 },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30 },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "clamshell", sets: 2, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "rebolado-basico", sets: 3, repsTarget: "1min", restSec: 30 },
      { exerciseId: "isolamento-quadril-lateral", sets: 3, repsTarget: "30s cada", restSec: 30 },
    ],
  },
  {
    id: "m-qui-gluteo",
    name: "🍑 Glúteo · Manutenção (unilateral)",
    dayOfWeek: 4,
    durationMin: 48,
    cycle: "manutencao",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "agachamento-bulgaro", sets: 3, repsTarget: "12 cada", restSec: 60 },
      { exerciseId: "hip-thrust-unilateral", sets: 3, repsTarget: "12 cada", restSec: 60 },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45 },
    ],
  },
  {
    id: "m-sex-gluteo",
    name: "🍑 Glúteo · Manutenção (bombeamento)",
    dayOfWeek: 5,
    durationMin: 45,
    cycle: "manutencao",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "hip-thrust-barra", sets: 3, repsTarget: "15", restSec: 45 },
      { exerciseId: "coice-gluteo-polia", sets: 3, repsTarget: "15 cada", restSec: 30, notes: "Pico de glúteo com tensão constante" },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "prancha-lateral", sets: 3, repsTarget: "30s cada", restSec: 30 },
    ],
  },
];

export const CYCLE_TEMPLATES: WorkoutTemplate[] = [
  ...VARIATION,
  ...HYPERTROPHY,
  ...REFINEMENT,
  ...MAINTENANCE,
];

export const CYCLES = [
  { id: "adaptacao", name: "Adaptação", description: "Aprende os movimentos, ativa glúteo, seca a barriga (déficit). Cargas leves (~6 semanas).", threshold: 28 },
  { id: "variacao", name: "Variação", description: "Mesmo objetivo de glúteo, exercícios variados pra estímulo novo.", threshold: 60 },
  { id: "hipertrofia", name: "Hipertrofia", description: "Fase de ouro: sai do déficit, volume alto, foco máximo em crescimento de glúteo.", threshold: 60 },
  { id: "refinamento", name: "Refinamento", description: "Cargas leves, reps altas, simetria e densidade do glúteo.", threshold: 60 },
  { id: "manutencao", name: "Manutenção", description: "Segura a forma com volume reduzido. Fase ideal pra alinhar com o início da TRH.", threshold: 120 },
] as const;

export type CycleId = typeof CYCLES[number]["id"];

// Qual meta nutricional cada fase usa. O app seleciona o plano alimentar
// correspondente ao ciclo de treino ativo.
export const CYCLE_TO_GOAL: Record<CycleId, "deficit" | "manutencao" | "superavit"> = {
  adaptacao: "deficit",   // secar a barriga
  variacao: "deficit",    // ainda secando
  hipertrofia: "superavit", // fase de crescer o glúteo
  refinamento: "manutencao",
  manutencao: "manutencao",
};
