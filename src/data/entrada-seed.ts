import type { WorkoutTemplate } from "../lib/db";

// ═══════════════════════════════════════════════════════════════════════════
// FASE DE ENTRADA — 3 semanas antes da Adaptação, na Smartfit Jardins.
//
// REGRA CENTRAL (2026-11-09): a rampa é de CARGA e APRENDIZADO. Ela recomeça
// aqui ao trocar de academia e prefere contar que está começando agora. A
// semana 1 é a "mini-entrada" de docs/OBJETIVO.md §8.2: 2 séries leves por
// exercício, achando cada aparelho e aprendendo a regular. A semana 2 sobe pra
// 2-3 séries e a semana 3 pra 3. Hip thrust na máquina já na semana 1 — sentada
// e com o encosto, é o jeito mais simples de aprender o movimento.
//
// A divisão é a da variação (Inferior A · Superior A · Inferior B · Superior B
// · Inferior C), só com máquina e polia — halter e banco entram na Adaptação.
// Teto de 40 min pelo estimador. O vacuum não entra aqui: desde 2026-11-09 ele
// é diário, no alongamento da manhã em casa (tests/data/maquina-primeiro.test.ts).
// Travado por tests/data/fase1-chun-li.test.ts e tests/data/entrada-blocos.test.ts.
//
// BLOCOS — cada exercício declara onde ele mora na sessão:
//   `aquecimento` — abre a sessão, sempre. Esteira (ou bike) nos dias de
//                   seg/ter/qua/sex; na quinta, mobilidade articular.
//   `maquina`     — miolo, na área de aparelhos.
//   `solo`        — miolo, na polia e no colchonete.
//   `final`       — fecha a sessão. Nenhum template daqui usa: o cardio leve
//                   pós-treino é somado em all-templates.ts.
// Só o MIOLO troca de ordem (`src/lib/session-order.ts`), por isso ele é
// escrito em blocos contíguos.
//
// "OCUPADO" / "NÃO TEM AQUI": todo item de máquina ou polia tem
// `substitutoId` (tests/data/substitutos.test.ts).
// ═══════════════════════════════════════════════════════════════════════════

const APRENDER = "Semana de aprender: ache o aparelho, regule e use carga leve — sobra fôlego no fim de cada série";

