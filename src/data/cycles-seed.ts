import type { WorkoutTemplate } from "../lib/db";

// ═══════════════════════════════════════════════════════════════════════════
// SMARTFIT JARDINS DESDE 2026-11-09. Ela antecipou a troca de academia pra
// fase 1 (docs/OBJETIVO.md §8), e todos os ciclos foram reescritos com os
// aparelhos que ela confirmou: máquina de hip thrust, flexora sentada, polia
// que desce até o chão, abdutora/adutora, leg press, extensora, peck deck,
// remada, banco inclinado e halteres. Coice na máquina, extensão a 45° e hack
// só entram "se tiver"; smith nunca é exercício principal.
//
// A semana é sempre a mesma divisão: Inferior A (seg) · Superior A (ter) ·
// Inferior B (qua) · Superior B (qui) · Inferior C (sex). Glúteo médio na
// abdutora 3x, posterior pela flexora (stiff pouco ou nenhum), peito de cima,
// remadas sem puxada aberta, braço e carregamentos pra levantar a noiva.
//
// FAIXAS (séries por semana, OBJETIVO.md §8.3): a variação fica dentro delas
// (tests/data/fase1-chun-li.test.ts); a hipertrofia dentro e nunca abaixo da
// variação, o refinamento dentro, a manutenção nunca acima do refinamento e
// nunca com glúteo médio abaixo de 12 (tests/data/fase2-smartfit.test.ts).
//
// "OCUPADO" / "NÃO TEM AQUI": todo item que usa máquina, polia, banco ou barra
// declara `substitutoId` — mesmo grupo muscular, de preferência halter ou
// polia, sem repetir outro exercício do dia (tests/data/substitutos.test.ts).
// O substituto herda séries/reps/descanso do item, então a sessão não cresce.
//
// `block`: "maquina" pras máquinas, "solo" pra polia, halter, banco e peso do
// corpo, sempre contíguos. `durationMin` = estimarDuracaoMin, ≤ 60 min. O
// cardio leve pós-treino dos ciclos de déficit é somado em all-templates.ts.
// ZONA 2 NÃO ENTRA AQUI: a caminhada a pé até a academia e de volta já é a dose.
// Os ids são os de sempre: o histórico de sessões dela aponta pra eles.
// ═══════════════════════════════════════════════════════════════════════════

