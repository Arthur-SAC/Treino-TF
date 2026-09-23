import type { WorkoutTemplate } from "../lib/db";

// ═══════════════════════════════════════════════════════════════════════════
// Todos os ciclos mantêm glúteo como PRIORIDADE Nº 1 (4 estímulos/semana) e
// vão progredindo: variação (estímulo novo) → hipertrofia (volume/superávit) →
// refinamento (alta rep/densidade) → manutenção (segura a forma quando o
// objetivo do momento é consolidar, não crescer).
// Regras fixas: dias de força (seg/ter/qui/sex) começam com cardio + articular;
// quarta começa com articular e tem o circuito de glúteo médio (ponte + abdução).
// ZONA 2 NÃO ENTRA AQUI: ela caminha 5 km do trabalho para casa todo dia, o
// que já é zona 2 e em dose melhor (diária, não 3x/semana). Prescrever de novo
// no fim do treino alongava a sessão em 20 min e empurrava o jantar para as
// 20h — que é exatamente quando o jantar sai do controle. O aquecimento leve
// na esteira continua: aquecer não é a mesma coisa que dosar cardio.
// PADRÃO DE LEVANTAR (2026-08-12): o objetivo dela de erguer a noiva no colo
// entrou nos ciclos de variação/hipertrofia/refinamento/manutenção por TROCA,
// nunca por soma — a sessão de academia não cresce (mesma razão da zona 2
// acima: mais minutos empurram o jantar pra depois das 20h). Cada exercício
// novo (agachamento-goblet, carregamento-frontal, prancha-antirrotacao) saiu
// de outro do mesmo template; contagem e durationMin ficam idênticos. A
// manutenção não recebe o carregamento frontal de propósito: é a fase de
// volume reduzido, e nem todo padrão precisa estar presente ali.
// ═══════════════════════════════════════════════════════════════════════════

