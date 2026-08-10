import type { WorkoutTemplate } from "../lib/db";

// ═══════════════════════════════════════════════════════════════════════════
// CICLO 1 — ADAPTAÇÃO — glúteo é PRIORIDADE Nº 1. Enxuto pra INICIANTE:
// sessões de ~22–40 min (ela está começando e não quer 2h; os dias que
// perderam a zona 2 em 2026-08-10 ficaram mais curtos — a caminhada diária
// já cobre o cardio). Poucos exercícios,
// 3 séries, foco em aprender o padrão e ativar glúteo. Cintura fina = só core
// transverso (sem oblíquo com carga). A progressão de volume vem nas fases
// seguintes (variação/hipertrofia). Regra: força começa com cardio + articular.
// ═══════════════════════════════════════════════════════════════════════════
export const WORKOUT_PLAN: WorkoutTemplate[] = [
  {
    id: "seg-gluteo-mobilidade",
    name: "◆Glúteo A · Força",
    dayOfWeek: 1,
    durationMin: 27,
    cycle: "adaptacao",
    purpose: "Hoje é glúteo pesado: construir a base de músculo que dá volume e forma ao bumbum — a fundação que a TRH vai arredondar depois.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, notes: "Aquece leve" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "12 cada", restSec: 30, notes: "Ativação — sente o glúteo ligar antes de carregar" },
      { exerciseId: "hip-thrust-barra", sets: 3, repsTarget: "10-12", restSec: 90, notes: "O MAIOR construtor de glúteo. Some peso quando as reps saírem fácil" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "12", restSec: 90, notes: "Leg press 45° com pés ALTOS e um pouco abertos = foco glúteo. Empurra pelo calcanhar. Plataforma pequena? faz unilateral (um pé por vez)" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, notes: "Glúteo médio — arredonda a lateral" },
    ],
  },
  {
    id: "ter-cintura-costas",
    name: "Superior leve + Cintura fina",
    dayOfWeek: 2,
    durationMin: 36,
    cycle: "adaptacao",
    purpose: "Hoje afina a cintura e cuida da postura e do busto, com carga leve pra deixar o tronco elegante sem engrossar.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0 },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "12 (LEVE)", restSec: 60, notes: "Base de busto — carga leve" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 60, notes: "Postura — multiestação" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15-20", restSec: 45, notes: "Postura ereta = busto mais cheio" },
      { exerciseId: "prancha", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Core sem engrossar a cintura" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Transverso — afina a cintura por dentro, sem engrossar" },
    ],
  },
  {
    id: "qua-mobilidade-danca",
    name: "Mobilidade + Dança + ◆Glúteo médio",
    dayOfWeek: 3,
    durationMin: 40,
    cycle: "adaptacao",
    purpose: "Hoje solta o quadril e trabalha o glúteo médio — o que arredonda a lateral do bumbum e dá o gingado. Dia mais leve.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "cat-cow", sets: 2, repsTarget: "10", restSec: 0 },
      { exerciseId: "agachamento-assistido-espaldar", sets: 2, repsTarget: "30-60s", restSec: 20, notes: "Destrava o quadril de quem fica sentada" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 30, notes: "Glúteo médio na máquina — arredonda a lateral" },
      { exerciseId: "clamshell", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30 },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "rebolado-basico", sets: 3, repsTarget: "1min", restSec: 30 },
    ],
  },
  {
    id: "qui-gluteo-coxa",
    name: "◆Glúteo B · Unilateral + Coxa",
    dayOfWeek: 4,
    durationMin: 27,
    cycle: "adaptacao",
    purpose: "Hoje é glúteo e coxa um lado de cada vez: corrige assimetria e deixa as pernas mais cheias e femininas.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "12 cada", restSec: 30 },
      { exerciseId: "step-up-gluteo", sets: 3, repsTarget: "10 cada", restSec: 60, notes: "Sobe empurrando pelo calcanhar da perna de cima, desce devagar. Substitui o búlgaro, que é avançado demais pra esta fase" },
      { exerciseId: "stiff", sets: 3, repsTarget: "12", restSec: 60, notes: "Dobradiça de quadril — o padrão que mais constrói glúteo. Amplitude só até onde o posterior deixa, sem arredondar a lombar" },
      { exerciseId: "hip-thrust-unilateral", sets: 3, repsTarget: "10 cada", restSec: 60 },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, notes: "Coxa interna cheia — silhueta curvilínea" },
    ],
  },
  {
    id: "sex-peitoral-postura",
    name: "◆Glúteo C · Volume + Core",
    dayOfWeek: 5,
    durationMin: 22,
    cycle: "adaptacao",
    purpose: "Hoje é bombeamento de glúteo (muita repetição) + core que segura a cintura fina.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0 },
      { exerciseId: "hip-thrust-barra", sets: 4, repsTarget: "15-20 (bombeamento)", restSec: 45, notes: "Reps altas, carga média — bomba de sangue no glúteo" },
      { exerciseId: "kickback", sets: 3, repsTarget: "15 cada", restSec: 30, notes: "Pico de glúteo — caneleira pesada, controla a volta" },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Cinto interno — prioridade sem TRH" },
    ],
  },
];
