import type { WorkoutTemplate } from "../lib/db";

// ═══════════════════════════════════════════════════════════════════════════
// FASE DE ENTRADA — 3 semanas antes da Adaptação.
//
// REGRA CENTRAL: a exposição é uma RAMPA, não um corte. O teto de
// `exposureLevel` sobe a cada semana — 2, depois 3, depois 4. A semana 1 é só
// máquina sentada, bike e solo no colchonete; o hip thrust (nível 4, o mais
// conspícuo do catálogo) só aparece na semana 3.
//
// A razão não é conforto: a Adaptação estreava com hip thrust de barra na
// primeira segunda-feira, e esse era o motivo real de a usuária querer treinar
// em casa. Travado por `tests/data/entrada-rampa-exposicao.test.ts`.
//
// BLOCOS — cada exercício declara onde ele mora na sessão:
//   `aquecimento` — abre a sessão, sempre. Bike leve, mobilidade articular,
//                   cat-cow e a ativação de glúteo que precede a carga.
//   `maquina`     — miolo, na área de aparelhos (inclui o banco com rack do
//                   hip thrust, que é uma estação).
//   `solo`        — miolo, na área livre (colchonete, halteres, step, mini band).
//   `final`       — fecha a sessão, sempre: o cardio zona 2. Cardio antes rouba
//                   energia do glúteo.
// Só o MIOLO troca de ordem (`src/lib/session-order.ts`) — a sessão nunca
// depende de a área livre estar vazia. Por isso o miolo é escrito em blocos
// contíguos, máquina antes de solo: essa é a ordem padrão da tela.
// ═══════════════════════════════════════════════════════════════════════════

// ─── SEMANA 1 — teto de exposição 2 ────────────────────────────────────────
const SEMANA_1: WorkoutTemplate[] = [
  {
    id: "e1-seg",
    name: "Entrada · Inferior (máquinas)",
    dayOfWeek: 1,
    durationMin: 30,
    cycle: "entrada-1",
    purpose: "Primeiro dia: só máquina sentada. Você aprende o movimento e o lugar, sem nada que chame atenção.",
    exercises: [
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento", notes: "Aquecimento leve — só pra soltar" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", notes: "Leg press. Pés na largura do quadril, no meio da plataforma. Empurra pelo calcanhar" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", notes: "Glúteo médio — é ele que arredonda a lateral" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", notes: "Coxa interna — silhueta cheia" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "15", restSec: 30, block: "solo", notes: "Aperta o glúteo 1-2s lá em cima. É a contração que constrói" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "10min", restSec: 0, block: "final", notes: "Começa com 10 min nesta fase; sobe pra 15 na Adaptação" },
    ],
  },
  {
    id: "e1-ter",
    name: "Entrada · Postura + Core",
    dayOfWeek: 2,
    durationMin: 25,
    cycle: "entrada-1",
    purpose: "Postura e core. Ombro pra trás muda a leitura do tronco hoje, sem esperar nenhum ganho físico.",
    exercises: [
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", notes: "Puxa com as costas, não com o braço. Junta as escápulas" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", notes: "Abre os ombros — postura ereta deixa o busto mais cheio" },
      { exerciseId: "prancha", sets: 3, repsTarget: "30s", restSec: 30, block: "solo" },
      { exerciseId: "dead-bug", sets: 3, repsTarget: "10 cada", restSec: 30, block: "solo" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30s", restSec: 30, block: "solo", notes: "Cinto interno — afina a cintura por dentro, sem engrossar" },
    ],
  },
  {
    id: "e1-qua",
    name: "Entrada · Glúteo médio",
    dayOfWeek: 3,
    durationMin: 30,
    cycle: "entrada-1",
    purpose: "Glúteo médio e quadril solto. É o músculo que tira o formato quadrado e arredonda a lateral.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "cat-cow", sets: 2, repsTarget: "10", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "clamshell", sets: 3, repsTarget: "15 cada", restSec: 30, block: "solo" },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "15 cada", restSec: 30, block: "solo" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "15", restSec: 30, block: "solo" },
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "10min", restSec: 0, block: "final" },
    ],
  },
  {
    id: "e1-qui",
    name: "Entrada · Dia leve",
    dayOfWeek: 4,
    durationMin: 25,
    cycle: "entrada-1",
    purpose: "Dia leve de propósito. Recuperar faz parte do treino — é descansando que o músculo cresce.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "cat-cow", sets: 2, repsTarget: "10", restSec: 0, block: "aquecimento" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "20min", restSec: 0, block: "final", notes: "Esteira inclinada ou bike — hoje o cardio é o treino" },
    ],
  },
  {
    id: "e1-sex",
    name: "Entrada · Inferior B",
    dayOfWeek: 5,
    durationMin: 30,
    cycle: "entrada-1",
    purpose: "Fecha a semana no glúteo. Pés altos no leg press joga o esforço pro bumbum em vez da coxa.",
    exercises: [
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", notes: "Leg press com os pés ALTOS na plataforma = foco glúteo. Se a mobilidade ainda não deixar, começa mais baixo e sobe com as semanas" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo", notes: "Uma perna de cada vez — corrige diferença entre os lados" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "10min", restSec: 0, block: "final" },
    ],
  },
];