// Ciclo 2 — VARIAÇÃO — reescrito para a Chun-Li macia (spec 2026-09-23).
// É o topo da fase 1: todo grupo fica dentro das faixas da spec
// (tests/data/fase1-chun-li.test.ts). 3 inferiores + 2 superiores, abdutora
// de máquina 3x, posterior pela flexora (stiff limitado pra não encher a dobra
// do glúteo), braço e peito de cima. `durationMin` = estimarDuracaoMin.
// Os ids são os de sempre: o histórico de sessões dela aponta pra eles.
const VARIATION: WorkoutTemplate[] = [
  {
    id: "v-seg-gluteo-unilateral",
    name: "◆Inferior A · Glúteo + coxa da frente",
    dayOfWeek: 1,
    durationMin: 57,
    cycle: "variacao",
    purpose: "Projeção do glúteo, a frente da coxa e a coxa interna — a perna inteira da Chun-Li num dia só.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "hip-thrust-barra", sets: 4, repsTarget: "10-12", restSec: 90, block: "maquina" },
      { exerciseId: "leg-press-pes-medios", sets: 3, repsTarget: "10-12", restSec: 90, block: "maquina" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15-20", restSec: 45, block: "maquina" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "agachamento-goblet", sets: 3, repsTarget: "10-12", restSec: 75, block: "solo" },
      { exerciseId: "kickback", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "v-ter-cintura-costas",
    name: "Superior A · Peito de cima + costas + braço",
    dayOfWeek: 2,
    durationMin: 53,
    cycle: "variacao",
    purpose: "Peito cheio em cima, meio das costas e braço firme — o tronco atlético que não fica quadrado.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "10-12", restSec: 75, block: "maquina", notes: "Pegada neutra, cotovelos rentes" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15-20", restSec: 45, block: "maquina" },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "10-12", restSec: 75, block: "solo" },
      { exerciseId: "cross-over-cabo", sets: 3, repsTarget: "12-15", restSec: 60, block: "solo" },
      { exerciseId: "rosca-martelo", sets: 3, repsTarget: "10-12", restSec: 60, block: "solo" },
      { exerciseId: "triceps-testa-barra-w", sets: 3, repsTarget: "10-12", restSec: 60, block: "solo" },
      { exerciseId: "prancha-antirrotacao", sets: 3, repsTarget: "6 trocas cada lado", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "v-qua-mobilidade-danca",
    name: "◆Inferior B · Glúteo médio + coxa",
    dayOfWeek: 3,
    durationMin: 46,
    cycle: "variacao",
    purpose: "A lateral do quadril com carga e a coxa por dentro e pela frente: é o que alarga a silhueta vista de frente.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 4, repsTarget: "15-20", restSec: 45, block: "maquina", notes: "Tronco inclinado pra frente" },
      { exerciseId: "cadeira-extensora", sets: 3, repsTarget: "12-15", restSec: 60, block: "maquina" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "agachamento-goblet", sets: 3, repsTarget: "10-12", restSec: 75, block: "solo" },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "20 cada", restSec: 30, block: "solo" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "v-qui-gluteo-stiff",
    name: "Superior B · Força de levantar",
    dayOfWeek: 4,
    durationMin: 57,
    cycle: "variacao",
    purpose: "Pegada, braço, costas médias e peito de cima: a força de erguer a noiva, com a lombar protegida.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "10-12", restSec: 75, block: "solo" },
      { exerciseId: "remada-unilateral-halter", sets: 3, repsTarget: "10-12 cada", restSec: 60, block: "solo" },
      { exerciseId: "rosca-barra-w", sets: 3, repsTarget: "10-12", restSec: 60, block: "solo" },
      { exerciseId: "triceps-testa-barra-w", sets: 3, repsTarget: "10-12", restSec: 60, block: "solo" },
      { exerciseId: "carregamento-frontal", sets: 3, repsTarget: "20m", restSec: 60, block: "solo" },
      { exerciseId: "farmer-walk", sets: 3, repsTarget: "30m", restSec: 60, block: "solo" },
      { exerciseId: "extensao-lombar", sets: 2, repsTarget: "12-15", restSec: 45, block: "solo" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "v-sex-peitoral-postura",
    name: "◆Inferior C · Glúteo máximo + posterior",
    dayOfWeek: 5,
    durationMin: 58,
    cycle: "variacao",
    purpose: "Glúteo destacado: projeção por trás e por cima, dobra de baixo nítida, posterior na medida.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15-20", restSec: 45, block: "maquina" },
      { exerciseId: "flexora-em-pe", sets: 3, repsTarget: "12 cada", restSec: 45, block: "maquina" },
      { exerciseId: "hip-thrust-unilateral", sets: 3, repsTarget: "10-12 cada", restSec: 60, block: "solo" },
      { exerciseId: "kettlebell-swing", sets: 3, repsTarget: "15", restSec: 60, block: "solo", notes: "Explosão de quadril — a dobradiça já aprendida na adaptação" },
      { exerciseId: "stiff", sets: 3, repsTarget: "10-12", restSec: 75, block: "solo" },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "15 cada", restSec: 30, block: "solo" },
      { exerciseId: "kickback", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo" },
    ],
  },
];

