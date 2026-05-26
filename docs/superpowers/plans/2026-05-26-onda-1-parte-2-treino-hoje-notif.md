# Trein-Final — Onda 1 Parte 2: Treino + Hoje + Notificações + Settings

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Completar a Onda 1 com a aba Treino funcional (plano semanal pré-montado, catálogo de ~35 exercícios, registro de sessão com sugestão automática de carga via lib `progression`, gráfico de progressão), o dashboard "Hoje" agregado, sistema de notificações (pausas ativas, hidratação, lembrete de treino), tela de Configurações (horários, quiet hours, modo foco, export/import backup, apagar tudo), e o gráfico de WHR com alvo na aba Corpo.

**Architecture:** Continua o pattern da Parte 1 (React + TS strict + Tailwind + Dexie + React Router). Notificações usam `Notification API` + `Service Worker.showNotification` + `setTimeout` com persistência em settings store (já que `Notification Triggers API` ainda é experimental em alguns Androids). Gráficos usam SVG inline customizado (sem lib externa pra manter bundle pequeno).

**Tech Stack:** Mesmo da Parte 1. Sem novas dependências.

**Spec:** [`../specs/2026-05-26-app-transicao-design.md`](../specs/2026-05-26-app-transicao-design.md)
**Continua de:** [`2026-05-26-onda-1-parte-1-fundacao-corpo.md`](./2026-05-26-onda-1-parte-1-fundacao-corpo.md) (commit `0c09d58`)

---

## File Structure (additions)

```
src/
├── data/
│   ├── exercises-seed.ts          # ~35 exercícios pré-cadastrados (TS, não JSON pra ter type checking)
│   └── workout-plan-seed.ts       # plano semanal padrão
├── lib/
│   ├── seed.ts                    # função que popula DB no primeiro init (idempotent)
│   ├── notifications.ts           # API wrapper + agendamento
│   └── settings-helpers.ts        # get/set typed pra settings store
├── components/
│   ├── SessionRecorder.tsx        # form de registro de sessão de treino
│   ├── ExerciseCard.tsx           # card de um exercício na lista
│   ├── ProgressionChart.tsx       # gráfico SVG simples
│   ├── WhrChart.tsx               # gráfico de WHR com alvo
│   └── TodayCard.tsx              # card individual no dashboard Hoje
├── pages/
│   ├── workout/
│   │   ├── WorkoutHome.tsx        # (já existe — substituir placeholder)
│   │   ├── WeeklyPlan.tsx         # plano semanal
│   │   ├── ExerciseLibrary.tsx    # lista do catálogo
│   │   ├── ExerciseDetail.tsx     # detalhe de um exercício
│   │   ├── SessionDetail.tsx      # registrar/visualizar sessão
│   │   └── ProgressionHistory.tsx # gráfico de progressão por exercício
│   ├── Today.tsx                  # (já existe — substituir placeholder)
│   └── Settings.tsx               # configurações
└── hooks/
    └── useSetting.ts              # hook reativo pra um setting específico
tests/
├── lib/
│   ├── seed.test.ts
│   ├── notifications.test.ts
│   └── settings-helpers.test.ts
└── pages/
    └── workout-session.smoke.test.tsx
```

---

## Fase A — Dados pré-cadastrados

### Task 1: Seed do catálogo de exercícios + plano semanal

**Files:**
- Create: `src/data/exercises-seed.ts`
- Create: `src/data/workout-plan-seed.ts`
- Create: `src/lib/seed.ts`
- Create: `tests/lib/seed.test.ts`

- [ ] **Step 1: Escrever teste**

`tests/lib/seed.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { seedDatabase } from "../../src/lib/seed";
import { db } from "../../src/lib/db";

describe("seedDatabase", () => {
  it("popula exercícios e templates na primeira chamada", async () => {
    await seedDatabase();
    const exercises = await db.exercises.toArray();
    const templates = await db.workoutTemplates.toArray();
    expect(exercises.length).toBeGreaterThanOrEqual(30);
    expect(templates.length).toBeGreaterThanOrEqual(5);
  });

  it("não duplica em chamadas repetidas", async () => {
    await seedDatabase();
    const firstCount = (await db.exercises.toArray()).length;
    await seedDatabase();
    const secondCount = (await db.exercises.toArray()).length;
    expect(secondCount).toBe(firstCount);
  });

  it("todo exercício tem campos obrigatórios", async () => {
    await seedDatabase();
    const exercises = await db.exercises.toArray();
    for (const ex of exercises) {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(ex.category).toBeTruthy();
      expect(ex.description).toBeTruthy();
      expect(Array.isArray(ex.commonMistakes)).toBe(true);
      expect([1, 2, 3, 4, 5]).toContain(ex.exposureLevel);
    }
  });
});
```

- [ ] **Step 2: Catálogo de exercícios**

`src/data/exercises-seed.ts`:

