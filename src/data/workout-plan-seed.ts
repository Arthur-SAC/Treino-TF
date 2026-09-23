import type { WorkoutTemplate } from "../lib/db";

// ═══════════════════════════════════════════════════════════════════════════
// CICLO 1 — ADAPTAÇÃO — reescrito para a Chun-Li macia (spec 2026-09-23).
// O objetivo virou "Chun-Li macia com glúteo destacado": coxa inteira grossa,
// glúteo que passa da linha da coxa, costas bonitas, peito cheio em cima e
// braço com força pra levantar a noiva. A semana passou a ser 3 dias de
// inferior + 2 de superior. O glúteo médio (a largura do quadril de frente)
// ganhou abdutora de máquina em 3 dias: antes era um dia forte e um simbólico.
// Adaptação é a rampa até a variação: nenhum grupo passa do volume dela
// (tests/data/fase1-chun-li.test.ts). Sem zona 2: a caminhada de 5 km é o
// cardio. Sem búlgaro nem swing, avançados demais pra quem está começando.
// `durationMin` = estimarDuracaoMin (session-duration.ts), nunca à mão.
// Os ids são os de sempre: o histórico de sessões dela aponta pra eles.
// ═══════════════════════════════════════════════════════════════════════════
export const WORKOUT_PLAN: WorkoutTemplate[] = [
  {
    id: "seg-gluteo-mobilidade",
    name: "◆Inferior A · Glúteo + coxa da frente",
    dayOfWeek: 1,
    durationMin: 42,
    cycle: "adaptacao",
    purpose: "Hoje é projeção do glúteo e a frente da coxa: o bumbum que passa da linha da coxa e a perna grossa da Chun-Li.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento", notes: "Aquece leve" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "hip-thrust-barra", sets: 3, repsTarget: "10-12", restSec: 90, block: "maquina", notes: "O maior construtor de projeção. Some peso quando as 12 saírem fácil" },
      { exerciseId: "leg-press-pes-medios", sets: 3, repsTarget: "12", restSec: 90, block: "maquina", notes: "Pés no MEIO da plataforma: é a frente da coxa" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", notes: "Glúteo médio — a largura do quadril de frente" },
      { exerciseId: "agachamento-goblet", sets: 3, repsTarget: "10-12", restSec: 75, block: "solo", notes: "Padrão de levantar: halter contra o peito, cotovelos pra baixo" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, block: "solo", notes: "Transverso: afina a cintura por dentro" },
    ],
  },
  {
    id: "ter-cintura-costas",
    name: "Superior A · Peito de cima + costas + braço",
    dayOfWeek: 2,
    durationMin: 42,
    cycle: "adaptacao",
    purpose: "Hoje é o tronco da Chun-Li: peito cheio em cima, meio das costas firme e braço com força — sem alargar ombro.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 75, block: "maquina", notes: "Pegada neutra, cotovelos rentes ao corpo: espessura no meio das costas, sem abrir" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", notes: "Postura: ombro pra trás = peito projetado" },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "12", restSec: 75, block: "solo", notes: "Peito de CIMA — é ele que enche o decote" },
      { exerciseId: "rosca-martelo", sets: 2, repsTarget: "12", restSec: 60, block: "solo" },
      { exerciseId: "triceps-testa-barra-w", sets: 2, repsTarget: "12", restSec: 60, block: "solo" },
      { exerciseId: "prancha-antirrotacao", sets: 3, repsTarget: "6 trocas cada lado", restSec: 30, block: "solo", notes: "Core que resiste a rotação — pessoa no colo se mexe" },
    ],
  },
  {
    id: "qua-mobilidade-danca",
    name: "◆Inferior B · Glúteo médio + coxa",
    dayOfWeek: 3,
    durationMin: 35,
    cycle: "adaptacao",
    purpose: "Hoje é a lateral do quadril e a coxa por dentro e pela frente: o que abre a silhueta vista de frente.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", notes: "Tronco um pouco inclinado pra frente: puxa pra parte de cima do glúteo" },
      { exerciseId: "cadeira-extensora", sets: 3, repsTarget: "12", restSec: 60, block: "maquina" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", notes: "Coxa interna cheia — as coxas se encostam" },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "15 cada", restSec: 30, block: "solo" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "15", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "qui-gluteo-coxa",
    name: "Superior B · Força de levantar",
    dayOfWeek: 4,
    durationMin: 42,
    cycle: "adaptacao",
    purpose: "Hoje é a força de carregar: pegada, braço e costas médias, com a lombar protegida.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "cross-over-cabo", sets: 3, repsTarget: "12", restSec: 60, block: "solo", notes: "Crucifixo inclinado leve: aproxima o meio do peito" },
      { exerciseId: "remada-unilateral-halter", sets: 3, repsTarget: "10 cada", restSec: 60, block: "solo" },
      { exerciseId: "rosca-barra-w", sets: 2, repsTarget: "12", restSec: 60, block: "solo" },
      { exerciseId: "carregamento-frontal", sets: 3, repsTarget: "20m", restSec: 60, block: "solo", notes: "Peso contra o PEITO, tronco ereto — o movimento de erguer alguém" },
      { exerciseId: "extensao-lombar", sets: 2, repsTarget: "12", restSec: 45, block: "solo" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "sex-peitoral-postura",
    name: "◆Inferior C · Glúteo máximo + posterior",
    dayOfWeek: 5,
    durationMin: 40,
    cycle: "adaptacao",
    purpose: "Hoje é o glúteo que passa da linha da coxa e a dobra de baixo nítida: projeção, com o posterior na medida.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "flexora-em-pe", sets: 3, repsTarget: "12 cada", restSec: 45, block: "maquina", notes: "O posterior vem daqui, não do stiff — é o que deixa a dobra do glúteo nítida" },
      { exerciseId: "hip-thrust-barra", sets: 3, repsTarget: "15", restSec: 60, block: "maquina", notes: "Carga média, reps altas, pausa de 1 s no topo" },
      { exerciseId: "stiff", sets: 2, repsTarget: "12", restSec: 75, block: "solo", notes: "Dobradiça: amplitude só até onde o posterior deixa, lombar neutra" },
      { exerciseId: "kickback", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo", notes: "Pico do glúteo — controla a volta" },
    ],
  },
];
