import type { WorkoutTemplate } from "../lib/db";

// ═══════════════════════════════════════════════════════════════════════════
// CICLO 1 — ADAPTAÇÃO — glúteo é PRIORIDADE Nº 1. Enxuto pra INICIANTE:
// sessões de ~22–40 min (ela está começando e não quer 2h; os dias que
// perderam a zona 2 em 2026-08-10 ficaram mais curtos — a caminhada diária
// já cobre o cardio). Poucos exercícios,
// 3 séries, foco em aprender o padrão e ativar glúteo. Cintura fina = só core
// transverso (sem oblíquo com carga). A progressão de volume vem nas fases
// seguintes (variação/hipertrofia). Regra: força começa com cardio + articular.
//
// PADRÃO DE LEVANTAR (2026-08-12, revisão final): as trocas que dão a força de
// erguer a noiva no colo entraram TAMBÉM aqui, e não só nos ciclos de
// variação/hipertrofia/refinamento/manutenção. Motivo: ela está em `entrada-1`,
// e variação fica a ~48 sessões — uns dois meses e meio. O segundo objetivo
// declarado do programa não chegaria até ela neste ano de treino. A adaptação
// ela alcança em ~3 semanas.
// A FASE DE ENTRADA fica de fora de propósito: é rampa de exposição, e
// atravessar o salão carregando peso na frente do corpo na semana 1 é cedo
// demais — o que ela precisa nas três primeiras semanas é entrar na academia e
// voltar no dia seguinte, não um padrão novo que chama atenção.
// Mesma regra dos outros ciclos: a sessão NÃO cresce. Cada exercício que entra
// saiu de outro do mesmo template; contagem e `durationMin` ficam idênticos
// (congelados em `tests/data/trocas-forca.test.ts`).
// ═══════════════════════════════════════════════════════════════════════════
export const WORKOUT_PLAN: WorkoutTemplate[] = [
  {
    id: "seg-gluteo-mobilidade",
    name: "◆Glúteo A · Força",
    dayOfWeek: 1,
    durationMin: 27,
    cycle: "adaptacao",
    purpose: "Hoje é glúteo pesado: construir a base de músculo que dá volume e forma ao bumbum. É a alavanca mais forte que você tem, e responde rápido porque você está começando.",
    exercises: [
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, notes: "Aquece leve" },
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "12 cada", restSec: 30, notes: "Ativação — sente o glúteo ligar antes de carregar" },
      { exerciseId: "hip-thrust-barra", sets: 3, repsTarget: "10-12", restSec: 90, notes: "O MAIOR construtor de glúteo. Some peso quando as reps saírem fácil" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "12", restSec: 90, notes: "Leg press 45° com pés ALTOS e um pouco abertos = foco glúteo. Empurra pelo calcanhar. Plataforma pequena? faz unilateral (um pé por vez)" },
      { exerciseId: "agachamento-goblet", sets: 3, repsTarget: "10-12", restSec: 60, notes: "Padrão de levantar — halter contra o peito, cotovelos pra baixo. Começa leve: é o agachamento que ensina a erguer alguém no colo" },
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
      // Saiu a remada baixa, não o face pull: os dois eram o MESMO padrão
      // (puxada horizontal pra postura) e a sessão tinha os dois. O face pull
      // fica porque é o que abre o ombro e levanta o busto, custa menos tempo
      // (45s de intervalo contra 60s) e a redundância era do outro lado. O
      // carregamento ocupa quase o mesmo tempo que a remada ocupava — por isso
      // os 36 min continuam honestos.
      { exerciseId: "carregamento-frontal", sets: 3, repsTarget: "20m", restSec: 60, notes: "Padrão de levantar — peso contra o PEITO, nunca no ombro. Tronco ereto o percurso inteiro" },
      { exerciseId: "face-pull-polia", sets: 3, repsTarget: "15-20", restSec: 45, notes: "Postura ereta = busto mais cheio" },
      { exerciseId: "prancha-antirrotacao", sets: 3, repsTarget: "6 trocas cada lado", restSec: 30, notes: "Padrão de levantar — core que resiste a rotação; pessoa no colo se mexe. Qualidade acima de repetição" },
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
      { exerciseId: "vacuum-abdominal", sets: 3, repsTarget: "30-45s", restSec: 30, notes: "Cinto interno — é o transverso que afina a cintura por dentro, e é a alavanca que você tem" },
    ],
  },
];