// ─── SEMANA 2 — teto 3: entram stiff (dobradiça) e step-up ─────────────────
const SEMANA_2: WorkoutTemplate[] = [
  {
    id: "e2-seg",
    name: "Entrada · Inferior (máquinas) II",
    dayOfWeek: 1,
    durationMin: 32,
    cycle: "entrada-2",
    purpose: "Mesma sessão da semana passada, com um pouco mais de repetição. Você já sabe onde fica tudo.",
    exercises: [
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "15", restSec: 60, block: "maquina", notes: "Leg press. Se as 15 saírem fáceis, sobe uma placa" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30, block: "solo" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "12min", restSec: 0, block: "final" },
    ],
  },
  {
    id: "e2-ter",
    name: "Entrada · Postura + Core II",
    dayOfWeek: 2,
    durationMin: 27,
    cycle: "entrada-2",
    purpose: "Postura de novo — é o ganho mais rápido que existe e não depende de perder nem um grama.",
    exercises: [
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 60, block: "maquina" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "18", restSec: 45, block: "maquina" },
      { exerciseId: "prancha", sets: 3, repsTarget: "40s", restSec: 30, block: "solo" },
      { exerciseId: "dead-bug", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "40s", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "e2-qua",
    name: "Entrada · Glúteo médio II",
    dayOfWeek: 3,
    durationMin: 30,
    cycle: "entrada-2",
    purpose: "Glúteo médio com mais repetição. Esse é o trabalho chato que dá o formato redondo.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "clamshell", sets: 3, repsTarget: "20 cada", restSec: 30, block: "solo" },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "20 cada", restSec: 30, block: "solo" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30, block: "solo" },
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "10min", restSec: 0, block: "final" },
    ],
  },
  {
    id: "e2-qui",
    name: "Entrada · Leve + Step-up",
    dayOfWeek: 4,
    durationMin: 28,
    cycle: "entrada-2",
    purpose: "Dia leve com o primeiro exercício em pé: subir no step. Parece pouco e é muito glúteo.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "step-up-gluteo", sets: 3, repsTarget: "10 cada", restSec: 45, block: "solo", notes: "Sobe empurrando pelo calcanhar da perna de cima. Desce devagar — a descida é metade do exercício" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "15min", restSec: 0, block: "final" },
    ],
  },
  {
    id: "e2-sex",
    name: "Entrada · Inferior B + Dobradiça",
    dayOfWeek: 5,
    durationMin: 35,
    cycle: "entrada-2",
    purpose: "Hoje você aprende a dobradiça de quadril — o padrão que mais constrói glúteo e o mais fácil de fazer errado.",
    exercises: [
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", notes: "Leg press pés altos" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "stiff", sets: 3, repsTarget: "12", restSec: 60, block: "solo", notes: "AMPLITUDE CURTA por enquanto: halteres de 3-4 kg, empurra o quadril pra trás e desce SÓ até onde o posterior da coxa deixa, sem arredondar a lombar. A amplitude aumenta sozinha nas próximas semanas — forçar agora é como se machuca a lombar" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "12min", restSec: 0, block: "final" },
    ],
  },
];

