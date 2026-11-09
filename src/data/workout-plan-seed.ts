import type { WorkoutTemplate } from "../lib/db";

// ═══════════════════════════════════════════════════════════════════════════
// CICLO 1 — ADAPTAÇÃO — Chun-Li macia (spec 2026-09-23), na Smartfit Jardins
// desde 2026-11-09. Mesma divisão da variação: Inferior A · Superior A ·
// Inferior B · Superior B · Inferior C, abdutora de máquina em 3 dias.
// Adaptação é a rampa até a variação: nenhum grupo passa do volume dela
// (tests/data/fase1-chun-li.test.ts). Sem búlgaro nem swing, avançados demais
// pra quem está começando; o stiff fica (2 séries na sexta) porque é aqui que
// ela aprende a dobradiça de quadril — a flexora segue com mais séries.
// Todo item com máquina, polia, banco ou barra tem `substitutoId` pro
// "Ocupado"/"Não tem aqui" (tests/data/substitutos.test.ts).
// MÁQUINA PRIMEIRO (decisão dela, 2026-11-09): onde a máquina ou a polia rende
// igual, ela é o exercício e o peso livre é o plano B — ver cycles-seed.ts.
// `durationMin` = estimarDuracaoMin (session-duration.ts), nunca à mão.
// Os ids são os de sempre: o histórico de sessões dela aponta pra eles.
// ═══════════════════════════════════════════════════════════════════════════
export const WORKOUT_PLAN: WorkoutTemplate[] = [
  {
    id: "seg-gluteo-mobilidade",
    name: "◆Inferior A · Glúteo + coxa da frente",
    dayOfWeek: 1,
    durationMin: 41,
    cycle: "adaptacao",
    purpose: "Hoje é projeção do glúteo e a frente da coxa: o bumbum que passa da linha da coxa e a perna grossa da Chun-Li.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento", notes: "Aquece leve" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "10-12", restSec: 90, block: "maquina", substitutoId: "hip-thrust-barra", notes: "O maior construtor de projeção. Suba a carga quando as 12 saírem fácil" },
      { exerciseId: "leg-press-pes-medios", sets: 3, repsTarget: "12", restSec: 90, block: "maquina", substitutoId: "agachamento-goblet", notes: "Pés no MEIO da plataforma: é a frente da coxa" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "abducao-quadril-polia", notes: "Glúteo médio — a largura do quadril de frente" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo", notes: "Coxa interna cheia — as coxas se encostam" },
      { exerciseId: "coice-gluteo-polia", sets: 2, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "kickback", notes: "Pico do glúteo — controle a volta" },
    ],
  },
  {
    id: "ter-cintura-costas",
    name: "Superior A · Peito de cima + costas + braço",
    dayOfWeek: 2,
    durationMin: 47,
    cycle: "adaptacao",
    purpose: "Hoje é o tronco da Chun-Li: peito cheio em cima, meio das costas firme e braço com força — sem alargar ombro.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 75, block: "maquina", substitutoId: "remada-unilateral-halter", notes: "Pegada neutra, cotovelos rentes ao corpo: espessura no meio das costas, sem abrir" },
      { exerciseId: "voador-maquina", sets: 2, repsTarget: "12-15", restSec: 60, block: "maquina", substitutoId: "crucifixo-polia" },
      { exerciseId: "supino-inclinado-maquina", sets: 3, repsTarget: "12", restSec: 75, block: "maquina", substitutoId: "supino-inclinado-halteres", notes: "Peito de CIMA — é ele que enche o decote" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15", restSec: 45, block: "solo", substitutoId: "face-pull", notes: "Postura: ombro pra trás = peito projetado" },
      { exerciseId: "rosca-polia", sets: 2, repsTarget: "12", restSec: 60, block: "solo", substitutoId: "rosca-martelo" },
      { exerciseId: "triceps-polia-corda", sets: 2, repsTarget: "12", restSec: 60, block: "solo", substitutoId: "triceps-testa-barra-w" },
      { exerciseId: "pallof-polia", sets: 3, repsTarget: "6 cada", restSec: 30, block: "solo", substitutoId: "prancha-antirrotacao", notes: "Core que resiste a rotação — pessoa no colo se mexe" },
    ],
  },
  {
    id: "qua-mobilidade-danca",
    name: "◆Inferior B · Glúteo médio + coxa",
    dayOfWeek: 3,
    durationMin: 38,
    cycle: "adaptacao",
    purpose: "Hoje é a lateral do quadril e a coxa por dentro e pela frente: o que abre a silhueta vista de frente.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "hip-thrust-maquina-leve", sets: 2, repsTarget: "15", restSec: 30, block: "aquecimento", substitutoId: "ponte-gluteo-band", notes: "Leve, só pra acordar o glúteo antes do resto" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "abdutor-band-em-pe", notes: "Tronco um pouco inclinado pra frente: puxa pra parte de cima do glúteo" },
      { exerciseId: "cadeira-extensora", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "step-up-gluteo" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo" },
      { exerciseId: "agachamento-goblet", sets: 3, repsTarget: "10-12", restSec: 75, block: "solo", notes: "Padrão de levantar: halter contra o peito, cotovelos pra baixo" },
      { exerciseId: "abducao-quadril-polia", sets: 2, repsTarget: "15 cada", restSec: 30, block: "solo", substitutoId: "abdutor-deitada" },
    ],
  },
  {
    id: "qui-gluteo-coxa",
    name: "Superior B · Força de levantar",
    dayOfWeek: 4,
    durationMin: 41,
    cycle: "adaptacao",
    purpose: "Hoje é a força de carregar: pegada, braço e costas médias, com a lombar protegida.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "crucifixo-polia", sets: 3, repsTarget: "12", restSec: 60, block: "solo", substitutoId: "cross-over-cabo", notes: "De baixo pra cima: é o peito de cima" },
      { exerciseId: "remada-polia-unilateral", sets: 3, repsTarget: "10 cada", restSec: 60, block: "solo", substitutoId: "remada-unilateral-halter" },
      { exerciseId: "rosca-polia", sets: 2, repsTarget: "12", restSec: 60, block: "solo", substitutoId: "rosca-barra-w" },
      { exerciseId: "triceps-polia-corda", sets: 2, repsTarget: "12", restSec: 60, block: "solo", substitutoId: "triceps-testa-barra-w" },
      { exerciseId: "carregamento-frontal", sets: 3, repsTarget: "20m", restSec: 60, block: "solo", notes: "Peso contra o PEITO, tronco ereto — o movimento de erguer alguém" },
      { exerciseId: "extensao-lombar", sets: 2, repsTarget: "12", restSec: 45, block: "solo" },
    ],
  },
  {
    id: "sex-peitoral-postura",
    name: "◆Inferior C · Glúteo máximo + posterior",
    dayOfWeek: 5,
    durationMin: 38,
    cycle: "adaptacao",
    purpose: "Hoje é o glúteo que passa da linha da coxa e a dobra de baixo nítida: projeção, com o posterior na medida.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "abducao-quadril-polia" },
      { exerciseId: "flexora-sentada", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "flexora-em-pe", notes: "O posterior vem daqui, não do stiff — é o que deixa a dobra do glúteo nítida" },
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "15", restSec: 60, block: "maquina", substitutoId: "hip-thrust-barra", notes: "Carga média, reps altas, pausa de 1 s no topo" },
      { exerciseId: "stiff", sets: 2, repsTarget: "12", restSec: 75, block: "solo", substitutoId: "good-morning", notes: "Dobradiça: amplitude só até onde o posterior deixa, lombar neutra" },
      { exerciseId: "coice-gluteo-polia", sets: 2, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "kickback", notes: "Pico do glúteo — controle a volta" },
    ],
  },
];