// ─── SEMANA 1 — 2 séries leves, achando e regulando cada aparelho ──────────
const SEMANA_1: WorkoutTemplate[] = [
  {
    id: "e1-seg",
    name: "Entrada · Inferior A",
    dayOfWeek: 1,
    durationMin: 28,
    cycle: "entrada-1",
    purpose: "Primeiro dia na Smartfit: glúteo e coxa só nas máquinas. Você aprende onde fica cada uma e como regular.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento", notes: "Aquecimento leve — só pra soltar" },
      { exerciseId: "hip-thrust-maquina", sets: 2, repsTarget: "12", restSec: 75, block: "maquina", substitutoId: "hip-thrust-barra", notes: APRENDER },
      { exerciseId: "leg-press-pes-medios", sets: 2, repsTarget: "12", restSec: 75, block: "maquina", substitutoId: "agachamento-goblet", notes: APRENDER },
      { exerciseId: "abdutor-maquina", sets: 2, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "abducao-quadril-polia", notes: APRENDER },
      { exerciseId: "adutora-maquina", sets: 2, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo", notes: APRENDER },
      { exerciseId: "coice-gluteo-polia", sets: 2, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "kickback", notes: APRENDER },
    ],
  },
  {
    id: "e1-ter",
    name: "Entrada · Superior A",
    dayOfWeek: 2,
    durationMin: 30,
    cycle: "entrada-1",
    purpose: "Costas, peito de cima e braço nas máquinas e na polia. Ombro pra trás muda a leitura do tronco desde hoje.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 2, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "remada-unilateral-halter", notes: APRENDER },
      { exerciseId: "voador-maquina", sets: 2, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "crucifixo-polia", notes: APRENDER },
      { exerciseId: "face-pull-polia", sets: 2, repsTarget: "15", restSec: 45, block: "solo", substitutoId: "face-pull", notes: APRENDER },
      { exerciseId: "rosca-polia", sets: 2, repsTarget: "12", restSec: 45, block: "solo", substitutoId: "rosca-martelo", notes: APRENDER },
      { exerciseId: "triceps-polia-corda", sets: 2, repsTarget: "12", restSec: 45, block: "solo", substitutoId: "triceps-testa-barra-w", notes: APRENDER },
      { exerciseId: "pallof-polia", sets: 2, repsTarget: "10 cada", restSec: 30, block: "solo", substitutoId: "prancha-antirrotacao", notes: APRENDER },
    ],
  },
  {
    id: "e1-qua",
    name: "Entrada · Inferior B",
    dayOfWeek: 3,
    durationMin: 26,
    cycle: "entrada-1",
    purpose: "Glúteo médio e coxa. É o músculo que tira o formato quadrado e arredonda a lateral do quadril.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento", notes: "Inclinação 0-2%, 4,5-5 km/h — só pra esquentar. Bike nível 2-3 se a esteira estiver ocupada" },
      { exerciseId: "abdutor-maquina", sets: 2, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "abdutor-band-em-pe", notes: APRENDER },
      { exerciseId: "cadeira-extensora", sets: 2, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "agachamento-goblet", notes: APRENDER },
      { exerciseId: "adutora-maquina", sets: 2, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo", notes: APRENDER },
      { exerciseId: "hip-thrust-maquina", sets: 2, repsTarget: "15", restSec: 30, block: "maquina", substitutoId: "ponte-gluteo-band", notes: APRENDER },
      { exerciseId: "abducao-quadril-polia", sets: 2, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "abdutor-deitada", notes: APRENDER },
    ],
  },
  {
    id: "e1-qui",
    name: "Entrada · Superior B",
    dayOfWeek: 4,
    durationMin: 21,
    cycle: "entrada-1",
    purpose: "Costas, peito de cima e braço de novo, com outros aparelhos. É a base da força de levantar.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 2, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "remada-unilateral-halter", notes: APRENDER },
      { exerciseId: "crucifixo-polia", sets: 2, repsTarget: "12", restSec: 60, block: "solo", substitutoId: "cross-over-cabo", notes: APRENDER },
      { exerciseId: "rosca-polia", sets: 2, repsTarget: "12", restSec: 45, block: "solo", substitutoId: "rosca-martelo", notes: APRENDER },
      { exerciseId: "triceps-polia-corda", sets: 2, repsTarget: "12", restSec: 45, block: "solo", substitutoId: "triceps-testa-barra-w", notes: APRENDER },
    ],
  },
  {
    id: "e1-sex",
    name: "Entrada · Inferior C",
    dayOfWeek: 5,
    durationMin: 28,
    cycle: "entrada-1",
    purpose: "Fecha a semana no glúteo e no posterior da coxa, pela flexora — é o que deixa a dobra do glúteo nítida.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 2, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "abducao-quadril-polia", notes: APRENDER },
      { exerciseId: "flexora-sentada", sets: 2, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "flexora-em-pe", notes: APRENDER },
      { exerciseId: "hip-thrust-maquina", sets: 2, repsTarget: "12", restSec: 75, block: "maquina", substitutoId: "hip-thrust-barra", notes: APRENDER },
      { exerciseId: "pull-through-polia", sets: 2, repsTarget: "12", restSec: 60, block: "solo", substitutoId: "ponte-gluteo-band", notes: APRENDER },
      { exerciseId: "coice-gluteo-polia", sets: 2, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "kickback", notes: APRENDER },
    ],
  },
];