```typescript
import type { Exercise } from "../lib/db";

export const EXERCISES: Exercise[] = [
  // === GLÚTEO (foco principal) ===
  {
    id: "hip-thrust-barra",
    name: "Hip thrust com barra",
    category: "gluteo",
    equipment: ["barra", "anilhas", "banco"],
    difficulty: "intermediario",
    description: "Quadril em flexão sobre banco, barra apoiada na pelve, sobe o quadril até alinhar com tronco e joelhos. Aperta o glúteo no topo por 1-2 segundos.",
    commonMistakes: [
      "Estender lombar em vez de glúteo (arquear costas)",
      "Não chegar a alinhamento completo no topo",
      "Apoiar barra no abdômen em vez da pelve",
    ],
    easierVariation: "Hip thrust sem peso, só com peso do corpo",
    harderVariation: "Hip thrust unilateral (uma perna)",
    exposureLevel: 4,
  },
  {
    id: "ponte-gluteo-band",
    name: "Ponte de glúteo com mini-band",
    category: "gluteo",
    equipment: ["mini-band"],
    difficulty: "iniciante",
    description: "Deitada de costas, joelhos dobrados, mini-band acima dos joelhos. Sobe o quadril empurrando os joelhos contra a banda. Aperta no topo.",
    commonMistakes: [
      "Joelhos caindo pra dentro",
      "Não empurrar a banda durante o movimento",
    ],
    easierVariation: "Ponte sem banda",
    harderVariation: "Ponte unilateral com banda",
    exposureLevel: 1,
  },
  {
    id: "agachamento-livre",
    name: "Agachamento livre",
    category: "gluteo",
    equipment: ["barra", "anilhas"],
    difficulty: "intermediario",
    description: "Barra apoiada nos trapézios, pés na largura dos ombros, agacha até coxa paralela ao chão. Joelhos seguem direção dos pés.",
    commonMistakes: [
      "Joelhos caindo pra dentro",
      "Curvar a lombar na descida",
      "Calcanhar levantando do chão",
    ],
    easierVariation: "Agachamento com peso do corpo (air squat)",
    harderVariation: "Agachamento búlgaro (uma perna no banco atrás)",
    exposureLevel: 4,
  },
  {
    id: "agachamento-goblet",
    name: "Agachamento goblet",
    category: "gluteo",
    equipment: ["halteres"],
    difficulty: "iniciante",
    description: "Segura um halter na altura do peito, agacha com pés na largura dos ombros. Bom pra aprender o padrão de movimento.",
    commonMistakes: [
      "Inclinar muito o tronco pra frente",
      "Não descer paralelo",
    ],
    easierVariation: "Agachamento livre sem peso",
    harderVariation: "Agachamento goblet com pausa de 2s no fundo",
    exposureLevel: 2,
  },
  {
    id: "abdutor-maquina",
    name: "Abdutor na máquina",
    category: "gluteo",
    equipment: ["maquina-abdutor"],
    difficulty: "iniciante",
    description: "Sentada, abre os joelhos contra a resistência da máquina. Foco no glúteo médio (lateral do quadril).",
    commonMistakes: [
      "Inclinar tronco pra frente em vez de manter ereto",
      "Movimento muito rápido sem controle",
    ],
    exposureLevel: 1,
  },
  {
    id: "abdutor-band-em-pe",
    name: "Abdutor em pé com banda",
    category: "gluteo",
    equipment: ["mini-band"],
    difficulty: "iniciante",
    description: "Em pé, mini-band em volta dos tornozelos. Abre uma perna lateralmente, mantendo tronco estável. Alterna lados.",
    commonMistakes: [
      "Inclinar o tronco pro lado oposto",
      "Levantar perna pra frente em vez de pro lado",
    ],
    exposureLevel: 1,
  },
  {
    id: "elevacao-pelvica-banco",
    name: "Elevação pélvica unipodal",
    category: "gluteo",
    equipment: ["banco"],
    difficulty: "intermediario",
    description: "Costas no banco, uma perna apoiada no chão, outra estendida. Sobe quadril com a perna apoiada. Glúteo unilateral.",
    commonMistakes: [
      "Usar lombar pra subir em vez de glúteo",
      "Não chegar à extensão completa",
    ],
    easierVariation: "Elevação pélvica bipodal no chão",
    harderVariation: "Com peso na pelve",
    exposureLevel: 3,
  },
  {
    id: "stiff",
    name: "Stiff (RDL)",
    category: "gluteo",
    equipment: ["halteres", "barra"],
    difficulty: "intermediario",
    description: "Pernas levemente flexionadas, desce o tronco com coluna neutra até sentir alongamento posterior. Sobe ativando glúteo e posterior.",
    commonMistakes: [
      "Curvar a lombar",
      "Dobrar muito os joelhos (vira agachamento)",
      "Descer com peso longe do corpo",
    ],
    easierVariation: "Stiff só com peso do corpo",
    harderVariation: "Stiff unilateral",
    exposureLevel: 3,
  },
  // === CINTURA & ABDOMINAIS FUNCIONAIS ===
  {
    id: "prancha",
    name: "Prancha frontal",
    category: "cintura",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Apoio nos antebraços e pontas dos pés, corpo reto da cabeça aos calcanhares. Aperta abdômen e glúteo.",
    commonMistakes: [
      "Quadril caindo",
      "Quadril subindo demais (tipo cachorrinho)",
      "Respirar pouco",
    ],
    easierVariation: "Prancha com joelhos no chão",
    harderVariation: "Prancha com elevação alternada de braço/perna",
    exposureLevel: 2,
  },
  {
    id: "dead-bug",
    name: "Dead bug",
    category: "cintura",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Deitada de costas, braços e pernas pra cima. Estende braço de um lado e perna do lado oposto sem deixar a lombar arquear.",
    commonMistakes: [
      "Lombar saindo do chão",
      "Movimento muito rápido",
    ],
    exposureLevel: 1,
  },
  {
    id: "bird-dog",
    name: "Bird dog",
    category: "cintura",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Em 4 apoios, estende braço de um lado e perna do lado oposto, alinhando com tronco. Mantém quadril nivelado.",
    commonMistakes: [
      "Quadril torcendo",
      "Lombar arqueando",
    ],
    exposureLevel: 1,
  },
  {
    id: "prancha-lateral",
    name: "Prancha lateral",
    category: "cintura",
    equipment: ["peso-corporal"],
    difficulty: "intermediario",
    description: "De lado, apoio no antebraço, corpo reto. Quadril não cai. Mantém por tempo.",
    commonMistakes: [
      "Quadril caindo",
      "Não alinhar corpo",
    ],
    easierVariation: "Prancha lateral com joelho no chão",
    harderVariation: "Prancha lateral com elevação de perna",
    exposureLevel: 3,
  },
  // === COSTAS (cadeia posterior, postura) ===
  {
    id: "remada-curvada",
    name: "Remada curvada com halteres",
    category: "costas",
    equipment: ["halteres"],
    difficulty: "intermediario",
    description: "Tronco inclinado 45°, halteres nas mãos, puxa pra cima retraindo escápulas. Cotovelos próximos do corpo.",
    commonMistakes: [
      "Usar muito impulso (movimento balístico)",
      "Não retrair escápula no topo",
      "Lombar curva",
    ],
    exposureLevel: 3,
  },
  {
    id: "remada-baixa-maquina",
    name: "Remada baixa na máquina",
    category: "costas",
    equipment: ["maquina-remada"],
    difficulty: "iniciante",
    description: "Sentada, puxa o cabo até a barriga, cotovelos próximos do corpo, aperta as escápulas.",
    commonMistakes: [
      "Inclinar tronco pra trás demais",
      "Não controlar a volta",
    ],
    exposureLevel: 1,
  },
  {
    id: "puxada-frente-maquina",
    name: "Puxada na máquina (frente)",
    category: "costas",
    equipment: ["maquina-puxada"],
    difficulty: "iniciante",
    description: "Puxa a barra até a altura do peito (não da nuca), retrai escápulas. Não desenvolver muito — só pra postura.",
    commonMistakes: [
      "Puxar pra nuca (risco lesão ombro)",
      "Balanço corporal",
    ],
    exposureLevel: 1,
  },
  // === POSTURA & RETRAÇÃO ESCAPULAR ===
  {
    id: "retracao-escapular",
    name: "Retração escapular com banda",
    category: "postura",
    equipment: ["faixa-elastica"],
    difficulty: "iniciante",
    description: "Em pé, banda esticada à frente na altura do peito. Puxa abrindo os braços lateralmente, apertando escápulas atrás.",
    commonMistakes: [
      "Encolher os ombros (subir trapézio)",
      "Cotovelos travados",
    ],
    exposureLevel: 1,
  },
  {
    id: "face-pull",
    name: "Face pull",
    category: "postura",
    equipment: ["polia", "corda"],
    difficulty: "iniciante",
    description: "Corda na polia alta, puxa em direção ao rosto separando as mãos no final. Rotacional externa de ombro.",
    commonMistakes: [
      "Subir trapézio",
      "Puxar pra baixo em vez de pra fora",
    ],
    exposureLevel: 2,
  },
  // === PEITORAL SUPERIOR LEVE (busto) ===
  {
    id: "supino-inclinado-halteres",
    name: "Supino inclinado com halteres (LEVE)",
    category: "peitoral",
    equipment: ["halteres", "banco-inclinado"],
    difficulty: "iniciante",
    description: "Banco inclinado 30-45°, halteres LEVES. Foco peitoral superior pra ajudar busto. Cargas baixas — buscar tônus, não hipertrofia.",
    commonMistakes: [
      "Pegar peso pesado demais (queremos LEVE)",
      "Banco muito inclinado (vira ombro)",
      "Descer pouco",
    ],
    exposureLevel: 2,
  },
  {
    id: "cross-over-cabo",
    name: "Cross-over no cabo (médio)",
    category: "peitoral",
    equipment: ["polia"],
    difficulty: "iniciante",
    description: "Polias na altura média, puxa cabos cruzando à frente do corpo. Aperta peitoral central. Carga leve.",
    commonMistakes: [
      "Carga pesada (queremos tônus)",
      "Curvar tronco",
    ],
    exposureLevel: 2,
  },
  // === MOBILIDADE & ALONGAMENTO ===
  {
    id: "mobilidade-quadril-90-90",
    name: "Mobilidade de quadril 90/90",
    category: "mobilidade",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Sentada com uma perna à frente em 90° e outra ao lado em 90°. Inclina tronco sobre perna da frente, depois pra trás. Alterna lados.",
    commonMistakes: [
      "Forçar amplitude (deve puxar, não doer)",
      "Não respirar",
    ],
    exposureLevel: 1,
  },
  {
    id: "alongamento-flexor-quadril",
    name: "Alongamento de flexor de quadril",
    category: "mobilidade",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Ajoelhada, uma perna à frente em 90° (pé apoiado), outra atrás (joelho no chão). Empurra quadril pra frente, sente alongar na frente da coxa de trás.",
    commonMistakes: [
      "Curvar lombar (deve manter neutra)",
      "Não soltar quadril",
    ],
    exposureLevel: 1,
  },
  {
    id: "alongamento-piriforme",
    name: "Alongamento de piriforme (figura 4)",
    category: "mobilidade",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Deitada de costas, cruza um tornozelo sobre o joelho oposto formando 4. Puxa a perna apoiada em direção ao peito.",
    commonMistakes: [
      "Forçar antes de aquecer",
      "Não respirar fundo",
    ],
    exposureLevel: 1,
  },
  {
    id: "cat-cow",
    name: "Cat-cow (gato-vaca)",
    category: "mobilidade",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Em 4 apoios, alterna arquear coluna pra cima (gato) e afundar a barriga puxando peito pra frente (vaca). Mobiliza coluna toda.",
    commonMistakes: [
      "Movimento muito rápido",
      "Não respirar coordenado",
    ],
    exposureLevel: 1,
  },
  {
    id: "ativacao-gluteo-band-walks",
    name: "Mini-band walks lateral",
    category: "mobilidade",
    equipment: ["mini-band"],
    difficulty: "iniciante",
    description: "Mini-band acima dos joelhos, agachamento leve. Anda lateral mantendo tensão na banda. 10 passos cada lado. Pré-treino pra ativar glúteo.",
    commonMistakes: [
      "Joelhos caindo pra dentro",
      "Tronco balançando",
    ],
    exposureLevel: 1,
  },
  // === DANÇA & MOVIMENTO (versão básica Onda 1) ===
  {
    id: "rotacao-quadril-em-pe",
    name: "Rotação de quadril em pé",
    category: "danca",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Em pé, mãos no quadril. Faz círculos com o quadril, primeiro num sentido depois no outro. 20 cada lado. Solta a região.",
    commonMistakes: [
      "Mexer joelhos junto",
      "Tensionar ombros",
    ],
    exposureLevel: 1,
  },
  {
    id: "rebolado-basico",
    name: "Rebolado básico (pélvico)",
    category: "danca",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Em pé, joelhos levemente dobrados. Move quadril pra frente e pra trás isoladamente. Pratique antes lento, depois acelera.",
    commonMistakes: [
      "Mexer tronco junto",
      "Tensionar muito",
    ],
    exposureLevel: 2,
  },
  {
    id: "isolamento-quadril-lateral",
    name: "Isolamento lateral de quadril",
    category: "danca",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Quadril pro lado, depois pro outro. Tronco fica parado. Sente o oblíquo trabalhar sem hipertrofia (movimentos pequenos).",
    commonMistakes: [
      "Mexer ombros",
      "Inclinar tronco",
    ],
    exposureLevel: 2,
  },
  // === AQUECIMENTO ===
  {
    id: "aquecimento-articular",
    name: "Aquecimento articular geral",
    category: "aquecimento",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "5 min: círculo de pescoço (5x cada), círculo de ombros (10), inclinação lateral de tronco (5), círculo de quadril (10), aquecimento de joelho/tornozelo (10).",
    commonMistakes: [
      "Movimentos bruscos",
      "Pular aquecimento direto pro treino pesado",
    ],
    exposureLevel: 1,
  },
  {
    id: "cardio-leve-esteira",
    name: "Cardio leve (esteira ou bike)",
    category: "aquecimento",
    equipment: ["esteira"],
    difficulty: "iniciante",
    description: "5-7 min em ritmo confortável (consegue conversar). Eleva temperatura corporal, prepara articulações.",
    commonMistakes: [
      "Começar muito intenso",
      "Pular essa fase",
    ],
    exposureLevel: 1,
  },
  // === MOBILIDADE PÉLVICA (vida íntima — base de flexibilidade) ===
  {
    id: "borboleta",
    name: "Borboleta (alongamento adutor)",
    category: "mobilidade",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Sentada, planta dos pés juntas, joelhos pros lados. Cotovelos podem pressionar gentilmente joelhos pra baixo. 1-2 min respirando.",
    commonMistakes: [
      "Forçar joelhos com pressão exagerada",
      "Curvar lombar",
    ],
    exposureLevel: 1,
  },
  {
    id: "agachamento-profundo-pausa",
    name: "Agachamento profundo com pausa",
    category: "mobilidade",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Agacha o mais profundo possível mantendo pés no chão. Pausa 30s-2min. Mobiliza quadril, tornozelo, lombar.",
    commonMistakes: [
      "Calcanhar levantando",
      "Forçar amplitude sem preparo",
    ],
    easierVariation: "Apoiar em algo (parede, móvel) durante a pausa",
    exposureLevel: 1,
  },
  {
    id: "happy-baby",
    name: "Happy baby",
    category: "mobilidade",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Deitada de costas, segura as plantas dos pés, joelhos abrem pros lados perto das axilas. Solta lombar e abre quadril.",
    commonMistakes: [
      "Cabeça levantando",
      "Pés muito longe do corpo",
    ],
    exposureLevel: 1,
  },
  // === ADUÇÃO / ABDUÇÃO PRA QUADRIL ===
  {
    id: "abdutor-deitada",
    name: "Abdutor deitada de lado",
    category: "gluteo",
    equipment: ["peso-corporal"],
    difficulty: "iniciante",
    description: "Deitada de lado, perna de baixo dobrada, perna de cima estendida. Levanta a perna de cima sem rodar quadril. 15-20 reps cada lado.",
    commonMistakes: [
      "Rodar quadril (levantar pra frente em vez de pro lado)",
      "Não controlar descida",
    ],
    harderVariation: "Com caneleira ou banda",
    exposureLevel: 1,
  },
  {
    id: "clamshell",
    name: "Clamshell",
    category: "gluteo",
    equipment: ["mini-band"],
    difficulty: "iniciante",
    description: "Deitada de lado, joelhos dobrados, banda acima do joelho. Abre o joelho de cima mantendo os pés juntos. Glúteo médio.",
    commonMistakes: [
      "Rolar pra trás pra ajudar",
      "Abrir só um pouquinho",
    ],
    exposureLevel: 1,
  },
];
```