// ─── SEMANA 3 — teto 4: entra o hip thrust ─────────────────────────────────
const SEMANA_3: WorkoutTemplate[] = [
  {
    id: "e3-seg",
    name: "Entrada · Hip thrust (graduação)",
    dayOfWeek: 1,
    durationMin: 35,
    cycle: "entrada-3",
    purpose: "Hoje entra o hip thrust — o maior construtor de bumbum que existe. Primeiro sem peso nenhum, só pra pegar o jeito.",
    exercises: [
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "12 cada", restSec: 30, block: "aquecimento", notes: "Ativação — sente o glúteo ligar antes de carregar" },
      { exerciseId: "hip-thrust-barra", sets: 3, repsTarget: "15 (SEM PESO)", restSec: 60, block: "maquina", notes: "ETAPA 1: só o peso do corpo, costas apoiadas no banco. Queixo pra baixo, costela fechada, empurra pelo calcanhar e aperta o glúteo 2s no topo. Quando as 3 séries saírem redondas, passa pra barra vazia (~10 kg) em 3x12 — e só depois disso começa a somar anilha" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "12min", restSec: 0, block: "final" },
    ],
  },
  {
    id: "e3-ter",
    name: "Entrada · Postura + Core III",
    dayOfWeek: 2,
    durationMin: 27,
    cycle: "entrada-3",
    purpose: "Postura e cintura. O vacuum é o que afina por dentro — nenhum abdominal com carga faz isso.",
    exercises: [
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 60, block: "maquina" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "20", restSec: 45, block: "maquina" },
      { exerciseId: "prancha", sets: 3, repsTarget: "45s", restSec: 30, block: "solo" },
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "45s", restSec: 30, block: "solo" },
    ],
  },
  {
    id: "e3-qua",
    name: "Entrada · Glúteo médio III",
    dayOfWeek: 3,
    durationMin: 30,
    cycle: "entrada-3",
    purpose: "Glúteo médio de novo. É repetitivo de propósito: esse músculo responde a volume, não a novidade.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "aquecimento" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "18", restSec: 45, block: "maquina" },
      { exerciseId: "clamshell", sets: 3, repsTarget: "20 cada", restSec: 30, block: "solo" },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "20 cada", restSec: 30, block: "solo" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30, block: "solo" },
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "10min", restSec: 0, block: "final" },
    ],
  },
  {
    id: "e3-qui",
    name: "Entrada · Leve + Step-up II",
    dayOfWeek: 4,
    durationMin: 28,
    cycle: "entrada-3",
    purpose: "Dia leve. Na semana que vem começa a Adaptação e você já vai conhecer todos os movimentos.",
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "step-up-gluteo", sets: 3, repsTarget: "12 cada", restSec: 45, block: "solo" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "15min", restSec: 0, block: "final" },
    ],
  },
  {
    id: "e3-sex",
    name: "Entrada · Inferior B + Dobradiça II",
    dayOfWeek: 5,
    durationMin: 35,
    cycle: "entrada-3",
    purpose: "Última sessão da Entrada. Se a dobradiça já sai redonda, você está pronta pra Adaptação.",
    exercises: [
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "aquecimento" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "15", restSec: 60, block: "maquina", notes: "Leg press pés altos" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "stiff", sets: 3, repsTarget: "12", restSec: 60, block: "solo", notes: "Amplitude ainda controlada — desce só até onde o posterior deixa sem arredondar a lombar. Se já está descendo mais que na semana passada, é sinal de que a mobilidade está vindo" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "15min", restSec: 0, block: "final" },
    ],
  },
];

export const ENTRADA_TEMPLATES: WorkoutTemplate[] = [...SEMANA_1, ...SEMANA_2, ...SEMANA_3];