// ─── SEMANA 2 — 2-3 séries, a carga sobe um pouco ──────────────────────────
const SEMANA_2: WorkoutTemplate[] = [
  {
    id: "e2-seg",
    name: "Entrada · Inferior A II",
    dayOfWeek: 1,
    durationMin: 33,
    cycle: "entrada-2",
    purpose: "Mesmos aparelhos da semana passada, com mais séries. Você já sabe onde fica tudo e como regular.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "12", restSec: 75, block: "maquina", substitutoId: "hip-thrust-barra", notes: "Se as 12 saírem fáceis, suba uma placa. Aperte o glúteo 1 s lá em cima" },
      { exerciseId: "leg-press-pes-medios", sets: 3, repsTarget: "12", restSec: 75, block: "maquina", substitutoId: "agachamento-goblet", notes: "Pés no meio da plataforma, empurre pelo calcanhar" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "abducao-quadril-polia", notes: "Glúteo médio — é ele que arredonda a lateral" },
      { exerciseId: "adutora-maquina", sets: 2, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo" },
      { exerciseId: "coice-gluteo-polia", sets: 2, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "kickback" },
    ],
  },
  {
    id: "e2-ter",
    name: "Entrada · Superior A II",
    dayOfWeek: 2,
    durationMin: 35,
    cycle: "entrada-2",
    purpose: "Postura de novo — é o ganho mais rápido que existe e não depende de perder nem um grama.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "remada-unilateral-halter", notes: "Puxa com as costas, não com o braço. Junta as escápulas" },
      { exerciseId: "voador-maquina", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "crucifixo-polia" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15", restSec: 45, block: "solo", substitutoId: "face-pull", notes: "Abre os ombros — postura ereta deixa o busto mais cheio" },
      { exerciseId: "rosca-polia", sets: 2, repsTarget: "12", restSec: 45, block: "solo", substitutoId: "rosca-martelo" },
      { exerciseId: "triceps-polia-corda", sets: 2, repsTarget: "12", restSec: 45, block: "solo", substitutoId: "triceps-testa-barra-w" },
      { exerciseId: "pallof-polia", sets: 2, repsTarget: "10 cada", restSec: 30, block: "solo", substitutoId: "prancha-antirrotacao" },
    ],
  },
  {
    id: "e2-qua",
    name: "Entrada · Inferior B II",
    dayOfWeek: 3,
    durationMin: 30,
    cycle: "entrada-2",
    purpose: "Glúteo médio com mais séries. Esse é o trabalho chato que dá o formato redondo.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento", notes: "Inclinação 0-2%, 4,5-5 km/h — só pra esquentar. Bike nível 2-3 se a esteira estiver ocupada" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "abdutor-band-em-pe", notes: "Tronco um pouco inclinado pra frente: puxa pra parte de cima do glúteo" },
      { exerciseId: "cadeira-extensora", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "agachamento-goblet" },
      { exerciseId: "adutora-maquina", sets: 2, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo" },
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "15", restSec: 30, block: "maquina", substitutoId: "ponte-gluteo-band", notes: "Leve, como acabamento: aperte o glúteo 1-2 s lá em cima. É a contração que constrói" },
      { exerciseId: "abducao-quadril-polia", sets: 2, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "abdutor-deitada" },
    ],
  },
  {
    id: "e2-qui",
    name: "Entrada · Superior B II",
    dayOfWeek: 4,
    durationMin: 24,
    cycle: "entrada-2",
    purpose: "Costas, peito de cima e braço com mais séries. A força de levantar começa a aparecer.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "remada-unilateral-halter" },
      { exerciseId: "crucifixo-polia", sets: 3, repsTarget: "12", restSec: 60, block: "solo", substitutoId: "cross-over-cabo", notes: "De baixo pra cima: é o peito de cima" },
      { exerciseId: "rosca-polia", sets: 2, repsTarget: "12", restSec: 45, block: "solo", substitutoId: "rosca-martelo" },
      { exerciseId: "triceps-polia-corda", sets: 2, repsTarget: "12", restSec: 45, block: "solo", substitutoId: "triceps-testa-barra-w" },
    ],
  },
  {
    id: "e2-sex",
    name: "Entrada · Inferior C II",
    dayOfWeek: 5,
    durationMin: 32,
    cycle: "entrada-2",
    purpose: "Glúteo e posterior com mais séries. O pull-through ensina a dobradiça de quadril sem pesar na lombar.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "abducao-quadril-polia" },
      { exerciseId: "flexora-sentada", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "flexora-em-pe", notes: "O posterior vem daqui — é o que deixa a dobra do glúteo nítida" },
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "12", restSec: 75, block: "maquina", substitutoId: "hip-thrust-barra" },
      { exerciseId: "pull-through-polia", sets: 2, repsTarget: "12", restSec: 60, block: "solo", substitutoId: "ponte-gluteo-band", notes: "Quadril pra trás, braços soltos; quem puxa o cabo é o glúteo, não as costas" },
      { exerciseId: "coice-gluteo-polia", sets: 2, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "kickback" },
    ],
  },
];