// Ciclo 2 — VARIAÇÃO — topo da fase 1. Ainda em déficit.
const VARIATION: WorkoutTemplate[] = [
  {
    id: "v-seg-gluteo-unilateral",
    name: "◆Inferior A · Glúteo + coxa da frente",
    dayOfWeek: 1,
    durationMin: 54,
    cycle: "variacao",
    purpose: "Projeção do glúteo, a frente da coxa e a coxa interna — a perna inteira da Chun-Li num dia só.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "hip-thrust-maquina", sets: 4, repsTarget: "10-12", restSec: 90, block: "maquina", substitutoId: "hip-thrust-barra", notes: "O maior construtor de projeção. Segure 1 s lá em cima apertando o glúteo" },
      { exerciseId: "leg-press-pes-medios", sets: 4, repsTarget: "10-12", restSec: 90, block: "maquina", substitutoId: "agachamento-goblet", notes: "Pés no meio da plataforma: é a frente da coxa" },
      { exerciseId: "abdutor-maquina", sets: 4, repsTarget: "15-20", restSec: 45, block: "maquina", substitutoId: "abducao-quadril-polia" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo" },
      { exerciseId: "coice-gluteo-polia", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "kickback", notes: "Polia no chão, tornozeleira no pé: chute pra trás e pra cima sem arquear a lombar" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "v-ter-cintura-costas",
    name: "Superior A · Peito de cima + costas + braço",
    dayOfWeek: 2,
    durationMin: 54,
    cycle: "variacao",
    purpose: "Peito cheio em cima, meio das costas e braço firme — o tronco atlético que não fica quadrado.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "10-12", restSec: 75, block: "maquina", substitutoId: "remada-unilateral-halter", notes: "Pegada neutra, cotovelos rentes" },
      { exerciseId: "voador-maquina", sets: 3, repsTarget: "12-15", restSec: 60, block: "maquina", substitutoId: "crucifixo-polia" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15-20", restSec: 45, block: "solo", substitutoId: "face-pull" },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "10-12", restSec: 75, block: "solo", substitutoId: "cross-over-cabo" },
      { exerciseId: "rosca-martelo", sets: 3, repsTarget: "10-12", restSec: 60, block: "solo", substitutoId: "rosca-polia" },
      { exerciseId: "triceps-polia-corda", sets: 3, repsTarget: "10-12", restSec: 60, block: "solo", substitutoId: "triceps-testa-barra-w" },
      { exerciseId: "pallof-polia", sets: 3, repsTarget: "10 cada", restSec: 30, block: "solo", substitutoId: "prancha-antirrotacao", notes: "Core que resiste à rotação — pessoa no colo se mexe" },
    ],
  },
  {
    id: "v-qua-mobilidade-danca",
    name: "◆Inferior B · Glúteo médio + coxa",
    dayOfWeek: 3,
    durationMin: 54,
    cycle: "variacao",
    purpose: "A lateral do quadril com carga e a coxa por dentro e pela frente: é o que alarga a silhueta vista de frente.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 4, repsTarget: "15-20", restSec: 45, block: "maquina", substitutoId: "abdutor-band-em-pe", notes: "Tronco inclinado pra frente" },
      { exerciseId: "cadeira-extensora", sets: 5, repsTarget: "12-15", restSec: 60, block: "maquina", substitutoId: "agachamento-goblet" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo" },
      { exerciseId: "flexora-sentada", sets: 2, repsTarget: "10-12", restSec: 60, block: "maquina", substitutoId: "flexora-em-pe", notes: "O resto do posterior da semana fica na sexta — dividido pra não acumular 6 séries num aparelho só" },
      { exerciseId: "agachamento-bulgaro", sets: 3, repsTarget: "10-12 cada", restSec: 75, block: "solo", substitutoId: "leg-press-pes-medios", notes: "Comece com 2 halteres de 6 kg. Passada longa, peso no calcanhar da frente, lado mais fraco primeiro." },
      { exerciseId: "abducao-quadril-polia", sets: 3, repsTarget: "15 cada", restSec: 30, block: "solo", substitutoId: "abdutor-deitada" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "v-qui-gluteo-stiff",
    name: "Superior B · Força de levantar",
    dayOfWeek: 4,
    durationMin: 53,
    cycle: "variacao",
    purpose: "Pegada, braço, costas médias e peito de cima: a força de erguer a noiva, com a lombar protegida.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "10-12", restSec: 75, block: "solo", substitutoId: "crucifixo-polia" },
      { exerciseId: "remada-unilateral-halter", sets: 3, repsTarget: "10-12 cada", restSec: 60, block: "solo", substitutoId: "remada-baixa-maquina" },
      { exerciseId: "rosca-polia", sets: 3, repsTarget: "10-12", restSec: 60, block: "solo", substitutoId: "rosca-barra-w" },
      { exerciseId: "triceps-testa-barra-w", sets: 3, repsTarget: "10-12", restSec: 60, block: "solo", substitutoId: "triceps-polia-corda" },
      { exerciseId: "carregamento-frontal", sets: 3, repsTarget: "20m", restSec: 60, block: "solo", notes: "Peso contra o peito, tronco ereto — o movimento de erguer alguém" },
      { exerciseId: "farmer-walk", sets: 3, repsTarget: "30m", restSec: 60, block: "solo" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "v-sex-peitoral-postura",
    name: "◆Inferior C · Glúteo máximo + posterior",
    dayOfWeek: 5,
    durationMin: 49,
    cycle: "variacao",
    purpose: "Glúteo destacado: projeção por trás e por cima, dobra de baixo nítida, posterior na medida.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 4, repsTarget: "15-20", restSec: 45, block: "maquina", substitutoId: "abducao-quadril-polia" },
      { exerciseId: "flexora-sentada", sets: 4, repsTarget: "10-12", restSec: 60, block: "maquina", substitutoId: "flexora-em-pe", notes: "O posterior vem daqui, não do stiff — é o que deixa a dobra do glúteo nítida" },
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "10-12", restSec: 75, block: "maquina", substitutoId: "hip-thrust-barra" },
      { exerciseId: "pull-through-polia", sets: 3, repsTarget: "12-15", restSec: 60, block: "solo", substitutoId: "kettlebell-swing", notes: "Quadril pra trás, braços soltos; quem puxa o cabo é o glúteo, não as costas" },
      { exerciseId: "extensao-45-gluteo", sets: 2, repsTarget: "12-15", restSec: 45, block: "solo", substitutoId: "ponte-gluteo-bola", notes: "Costas arredondadas de leve e pés virados pra fora: o glúteo faz a subida, não a lombar" },
      { exerciseId: "coice-gluteo-polia", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "kickback" },
    ],
  },
];

// Ciclo 3 — HIPERTROFIA — topo das faixas, reps 8-12, sai do déficit.
const HYPERTROPHY: WorkoutTemplate[] = [
  {
    id: "h-seg-gluteo-volume",
    name: "◆Inferior A · Glúteo + coxa (volume)",
    dayOfWeek: 1,
    durationMin: 54,
    cycle: "hipertrofia",
    purpose: "Fase de ouro do glúteo: empurra a carga no hip thrust e no leg press, é agora que ele cresce de verdade.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "hip-thrust-maquina", sets: 5, repsTarget: "8-10", restSec: 90, block: "maquina", substitutoId: "hip-thrust-barra", notes: "Fase de ouro — anote a carga e suba quando as 10 saírem" },
      { exerciseId: "leg-press-pes-medios", sets: 5, repsTarget: "8-10", restSec: 75, block: "maquina", substitutoId: "agachamento-goblet" },
      { exerciseId: "abdutor-maquina", sets: 5, repsTarget: "12-15", restSec: 30, block: "maquina", substitutoId: "abducao-quadril-polia" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "12-15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo" },
      { exerciseId: "coice-gluteo-polia", sets: 2, repsTarget: "10-12 cada", restSec: 30, block: "solo", substitutoId: "kickback", notes: "Pico do glúteo — controle a volta" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, block: "solo", notes: "Transverso — afina a cintura, sem engrossar" },
    ],
  },
  {
    id: "h-ter-cintura-costas",
    name: "Superior A · Peito de cima + costas + braço (volume)",
    dayOfWeek: 2,
    durationMin: 56,
    cycle: "hipertrofia",
    purpose: "Tronco em volume: peito de cima, meio das costas e braço — postura forte que valoriza o busto.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 4, repsTarget: "8-10", restSec: 75, block: "maquina", substitutoId: "remada-unilateral-halter", notes: "Pegada neutra, cotovelos rentes: espessura no meio das costas, sem abrir" },
      { exerciseId: "voador-maquina", sets: 4, repsTarget: "10-12", restSec: 60, block: "maquina", substitutoId: "crucifixo-polia" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15-20", restSec: 45, block: "solo", substitutoId: "face-pull", notes: "Postura ereta = busto mais cheio" },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "10-12", restSec: 75, block: "solo", substitutoId: "cross-over-cabo", notes: "Inclinado e controlado: enche o peito de cima. O que lê como masculino é supino reto ou declinado pesado — este progride" },
      { exerciseId: "rosca-martelo", sets: 3, repsTarget: "8-10", restSec: 60, block: "solo", substitutoId: "rosca-polia" },
      { exerciseId: "triceps-polia-corda", sets: 3, repsTarget: "10-12", restSec: 60, block: "solo", substitutoId: "triceps-testa-barra-w" },
      { exerciseId: "prancha-antirrotacao", sets: 3, repsTarget: "8 trocas cada lado", restSec: 45, block: "solo", notes: "Padrão de levantar — core que resiste a rotação, essencial pra carregar peso assimétrico" },
    ],
  },
  {
    id: "h-qua-mobilidade-danca",
    name: "◆Inferior B · Glúteo médio + coxa (volume)",
    dayOfWeek: 3,
    durationMin: 54,
    cycle: "hipertrofia",
    purpose: "Glúteo médio e coxa no volume: a lateral do quadril que alarga a silhueta e a coxa que fica grossa.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 5, repsTarget: "12-15", restSec: 30, block: "maquina", substitutoId: "abdutor-band-em-pe", notes: "Tronco inclinado pra frente: puxa pra parte de cima do glúteo" },
      { exerciseId: "hack-machine", sets: 3, repsTarget: "10-12", restSec: 60, block: "maquina", substitutoId: "leg-press-pes-medios", notes: "Se a unidade não tiver o hack, marque \"Não tem aqui\" e o leg press entra no lugar" },
      { exerciseId: "cadeira-extensora", sets: 3, repsTarget: "12-15", restSec: 60, block: "maquina", substitutoId: "agachamento-goblet" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "12-15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo" },
      { exerciseId: "flexora-sentada", sets: 2, repsTarget: "8-10", restSec: 60, block: "maquina", substitutoId: "flexora-em-pe", notes: "O resto do posterior da semana fica na sexta — dividido pra não acumular 6 séries num aparelho só" },
      { exerciseId: "agachamento-bulgaro", sets: 3, repsTarget: "8-10 cada", restSec: 60, block: "solo", substitutoId: "step-up-gluteo", notes: "Lado mais fraco primeiro; tronco levemente inclinado pra frente" },
      { exerciseId: "abducao-quadril-polia", sets: 3, repsTarget: "15 cada", restSec: 30, block: "solo", substitutoId: "abdutor-deitada" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "h-qui-gluteo-posterior",
    name: "Superior B · Força de levantar (volume)",
    dayOfWeek: 4,
    durationMin: 55,
    cycle: "hipertrofia",
    purpose: "Peito de cima, costas, braço e carregamentos em volume: a força de erguer a noiva no colo.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "supino-inclinado-halteres", sets: 4, repsTarget: "10-12", restSec: 75, block: "solo", substitutoId: "crucifixo-polia" },
      { exerciseId: "remada-unilateral-halter", sets: 4, repsTarget: "8-10 cada", restSec: 60, block: "solo", substitutoId: "remada-baixa-maquina" },
      { exerciseId: "rosca-polia", sets: 3, repsTarget: "10-12", restSec: 60, block: "solo", substitutoId: "rosca-barra-w" },
      { exerciseId: "triceps-testa-barra-w", sets: 3, repsTarget: "8-10", restSec: 60, block: "solo", substitutoId: "triceps-polia-corda" },
      { exerciseId: "carregamento-frontal", sets: 3, repsTarget: "20-30m", restSec: 60, block: "solo", notes: "Padrão de levantar — carga à frente do corpo" },
      { exerciseId: "farmer-walk", sets: 3, repsTarget: "30m", restSec: 60, block: "solo" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "h-sex-peitoral-postura",
    name: "◆Inferior C · Glúteo máximo + posterior (volume)",
    dayOfWeek: 5,
    durationMin: 50,
    cycle: "hipertrofia",
    purpose: "Glúteo destacado da coxa no volume: projeção por trás, dobra de baixo nítida e posterior pela flexora.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 5, repsTarget: "12-15", restSec: 30, block: "maquina", substitutoId: "abducao-quadril-polia" },
      { exerciseId: "flexora-sentada", sets: 5, repsTarget: "8-10", restSec: 60, block: "maquina", substitutoId: "flexora-em-pe", notes: "O posterior vem daqui, não do stiff — é o que deixa a dobra do glúteo nítida" },
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "10-12", restSec: 75, block: "maquina", substitutoId: "hip-thrust-barra" },
      { exerciseId: "kettlebell-swing", sets: 3, repsTarget: "15", restSec: 60, block: "solo", notes: "Explosão de quadril — a dobradiça já aprendida" },
      { exerciseId: "extensao-45-gluteo", sets: 2, repsTarget: "12-15", restSec: 45, block: "solo", substitutoId: "ponte-gluteo-bola" },
      { exerciseId: "coice-gluteo-polia", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "kickback", notes: "Pico de glúteo — controle a volta" },
    ],
  },
];

// Ciclo 4 — REFINAMENTO — meio das faixas, reps altas, descanso curto: densidade.
const REFINEMENT: WorkoutTemplate[] = [
  {
    id: "r-seg-gluteo-densidade",
    name: "◆Inferior A · Glúteo + coxa (densidade)",
    dayOfWeek: 1,
    durationMin: 52,
    cycle: "refinamento",
    purpose: "Densidade do glúteo e da coxa: muita repetição e pouco descanso pra deixar o músculo durinho e desenhado.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "hip-thrust-maquina", sets: 4, repsTarget: "15-20", restSec: 60, block: "maquina", substitutoId: "hip-thrust-barra" },
      { exerciseId: "leg-press-pes-medios", sets: 4, repsTarget: "15", restSec: 60, block: "maquina", substitutoId: "agachamento-goblet" },
      { exerciseId: "abdutor-maquina", sets: 4, repsTarget: "20", restSec: 30, block: "maquina", substitutoId: "abducao-quadril-polia" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "20", restSec: 30, block: "maquina", substitutoId: "agachamento-sumo" },
      { exerciseId: "coice-gluteo-polia", sets: 3, repsTarget: "15 cada", restSec: 30, block: "solo", substitutoId: "kickback", notes: "Densidade — carga leve, alta repetição, sem pausa entre os lados" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, block: "solo", notes: "Transverso — afina a cintura, sem engrossar" },
    ],
  },
  {
    id: "r-ter-cintura-postura",
    name: "Superior A · Postura + peito de cima (densidade)",
    dayOfWeek: 2,
    durationMin: 53,
    cycle: "refinamento",
    purpose: "Postura e peito de cima com repetição alta — refina a silhueta e levanta o busto.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 4, repsTarget: "12-15", restSec: 45, block: "maquina", substitutoId: "remada-unilateral-halter" },
      { exerciseId: "voador-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "crucifixo-polia" },
      { exerciseId: "face-pull-polia", sets: 4, repsTarget: "20", restSec: 30, block: "solo", substitutoId: "face-pull", notes: "Abre os ombros, levanta o busto" },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "12-15", restSec: 60, block: "solo", substitutoId: "cross-over-cabo" },
      { exerciseId: "rosca-martelo", sets: 3, repsTarget: "12-15", restSec: 45, block: "solo", substitutoId: "rosca-polia" },
      { exerciseId: "triceps-polia-corda", sets: 3, repsTarget: "12-15", restSec: 45, block: "solo", substitutoId: "triceps-testa-barra-w" },
      { exerciseId: "prancha-antirrotacao", sets: 3, repsTarget: "8 trocas cada lado", restSec: 30, block: "solo", notes: "Padrão de levantar — core que resiste a rotação, essencial pra carregar peso assimétrico" },
    ],
  },
  {
    id: "r-qua-mobilidade-danca",
    name: "◆Inferior B · Glúteo médio + coxa (densidade)",
    dayOfWeek: 3,
    durationMin: 51,
    cycle: "refinamento",
    purpose: "Glúteo médio e coxa com repetição alta — lateral redonda e coxa firme.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 4, repsTarget: "20", restSec: 30, block: "maquina", substitutoId: "abdutor-band-em-pe", notes: "Glúteo médio na máquina — arredonda a lateral" },
      { exerciseId: "cadeira-extensora", sets: 4, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "step-up-gluteo" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "20", restSec: 30, block: "maquina", substitutoId: "agachamento-sumo" },
      { exerciseId: "agachamento-goblet", sets: 3, repsTarget: "12-15", restSec: 45, block: "solo", notes: "Padrão de levantar — carga à frente, o agachamento que serve pra erguer no colo" },
      { exerciseId: "agachamento-bulgaro", sets: 3, repsTarget: "12-15 cada", restSec: 45, block: "solo", substitutoId: "leg-press-pes-medios", notes: "Leve, lado mais fraco primeiro — corrige a diferença entre os lados" },
      { exerciseId: "abducao-quadril-polia", sets: 3, repsTarget: "15 cada", restSec: 30, block: "solo", substitutoId: "abdutor-deitada" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "r-qui-gluteo-simetria",
    name: "Superior B · Força de levantar (densidade)",
    dayOfWeek: 4,
    durationMin: 53,
    cycle: "refinamento",
    purpose: "Braço, costas médias e peito de cima com repetição alta, e os carregamentos que seguram a força de levantar.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "supino-inclinado-halteres", sets: 4, repsTarget: "12-15", restSec: 60, block: "solo", substitutoId: "crucifixo-polia" },
      { exerciseId: "remada-unilateral-halter", sets: 3, repsTarget: "12-15 cada", restSec: 45, block: "solo", substitutoId: "remada-baixa-maquina" },
      { exerciseId: "rosca-polia", sets: 3, repsTarget: "12-15", restSec: 45, block: "solo", substitutoId: "rosca-barra-w" },
      { exerciseId: "triceps-testa-barra-w", sets: 3, repsTarget: "12-15", restSec: 45, block: "solo", substitutoId: "triceps-polia-corda" },
      { exerciseId: "carregamento-frontal", sets: 3, repsTarget: "20-30m", restSec: 60, block: "solo", notes: "Padrão de levantar — carga à frente do corpo" },
      { exerciseId: "farmer-walk", sets: 3, repsTarget: "30m", restSec: 45, block: "solo" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "r-sex-peitoral-refinamento",
    name: "◆Inferior C · Glúteo máximo + posterior (densidade)",
    dayOfWeek: 5,
    durationMin: 53,
    cycle: "refinamento",
    purpose: "Acabamento do glúteo destacado: projeção com repetição alta e posterior na medida.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 4, repsTarget: "15", restSec: 30, block: "maquina", substitutoId: "abducao-quadril-polia" },
      { exerciseId: "flexora-sentada", sets: 5, repsTarget: "12-15", restSec: 45, block: "maquina", substitutoId: "flexora-em-pe" },
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "hip-thrust-barra" },
      { exerciseId: "pull-through-polia", sets: 3, repsTarget: "15", restSec: 45, block: "solo", substitutoId: "kettlebell-swing" },
      { exerciseId: "extensao-45-gluteo", sets: 2, repsTarget: "15", restSec: 30, block: "solo", substitutoId: "ponte-gluteo-bola" },
      { exerciseId: "coice-gluteo-polia", sets: 3, repsTarget: "15 cada", restSec: 30, block: "solo", substitutoId: "kickback" },
      { exerciseId: "stiff-unilateral", sets: 2, repsTarget: "15 cada", restSec: 45, block: "solo", notes: "Leve e lento: equilíbrio e simetria, não carga" },
    ],
  },
];