- [ ] **Step 3: Plano semanal**

`src/data/workout-plan-seed.ts`:

```typescript
import type { WorkoutTemplate } from "../lib/db";

export const WORKOUT_PLAN: WorkoutTemplate[] = [
  {
    id: "seg-gluteo-mobilidade",
    name: "Glúteo + Mobilidade de quadril",
    dayOfWeek: 1,
    durationMin: 50,
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "10 cada lado", restSec: 30 },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "15", restSec: 45 },
      { exerciseId: "hip-thrust-barra", sets: 4, repsTarget: "10-12", restSec: 90 },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 60 },
      { exerciseId: "mobilidade-quadril-90-90", sets: 1, repsTarget: "5min", restSec: 0 },
    ],
  },
  {
    id: "ter-cintura-costas",
    name: "Cintura funcional + Costas",
    dayOfWeek: 2,
    durationMin: 45,
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "dead-bug", sets: 3, repsTarget: "10 cada lado", restSec: 30 },
      { exerciseId: "bird-dog", sets: 3, repsTarget: "10 cada lado", restSec: 30 },
      { exerciseId: "prancha", sets: 3, repsTarget: "30-45s", restSec: 45 },
      { exerciseId: "remada-baixa-maquina", sets: 3, repsTarget: "12", restSec: 60 },
      { exerciseId: "retracao-escapular", sets: 3, repsTarget: "15", restSec: 30 },
      { exerciseId: "alongamento-piriforme", sets: 1, repsTarget: "1min cada lado", restSec: 0 },
    ],
  },
  {
    id: "qua-mobilidade-danca",
    name: "Mobilidade total + Dança",
    dayOfWeek: 3,
    durationMin: 40,
    exercises: [
      { exerciseId: "cat-cow", sets: 2, repsTarget: "10", restSec: 0 },
      { exerciseId: "borboleta", sets: 1, repsTarget: "2min", restSec: 0 },
      { exerciseId: "happy-baby", sets: 1, repsTarget: "1min", restSec: 0 },
      { exerciseId: "agachamento-profundo-pausa", sets: 1, repsTarget: "2min", restSec: 0 },
      { exerciseId: "alongamento-flexor-quadril", sets: 1, repsTarget: "1min cada lado", restSec: 0 },
      { exerciseId: "rotacao-quadril-em-pe", sets: 2, repsTarget: "20 cada sentido", restSec: 30 },
      { exerciseId: "rebolado-basico", sets: 3, repsTarget: "1min", restSec: 30 },
      { exerciseId: "isolamento-quadril-lateral", sets: 3, repsTarget: "30s cada lado", restSec: 30 },
    ],
  },
  {
    id: "qui-gluteo-coxa",
    name: "Glúteo (variação) + Coxa",
    dayOfWeek: 4,
    durationMin: 50,
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "clamshell", sets: 2, repsTarget: "15 cada lado", restSec: 30 },
      { exerciseId: "agachamento-goblet", sets: 4, repsTarget: "10-12", restSec: 75 },
      { exerciseId: "stiff", sets: 3, repsTarget: "12", restSec: 75 },
      { exerciseId: "abdutor-band-em-pe", sets: 3, repsTarget: "15 cada lado", restSec: 45 },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "15 cada lado", restSec: 30 },
    ],
  },
  {
    id: "sex-peitoral-postura",
    name: "Peitoral leve + Postura",
    dayOfWeek: 5,
    durationMin: 45,
    exercises: [
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0 },
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "10 (carga LEVE)", restSec: 60 },
      { exerciseId: "cross-over-cabo", sets: 3, repsTarget: "12 (carga LEVE)", restSec: 60 },
      { exerciseId: "face-pull", sets: 4, repsTarget: "15", restSec: 45 },
      { exerciseId: "retracao-escapular", sets: 3, repsTarget: "15", restSec: 30 },
      { exerciseId: "prancha-lateral", sets: 2, repsTarget: "30s cada lado", restSec: 30 },
      { exerciseId: "alongamento-flexor-quadril", sets: 1, repsTarget: "1min cada lado", restSec: 0 },
    ],
  },
];
```

- [ ] **Step 4: Função de seed idempotente**

`src/lib/seed.ts`:

```typescript
import { db } from "./db";
import { EXERCISES } from "../data/exercises-seed";
import { WORKOUT_PLAN } from "../data/workout-plan-seed";

export async function seedDatabase(): Promise<void> {
  const seeded = await db.settings.get("seeded");
  if (seeded?.value === true) return;

  await db.transaction("rw", db.exercises, db.workoutTemplates, db.settings, async () => {
    for (const ex of EXERCISES) {
      await db.exercises.put(ex);
    }
    for (const tpl of WORKOUT_PLAN) {
      await db.workoutTemplates.put(tpl);
    }
    await db.settings.put({ key: "seeded", value: true });
  });
}
```

- [ ] **Step 5: Tests pass + build**

```bash
npm run test -- seed
npm run build
```

3 tests passing, build clean.

- [ ] **Step 6: Commit**

```bash
git add src/data/ src/lib/seed.ts tests/lib/seed.test.ts
git commit -m "feat(data): catálogo de 35 exercícios + plano semanal pré-cadastrados"
```

---

## Fase B — Settings helpers

### Task 2: Settings helpers tipados + hook

**Files:**
- Create: `src/lib/settings-helpers.ts`
- Create: `src/hooks/useSetting.ts`
- Create: `tests/lib/settings-helpers.test.ts`

- [ ] **Step 1: Test**

`tests/lib/settings-helpers.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getSetting, setSetting, type Settings } from "../../src/lib/settings-helpers";

describe("settings helpers", () => {
  it("setSetting + getSetting round-trip", async () => {
    await setSetting("morningReminderTime", "08:00");
    expect(await getSetting("morningReminderTime")).toBe("08:00");
  });

  it("getSetting retorna default se chave não existir", async () => {
    expect(await getSetting("activeBreakIntervalMin")).toBe(90);
  });

  it("aceita objeto", async () => {
    await setSetting("quietHours", { from: "22:00", to: "08:00" });
    expect(await getSetting("quietHours")).toEqual({ from: "22:00", to: "08:00" });
  });
});

// Type-only test: Settings keys are constrained
// @ts-expect-error invalid key
() => setSetting("invalidKey", "x");
```

- [ ] **Step 2: Implementação**

`src/lib/settings-helpers.ts`:

```typescript
import { db } from "./db";

export interface Settings {
  onboarded: boolean;
  seeded: boolean;
  morningReminderTime: string; // "HH:MM"
  eveningReminderTime: string;
  workoutReminderTime: string;
  activeBreakIntervalMin: number;
  activeBreakStartHour: number; // 0-23
  activeBreakEndHour: number;
  hydrationIntervalMin: number;
  hydrationGoalMl: number;
  quietHours: { from: string; to: string };
  focusModeUntil: number | null; // timestamp ms
  notificationsEnabled: boolean;
}

const DEFAULTS: Settings = {
  onboarded: false,
  seeded: false,
  morningReminderTime: "08:00",
  eveningReminderTime: "22:00",
  workoutReminderTime: "18:00",
  activeBreakIntervalMin: 90,
  activeBreakStartHour: 9,
  activeBreakEndHour: 18,
  hydrationIntervalMin: 60,
  hydrationGoalMl: 2000,
  quietHours: { from: "22:00", to: "08:00" },
  focusModeUntil: null,
  notificationsEnabled: true,
};

export async function getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]> {
  const row = await db.settings.get(key);
  if (row === undefined) return DEFAULTS[key];
  return row.value as Settings[K];
}

export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  await db.settings.put({ key, value });
}
```