// Ciclo 3 — HIPERTROFIA — volume alto, reps 8-12, sai do déficit (manutenção/leve superávit)
const HYPERTROPHY: WorkoutTemplate[] = [
  {
    id: "h-seg-gluteo-volume",
    name: "◆Glúteo A · Volume alto",
    dayOfWeek: 1,
    durationMin: 47,
    cycle: "hipertrofia",
    purpose: "Fase de ouro do glúteo: empurra a carga, é agora que ele cresce de verdade.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 3, repsTarget: "12 cada", restSec: 30 },
      { exerciseId: "hip-thrust-barra", sets: 5, repsTarget: "8-10", restSec: 90, notes: "Fase de ouro — empurra a carga, glúteo cresce" },
      { exerciseId: "smith-squat", sets: 4, repsTarget: "10-12", restSec: 90 },
      { exerciseId: "agachamento-livre", sets: 3, repsTarget: "10", restSec: 90 },
      { exerciseId: "agachamento-goblet", sets: 3, repsTarget: "10-12", restSec: 75, notes: "Padrão de levantar — carga à frente, aprende o agachamento que serve pra erguer no colo" },
    ],
  },
  {
    id: "h-ter-cintura-costas",
    name: "Superior + Cintura (volume)",
    dayOfWeek: 2,
    durationMin: 35,
    cycle: "hipertrofia",
    purpose: "Superior e cintura em volume — postura forte que valoriza o busto.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "12 (LEVE)", restSec: 60, notes: "Leve de propósito: peitoral leve dá base que projeta o busto, pesado constrói um peito que lê como masculino" },
      { exerciseId: "carregamento-frontal", sets: 3, repsTarget: "20-30m", restSec: 60, notes: "Padrão de levantar — carga à frente do corpo" },
      { exerciseId: "remada-baixa-maquina", sets: 4, repsTarget: "10-12", restSec: 75 },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15-20", restSec: 45, notes: "Postura ereta = busto mais cheio" },
    ],
  },
  {
    id: "h-qua-mobilidade-danca",
    name: "Mobilidade + Dança + ◆Glúteo médio (volume)",
    dayOfWeek: 3,
    durationMin: 54,
    cycle: "hipertrofia",
    purpose: "Mobilidade + glúteo médio no volume — mantém o quadril solto enquanto cresce.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "cat-cow", sets: 2, repsTarget: "10", restSec: 0 },
      { exerciseId: "agachamento-profundo-pausa", sets: 1, repsTarget: "2min", restSec: 0 },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 30, notes: "Glúteo médio na máquina — arredonda a lateral" },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "clamshell", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30 },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "rebolado-basico", sets: 3, repsTarget: "1min", restSec: 30 },
    ],
  },
  {
    id: "h-qui-gluteo-posterior",
    name: "◆Glúteo B · Posterior + Coxa (volume)",
    dayOfWeek: 4,
    durationMin: 37,
    cycle: "hipertrofia",
    purpose: "Glúteo e posterior pesados — coxa cheia e bumbum projetado.",
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
    name: "◆Glúteo C · Volume + Coxa",
    dayOfWeek: 5,
    durationMin: 37,
    cycle: "hipertrofia",
    purpose: "Mais volume de glúteo e coxa — aproveita a fase de crescimento ao máximo.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "hip-thrust-barra", sets: 4, repsTarget: "15", restSec: 60 },
      { exerciseId: "agachamento-sumo", sets: 4, repsTarget: "12", restSec: 60 },
      { exerciseId: "kickback", sets: 4, repsTarget: "15 cada", restSec: 30, notes: "Pico de glúteo — caneleira pesada" },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "prancha-antirrotacao", sets: 3, repsTarget: "8 trocas cada lado", restSec: 45, notes: "Padrão de levantar — core que resiste a rotação, essencial pra carregar peso assimétrico" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Transverso — afina a cintura, sem engrossar" },
    ],
  },
];