// ─── SEMANA 3 — 3 séries em tudo ───────────────────────────────────────────
const SEMANA_3: WorkoutTemplate[] = [
  {
    id: "e3-seg",
    name: "Entrada · Inferior A III",
    dayOfWeek: 1,
    durationMin: 36,
    cycle: "entrada-3",
    purpose: "3 séries em tudo. O hip thrust na máquina já tem carga de verdade — anote o peso e suba quando sobrar fôlego.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "12", restSec: 75, block: "maquina", substitutoId: "hip-thrust-barra", notes: "Queixo pra baixo, costela fechada (barriga firme, como quem segura uma tosse), empurre pelo calcanhar e aperte o glúteo 1 s no topo" },
      { exerciseId: "leg-press-pes-medios", sets: 3, repsTarget: "12", restSec: 75, block: "maquina", substitutoId: "agachamento-goblet" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "abducao-quadril-polia" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo", notes: "Coxa interna — silhueta cheia" },
      { exerciseId: "coice-gluteo-polia", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "kickback" },
    ],
  },
  {
    id: "e3-ter",
    name: "Entrada · Superior A III",
    dayOfWeek: 2,
    durationMin: 38,
    cycle: "entrada-3",
    purpose: "Postura e cintura. A antirrotação na polia firma o centro do corpo — nenhum abdominal com carga faz isso sem engrossar.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "remada-unilateral-halter" },
      { exerciseId: "voador-maquina", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "crucifixo-polia", notes: "Peito de cima e do meio — cotovelos levemente dobrados" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15", restSec: 30, block: "solo", substitutoId: "face-pull" },
      { exerciseId: "rosca-polia", sets: 3, repsTarget: "12", restSec: 45, block: "solo", substitutoId: "rosca-martelo" },
      { exerciseId: "triceps-polia-corda", sets: 3, repsTarget: "12", restSec: 45, block: "solo", substitutoId: "triceps-testa-barra-w" },
      { exerciseId: "pallof-polia", sets: 3, repsTarget: "10 cada", restSec: 30, block: "solo", substitutoId: "prancha-antirrotacao", notes: "Core que resiste à rotação — pessoa no colo se mexe" },
    ],
  },
  {
    id: "e3-qua",
    name: "Entrada · Inferior B III",
    dayOfWeek: 3,
    durationMin: 34,
    cycle: "entrada-3",
    purpose: "Glúteo médio de novo. É repetitivo de propósito: esse músculo responde a volume, não a novidade.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento", notes: "Inclinação 0-2%, 4,5-5 km/h — só pra esquentar. Bike nível 2-3 se a esteira estiver ocupada" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "abdutor-band-em-pe" },
      { exerciseId: "cadeira-extensora", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "agachamento-goblet" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "agachamento-sumo" },
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "20", restSec: 30, block: "maquina", substitutoId: "ponte-gluteo-band", notes: "Leve, como acabamento do glúteo: aperte 1-2 s lá em cima" },
      { exerciseId: "abducao-quadril-polia", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "abdutor-deitada" },
    ],
  },
  {
    id: "e3-qui",
    name: "Entrada · Superior B III",
    dayOfWeek: 4,
    durationMin: 27,
    cycle: "entrada-3",
    purpose: "Último superior da Entrada. Na semana que vem começa a Adaptação e entram halteres e banco.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "remada-unilateral-halter" },
      { exerciseId: "crucifixo-polia", sets: 3, repsTarget: "12", restSec: 60, block: "solo", substitutoId: "cross-over-cabo" },
      { exerciseId: "rosca-polia", sets: 3, repsTarget: "12", restSec: 45, block: "solo", substitutoId: "rosca-martelo" },
      { exerciseId: "triceps-polia-corda", sets: 3, repsTarget: "12", restSec: 45, block: "solo", substitutoId: "triceps-testa-barra-w" },
    ],
  },
  {
    id: "e3-sex",
    name: "Entrada · Inferior C III",
    dayOfWeek: 5,
    durationMin: 36,
    cycle: "entrada-3",
    purpose: "Última sessão da Entrada. Se o hip thrust e o pull-through já saem redondos, você está pronta pra Adaptação.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", substitutoId: "abducao-quadril-polia" },
      { exerciseId: "flexora-sentada", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", substitutoId: "flexora-em-pe" },
      { exerciseId: "hip-thrust-maquina", sets: 3, repsTarget: "12", restSec: 75, block: "maquina", substitutoId: "hip-thrust-barra" },
      { exerciseId: "pull-through-polia", sets: 3, repsTarget: "12", restSec: 60, block: "solo", substitutoId: "ponte-gluteo-band" },
      { exerciseId: "coice-gluteo-polia", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo", substitutoId: "kickback", notes: "Pico do glúteo — controle a volta" },
    ],
  },
];

export const ENTRADA_TEMPLATES: WorkoutTemplate[] = [...SEMANA_1, ...SEMANA_2, ...SEMANA_3];