// Ciclo 5 — MANUTENÇÃO — segura a forma com volume reduzido. Serve para
// consolidar depois de uma fase de crescimento, ou para atravessar um período
// em que a vida não comporta volume alto. Não é sala de espera de nada.
const MAINTENANCE: WorkoutTemplate[] = [
  {
    id: "m-seg-gluteo",
    name: "◆Inferior A · Manutenção",
    dayOfWeek: 1,
    durationMin: 39,
    cycle: "manutencao",
    purpose: "Manutenção do glúteo e da coxa: segura o que você construiu sem forçar — volume menor, carga mantida.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "10-12", restSec: 75, block: "maquina", substitutoId: "hip-thrust-barra", notes: "Mantém a carga — não precisa subir sempre" },
      { exerciseId: "leg-press-pes-medios", sets: 3, repsTarget: "10-12", restSec: 75, block: "maquina", substitutoId: "agachamento-goblet" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15-20", restSec: 45, block: "maquina", substitutoId: "abducao-quadril-polia", notes: "Glúteo médio não cai abaixo de 12 séries nem na manutenção" },
      { exerciseId: "adutora-maquina", sets: 2, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, block: "solo", notes: "Transverso — afina a cintura, sem engrossar" },
    ],
  },
  {
    id: "m-ter-superior",
    name: "Superior A · Manutenção",
    dayOfWeek: 2,
    durationMin: 47,
    cycle: "manutencao",
    purpose: "Mantém postura, peito de cima e cintura — silhueta firme com pouco volume.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "10-12", restSec: 60, block: "maquina", substitutoId: "remada-unilateral-halter" },
      { exerciseId: "voador-maquina", sets: 2, repsTarget: "12-15", restSec: 60, block: "maquina", substitutoId: "crucifixo-polia" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15-20", restSec: 45, block: "solo", substitutoId: "face-pull", notes: "Postura ereta = busto mais cheio" },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "10-12", restSec: 60, block: "solo", substitutoId: "cross-over-cabo" },
      { exerciseId: "rosca-martelo", sets: 2, repsTarget: "10-12", restSec: 60, block: "solo", substitutoId: "rosca-polia" },
      { exerciseId: "triceps-polia-corda", sets: 2, repsTarget: "10-12", restSec: 60, block: "solo", substitutoId: "triceps-testa-barra-w" },
      { exerciseId: "prancha-antirrotacao", sets: 3, repsTarget: "8 trocas cada lado", restSec: 45, block: "solo", notes: "Padrão de levantar — core que resiste a rotação, essencial pra carregar peso assimétrico" },
    ],
  },
  {
    id: "m-qua-mobilidade",
    name: "◆Inferior B · Manutenção",
    dayOfWeek: 3,
    durationMin: 42,
    cycle: "manutencao",
    purpose: "Glúteo médio e coxa no mínimo que segura a forma — a lateral do quadril não perde o que ganhou.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15-20", restSec: 45, block: "maquina", substitutoId: "abdutor-band-em-pe" },
      { exerciseId: "cadeira-extensora", sets: 3, repsTarget: "12-15", restSec: 60, block: "maquina", substitutoId: "step-up-gluteo" },
      { exerciseId: "adutora-maquina", sets: 2, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo" },
      { exerciseId: "agachamento-goblet", sets: 3, repsTarget: "10-12", restSec: 75, block: "solo", notes: "Padrão de levantar — carga à frente, o agachamento que serve pra erguer no colo" },
      { exerciseId: "abducao-quadril-polia", sets: 3, repsTarget: "15 cada", restSec: 30, block: "solo", substitutoId: "abdutor-deitada" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "m-qui-gluteo",
    name: "Superior B · Manutenção",
    dayOfWeek: 4,
    durationMin: 50,
    cycle: "manutencao",
    purpose: "Mantém a força de levantar: peito de cima, costas médias, braço, pegada e o agachamento com carga à frente.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "10-12", restSec: 75, block: "solo", substitutoId: "crucifixo-polia" },
      { exerciseId: "remada-unilateral-halter", sets: 3, repsTarget: "10-12 cada", restSec: 60, block: "solo", substitutoId: "remada-baixa-maquina" },
      { exerciseId: "rosca-polia", sets: 2, repsTarget: "10-12", restSec: 60, block: "solo", substitutoId: "rosca-barra-w" },
      { exerciseId: "triceps-testa-barra-w", sets: 2, repsTarget: "10-12", restSec: 60, block: "solo", substitutoId: "triceps-polia-corda" },
      { exerciseId: "agachamento-goblet", sets: 3, repsTarget: "10-12", restSec: 75, block: "solo", notes: "Padrão de levantar — carga à frente, o agachamento que serve pra erguer no colo" },
      { exerciseId: "farmer-walk", sets: 3, repsTarget: "30m", restSec: 60, block: "solo" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "m-sex-gluteo",
    name: "◆Inferior C · Manutenção",
    dayOfWeek: 5,
    durationMin: 37,
    cycle: "manutencao",
    purpose: "Glúteo máximo e posterior no mínimo que segura a projeção — mantém o músculo ativo e cheio.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15-20", restSec: 45, block: "maquina", substitutoId: "abducao-quadril-polia", notes: "Glúteo médio não cai abaixo de 12 séries nem na manutenção" },
      { exerciseId: "flexora-sentada", sets: 4, repsTarget: "10-12", restSec: 60, block: "maquina", substitutoId: "flexora-em-pe" },
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "12-15", restSec: 60, block: "maquina", substitutoId: "hip-thrust-barra" },
      { exerciseId: "coice-gluteo-polia", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "kickback", notes: "Pico de glúteo — controle a volta" },
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
  { id: "entrada-1", name: "Entrada · Semana 1", description: "Semana de aprender: só máquina e polia, 2 séries leves. Acha cada aparelho e aprende a regular.", threshold: 5 },
  { id: "entrada-2", name: "Entrada · Semana 2", description: "Mesmos aparelhos, com 2 a 3 séries e a carga subindo um pouco.", threshold: 5 },
  { id: "entrada-3", name: "Entrada · Semana 3", description: "3 séries em tudo. Na semana seguinte começa a Adaptação, com halteres e banco.", threshold: 5 },
  { id: "adaptacao", name: "Adaptação", description: "Aprende os movimentos com carga leve: glúteo, coxa inteira, costas, peito de cima e braço. Seca a barriga (déficit). ~6 semanas.", threshold: 28 },
  { id: "variacao", name: "Variação", description: "Topo da fase 1: glúteo destacado, coxa grossa, costas e braço com força de levantar. Ainda em déficit.", threshold: 60 },
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