// Ciclo 4 — REFINAMENTO — cargas menores, reps altas, simetria e densidade
const REFINEMENT: WorkoutTemplate[] = [
  {
    id: "r-seg-gluteo-densidade",
    name: "◆Glúteo densidade (alta rep)",
    dayOfWeek: 1,
    durationMin: 32,
    cycle: "refinamento",
    purpose: "Densidade do glúteo: muita repetição pra deixar o músculo durinho e desenhado.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "15 cada", restSec: 30 },
      { exerciseId: "hip-thrust-barra", sets: 4, repsTarget: "15-20 (média)", restSec: 45 },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "15", restSec: 60 },
      { exerciseId: "kickback", sets: 4, repsTarget: "20 cada", restSec: 30, notes: "Densidade — caneleira, alta repetição" },
      { exerciseId: "agachamento-goblet", sets: 3, repsTarget: "10-12", restSec: 75, notes: "Padrão de levantar — carga à frente, aprende o agachamento que serve pra erguer no colo" },
    ],
  },
  {
    id: "r-ter-cintura-postura",
    name: "Cintura + Postura (densidade)",
    dayOfWeek: 2,
    durationMin: 48,
    cycle: "refinamento",
    purpose: "Cintura e postura — refina a silhueta e levanta o busto.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "15 (bem leve)", restSec: 45 },
      { exerciseId: "face-pull-polia", sets: 4, repsTarget: "20", restSec: 30, notes: "Abre os ombros, levanta o busto" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "15 (leve)", restSec: 45 },
      { exerciseId: "carregamento-frontal", sets: 3, repsTarget: "20-30m", restSec: 60, notes: "Padrão de levantar — carga à frente do corpo" },
      { exerciseId: "prancha-antirrotacao", sets: 3, repsTarget: "8 trocas cada lado", restSec: 45, notes: "Padrão de levantar — core que resiste a rotação, essencial pra carregar peso assimétrico" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Transverso — afina a cintura, sem engrossar" },
    ],
  },
  {
    id: "r-qua-mobilidade-danca",
    name: "Mobilidade + Dança + ◆Glúteo médio (livre)",
    dayOfWeek: 3,
    durationMin: 56,
    cycle: "refinamento",
    purpose: "Mobilidade livre + glúteo médio — fluidez e lateral redonda.",
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
    name: "◆Glúteo simetria (unilateral)",
    dayOfWeek: 4,
    durationMin: 32,
    cycle: "refinamento",
    purpose: "Glúteo um lado de cada vez — corrige diferença entre os lados pra ficar simétrico.",
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
    name: "◆Glúteo densidade + Core",
    dayOfWeek: 5,
    durationMin: 32,
    cycle: "refinamento",
    purpose: "Densidade de glúteo + core — acabamento da forma.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "hip-thrust-barra", sets: 4, repsTarget: "20", restSec: 45 },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "20", restSec: 30, notes: "Glúteo médio na máquina — arredonda a lateral" },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "20 cada", restSec: 30 },
      { exerciseId: "ponte-gluteo-bola", sets: 3, repsTarget: "15", restSec: 30, notes: "Instabilidade recruta mais glúteo + core" },
      { exerciseId: "prancha-lateral", sets: 3, repsTarget: "45s cada", restSec: 30 },
    ],
  },
];