- [ ] **Step 3: Hook reativo**

`src/hooks/useSetting.ts`:

```typescript
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import type { Settings } from "../lib/settings-helpers";

const DEFAULTS: Settings = {
  onboarded: false,
  seeded: false,
  morningReminderTime: "08:00",
  eveningReminderTime: "22:00",
  workoutReminderTime: "18:00",
  activeBreakIntervalMin: 90,
  activeBreakStartHour: 9,
  activeBreakEndHour: 18,
  hydrationIntervalMin: 60,
  hydrationGoalMl: 2000,
  quietHours: { from: "22:00", to: "08:00" },
  focusModeUntil: null,
  notificationsEnabled: true,
};

export function useSetting<K extends keyof Settings>(key: K): Settings[K] {
  const row = useLiveQuery(() => db.settings.get(key), [key]);
  if (row === undefined) return DEFAULTS[key];
  return row.value as Settings[K];
}
```

- [ ] **Step 4: Validate**

```bash
npm run test -- settings-helpers
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/settings-helpers.ts src/hooks/useSetting.ts tests/lib/settings-helpers.test.ts
git commit -m "feat(settings): helpers tipados + hook reativo"
```

---

## Fase C — Aba Treino

### Task 3: Página WeeklyPlan

**Files:**
- Modify: `src/pages/workout/WorkoutHome.tsx` (substituir placeholder)
- Create: `src/pages/workout/WeeklyPlan.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: WorkoutHome novo**

`src/pages/workout/WorkoutHome.tsx`:

```tsx
import { Link } from "react-router-dom";

export function WorkoutHome() {
  return (
    <div className="p-4 pb-24 space-y-3">
      <h1 className="font-serif text-2xl text-nude mb-2">Treino</h1>
      <Link to="/treino/plano" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Plano semanal</h3>
        <p className="text-muted text-sm mt-1">Treinos do dia e da semana</p>
      </Link>
      <Link to="/treino/biblioteca" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Biblioteca de exercícios</h3>
        <p className="text-muted text-sm mt-1">Catálogo com técnica, erros, variações</p>
      </Link>
      <Link to="/treino/progressao" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Progressão</h3>
        <p className="text-muted text-sm mt-1">Histórico de cargas por exercício</p>
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: WeeklyPlan**

`src/pages/workout/WeeklyPlan.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function WeeklyPlan() {
  const templates = useLiveQuery(() => db.workoutTemplates.orderBy("dayOfWeek").toArray(), []);
  const today = new Date().getDay();

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino" className="text-muted text-sm">&larr; Treino</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Plano semanal</h1>
      </div>
      <div className="space-y-3">
        {templates?.map((tpl) => {
          const isToday = tpl.dayOfWeek === today;
          return (
            <Link
              key={tpl.id}
              to={`/treino/sessao/${tpl.id}`}
              className={`card block transition ${
                isToday ? "border-nude bg-wine/20" : "hover:border-nude/40"
              }`}
            >
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-muted text-xs uppercase tracking-wider">
                  {DAYS[tpl.dayOfWeek]} {isToday && "· hoje"}
                </span>
                <span className="text-muted text-xs">{tpl.durationMin} min</span>
              </div>
              <h3 className="text-nude-warm font-medium">{tpl.name}</h3>
              <p className="text-muted text-sm mt-1">{tpl.exercises.length} exercícios</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Registrar rota**

Em `src/main.tsx`, adicione import `WeeklyPlan` e rota `treino/plano`.

- [ ] **Step 4: Inicializar seed na primeira execução**

Atualize `src/main.tsx` pra rodar seed antes de renderizar:

```tsx
import { seedDatabase } from "./lib/seed";

seedDatabase().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
});
```

(Substitua o `ReactDOM.createRoot(...)` direto pelo wrapper acima.)

- [ ] **Step 5: Validate + commit**

```bash
npm run build
git add src/pages/workout/ src/main.tsx
git commit -m "feat(treino): WorkoutHome + WeeklyPlan com seed automático"
```

---

### Task 4: Página ExerciseLibrary + ExerciseDetail

**Files:**
- Create: `src/components/ExerciseCard.tsx`
- Create: `src/pages/workout/ExerciseLibrary.tsx`
- Create: `src/pages/workout/ExerciseDetail.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: ExerciseCard**

`src/components/ExerciseCard.tsx`:

```tsx
import { Link } from "react-router-dom";
import type { Exercise } from "../lib/db";

const CATEGORY_LABEL: Record<string, string> = {
  gluteo: "Glúteo",
  cintura: "Cintura",
  costas: "Costas",
  postura: "Postura",
  peitoral: "Peitoral",
  mobilidade: "Mobilidade",
  danca: "Dança",
  aquecimento: "Aquecimento",
};

const DIFFICULTY_LABEL: Record<Exercise["difficulty"], string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export function ExerciseCard({ ex }: { ex: Exercise }) {
  return (
    <Link to={`/treino/exercicio/${ex.id}`} className="card block hover:border-nude/40 transition">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">{CATEGORY_LABEL[ex.category] ?? ex.category}</span>
        <span className="text-muted text-xs">{DIFFICULTY_LABEL[ex.difficulty]} · exp {ex.exposureLevel}/5</span>
      </div>
      <h3 className="text-nude-warm font-medium">{ex.name}</h3>
    </Link>
  );
}
```

- [ ] **Step 2: ExerciseLibrary**

`src/pages/workout/ExerciseLibrary.tsx`:

```tsx
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { ExerciseCard } from "../../components/ExerciseCard";

const CATEGORIES = ["gluteo", "cintura", "costas", "postura", "peitoral", "mobilidade", "danca", "aquecimento"];
const CATEGORY_LABELS: Record<string, string> = {
  gluteo: "Glúteo",
  cintura: "Cintura",
  costas: "Costas",
  postura: "Postura",
  peitoral: "Peitoral",
  mobilidade: "Mobilidade",
  danca: "Dança",
  aquecimento: "Aquecimento",
};

export function ExerciseLibrary() {
  const [category, setCategory] = useState<string | null>(null);
  const exercises = useLiveQuery(async () => {
    if (category) {
      return db.exercises.where("category").equals(category).toArray();
    }
    return db.exercises.toArray();
  }, [category]);

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino" className="text-muted text-sm">&larr; Treino</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Biblioteca</h1>
      </div>
      <div className="overflow-x-auto -mx-4 px-4 mb-4">
        <div className="flex gap-2 w-max">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
              category === null ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
                category === c ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {exercises?.map((ex) => <ExerciseCard key={ex.id} ex={ex} />)}
        {exercises?.length === 0 && (
          <p className="text-muted text-sm text-center py-4">Nenhum exercício nessa categoria.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: ExerciseDetail**

`src/pages/workout/ExerciseDetail.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useParams } from "react-router-dom";
import { db } from "../../lib/db";