// Ciclo 5 — MANUTENÇÃO — segura a forma com volume reduzido. Serve para
// consolidar depois de uma fase de crescimento, ou para atravessar um período
// em que a vida não comporta volume alto. Não é sala de espera de nada.
const MAINTENANCE: WorkoutTemplate[] = [
  {
    id: "m-seg-gluteo",
    name: "◆Glúteo · Manutenção (força leve)",
    dayOfWeek: 1,
    durationMin: 37,
    cycle: "manutencao",
    purpose: "Manutenção do glúteo: segura o que você construiu sem forçar — volume menor, carga mantida.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15-20", restSec: 45, notes: "Glúteo médio não cai abaixo de 12 séries nem na manutenção" },
      { exerciseId: "hip-thrust-barra", sets: 3, repsTarget: "10-12", restSec: 75, notes: "Mantém a carga — não precisa subir sempre" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "12", restSec: 75 },
      { exerciseId: "stiff", sets: 3, repsTarget: "12", restSec: 60 },
      { exerciseId: "agachamento-goblet", sets: 3, repsTarget: "10-12", restSec: 75, notes: "Padrão de levantar — carga à frente, aprende o agachamento que serve pra erguer no colo" },
    ],
  },
  {
    id: "m-ter-superior",
    name: "Superior + Cintura (manutenção)",
    dayOfWeek: 2,
    durationMin: 45,
    cycle: "manutencao",
    purpose: "Mantém postura e cintura — silhueta firme com pouco volume.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "12 (leve)", restSec: 60 },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 60 },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15-20", restSec: 45, notes: "Postura ereta = busto mais cheio" },
      { exerciseId: "prancha-antirrotacao", sets: 3, repsTarget: "8 trocas cada lado", restSec: 45, notes: "Padrão de levantar — core que resiste a rotação, essencial pra carregar peso assimétrico" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Transverso — afina a cintura, sem engrossar" },
    ],
  },
  {
    id: "m-qua-mobilidade",
    name: "Mobilidade + Dança + ◆Glúteo médio (manutenção)",
    dayOfWeek: 3,
    durationMin: 48,
    cycle: "manutencao",
    purpose: "Mobilidade + glúteo médio leve — mantém o quadril solto e a lateral.",
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
    name: "◆Glúteo · Manutenção (unilateral)",
    dayOfWeek: 4,
    durationMin: 32,
    cycle: "manutencao",
    purpose: "Manutenção do glúteo unilateral — preserva simetria e coxa.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15-20", restSec: 45, notes: "Glúteo médio não cai abaixo de 12 séries nem na manutenção" },
      { exerciseId: "agachamento-bulgaro", sets: 3, repsTarget: "12 cada", restSec: 60 },
      { exerciseId: "hip-thrust-unilateral", sets: 3, repsTarget: "12 cada", restSec: 60 },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45 },
    ],
  },
  {
    id: "m-sex-gluteo",
    name: "◆Glúteo · Manutenção (bombeamento)",
    dayOfWeek: 5,
    durationMin: 27,
    cycle: "manutencao",
    purpose: "Bombeamento leve de glúteo — mantém o músculo ativo e cheio.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5-7min", restSec: 0 },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "hip-thrust-barra", sets: 3, repsTarget: "15", restSec: 45 },
      { exerciseId: "kickback", sets: 3, repsTarget: "15 cada", restSec: 30, notes: "Pico de glúteo — caneleira pesada, controla a volta" },
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
  { id: "entrada-1", name: "Entrada · Semana 1", description: "Só máquina sentada, bike e solo. Aprende os padrões e se acostuma com o espaço.", threshold: 5 },
  { id: "entrada-2", name: "Entrada · Semana 2", description: "Entra a dobradiça de quadril com halteres leves e o step-up.", threshold: 5 },
  { id: "entrada-3", name: "Entrada · Semana 3", description: "Entra o hip thrust — primeiro com o peso do corpo, depois com a barra vazia.", threshold: 5 },
  { id: "adaptacao", name: "Adaptação", description: "Aprende os movimentos, ativa glúteo, seca a barriga (déficit). Cargas leves (~6 semanas).", threshold: 28 },
  { id: "variacao", name: "Variação", description: "Mesmo objetivo de glúteo, exercícios variados pra estímulo novo.", threshold: 60 },
  { id: "hipertrofia", name: "Hipertrofia", description: "Fase de ouro: volume alto, foco máximo em crescimento de glúteo.", threshold: 60 },
  { id: "refinamento", name: "Refinamento", description: "Cargas leves, reps altas, simetria e densidade do glúteo.", threshold: 60 },
  { id: "manutencao", name: "Manutenção", description: "Segura a forma com volume reduzido. Para consolidar depois de crescer, ou atravessar um período apertado.", threshold: 120 },
] as const;

export type CycleId = typeof CYCLES[number]["id"];

// Qual meta nutricional cada fase usa. O app seleciona o plano alimentar
// correspondente ao ciclo de treino ativo.
export const CYCLE_TO_GOAL: Record<CycleId, "deficit" | "manutencao" | "superavit"> = {
  "entrada-1": "deficit",
  "entrada-2": "deficit",
  "entrada-3": "deficit",
  adaptacao: "deficit",   // secar a barriga
  variacao: "deficit",    // ainda secando
  hipertrofia: "superavit", // fase de crescer o glúteo
  refinamento: "manutencao",
  manutencao: "manutencao",
};