export function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const ex = useLiveQuery(() => (id ? db.exercises.get(id) : Promise.resolve(undefined)), [id]);

  if (!ex) {
    return (
      <div className="p-4 pb-24">
        <p className="text-muted text-sm text-center py-8">Exercício não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino/biblioteca" className="text-muted text-sm">&larr; Biblioteca</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{ex.name}</h1>
      <p className="text-muted text-xs mb-4">
        {ex.category} · {ex.difficulty} · exposição {ex.exposureLevel}/5
      </p>

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Como fazer</h2>
        <p className="text-sm">{ex.description}</p>
      </div>

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Erros comuns</h2>
        <ul className="space-y-1 text-sm list-disc pl-5">
          {ex.commonMistakes.map((m) => <li key={m}>{m}</li>)}
        </ul>
      </div>

      {ex.equipment.length > 0 && (
        <div className="card mb-3">
          <h2 className="text-nude-warm font-medium mb-2">Equipamento</h2>
          <p className="text-sm">{ex.equipment.join(", ")}</p>
        </div>
      )}

      {ex.easierVariation && (
        <div className="card mb-3">
          <h2 className="text-nude-warm font-medium mb-2">Se for muito difícil</h2>
          <p className="text-sm">{ex.easierVariation}</p>
        </div>
      )}

      {ex.harderVariation && (
        <div className="card mb-3">
          <h2 className="text-nude-warm font-medium mb-2">Se ficar fácil demais</h2>
          <p className="text-sm">{ex.harderVariation}</p>
        </div>
      )}

      {ex.videoUrl && (
        <a href={ex.videoUrl} target="_blank" rel="noreferrer" className="card block text-center text-nude">
          Ver vídeo →
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Rotas + commit**

Adicione em `main.tsx`:

```tsx
import { ExerciseLibrary } from "./pages/workout/ExerciseLibrary";
import { ExerciseDetail } from "./pages/workout/ExerciseDetail";
// ...
{ path: "treino/biblioteca", element: <ExerciseLibrary /> },
{ path: "treino/exercicio/:id", element: <ExerciseDetail /> },
```

```bash
npm run build
git add src/components/ExerciseCard.tsx src/pages/workout/ExerciseLibrary.tsx src/pages/workout/ExerciseDetail.tsx src/main.tsx
git commit -m "feat(treino): biblioteca + detalhe de exercício"
```

---

### Task 5: Registro de sessão com sugestão de carga

**Files:**
- Create: `src/components/SessionRecorder.tsx`
- Create: `src/pages/workout/SessionDetail.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: SessionRecorder**

`src/components/SessionRecorder.tsx`:

```tsx
import { useState, useEffect } from "react";
import type { Exercise, WorkoutSession } from "../lib/db";
import { db } from "../lib/db";
import { suggestNextLoad, type SessionFeedback } from "../lib/progression";

interface Props {
  exercise: Exercise;
  setsTarget: number;
  repsTarget: string;
  onSave: (entry: WorkoutSession["exercises"][number]) => void;
}

export function SessionRecorder({ exercise, setsTarget, repsTarget, onSave }: Props) {
  const [sets, setSets] = useState<Array<{ reps: string; weight: string }>>(
    () => Array.from({ length: setsTarget }, () => ({ reps: "", weight: "" })),
  );
  const [feedback, setFeedback] = useState<SessionFeedback>("medium");
  const [suggested, setSuggested] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    db.workoutSessions
      .where("date")
      .below(new Date().toISOString().slice(0, 10) + "z")
      .reverse()
      .toArray()
      .then((prev) => {
        if (!mounted) return;
        for (const session of prev) {
          const found = session.exercises.find((e) => e.exerciseId === exercise.id);
          if (found && found.sets.length > 0) {
            const lastSet = found.sets[found.sets.length - 1];
            const prevWeight = lastSet.weight;
            const completedAllReps = found.sets.every((s) => s.reps > 0);
            const prevFeedback = session.difficultySelf ?? "medium";
            setSuggested(suggestNextLoad({ lastLoad: prevWeight, feedback: prevFeedback, completedAllReps }));
            break;
          }
        }
      });
    return () => { mounted = false; };
  }, [exercise.id]);

  function handleSetChange(i: number, field: "reps" | "weight", value: string) {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  function applySuggestion() {
    if (suggested === null) return;
    setSets((prev) => prev.map((s) => ({ ...s, weight: String(suggested) })));
  }

  function handleSave() {
    const entry: WorkoutSession["exercises"][number] = {
      exerciseId: exercise.id,
      sets: sets
        .filter((s) => s.reps.trim() !== "")
        .map((s) => ({
          reps: Number(s.reps),
          weight: Number(s.weight.replace(",", ".")) || 0,
        })),
    };
    if (entry.sets.length > 0) onSave(entry);
  }

  return (
    <div className="card mb-3">
      <div className="flex justify-between items-baseline mb-2">
        <h3 className="text-nude-warm font-medium">{exercise.name}</h3>
        <span className="text-muted text-xs">{setsTarget}x {repsTarget}</span>
      </div>

      {suggested !== null && (
        <button
          type="button"
          onClick={applySuggestion}
          className="text-xs text-nude underline mb-2"
        >
          Sugestão de carga: {suggested} kg (aplicar em todas)
        </button>
      )}

      <div className="space-y-2 mb-2">
        {sets.map((s, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-muted text-xs w-12">Série {i + 1}</span>
            <input
              type="text"
              inputMode="decimal"
              value={s.weight}
              onChange={(e) => handleSetChange(i, "weight", e.target.value)}
              placeholder="kg"
              className="flex-1 bg-bg-deep border border-bg-border rounded-md px-2 py-1.5 text-nude-warm text-sm"
            />
            <input
              type="text"
              inputMode="numeric"
              value={s.reps}
              onChange={(e) => handleSetChange(i, "reps", e.target.value)}
              placeholder="reps"
              className="flex-1 bg-bg-deep border border-bg-border rounded-md px-2 py-1.5 text-nude-warm text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-2">
        {(["easy", "medium", "hard"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFeedback(f)}
            className={`flex-1 py-1.5 rounded-md text-xs ${
              feedback === f ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
            }`}
          >
            {f === "easy" ? "Fácil" : f === "medium" ? "Médio" : "Difícil"}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full bg-wine text-nude-warm rounded-md py-2 text-sm"
      >
        Salvar exercício
      </button>
    </div>
  );
}
```

- [ ] **Step 2: SessionDetail**

`src/pages/workout/SessionDetail.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { db, type Exercise, type WorkoutSession } from "../../lib/db";
import { SessionRecorder } from "../../components/SessionRecorder";

export function SessionDetail() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const template = useLiveQuery(
    () => (templateId ? db.workoutTemplates.get(templateId) : Promise.resolve(undefined)),
    [templateId],
  );
  const exercises = useLiveQuery(async () => {
    if (!template) return [];
    const ids = template.exercises.map((e) => e.exerciseId);
    return db.exercises.where("id").anyOf(ids).toArray();
  }, [template]);

  const [recorded, setRecorded] = useState<WorkoutSession["exercises"]>([]);
  const [feedback, setFeedback] = useState<WorkoutSession["difficultySelf"]>("medium");

  if (!template || !exercises) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  const exMap = new Map<string, Exercise>(exercises.map((e) => [e.id, e]));

  async function finishSession() {
    if (!template) return;
    const session: Omit<WorkoutSession, "id"> = {
      date: new Date().toISOString().slice(0, 10),
      templateId: template.id,
      exercises: recorded,
      durationMin: template.durationMin,
      difficultySelf: feedback,
    };
    await db.workoutSessions.add(session as WorkoutSession);
    navigate("/treino", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino/plano" className="text-muted text-sm">&larr; Plano</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">{template.name}</h1>
      </div>

      {template.exercises.map((tplEx, i) => {
        const ex = exMap.get(tplEx.exerciseId);
        if (!ex) return null;
        const alreadyRecorded = recorded.some((r) => r.exerciseId === ex.id);
        if (alreadyRecorded) {
          return (
            <div key={i} className="card mb-3 border-nude">
              <h3 className="text-nude-warm font-medium">{ex.name} ✓</h3>
              <p className="text-muted text-xs">Registrado</p>
            </div>
          );
        }
        return (
          <SessionRecorder
            key={i}
            exercise={ex}
            setsTarget={tplEx.sets}
            repsTarget={tplEx.repsTarget}
            onSave={(entry) => setRecorded((prev) => [...prev, entry])}
          />
        );
      })}

      <div className="card">
        <h2 className="text-nude-warm font-medium mb-2">Como foi o treino?</h2>
        <div className="flex gap-2 mb-3">
          {(["easy", "medium", "hard"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFeedback(f)}
              className={`flex-1 py-2 rounded-md text-sm ${
                feedback === f ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {f === "easy" ? "Fácil" : f === "medium" ? "Médio" : "Difícil"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={finishSession}
          disabled={recorded.length === 0}
          className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium disabled:opacity-50"
        >
          Finalizar treino ({recorded.length} exercícios)
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Rota + commit**

```tsx
import { SessionDetail } from "./pages/workout/SessionDetail";
// ...
{ path: "treino/sessao/:templateId", element: <SessionDetail /> },
```

```bash
npm run build
git add src/components/SessionRecorder.tsx src/pages/workout/SessionDetail.tsx src/main.tsx
git commit -m "feat(treino): registro de sessão com sugestão automática de carga"
```

---

### Task 6: Histórico de progressão (gráfico SVG)

**Files:**
- Create: `src/components/ProgressionChart.tsx`
- Create: `src/pages/workout/ProgressionHistory.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: ProgressionChart**

`src/components/ProgressionChart.tsx`:

```tsx
interface DataPoint {
  date: string;
  weight: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
}

export function ProgressionChart({ data, height = 160 }: Props) {
  if (data.length === 0) {
    return <p className="text-muted text-sm text-center py-4">Sem dados ainda.</p>;
  }
  if (data.length === 1) {
    return (
      <div className="text-center py-4">
        <p className="text-2xl font-serif text-nude">{data[0].weight} kg</p>
        <p className="text-muted text-xs">{data[0].date}</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.weight));
  const min = Math.min(...data.map((d) => d.weight));
  const range = max - min || 1;
  const padding = 20;
  const w = 320;
  const h = height;
  const stepX = (w - padding * 2) / (data.length - 1);

  const points = data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y = padding + (1 - (d.weight - min) / range) * (h - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" xmlns="http://www.w3.org/2000/svg">
      <polyline points={points} fill="none" stroke="#d4a373" strokeWidth={1.5} strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = padding + i * stepX;
        const y = padding + (1 - (d.weight - min) / range) * (h - padding * 2);
        return <circle key={i} cx={x} cy={y} r={2.5} fill="#f4e4d6" />;
      })}
      <text x={padding} y={padding - 4} fontSize={10} fill="#a87a6a">{max} kg</text>
      <text x={padding} y={h - 4} fontSize={10} fill="#a87a6a">{min} kg</text>
    </svg>
  );
}
```

- [ ] **Step 2: ProgressionHistory**

`src/pages/workout/ProgressionHistory.tsx`:

```tsx
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { ProgressionChart } from "../../components/ProgressionChart";
import { formatDateBR } from "../../lib/format";

export function ProgressionHistory() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const sessions = useLiveQuery(() => db.workoutSessions.orderBy("date").toArray(), []);

  const data = (() => {
    if (!selectedId || !sessions) return [];
    const points: Array<{ date: string; weight: number }> = [];
    for (const s of sessions) {
      const found = s.exercises.find((e) => e.exerciseId === selectedId);
      if (found && found.sets.length > 0) {
        const maxWeight = Math.max(...found.sets.map((set) => set.weight));
        points.push({ date: s.date, weight: maxWeight });
      }
    }
    return points;
  })();

  const exMap = new Map(exercises?.map((e) => [e.id, e]) ?? []);

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino" className="text-muted text-sm">&larr; Treino</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Progressão</h1>
      </div>

      <div className="card mb-3">
        <label className="block text-muted text-xs uppercase tracking-wider mb-1">Exercício</label>
        <select
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(e.target.value || null)}
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
        >
          <option value="">Escolha...</option>
          {exercises?.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>

      {selectedId && (
        <>
          <div className="card mb-3">
            <h2 className="text-nude-warm font-medium mb-2">{exMap.get(selectedId)?.name}</h2>
            <ProgressionChart data={data} />
          </div>

          {data.length > 0 && (
            <div className="card">
              <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Histórico</h2>
              <ul className="space-y-1 text-sm">
                {data.map((p, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-muted">{formatDateBR(new Date(p.date))}</span>
                    <span className="text-nude-warm">{p.weight} kg</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Rota + commit**

```tsx
import { ProgressionHistory } from "./pages/workout/ProgressionHistory";
// ...
{ path: "treino/progressao", element: <ProgressionHistory /> },
```

```bash
npm run build
git add src/components/ProgressionChart.tsx src/pages/workout/ProgressionHistory.tsx src/main.tsx
git commit -m "feat(treino): histórico de progressão com gráfico SVG"
```

---

## Fase D — Aba Hoje (dashboard)

### Task 7: Today dashboard

**Files:**
- Modify: `src/pages/Today.tsx`
- Create: `src/components/TodayCard.tsx`

- [ ] **Step 1: TodayCard**

`src/components/TodayCard.tsx`:

```tsx
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  to?: string;
  variant?: "default" | "highlight";
  rightSlot?: ReactNode;
}

export function TodayCard({ title, subtitle, to, variant = "default", rightSlot }: Props) {
  const base = "card block transition";
  const variantCls = variant === "highlight" ? "bg-wine/40 border-wine-light" : "hover:border-nude/40";
  const inner = (
    <>
      <div className="flex justify-between items-baseline">
        <h3 className="text-nude-warm font-medium">{title}</h3>
        {rightSlot}
      </div>
      {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
    </>
  );
  if (to) {
    return <Link to={to} className={`${base} ${variantCls}`}>{inner}</Link>;
  }
  return <div className={`card ${variantCls}`}>{inner}</div>;
}
```

- [ ] **Step 2: Today**

`src/pages/Today.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { TodayCard } from "../components/TodayCard";
import { useSetting } from "../hooks/useSetting";
import { formatDateBR } from "../lib/format";

export function Today() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayISO = today.toISOString().slice(0, 10);

  const todayTemplate = useLiveQuery(
    () => db.workoutTemplates.where("dayOfWeek").equals(dayOfWeek).first(),
    [dayOfWeek],
  );
  const sessionsToday = useLiveQuery(
    () => db.workoutSessions.where("date").equals(todayISO).count(),
    [todayISO],
  );
  const measurementsRecent = useLiveQuery(
    () => db.measurements.orderBy("date").reverse().limit(1).toArray(),
    [],
  );
  const photosRecent = useLiveQuery(
    () => db.photos.where("category").equals("self").reverse().limit(1).sortBy("date").then((arr) => arr.reverse()),
    [],
  );
  const goalMl = useSetting("hydrationGoalMl");
  const dailyLog = useLiveQuery(() => db.dailyLog.get(todayISO), [todayISO]);

  const daysSinceMeasurement = measurementsRecent?.[0]
    ? Math.floor((today.getTime() - new Date(measurementsRecent[0].date).getTime()) / 86400000)
    : null;
  const daysSincePhoto = photosRecent?.[0]
    ? Math.floor((today.getTime() - new Date(photosRecent[0].date).getTime()) / 86400000)
    : null;

  async function addWater(ml: number) {
    const log = await db.dailyLog.get(todayISO);
    if (log) {
      await db.dailyLog.update(todayISO, { waterMl: log.waterMl + ml });
    } else {
      await db.dailyLog.put({ date: todayISO, waterMl: ml, activeBreakCount: 0 });
    }
  }

  return (
    <div className="p-4 pb-24 space-y-3">
      <div>
        <p className="text-muted text-xs uppercase tracking-wider">Hoje · {formatDateBR(today)}</p>
        <h1 className="font-serif text-2xl text-nude">Bom dia</h1>
      </div>

      {todayTemplate ? (
        <TodayCard
          title={todayTemplate.name}
          subtitle={`Treino · ${todayTemplate.durationMin} min · ${sessionsToday ?? 0 > 0 ? "concluído ✓" : "ainda não feito"}`}
          to={`/treino/sessao/${todayTemplate.id}`}
          variant={sessionsToday ?? 0 > 0 ? "default" : "highlight"}
        />
      ) : (
        <TodayCard title="Descanso" subtitle="Hoje não tem treino programado" />
      )}

      <TodayCard
        title="Hidratação"
        subtitle={`${dailyLog?.waterMl ?? 0} ml de ${goalMl} ml`}
        rightSlot={
          <button
            type="button"
            onClick={() => void addWater(200)}
            className="text-xs bg-wine text-nude-warm px-2 py-1 rounded-md"
          >
            +200ml
          </button>
        }
      />

      {daysSinceMeasurement !== null && daysSinceMeasurement > 28 && (
        <TodayCard
          title="Hora de medir"
          subtitle={`Última medida há ${daysSinceMeasurement} dias`}
          to="/corpo/medidas"
          variant="highlight"
        />
      )}
      {daysSincePhoto !== null && daysSincePhoto > 14 && (
        <TodayCard
          title="Hora de tirar fotos"
          subtitle={`Última foto há ${daysSincePhoto} dias`}
          to="/corpo/fotos"
          variant="highlight"
        />
      )}

      <TodayCard title="Skincare" subtitle="Rotina chega na próxima atualização" />
      <TodayCard title="Movimento" subtitle="Dança e mobilidade na próxima atualização" />
    </div>
  );
}
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/pages/Today.tsx src/components/TodayCard.tsx
git commit -m "feat(hoje): dashboard agregando treino, hidratação, lembretes"
```

---

## Fase E — Notificações

### Task 8: Lib de notificações + testes

**Files:**
- Create: `src/lib/notifications.ts`
- Create: `tests/lib/notifications.test.ts`

- [ ] **Step 1: Test**

`tests/lib/notifications.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { isWithinQuietHours, isWithinWorkingHours } from "../../src/lib/notifications";

describe("isWithinQuietHours", () => {
  it("dentro do range noturno (22h-08h)", () => {
    expect(isWithinQuietHours(new Date("2026-05-26T23:00:00"), "22:00", "08:00")).toBe(true);
    expect(isWithinQuietHours(new Date("2026-05-26T06:00:00"), "22:00", "08:00")).toBe(true);
  });
  it("fora do range noturno", () => {
    expect(isWithinQuietHours(new Date("2026-05-26T10:00:00"), "22:00", "08:00")).toBe(false);
    expect(isWithinQuietHours(new Date("2026-05-26T18:00:00"), "22:00", "08:00")).toBe(false);
  });
  it("range diurno (mesmo dia)", () => {
    expect(isWithinQuietHours(new Date("2026-05-26T13:00:00"), "12:00", "14:00")).toBe(true);
    expect(isWithinQuietHours(new Date("2026-05-26T15:00:00"), "12:00", "14:00")).toBe(false);
  });
});

describe("isWithinWorkingHours", () => {
  it("hora dentro do range", () => {
    expect(isWithinWorkingHours(new Date("2026-05-26T10:00:00"), 9, 18)).toBe(true);
    expect(isWithinWorkingHours(new Date("2026-05-26T17:59:00"), 9, 18)).toBe(true);
  });
  it("hora fora do range", () => {
    expect(isWithinWorkingHours(new Date("2026-05-26T08:00:00"), 9, 18)).toBe(false);
    expect(isWithinWorkingHours(new Date("2026-05-26T19:00:00"), 9, 18)).toBe(false);
  });
  it("respeita dias úteis (segunda a sexta)", () => {
    // Sábado (dia 6) 26 não — usar 30 (sábado)
    expect(isWithinWorkingHours(new Date("2026-05-30T10:00:00"), 9, 18)).toBe(false);
    // Domingo (31)
    expect(isWithinWorkingHours(new Date("2026-05-31T10:00:00"), 9, 18)).toBe(false);
  });
});
```

- [ ] **Step 2: Implementation**

`src/lib/notifications.ts`:

```typescript
export function isWithinQuietHours(now: Date, from: string, to: string): boolean {
  const [fromH, fromM] = from.split(":").map(Number);
  const [toH, toM] = to.split(":").map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const fromMin = fromH * 60 + fromM;
  const toMin = toH * 60 + toM;
  if (fromMin === toMin) return false;
  if (fromMin < toMin) {
    return nowMin >= fromMin && nowMin < toMin;
  }
  return nowMin >= fromMin || nowMin < toMin;
}

export function isWithinWorkingHours(now: Date, startHour: number, endHour: number): boolean {
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  const h = now.getHours();
  return h >= startHour && h < endHour;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function notify(title: string, body: string): void {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  new Notification(title, { body, icon: "/icons/icon-192.svg" });
}

export function shouldNotifyNow(
  now: Date,
  opts: {
    notificationsEnabled: boolean;
    focusModeUntil: number | null;
    quietHours: { from: string; to: string };
  },
): boolean {
  if (!opts.notificationsEnabled) return false;
  if (opts.focusModeUntil && opts.focusModeUntil > now.getTime()) return false;
  if (isWithinQuietHours(now, opts.quietHours.from, opts.quietHours.to)) return false;
  return true;
}
```

- [ ] **Step 3: Tests + commit**

```bash
npm run test -- notifications
git add src/lib/notifications.ts tests/lib/notifications.test.ts
git commit -m "feat(notif): lib de timing + quiet hours + modo foco"
```

---

### Task 9: Agendador de notificações em runtime

**Files:**
- Create: `src/lib/notification-scheduler.ts`
- Modify: `src/App.tsx`

A abordagem prática: um scheduler que roda enquanto o app está aberto, com `setInterval` checando a cada minuto se é hora de notificar (respeitando quiet hours + modo foco + intervalos).

- [ ] **Step 1: Scheduler**

`src/lib/notification-scheduler.ts`:

```typescript
import { db } from "./db";
import { shouldNotifyNow, isWithinWorkingHours, notify } from "./notifications";
import { getSetting } from "./settings-helpers";

let intervalId: ReturnType<typeof setInterval> | null = null;
let lastActiveBreak = 0;
let lastHydration = 0;

async function tick() {
  const now = new Date();
  const settings = {
    notificationsEnabled: await getSetting("notificationsEnabled"),
    focusModeUntil: await getSetting("focusModeUntil"),
    quietHours: await getSetting("quietHours"),
  };
  if (!shouldNotifyNow(now, settings)) return;

  const activeBreakInterval = await getSetting("activeBreakIntervalMin");
  const activeBreakStart = await getSetting("activeBreakStartHour");
  const activeBreakEnd = await getSetting("activeBreakEndHour");
  const hydrationInterval = await getSetting("hydrationIntervalMin");

  const t = now.getTime();

  if (
    isWithinWorkingHours(now, activeBreakStart, activeBreakEnd) &&
    t - lastActiveBreak >= activeBreakInterval * 60_000
  ) {
    notify("Levanta da cadeira", "2 min de mobilidade de quadril");
    lastActiveBreak = t;
  }

  const hH = now.getHours();
  if (hH >= 9 && hH < 19 && t - lastHydration >= hydrationInterval * 60_000) {
    const todayISO = now.toISOString().slice(0, 10);
    const log = await db.dailyLog.get(todayISO);
    const drunk = log?.waterMl ?? 0;
    const goal = await getSetting("hydrationGoalMl");
    notify("Bebe água", `${drunk} ml de ${goal} ml hoje`);
    lastHydration = t;
  }
}

export function startScheduler() {
  if (intervalId !== null) return;
  intervalId = setInterval(() => void tick(), 60_000);
}

export function stopScheduler() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
```

- [ ] **Step 2: Wire in App**

Update `src/App.tsx`:

```tsx
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { OnboardingGate } from "./components/OnboardingGate";
import { startScheduler, stopScheduler } from "./lib/notification-scheduler";

function App() {
  useEffect(() => {
    startScheduler();
    return () => stopScheduler();
  }, []);

  return (
    <OnboardingGate>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </OnboardingGate>
  );
}

export default App;
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/lib/notification-scheduler.ts src/App.tsx
git commit -m "feat(notif): scheduler de pausas ativas + hidratação"
```

---

## Fase F — Configurações

### Task 10: Tela de Settings

**Files:**
- Modify: `src/pages/Settings.tsx` (existir? caso não, crie)
- Modify: `src/main.tsx` (registrar rota)
- Modify: `src/pages/Today.tsx` (link de acesso)

- [ ] **Step 1: Settings**

Substitua/Crie `src/pages/Settings.tsx`:

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSetting } from "../hooks/useSetting";
import { setSetting } from "../lib/settings-helpers";
import { requestNotificationPermission } from "../lib/notifications";
import { encryptBackup, decryptBackup } from "../lib/backup";
import { db } from "../lib/db";

export function Settings() {
  const notif = useSetting("notificationsEnabled");
  const morning = useSetting("morningReminderTime");
  const evening = useSetting("eveningReminderTime");
  const workout = useSetting("workoutReminderTime");
  const quietHours = useSetting("quietHours");
  const breakInterval = useSetting("activeBreakIntervalMin");
  const hydrInterval = useSetting("hydrationIntervalMin");
  const hydrGoal = useSetting("hydrationGoalMl");
  const focus = useSetting("focusModeUntil");

  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleNotifs() {
    if (!notif) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setError("Notificações foram bloqueadas pelo navegador. Ative em Configurações > Site.");
        return;
      }
    }
    await setSetting("notificationsEnabled", !notif);
  }

  async function pauseFocus(min: number) {
    await setSetting("focusModeUntil", Date.now() + min * 60_000);
    setInfo(`Modo foco ativo por ${min} min`);
    setTimeout(() => setInfo(null), 2500);
  }

  async function clearFocus() {
    await setSetting("focusModeUntil", null);
  }

  async function exportBackup() {
    setBusy(true);
    setError(null);
    const password = prompt("Senha pra criptografar o backup (mínimo 6 caracteres):");
    if (!password || password.length < 6) {
      setBusy(false);
      setError("Senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    try {
      const payload = {
        measurements: await db.measurements.toArray(),
        photos: await Promise.all(
          (await db.photos.toArray()).map(async (p) => ({
            ...p,
            blob: await blobToBase64(p.blob),
          })),
        ),
        sessions: await db.workoutSessions.toArray(),
        meals: await db.meals.toArray(),
        skincareLogs: await db.skincareLogs.toArray(),
        haircare: await db.haircare.toArray(),
        dailyLog: await db.dailyLog.toArray(),
      };
      const encrypted = await encryptBackup(payload, password);
      const link = document.createElement("a");
      link.href = `data:application/octet-stream;base64,${btoa(encrypted)}`;
      link.download = `trein-final-${new Date().toISOString().slice(0, 10)}.trein-backup`;
      link.click();
      setInfo("Backup baixado.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no backup.");
    } finally {
      setBusy(false);
    }
  }

  async function importBackup(file: File) {
    setBusy(true);
    setError(null);
    const password = prompt("Senha do backup:");
    if (!password) {
      setBusy(false);
      return;
    }
    try {
      const text = await file.text();
      const encrypted = atob(text);
      type ImportPayload = {
        measurements: unknown[];
        photos: Array<{ blob: string; date: string; tag: string; category: string }>;
        sessions: unknown[];
        meals: unknown[];
        skincareLogs: unknown[];
        haircare: unknown[];
        dailyLog: unknown[];
      };
      const payload = await decryptBackup<ImportPayload>(encrypted, password);
      await db.transaction("rw", db.measurements, db.photos, db.workoutSessions, db.meals, db.skincareLogs, db.haircare, db.dailyLog, async () => {
        await db.measurements.bulkAdd(payload.measurements as never);
        await db.photos.bulkAdd(
          await Promise.all(
            payload.photos.map(async (p) => ({
              ...p,
              blob: await base64ToBlob(p.blob),
            })),
          ) as never,
        );
        await db.workoutSessions.bulkAdd(payload.sessions as never);
        await db.meals.bulkAdd(payload.meals as never);
        await db.skincareLogs.bulkAdd(payload.skincareLogs as never);
        await db.haircare.bulkAdd(payload.haircare as never);
        await db.dailyLog.bulkAdd(payload.dailyLog as never);
      });
      setInfo("Backup importado.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha na importação (senha errada ou arquivo corrompido?).");
    } finally {
      setBusy(false);
    }
  }

  async function wipeAll() {
    if (!confirm("APAGAR TUDO? Não dá pra desfazer.")) return;
    if (!confirm("Tem certeza mesmo? Vai apagar TODAS suas medidas, fotos, sessões.")) return;
    await db.delete();
    location.reload();
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-muted text-sm">&larr; Hoje</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Configurações</h1>
      </div>

      {info && <p className="text-nude text-sm">{info}</p>}
      {error && <p className="text-red-300 text-sm">{error}</p>}

      <div className="card space-y-3">
        <h2 className="text-nude-warm font-medium">Notificações</h2>
        <label className="flex items-center justify-between">
          <span className="text-sm">Ativadas</span>
          <input type="checkbox" checked={notif} onChange={() => void toggleNotifs()} />
        </label>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Manhã</label>
          <input type="time" value={morning} onChange={(e) => void setSetting("morningReminderTime", e.target.value)}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Treino</label>
          <input type="time" value={workout} onChange={(e) => void setSetting("workoutReminderTime", e.target.value)}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Noite</label>
          <input type="time" value={evening} onChange={(e) => void setSetting("eveningReminderTime", e.target.value)}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Pausa ativa a cada</label>
          <input type="number" min={30} max={240} value={breakInterval} onChange={(e) => void setSetting("activeBreakIntervalMin", Number(e.target.value))}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          <p className="text-muted text-xs mt-1">minutos</p>
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Hidratação a cada</label>
          <input type="number" min={30} max={240} value={hydrInterval} onChange={(e) => void setSetting("hydrationIntervalMin", Number(e.target.value))}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          <p className="text-muted text-xs mt-1">minutos · meta diária: {hydrGoal}ml</p>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="text-nude-warm font-medium">Quiet hours</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">De</label>
            <input type="time" value={quietHours.from} onChange={(e) => void setSetting("quietHours", { ...quietHours, from: e.target.value })}
                   className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Até</label>
            <input type="time" value={quietHours.to} onChange={(e) => void setSetting("quietHours", { ...quietHours, to: e.target.value })}
                   className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          </div>
        </div>
      </div>

      <div className="card space-y-2">
        <h2 className="text-nude-warm font-medium">Modo foco</h2>
        {focus && focus > Date.now() ? (
          <>
            <p className="text-sm">Ativo até {new Date(focus).toLocaleTimeString()}</p>
            <button onClick={() => void clearFocus()} className="text-xs text-nude underline">Desativar</button>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => void pauseFocus(30)} className="bg-bg-deep border border-bg-border rounded-md py-2 text-sm">30 min</button>
            <button onClick={() => void pauseFocus(120)} className="bg-bg-deep border border-bg-border rounded-md py-2 text-sm">2 h</button>
            <button onClick={() => void pauseFocus(480)} className="bg-bg-deep border border-bg-border rounded-md py-2 text-sm">8 h</button>
          </div>
        )}
      </div>

      <div className="card space-y-2">
        <h2 className="text-nude-warm font-medium">Backup</h2>
        <button onClick={() => void exportBackup()} disabled={busy} className="w-full bg-wine text-nude-warm rounded-md py-2 text-sm disabled:opacity-50">
          {busy ? "Processando..." : "Exportar backup criptografado"}
        </button>
        <label className="block w-full bg-bg-deep border border-bg-border text-nude-warm text-center rounded-md py-2 text-sm cursor-pointer">
          Importar backup
          <input type="file" accept=".trein-backup" onChange={(e) => e.target.files?.[0] && void importBackup(e.target.files[0])} className="hidden" disabled={busy} />
        </label>
      </div>

      <div className="card space-y-2">
        <h2 className="text-nude-warm font-medium">Sistema</h2>
        <p className="text-muted text-xs">No Android, adicione o app na lista "Não otimizar bateria" pra notificações chegarem em tempo.</p>
        <button onClick={() => void wipeAll()} className="w-full bg-red-900/40 border border-red-900 text-red-200 rounded-md py-2 text-sm">
          Apagar TUDO
        </button>
      </div>
    </div>
  );
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function base64ToBlob(b64: string): Promise<Blob> {
  const res = await fetch(`data:application/octet-stream;base64,${b64}`);
  return res.blob();
}
```

- [ ] **Step 2: Rota + link no Today**

Em `main.tsx`:

```tsx
import { Settings } from "./pages/Settings";
// ...
{ path: "configuracoes", element: <Settings /> },
```

Em `Today.tsx`, adicione um link discreto no topo:

```tsx
<div className="flex justify-between items-start">
  <div>
    <p className="text-muted text-xs uppercase tracking-wider">Hoje · {formatDateBR(today)}</p>
    <h1 className="font-serif text-2xl text-nude">Bom dia</h1>
  </div>
  <Link to="/configuracoes" className="text-muted text-xs underline">configurações</Link>
</div>
```

(E adicione `import { Link } from "react-router-dom";` no topo do Today se ainda não estiver.)

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/pages/Settings.tsx src/main.tsx src/pages/Today.tsx
git commit -m "feat(settings): tela de configurações com backup, modo foco, notif"
```

---

## Fase G — WHR chart na aba Corpo

### Task 11: WhrChart + integração na tela Medidas

**Files:**
- Create: `src/components/WhrChart.tsx`
- Modify: `src/pages/body/Measurements.tsx`

- [ ] **Step 1: WhrChart**

`src/components/WhrChart.tsx`:

```tsx
interface DataPoint {
  date: string;
  whr: number;
}

interface Props {
  data: DataPoint[];
  target?: number;
  height?: number;
}

export function WhrChart({ data, target = 0.68, height = 160 }: Props) {
  if (data.length < 2) {
    return (
      <p className="text-muted text-sm text-center py-3">
        Pelo menos 2 medidas pra ver evolução. Alvo: {target.toFixed(2)}.
      </p>
    );
  }

  const w = 320;
  const h = height;
  const padding = 24;
  const max = Math.max(...data.map((d) => d.whr), target + 0.05);
  const min = Math.min(...data.map((d) => d.whr), target - 0.05);
  const range = max - min || 1;
  const stepX = (w - padding * 2) / (data.length - 1);

  const yOf = (whr: number) => padding + (1 - (whr - min) / range) * (h - padding * 2);
  const targetY = yOf(target);

  const points = data.map((d, i) => `${padding + i * stepX},${yOf(d.whr)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" xmlns="http://www.w3.org/2000/svg">
      <line x1={padding} x2={w - padding} y1={targetY} y2={targetY} stroke="#5c1a2b" strokeWidth={1} strokeDasharray="3 3" />
      <text x={w - padding - 60} y={targetY - 4} fontSize={9} fill="#a87a6a">alvo {target.toFixed(2)}</text>
      <polyline points={points} fill="none" stroke="#d4a373" strokeWidth={1.5} strokeLinejoin="round" />
      {data.map((d, i) => {
        const cx = padding + i * stepX;
        const cy = yOf(d.whr);
        return <circle key={i} cx={cx} cy={cy} r={2.5} fill="#f4e4d6" />;
      })}
      <text x={padding} y={padding - 6} fontSize={9} fill="#a87a6a">{max.toFixed(2)}</text>
      <text x={padding} y={h - 6} fontSize={9} fill="#a87a6a">{min.toFixed(2)}</text>
    </svg>
  );
}
```

- [ ] **Step 2: Integração**

Em `src/pages/body/Measurements.tsx`, importa `WhrChart` e `calculateWhr`, então adiciona um card antes do "Histórico":

```tsx
import { WhrChart } from "../../components/WhrChart";
// ...
const chartData = items
  ?.filter((m) => m.waistCm && m.hipCm)
  .map((m) => ({ date: m.date, whr: calculateWhr(m.waistCm!, m.hipCm!) }))
  .reverse() // historicamente cronológico
  ?? [];

// Antes do <h2>Histórico</h2>:
{chartData.length > 0 && (
  <div className="card mb-4">
    <h2 className="text-nude-warm font-medium mb-2">Evolução cintura/quadril</h2>
    <WhrChart data={chartData} />
  </div>
)}
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/components/WhrChart.tsx src/pages/body/Measurements.tsx
git commit -m "feat(corpo): gráfico de WHR com alvo 0,68"
```

---

## Fase H — Smoke test final + checklist

### Task 12: Smoke test do fluxo de treino

**Files:**
- Create: `tests/pages/workout-session.smoke.test.tsx`

- [ ] **Step 1: Test**

`tests/pages/workout-session.smoke.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { SessionDetail } from "../../src/pages/workout/SessionDetail";
import { db } from "../../src/lib/db";
import { seedDatabase } from "../../src/lib/seed";

beforeEach(async () => {
  await seedDatabase();
});

describe("Workout session smoke", () => {
  it("registra uma sessão e ela vai pro DB", async () => {
    render(
      <MemoryRouter initialEntries={["/treino/sessao/seg-gluteo-mobilidade"]}>
        <Routes>
          <Route path="/treino/sessao/:templateId" element={<SessionDetail />} />
          <Route path="/treino" element={<div>treino home</div>} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByText(/Glúteo \+ Mobilidade/)).toBeInTheDocument());
    
    // Encontra o primeiro SessionRecorder (aquecimento), digita uma série, salva
    const weightInputs = screen.getAllByPlaceholderText("kg");
    const repsInputs = screen.getAllByPlaceholderText("reps");
    
    fireEvent.change(weightInputs[0], { target: { value: "0" } });
    fireEvent.change(repsInputs[0], { target: { value: "5" } });
    fireEvent.click(screen.getAllByRole("button", { name: /salvar exercício/i })[0]);
    
    await waitFor(() => expect(screen.getByText(/Aquecimento articular geral ✓/)).toBeInTheDocument());
    
    // Finaliza a sessão
    fireEvent.click(screen.getByRole("button", { name: /finalizar treino/i }));
    
    await waitFor(async () => {
      const sessions = await db.workoutSessions.toArray();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].templateId).toBe("seg-gluteo-mobilidade");
      expect(sessions[0].exercises).toHaveLength(1);
    });
  });
});
```

- [ ] **Step 2: Run + commit**

```bash
npm run test
git add tests/pages/workout-session.smoke.test.tsx
git commit -m "test: smoke test do fluxo de registro de sessão"
```

---

### Task 13: README update + final consolidation

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update Status**

Em README.md, atualize a seção Status:

```markdown
## Status

- **Onda 1 Parte 1:** ✅ Concluída — fundação, libs, aba Corpo (medidas, fotos, comparação, onboarding)
- **Onda 1 Parte 2:** ✅ Concluída — aba Treino (plano semanal, 35 exercícios, registro de sessão, progressão), aba Hoje (dashboard), notificações (pausas, hidratação), configurações (backup, quiet hours, modo foco)
- **Onda 2:** aba Beleza (skincare, hair, estilo), aba Trilha (alimentação)
- **Onda 3:** dança/movimento profundo
- **Onda 4:** trilha completa + polimento
```

- [ ] **Step 2: Final build + test**

```bash
npm run test
npm run build
```

40+ testes passando, build clean.

- [ ] **Step 3: Final commit**

```bash
git add README.md
git commit -m "docs: README — Onda 1 Parte 2 concluída"
git log --oneline | head -25
```

---

## Notas pro engenheiro executor

1. **Catálogo de 35+ exercícios** é grande — o subagent vai gastar tokens só copiando. Vale dividir Task 1 em sub-tasks se necessário.
2. **Dexie compound queries com `equals`**: a Comparison usa `where("[category+tag]").equals([...])`. Outras queries também usam `equals` sem compound — mantenha consistente.
3. **`useLiveQuery` em queries assíncronas complexas**: às vezes precisa `async () => { ... }` em vez de `() => promise`. Já tem precedente em Photos.tsx.
4. **Notificações:** vão funcionar quando o app estiver aberto. Em background dependeria de Service Worker periodic sync (não escopo dessa parte). O cenário real é a usuária deixando o app instalado e aberto no celular durante o dia.
5. **`alert/prompt/confirm`** estão usados nas configurações. Funcionam, mas não são bonitos. Modal customizado pode entrar em refinamento futuro.
6. **Backup:** o blob das fotos vai virar base64 no JSON, que infla o tamanho. Pra usuárias com muitas fotos, exportar pode ficar grande (>10MB). Aceitável pra Onda 1.
