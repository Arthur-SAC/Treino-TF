# Chun-Li macia — Entrega 1 (treino da fase 1, cardápio 2.200, Hoje) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar no celular dela o treino da fase 1 reescrito para a "Chun-Li macia com glúteo destacado", o cardápio a 2.200 kcal com vitalidade na comida, e a creatina e a caminhada de fim de semana no Hoje. Nada aqui depende de medida.

**Architecture:** Duas libs puras novas travam as regras do treino: `volume-muscular.ts` (séries por grupo) e `session-duration.ts` (estimador de duração). Os seeds de exercícios, templates e plano alimentar são reescritos, e cada um sobe a versão para chegar ao IndexedDB do aparelho. A rotina do Hoje ganha dois itens em `today-routine.ts` e um subtítulo derivado em `Today.tsx`.

**Tech Stack:** Vite + React 18 + TypeScript strict (`verbatimModuleSyntax`), Dexie (IndexedDB), Vitest + fake-indexeddb, Tailwind v3.

**Spec:** `docs/superpowers/specs/2026-09-23-chun-li-macia-design.md` (partes 2 e 3, e a 1.2).

## Global Constraints

- Toda copy em pt-br com acentuação correta. Tratar a usuária por "você". Sem emoji em lugar nenhum.
- Nunca escrever "enquanto a TRH não vem", "por enquanto" ou "até lá". Nenhum template pode citar TRH/hormônio (`templates-integridade.test.ts`).
- Toda mudança de seed sobe a versão: `EXERCISE_SEED_VERSION` 10→11, `TEMPLATE_SEED_VERSION` 12→13, `MEAL_PLAN_VERSION` 13→14 (Task 4) →15 (Task 5), `MILESTONE_SEED_VERSION` 7→8. O pino em `tests/lib/seeds-chegam-no-aparelho.test.ts` sobe junto, com um teste de chegada que mira conteúdo novo.
- Equipamento só do prédio: sem Smith, nada na polia baixa além da remada horizontal (`no-low-pulley.test.ts`), nada acima da cabeça (`forca-levantar.test.ts`), nunca `puxada-frente-maquina`.
- A zona 2 continua fora de todo template (`zona2-caminhada.test.ts`, `correcoes-ciclo.test.ts`). A caminhada de 5 km é o cardio.
- Adaptação e variação: toda sessão ≤ 60 min pelo estimador. Entrada: ≤ 40 min (regra existente).
- IDs de template existentes são mantidos, porque o histórico de sessões aponta para eles. Só nomes, propósito e exercícios mudam.
- Guia de vitalidade: não citar citrulina, maca, tribulus, ginseng, arginina nem óxido nítrico (`vitalidade-guide.test.ts`), e não escrever número+unidade de suplemento.
- Commits terminam com `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`. Nada de push até a Task 7.
- Rodar testes com `npx vitest run <arquivo>`. A suíte inteira com `npm test`, o build com `npm run build`.

## Review Focus

1. **Histórico de treino dela:** a sessão já registrada em `seg-gluteo-mobilidade` precisa continuar abrindo depois do bump. Os ids são mantidos, e a Task 3 tem um teste que congela a lista de ids.
2. **Vídeo que ela colou:** depois do bump de exercícios, o `videoUrl` gravado por ela continua lá. O teste de chegada da Task 2 cobre isso.
3. **Reordenação quando a academia enche:** os blocos novos de adaptação e variação precisam ser trechos contíguos, senão `ordenarPorBloco` intercala exercícios. Coberto por teste na Task 3.
4. **Creatina marcada e desmarcada:** uma linha `routineChecks` com `done: false` não pode contar como início, senão o aviso de água some sem ela ter começado. Coberto por teste na Task 6.
5. **Fim de semana com duas caminhadas:** as duas creditam 60 min pelo `control: "walk"`, e o dia fecha a meta de 120 só com as duas. Coberto por teste na Task 6.

---

### Task 1: Libs de volume muscular e de duração de sessão

**Files:**
- Create: `src/lib/volume-muscular.ts`
- Create: `src/lib/session-duration.ts`
- Test: `tests/lib/volume-muscular.test.ts`
- Test: `tests/lib/session-duration.test.ts`

**Interfaces:**
- Produces:
  - `type GrupoMuscular = "gluteo-max" | "gluteo-medio" | "quadriceps" | "adutor" | "posterior" | "peito" | "costas" | "biceps" | "triceps"`
  - `GRUPO_DO_EXERCICIO: Readonly<Record<string, GrupoMuscular>>`
  - `volumeSemanal(templates: readonly Pick<WorkoutTemplate, "exercises">[]): Record<GrupoMuscular, number>`
  - `diasComExercicio(templates: readonly Pick<WorkoutTemplate, "exercises">[], exerciseId: string): number`
  - `segundosDeTrabalho(repsTarget: string): number`
  - `estimarDuracaoMin(t: Pick<WorkoutTemplate, "exercises">): number`

- [ ] **Step 1: Write the failing tests**

`tests/lib/volume-muscular.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { volumeSemanal, diasComExercicio, GRUPO_DO_EXERCICIO } from "../../src/lib/volume-muscular";

const t = (exercises: Array<{ exerciseId: string; sets: number }>) => ({
  exercises: exercises.map((e) => ({ ...e, repsTarget: "10", restSec: 60 })),
});

describe("volume semanal por grupo", () => {
  it("soma as séries do grupo primário de cada exercício na semana", () => {
    const v = volumeSemanal([
      t([{ exerciseId: "hip-thrust-barra", sets: 4 }, { exerciseId: "abdutor-maquina", sets: 3 }]),
      t([{ exerciseId: "abdutor-maquina", sets: 4 }, { exerciseId: "clamshell", sets: 3 }]),
    ]);
    expect(v["gluteo-max"]).toBe(4);
    expect(v["gluteo-medio"]).toBe(10);
  });

  it("exercício sem grupo mapeado (aquecimento, core, mobilidade) não conta", () => {
    const v = volumeSemanal([t([{ exerciseId: "vacuum-abdominal", sets: 3 }, { exerciseId: "cardio-leve-esteira", sets: 1 }])]);
    expect(Object.values(v).reduce((a, b) => a + b, 0)).toBe(0);
  });

  it("todo grupo aparece no resultado, mesmo zerado", () => {
    expect(Object.keys(volumeSemanal([])).sort()).toEqual(
      ["adutor", "biceps", "costas", "gluteo-max", "gluteo-medio", "peito", "posterior", "quadriceps", "triceps"],
    );
  });

  it("conta em quantos dias da semana um exercício aparece", () => {
    const semana = [t([{ exerciseId: "abdutor-maquina", sets: 3 }]), t([{ exerciseId: "clamshell", sets: 3 }]), t([{ exerciseId: "abdutor-maquina", sets: 4 }])];
    expect(diasComExercicio(semana, "abdutor-maquina")).toBe(2);
  });

  it("o leg press de pés altos conta como glúteo, e o de pés no meio como quadríceps", () => {
    expect(GRUPO_DO_EXERCICIO["smith-squat"]).toBe("gluteo-max");
    expect(GRUPO_DO_EXERCICIO["leg-press-pes-medios"]).toBe("quadriceps");
  });
});
```

`tests/lib/session-duration.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { segundosDeTrabalho, estimarDuracaoMin } from "../../src/lib/session-duration";

describe("segundos de trabalho por série", () => {
  it.each([
    ["5min", 300],
    ["15-20min", 1200],
    ["30-45s", 45],
    ["20m", 30],
    ["10-12", 36],
    ["12 (LEVE)", 36],
    ["15-20 (bombeamento)", 60],
    ["12 cada", 72],
    ["6 trocas cada lado", 36],
    ["sem número", 30],
  ])("%s → %i s", (reps, esperado) => {
    expect(segundosDeTrabalho(reps)).toBe(esperado);
  });
});

describe("estimativa da sessão", () => {
  it("soma séries × (trabalho + descanso) + 1 min de troca por exercício", () => {
    const min = estimarDuracaoMin({
      exercises: [
        { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0 },
        { exerciseId: "hip-thrust-barra", sets: 3, repsTarget: "10-12", restSec: 90 },
      ],
    });
    // (300 + 60) + (3 × (36 + 90) + 60) = 360 + 438 = 798 s ≈ 13,3 min
    expect(min).toBe(13);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/lib/volume-muscular.test.ts tests/lib/session-duration.test.ts`
Expected: FAIL. Os módulos ainda não existem.

- [ ] **Step 3: Write the implementation**

`src/lib/volume-muscular.ts`:
```ts
import type { WorkoutTemplate } from "./db";

// Séries semanais por grupo. É a régua da spec Chun-Li macia (2026-09-23):
// o programa antigo ia a 33 séries de glúteo máximo e deixava o glúteo médio
// (a largura do quadril de frente) parado em 12-15, quase tudo na quarta.
// Cada exercício conta para UM grupo, o primário. Composto não "vale em dobro":
// a spec foi escrita em séries diretas, e contar secundário inflaria a régua.
export type GrupoMuscular =
  | "gluteo-max" | "gluteo-medio" | "quadriceps" | "adutor" | "posterior"
  | "peito" | "costas" | "biceps" | "triceps";

const GRUPOS: readonly GrupoMuscular[] = [
  "gluteo-max", "gluteo-medio", "quadriceps", "adutor", "posterior",
  "peito", "costas", "biceps", "triceps",
];

export const GRUPO_DO_EXERCICIO: Readonly<Record<string, GrupoMuscular>> = {
  // glúteo máximo: projeção
  "hip-thrust-barra": "gluteo-max",
  "hip-thrust-unilateral": "gluteo-max",
  "ponte-gluteo-band": "gluteo-max",
  "ponte-gluteo-bola": "gluteo-max",
  "elevacao-pelvica-banco": "gluteo-max",
  "kickback": "gluteo-max",
  "kickback-cabo": "gluteo-max",
  "ativacao-gluteo-band-walks": "gluteo-max", // é coice em 4 apoios, não passada lateral
  "smith-squat": "gluteo-max", // leg press com pés ALTOS
  "kettlebell-swing": "gluteo-max",
  // glúteo médio: largura do quadril
  "abdutor-maquina": "gluteo-medio",
  "abdutor-band-em-pe": "gluteo-medio",
  "abdutor-deitada": "gluteo-medio",
  "abdutor-cabo-em-pe": "gluteo-medio",
  "clamshell": "gluteo-medio",
  // quadríceps
  "leg-press-pes-medios": "quadriceps",
  "cadeira-extensora": "quadriceps",
  "agachamento-goblet": "quadriceps",
  "agachamento-livre": "quadriceps",
  "agachamento-sumo": "quadriceps",
  "agachamento-bulgaro": "quadriceps",
  "step-up-gluteo": "quadriceps",
  // adutor
  "adutora-maquina": "adutor",
  // posterior: flexora por joelho + dobradiças
  "flexora-em-pe": "posterior",
  "stiff": "posterior",
  "stiff-unilateral": "posterior",
  "good-morning": "posterior",
  // peito
  "supino-inclinado-halteres": "peito",
  "cross-over-cabo": "peito",
  "cross-over-baixo": "peito",
  "voador-maquina": "peito",
  // costas
  "remada-baixa-maquina": "costas",
  "remada-unilateral-halter": "costas",
  "remada-curvada": "costas",
  "face-pull-polia": "costas",
  "face-pull": "costas",
  // braço
  "rosca-martelo": "biceps",
  "rosca-barra-w": "biceps",
  "triceps-testa-barra-w": "triceps",
};

type ComExercicios = Pick<WorkoutTemplate, "exercises">;

export function volumeSemanal(templates: readonly ComExercicios[]): Record<GrupoMuscular, number> {
  const total = Object.fromEntries(GRUPOS.map((g) => [g, 0])) as Record<GrupoMuscular, number>;
  for (const t of templates) {
    for (const e of t.exercises) {
      const g = GRUPO_DO_EXERCICIO[e.exerciseId];
      if (g) total[g] += e.sets;
    }
  }
  return total;
}

export function diasComExercicio(templates: readonly ComExercicios[], exerciseId: string): number {
  return templates.filter((t) => t.exercises.some((e) => e.exerciseId === exerciseId)).length;
}
```

`src/lib/session-duration.ts`:
```ts
import type { WorkoutTemplate } from "./db";

// Estimador de duração. Existe porque os `durationMin` eram escritos à mão e
// derivavam (v-qua dizia 54, levava ~30). Não é cronômetro: é uma régua
// estável para travar "≤ 60 min" e o número que a tela anuncia.
// Premissas: 3 s por repetição; "cada" dobra (um lado e depois o outro);
// carregamento em metros ≈ 30 s; 1 min de troca/ajuste por exercício.
const SEG_POR_REP = 3;
const SEG_CARREGAMENTO = 30;
const SEG_TROCA = 60;
const SEG_SEM_NUMERO = 30;

const maior = (m: RegExpMatchArray) => Number(m[2] ?? m[1]);

export function segundosDeTrabalho(repsTarget: string): number {
  const r = repsTarget.toLowerCase();
  const min = r.match(/(\d+)(?:\s*-\s*(\d+))?\s*min/);
  if (min) return maior(min) * 60;
  const seg = r.match(/(\d+)(?:\s*-\s*(\d+))?\s*s\b/);
  if (seg) return maior(seg);
  if (/\d+\s*m\b/.test(r)) return SEG_CARREGAMENTO;
  const reps = r.match(/(\d+)(?:\s*-\s*(\d+))?/);
  if (!reps) return SEG_SEM_NUMERO;
  return maior(reps) * SEG_POR_REP * (/cada/.test(r) ? 2 : 1);
}

export function estimarDuracaoMin(t: Pick<WorkoutTemplate, "exercises">): number {
  const seg = t.exercises.reduce(
    (acc, e) => acc + e.sets * (segundosDeTrabalho(e.repsTarget) + e.restSec) + SEG_TROCA,
    0,
  );
  return Math.round(seg / 60);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/lib/volume-muscular.test.ts tests/lib/session-duration.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/volume-muscular.ts src/lib/session-duration.ts tests/lib/volume-muscular.test.ts tests/lib/session-duration.test.ts
git commit -m "feat(treino): régua de séries por grupo e estimador de duração da sessão

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Nove exercícios novos no catálogo, com categorias Pernas e Braços

**Files:**
- Modify: `src/data/exercises-seed.ts` (acrescentar ao array `EXERCISES` antes do `];` que fecha, e ao `EXERCISE_VIDEOS`)
- Modify: `src/pages/workout/ExerciseLibrary.tsx:11-22` (`CATEGORIES` e `CATEGORY_LABELS`)
- Modify: `src/lib/seed.ts:25` (`EXERCISE_SEED_VERSION = 11`, com uma linha de histórico no comentário junto dele)
- Modify: `tests/lib/seeds-chegam-no-aparelho.test.ts` (pino 10→11 e teste de chegada)
- Test: `tests/data/exercicios-chun-li.test.ts`

**Interfaces:**
- Consumes: `GRUPO_DO_EXERCICIO` (Task 1). Os ids novos já estão mapeados lá.
- Produces: ids `leg-press-pes-medios`, `cadeira-extensora`, `flexora-em-pe`, `rosca-martelo`, `rosca-barra-w`, `triceps-testa-barra-w`, `remada-unilateral-halter`, `farmer-walk`, `extensao-lombar`. Categorias novas `"pernas"` e `"bracos"`.

- [ ] **Step 1: Write the failing test**

`tests/data/exercicios-chun-li.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { EXERCISES, EXERCISE_VIDEOS } from "../../src/data/exercises-seed";
import { CATEGORIES } from "../../src/pages/workout/ExerciseLibrary";
import { GRUPO_DO_EXERCICIO } from "../../src/lib/volume-muscular";

const NOVOS = [
  "leg-press-pes-medios", "cadeira-extensora", "flexora-em-pe", "rosca-martelo", "rosca-barra-w",
  "triceps-testa-barra-w", "remada-unilateral-halter", "farmer-walk", "extensao-lombar",
];
const DISPONIVEL = ["halteres", "barra", "anilhas", "banco", "leg-press", "multiestacao", "bola-suica", "espaldar", "caneleira", "colchonete"];

describe("exercícios da Chun-Li macia", () => {
  it("os nove existem, com descrição, erros comuns, cue de acerto e dicas", () => {
    for (const id of NOVOS) {
      const e = EXERCISES.find((x) => x.id === id);
      expect({ id, ok: !!e && !!e.description && e.commonMistakes.length > 0 && !!e.successCue && (e.proTips ?? []).length >= 2 })
        .toEqual({ id, ok: true });
    }
  });

  it("só usam equipamento da academia do prédio", () => {
    for (const id of NOVOS) {
      const e = EXERCISES.find((x) => x.id === id)!;
      expect({ id, fora: e.equipment.filter((q) => !DISPONIVEL.includes(q)) }).toEqual({ id, fora: [] });
    }
  });

  it("todo exercício com grupo muscular mapeado existe no catálogo", () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    expect(Object.keys(GRUPO_DO_EXERCICIO).filter((id) => !ids.has(id))).toEqual([]);
  });

  it("Pernas e Braços viraram filtros da Biblioteca", () => {
    expect(CATEGORIES).toContain("pernas");
    expect(CATEGORIES).toContain("bracos");
  });

  it("cada novo tem vídeo do YouTube", () => {
    for (const id of NOVOS) expect({ id, url: EXERCISE_VIDEOS[id] ?? null }).not.toEqual({ id, url: null });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/data/exercicios-chun-li.test.ts`
Expected: FAIL. Os ids não existem ainda.

- [ ] **Step 3: Add the categories**

Em `src/pages/workout/ExerciseLibrary.tsx`:
```ts
export const CATEGORIES = ["gluteo", "pernas", "cintura", "costas", "postura", "peitoral", "bracos", "mobilidade", "danca", "aquecimento", "cardio"];
const CATEGORY_LABELS: Record<string, string> = {
  gluteo: "Glúteo",
  pernas: "Pernas",
  cintura: "Cintura",
  costas: "Costas",
  postura: "Postura",
  peitoral: "Peitoral",
  bracos: "Braços",
  mobilidade: "Mobilidade",
  danca: "Dança",
  aquecimento: "Aquecimento",
  cardio: "Cardio",
};
```

- [ ] **Step 4: Add the nine exercises**

Acrescentar ao fim de `EXERCISES`, antes do `];`, com o comentário de seção:
```ts
  // === CHUN-LI MACIA (2026-09-23) — coxa inteira, braço que levanta, costas bonitas ===
  {
    id: "leg-press-pes-medios",
    name: "Leg press 45° (pés no meio — coxa)",
    category: "pernas",
    equipment: ["leg-press"],
    difficulty: "iniciante",
    description: "Na leg press 45°, pés no MEIO da plataforma, na largura do quadril. Desce controlado até ~90° no joelho e empurra pelo pé inteiro, sem travar o joelho no topo. Com os pés no meio quem trabalha é a frente da coxa — é a coxa grossa da Chun-Li.",
    commonMistakes: ["Travar o joelho no topo", "Descer pouco", "Tirar o quadril do encosto na descida"],
    easierVariation: "Carga leve, amplitude só até onde o quadril não sai do encosto",
    harderVariation: "Unilateral, um pé por vez no meio da plataforma",
    exposureLevel: 2,
    startLoadKg: 30,
    successCue: "Fez certo se sentir a frente da coxa queimando — não o joelho nem a lombar.",
    proTips: [
      "Pés no meio = coxa; pés altos (o outro leg press do programa) = glúteo. Mesma máquina, dois músculos",
      "Desce em 2-3 s: a descida controlada constrói tanto quanto a subida",
      "Plataforma pequena? Um pé por vez resolve e ainda corrige diferença entre as pernas",
    ],
  },
  {
    id: "cadeira-extensora",
    name: "Cadeira extensora (multiestação)",
    category: "pernas",
    equipment: ["multiestacao"],
    difficulty: "iniciante",
    description: "Sentada na multiestação, o rolo apoiado na frente do tornozelo. Estende os joelhos até quase esticar, segura 1 s lá em cima e desce devagar, em 2-3 s. Isola a frente da coxa sem carregar a coluna.",
    commonMistakes: ["Jogar o peso com impulso", "Descer rápido", "Tirar o quadril do banco pra ajudar"],
    easierVariation: "Uma perna por vez, carga leve",
    harderVariation: "Pausa de 2 s no topo em toda repetição",
    exposureLevel: 2,
    startLoadKg: 10,
    successCue: "Fez certo se a frente da coxa arder no fim da série, sem dor atrás do joelho.",
    proTips: [
      "Segura 1 s com a perna esticada: é ali que o músculo trabalha mais",
      "Mãos segurando o banco mantêm o quadril parado",
    ],
  },
  {
    id: "flexora-em-pe",
    name: "Flexora em pé (multiestação, uma perna)",
    category: "pernas",
    equipment: ["multiestacao"],
    difficulty: "iniciante",
    description: "Em pé de frente pra multiestação, segurando na estrutura, o rolo atrás do tornozelo de uma perna. Dobra o joelho trazendo o calcanhar em direção ao glúteo, sem mexer a coxa, e desce devagar. Uma perna por vez. Trabalha a parte de trás da coxa perto do joelho, sem encher a dobra embaixo do glúteo.",
    commonMistakes: ["Levar a coxa pra frente junto", "Arquear a lombar pra subir", "Descer soltando o peso"],
    easierVariation: "Flexora deitada de bruços no colchonete com caneleira",
    harderVariation: "Pausa de 1 s com o calcanhar perto do glúteo",
    exposureLevel: 2,
    startLoadKg: 5,
    successCue: "Fez certo se sentir a parte de trás da coxa, perto do joelho — não a lombar.",
    proTips: [
      "Coxa parada: só o joelho dobra",
      "Posterior pela flexora, e não por stiff pesado, é o que mantém a dobra do glúteo nítida",
    ],
  },
  {
    id: "rosca-martelo",
    name: "Rosca martelo com halteres",
    category: "bracos",
    equipment: ["halteres"],
    difficulty: "iniciante",
    description: "Em pé, halteres ao lado do corpo com as palmas viradas uma pra outra. Dobra os cotovelos subindo os halteres até a altura do ombro, sem balançar o tronco, e desce devagar. Braço e pegada: a força de segurar alguém no colo.",
    commonMistakes: ["Balançar o tronco pra subir", "Afastar o cotovelo do corpo", "Descer soltando"],
    easierVariation: "Alternada, um braço por vez",
    harderVariation: "Pausa de 1 s no topo",
    exposureLevel: 1,
    startLoadKg: 5,
    successCue: "Fez certo se o braço e o antebraço cansarem juntos, sem a lombar reclamar.",
    proTips: [
      "Cotovelo colado na lateral do corpo o tempo todo",
      "A pegada neutra (palmas frente a frente) fortalece o antebraço — é a pegada de segurar pessoa",
    ],
  },
  {
    id: "rosca-barra-w",
    name: "Rosca com barra W",
    category: "bracos",
    equipment: ["barra", "anilhas"],
    difficulty: "iniciante",
    description: "Em pé, barra W segura na parte inclinada, braços esticados à frente das coxas. Dobra os cotovelos trazendo a barra até a altura do peito e desce em 2-3 s. A barra W poupa o punho.",
    commonMistakes: ["Jogar o quadril pra frente", "Cotovelos indo pra frente", "Descer rápido"],
    easierVariation: "Só a barra, sem anilha",
    harderVariation: "Descida em 4 s",
    exposureLevel: 2,
    startLoadKg: 10,
    successCue: "Fez certo se só o bíceps trabalhar — tronco parado do começo ao fim.",
    proTips: [
      "Encosta as costas numa parede se o tronco quiser balançar",
      "Contorno de braço leve vem de repetições bem feitas, não de carga máxima",
    ],
  },
  {
    id: "triceps-testa-barra-w",
    name: "Tríceps testa com barra W",
    category: "bracos",
    equipment: ["barra", "banco"],
    difficulty: "iniciante",
    description: "Deitada no banco, barra W segura com os braços esticados sobre o peito. Dobra só os cotovelos, levando a barra em direção à testa, e estende de volta. Cotovelos apontados pro teto, sem abrir. Firma a parte de trás do braço.",
    commonMistakes: ["Abrir os cotovelos", "Mexer o ombro junto", "Carga pesada demais"],
    easierVariation: "Com um halter só, segurado com as duas mãos",
    harderVariation: "Pausa de 1 s com a barra perto da testa",
    exposureLevel: 2,
    startLoadKg: 8,
    successCue: "Fez certo se sentir a parte de trás do braço, não o cotovelo.",
    proTips: [
      "Braço parado da altura do ombro até o cotovelo: só o antebraço se mexe",
      "Carga leve e controle: é braço firme, não braço grande",
    ],
  },
  {
    id: "remada-unilateral-halter",
    name: "Remada unilateral com halter (serrote)",
    category: "costas",
    equipment: ["halteres", "banco"],
    difficulty: "iniciante",
    description: "Um joelho e uma mão apoiados no banco, costas retas. Puxa o halter em direção ao quadril, cotovelo rente ao corpo, e desce devagar. Constrói o meio das costas sem alargar: a puxada vai pro quadril, não pra fora.",
    commonMistakes: ["Girar o tronco pra subir", "Puxar em direção ao ombro", "Arredondar as costas"],
    easierVariation: "Halter leve, pausa de 1 s em cima",
    harderVariation: "Descida em 3 s",
    exposureLevel: 2,
    startLoadKg: 8,
    successCue: "Fez certo se sentir o meio das costas, entre a escápula e a coluna.",
    proTips: [
      "Pensa em levar o cotovelo ao bolso de trás",
      "Escápula pra trás e pra baixo no topo: é a costas bonita da spec, não a costas larga",
    ],
  },
  {
    id: "farmer-walk",
    name: "Farmer walk (caminhada com halteres)",
    category: "cintura",
    equipment: ["halteres"],
    difficulty: "iniciante",
    description: "Um halter pesado em cada mão, braços esticados ao lado do corpo, ombros pra trás e pra baixo. Caminha 20-30 m em passos curtos, tronco ereto, sem deixar o corpo tombar pra um lado. Pegada, core e postura de uma vez: a base de carregar alguém.",
    commonMistakes: ["Encolher os ombros", "Inclinar o tronco", "Passos longos e apressados"],
    easierVariation: "Halteres mais leves, 15 m",
    harderVariation: "Um halter só, de um lado (o core segura o tronco reto)",
    exposureLevel: 3,
    startLoadKg: 10,
    successCue: "Fez certo se a pegada e o abdômen cansarem, e o ombro não subir em direção à orelha.",
    proTips: [
      "Ombro longe da orelha o percurso inteiro",
      "Se a pegada falhar antes das pernas, está no peso certo",
    ],
  },
  {
    id: "extensao-lombar",
    name: "Extensão lombar na bola",
    category: "postura",
    equipment: ["bola-suica", "espaldar"],
    difficulty: "iniciante",
    description: "De barriga pra baixo sobre a bola suíça, pés apoiados no espaldar. Sobe o tronco até alinhar com as pernas, sem passar disso, e desce devagar. Desenha o sulco da lombar e protege a coluna.",
    commonMistakes: ["Subir além da linha do corpo", "Fazer com impulso", "Pescoço jogado pra trás"],
    easierVariation: "Amplitude menor, mãos no peito",
    harderVariation: "Mãos atrás da cabeça, pausa de 2 s em cima",
    exposureLevel: 2,
    successCue: "Fez certo se sentir os músculos ao lado da coluna, sem pontada.",
    proTips: [
      "Olhar pro chão mantém o pescoço alinhado",
      "Para na linha do corpo: passar dela é carga na coluna, não ganho",
    ],
  },
```

- [ ] **Step 5: Find and add the videos**

Para cada um dos nove ids, buscar com WebSearch um vídeo do YouTube em pt-BR ("<nome do exercício> como fazer"). Confirmar com WebFetch que o título da página bate com o exercício. Acrescentar a `EXERCISE_VIDEOS` no formato `"id": "https://www.youtube.com/watch?v=..."`. Um link que não abre ou não bate com o exercício não entra: busca outro. **Nunca inventar um id de vídeo.**

- [ ] **Step 6: Bump the version and write the arrival test**

Em `src/lib/seed.ts`: `export const EXERCISE_SEED_VERSION = 11;` e, no comentário de histórico junto dela, `// v11: nove exercícios da Chun-Li macia (coxa, braço, costas médias) e as categorias Pernas e Braços.`

Em `tests/lib/seeds-chegam-no-aparelho.test.ts`: trocar `expect(EXERCISE_SEED_VERSION).toBe(10);` por `toBe(11)` e acrescentar no `describe("exercícios", ...)`:
```ts
  it("os exercícios da Chun-Li macia chegam em quem estava na versão anterior, sem apagar o vídeo dela", async () => {
    await db.exercises.put({
      id: "hip-thrust-barra", name: "Hip thrust", category: "gluteo", equipment: ["barra"],
      difficulty: "intermediario", description: "antigo", commonMistakes: [], exposureLevel: 4,
      videoUrl: "https://exemplo/video-dela",
    } as never);
    await db.settings.put({ key: "seeded", value: true });
    await db.settings.put({ key: "cyclesSeeded", value: true });
    await db.settings.put({ key: "exerciseSeedVersion", value: ANTERIOR_EXERCICIOS });

    await seedDatabase();

    expect(await db.exercises.get("cadeira-extensora")).toBeDefined();
    expect((await db.exercises.get("rosca-martelo"))?.category).toBe("bracos");
    expect((await db.exercises.get("hip-thrust-barra"))?.videoUrl).toBe("https://exemplo/video-dela");
  });
```

- [ ] **Step 7: Run the tests**

Run: `npx vitest run tests/data/exercicios-chun-li.test.ts tests/lib/seeds-chegam-no-aparelho.test.ts tests/data/exercise-videos.test.ts tests/data/exercise-category-taxonomy.test.ts tests/data/forca-levantar.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/data/exercises-seed.ts src/pages/workout/ExerciseLibrary.tsx src/lib/seed.ts tests/data/exercicios-chun-li.test.ts tests/lib/seeds-chegam-no-aparelho.test.ts
git commit -m "feat(treino): coxa inteira, braço que levanta e costas médias entram no catálogo

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Templates da fase 1 reescritos (adaptação e variação), Entrada com braço e peito, manutenção com abdutora

**Files:**
- Modify: `src/data/workout-plan-seed.ts` (substituir o array `WORKOUT_PLAN` inteiro e o comentário de topo)
- Modify: `src/data/cycles-seed.ts` (substituir os 5 templates `v-*`; em `m-seg-gluteo` e `m-qui-gluteo`, acrescentar abdutora)
- Modify: `src/data/entrada-seed.ts` (`e1-ter`, `e2-ter`, `e3-ter`: +2 exercícios e `durationMin`)
- Modify: `src/lib/seed.ts:35` (`TEMPLATE_SEED_VERSION = 13` com linha de histórico)
- Modify: `tests/data/trocas-forca.test.ts` (tirar da tabela `ANTES` os ids de adaptação e variação; `m-seg-gluteo` → `{ ex: 7, min: 37 }`, `m-qui-gluteo` → `{ ex: 6, min: 32 }`)
- Modify: `tests/data/zona2-caminhada.test.ts` (tirar de `NOVA_DURACAO` os ids de adaptação e variação e trocar `m-seg-gluteo: 37`, `m-qui-gluteo: 32`; tirar de `NAO_AFETADOS` os ids de adaptação e variação e trocar `e1-ter: 33`, `e2-ter: 35`, `e3-ter: 35`; trocar `toHaveLength(27)` pelo novo tamanho)
- Modify: `tests/lib/seeds-chegam-no-aparelho.test.ts` (pino 12→13 e chegada)
- Test: `tests/data/fase1-chun-li.test.ts`

**Interfaces:**
- Consumes: `volumeSemanal`, `diasComExercicio`, `estimarDuracaoMin` (Task 1) e os ids da Task 2.
- Produces: os templates que o Hoje abre.

- [ ] **Step 1: Write the failing test**

`tests/data/fase1-chun-li.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { EXERCISES } from "../../src/data/exercises-seed";
import { volumeSemanal, diasComExercicio, type GrupoMuscular } from "../../src/lib/volume-muscular";
import { estimarDuracaoMin } from "../../src/lib/session-duration";

const ADAPTACAO = WORKOUT_PLAN;
const VARIACAO = CYCLE_TEMPLATES.filter((t) => t.cycle === "variacao");
const MANUTENCAO = CYCLE_TEMPLATES.filter((t) => t.cycle === "manutencao");
const FASE1 = [...ADAPTACAO, ...VARIACAO];

const FAIXA_VARIACAO: Record<GrupoMuscular, [number, number]> = {
  "gluteo-max": [18, 22], "gluteo-medio": [15, 21], quadriceps: [12, 16], adutor: [6, 6],
  posterior: [6, 8], peito: [9, 12], costas: [9, 12], biceps: [6, 6], triceps: [6, 6],
};

describe("fase 1 — Chun-Li macia", () => {
  it("a variação (topo da fase 1) fica dentro das faixas da spec em todo grupo", () => {
    const v = volumeSemanal(VARIACAO);
    const fora = (Object.keys(FAIXA_VARIACAO) as GrupoMuscular[])
      .filter((g) => v[g] < FAIXA_VARIACAO[g][0] || v[g] > FAIXA_VARIACAO[g][1])
      .map((g) => `${g}: ${v[g]} (faixa ${FAIXA_VARIACAO[g].join("-")})`);
    expect(fora).toEqual([]);
  });

  it("a adaptação sobe até a variação — nunca passa dela em grupo nenhum", () => {
    const a = volumeSemanal(ADAPTACAO);
    const v = volumeSemanal(VARIACAO);
    const passam = (Object.keys(a) as GrupoMuscular[]).filter((g) => a[g] > v[g]);
    expect(passam).toEqual([]);
  });

  it("a abdutora de máquina aparece em 3 dias da semana, na adaptação e na variação", () => {
    expect(diasComExercicio(ADAPTACAO, "abdutor-maquina")).toBe(3);
    expect(diasComExercicio(VARIACAO, "abdutor-maquina")).toBe(3);
  });

  it("toda sessão da fase 1 cabe em 60 min, e o número anunciado bate com o estimador", () => {
    const erradas = FASE1
      .map((t) => ({ id: t.id, anunciado: t.durationMin, estimado: estimarDuracaoMin(t) }))
      .filter((r) => r.anunciado > 60 || r.anunciado !== r.estimado);
    expect(erradas).toEqual([]);
  });

  it("toda sessão da fase 1 declara blocos contíguos — a reordenação depende disso", () => {
    for (const t of FASE1) {
      expect({ id: t.id, semBloco: t.exercises.filter((e) => !e.block).length }).toEqual({ id: t.id, semBloco: 0 });
      const seq = t.exercises.map((e) => e.block).filter((b, i, arr) => b !== arr[i - 1]);
      expect({ id: t.id, contiguo: seq.length === new Set(seq).size }).toEqual({ id: t.id, contiguo: true });
    }
  });

  it("os ids dos templates de adaptação e variação são os de sempre — o histórico dela aponta pra eles", () => {
    expect(ADAPTACAO.map((t) => t.id)).toEqual([
      "seg-gluteo-mobilidade", "ter-cintura-costas", "qua-mobilidade-danca", "qui-gluteo-coxa", "sex-peitoral-postura",
    ]);
    expect(VARIACAO.map((t) => t.id)).toEqual([
      "v-seg-gluteo-unilateral", "v-ter-cintura-costas", "v-qua-mobilidade-danca", "v-qui-gluteo-stiff", "v-sex-peitoral-postura",
    ]);
  });

  it("nenhum template usa exercício que masculiniza o tronco", () => {
    const nome = new Map(EXERCISES.map((e) => [e.id, e.name.toLowerCase()]));
    const PROIBIDO = /desenvolvimento|eleva[çc][ãa]o lateral|encolhimento|supino reto|declinado|obl[íi]quo com carga/;
    const achados = ALL_TEMPLATES.flatMap((t) =>
      t.exercises
        .filter((e) => e.exerciseId === "puxada-frente-maquina" || PROIBIDO.test(nome.get(e.exerciseId) ?? ""))
        .map((e) => `${t.id}: ${e.exerciseId}`),
    );
    expect(achados).toEqual([]);
  });

  it("o rebolado saiu da quarta — fica no sábado e na progressão de vitalidade", () => {
    const quartas = FASE1.filter((t) => t.dayOfWeek === 3);
    expect(quartas.flatMap((t) => t.exercises.map((e) => e.exerciseId))).not.toContain("rebolado-basico");
  });

  it("a manutenção nunca deixa o glúteo médio abaixo de 12, e com máquina", () => {
    expect(volumeSemanal(MANUTENCAO)["gluteo-medio"]).toBeGreaterThanOrEqual(12);
    expect(diasComExercicio(MANUTENCAO, "abdutor-maquina")).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/data/fase1-chun-li.test.ts`
Expected: FAIL (faixas, abdutora em 3 dias, blocos, duração).

- [ ] **Step 3: Replace `WORKOUT_PLAN` (adaptação)**

Novo comentário de topo e array em `src/data/workout-plan-seed.ts`:
```ts
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
      { exerciseId: "flexora-em-pe", sets: 2, repsTarget: "12 cada", restSec: 45, block: "maquina" },
      { exerciseId: "hip-thrust-barra", sets: 3, repsTarget: "15", restSec: 60, block: "maquina", notes: "Carga média, reps altas, pausa de 1 s no topo" },
      { exerciseId: "stiff", sets: 3, repsTarget: "12", restSec: 75, block: "solo", notes: "Dobradiça: amplitude só até onde o posterior deixa, lombar neutra" },
      { exerciseId: "kickback", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo", notes: "Pico do glúteo — controla a volta" },
    ],
  },
];
```

- [ ] **Step 4: Replace the five `v-*` templates (variação)**

Em `src/data/cycles-seed.ts`, substituir cada template `v-*` inteiro (mantendo id e `cycle: "variacao"`) por:
```ts
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
    durationMin: 52,
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
    durationMin: 56,
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
```

Os `durationMin` acima vêm do estimador. Se o teste acusar diferença de 1 min por arredondamento, **corrija o `durationMin`**, nunca o estimador.

- [ ] **Step 5: Manutenção — abdutora de máquina**

Em `m-seg-gluteo`, logo depois de `aquecimento-articular`, e também em `m-qui-gluteo`:
```ts
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15-20", restSec: 45, notes: "Glúteo médio não cai abaixo de 12 séries nem na manutenção" },
```
Depois: `m-seg-gluteo` → `durationMin: 37`, `m-qui-gluteo` → `durationMin: 32`. Esses templates continuam sem `block`, como todos da fase 2.

- [ ] **Step 6: Entrada — braço e peito leves na terça**

Em `e1-ter`, `e2-ter` e `e3-ter` (`src/data/entrada-seed.ts`), acrescentar no **fim** do trecho `solo`, depois do último exercício solo existente e antes de qualquer `final`:
```ts
      { exerciseId: "cross-over-cabo", sets: 2, repsTarget: "12", restSec: 60, block: "solo", notes: "Crucifixo inclinado bem leve — peito de cima" },
      { exerciseId: "rosca-martelo", sets: 2, repsTarget: "12", restSec: 60, block: "solo" },
```
`durationMin`: `e1-ter` 25→33, `e2-ter` 27→35, `e3-ter` 27→35. Os dois exercícios têm `exposureLevel` ≤ 2 e cabem no teto da semana 1.

- [ ] **Step 7: Update the frozen-value tests**

- `tests/data/trocas-forca.test.ts`: tirar de `ANTES` as 10 linhas de adaptação e variação. Trocar `"m-seg-gluteo": { ex: 7, min: 37 }` e `"m-qui-gluteo": { ex: 6, min: 32 }`. Acrescentar acima da tabela: `// Adaptação e variação saíram desta tabela em 2026-09-23 (Chun-Li macia): a regra delas passou a ser ≤ 60 min pelo estimador — tests/data/fase1-chun-li.test.ts.`
- `tests/data/zona2-caminhada.test.ts`: tirar de `NOVA_DURACAO` os ids de adaptação e variação. Trocar `m-seg-gluteo: 37` e `m-qui-gluteo: 32`, e atualizar o `toHaveLength` para a nova contagem. Em `NAO_AFETADOS`, tirar os ids de adaptação e variação e trocar `e1-ter: 33`, `e2-ter: 35`, `e3-ter: 35`.

- [ ] **Step 8: Bump the template version with an arrival test**

`src/lib/seed.ts`: `export const TEMPLATE_SEED_VERSION = 13;` com `// v13: fase 1 reescrita para a Chun-Li macia (3 inferiores + 2 superiores, abdutora 3x, braço e peito de cima).`

Em `tests/lib/seeds-chegam-no-aparelho.test.ts`, trocar o pino para `toBe(13)` e acrescentar no bloco de templates, no mesmo estilo dos testes vizinhos (plantar `templateSeedVersion = ANTERIOR_TEMPLATES` e um template antigo com id `seg-gluteo-mobilidade`):
```ts
    const seg = await db.templates.get("seg-gluteo-mobilidade");
    expect(seg?.exercises.map((e) => e.exerciseId)).toContain("leg-press-pes-medios");
```
Usar o nome real da tabela de templates em `db.ts`, o mesmo que os testes vizinhos já usam.

- [ ] **Step 9: Run the whole suite**

Run: `npm test`
Expected: PASS. Se um teste antigo quebrar porque cobrava um exercício que saiu da quarta ou da adaptação (ex.: `rebolado-basico` no template, `step-up-gluteo` na adaptação), ler a razão escrita nele. Se a razão foi substituída por esta spec, atualizar o teste com um comentário citando a spec. Se não foi, parar e reportar.

- [ ] **Step 10: Commit**

```bash
git add src/data/workout-plan-seed.ts src/data/cycles-seed.ts src/data/entrada-seed.ts src/lib/seed.ts tests/
git commit -m "feat(treino): a fase 1 vira Chun-Li macia — coxa inteira, glúteo médio 3x, braço e peito de cima

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Consumo real e cardápio a 2.200

**Files:**
- Modify: `src/lib/objetivo.ts:129-157` (`CONSUMO`)
- Modify: `src/data/meal-plan-seed.ts` (lanche e jantar do déficit, `INITIAL_PLAN`, `MAINTENANCE_BOOST`, `SURPLUS_BOOST`, planos de fase, comentários com 2300/3000/3300)
- Modify: `src/lib/comer-fora.ts:10` (comentário "2.300" → "2.200")
- Modify: `src/data/milestones-seed.ts:56` (interpolar a meta)
- Modify: `src/lib/path-seed.ts` (`MEAL_PLAN_VERSION = 14`, `MILESTONE_SEED_VERSION = 8`, bloco `if (msVersion < 8) await regravaMarcosV7();`)
- Modify: `tests/data/meal-plan-seed.test.ts`, `tests/lib/path-seed.test.ts`, `tests/pages/meal-plan-view.smoke.test.tsx`, `tests/data/milestones-objetivo.test.ts`, `tests/lib/seeds-chegam-no-aparelho.test.ts`

**Interfaces:**
- Produces: `CONSUMO.metaKcal === 2200`, `gastoEstimadoKcalMin === 2600`, `gastoEstimadoKcalMax === 2800`. Planos com `kcalDaily` 2200, 2750 e 2950.

- [ ] **Step 1: Point the tests at the new numbers (they fail)**

- `tests/data/meal-plan-seed.test.ts`: `toBe(2300)` → `toBe(2200)`; a faixa da variante 0 `2185..2415` → `2090..2310`.
- `tests/lib/path-seed.test.ts:32`: `toBe(2300)` → `toBe(2200)`.
- `tests/pages/meal-plan-view.smoke.test.tsx:16`: `"2300"` → `"2200"`.
- `tests/data/milestones-objetivo.test.ts`: substituir o teste das calorias por:
```ts
  it("as calorias citadas são as da meta atual de objetivo.ts — nunca um número solto", () => {
    expect(texto).toContain(CONSUMO.metaKcal.toLocaleString("pt-BR"));
    expect(texto).not.toMatch(/2\.300/);
  });
```
(importar `CONSUMO` de `../../src/lib/objetivo`).
- `tests/lib/seeds-chegam-no-aparelho.test.ts`: `MEAL_PLAN_VERSION` → `toBe(14)`, e acrescentar um teste de chegada que planta `mealPlanVersion = ANTERIOR_PLANO_ALIMENTAR` com um plano `goal: "deficit"` de `kcalDaily: 2300`, roda `seedPath()` e cobra `kcalDaily === 2200`, seguindo o formato dos testes de plano vizinhos.

Run: `npx vitest run tests/data/meal-plan-seed.test.ts tests/data/milestones-objetivo.test.ts`
Expected: FAIL.

- [ ] **Step 2: CONSUMO**

```ts
export const CONSUMO = {
  /** Mifflin-St Jeor (trabalho sentada) + caminhada de 5 km de segunda a
   *  domingo + treino de força 5x + cães com NEAT baixo (mais parado que
   *  andando). Recalibrado em 2026-09-23: o valor anterior (2.900-3.100)
   *  supunha os 5 km todo dia útil desde maio, e ela contou que andava "de vez
   *  em quando". */
  gastoEstimadoKcalMin: 2600,
  gastoEstimadoKcalMax: 2800,
  /** 2.200, escolhida por ela contra 2.000: déficit acima de ~750 derruba
   *  testosterona, e firmeza, libido e força são metade dos objetivos. */
  metaKcal: 2200,
```
(`proteinaGMin`, `proteinaGMax` e `discricionariaKcal` não mudam; comentários mantidos).

- [ ] **Step 3: Déficit — lanche 450, jantar 650**

Em `SLOTS` de `src/data/meal-plan-seed.ts`:
- `lanche.targetKcal: 500` → `450`. `jantar.targetKcal: 700` → `650`.
- `lanche-1`: trocar o food "Banana grande" por `{ name: "Banana média", qtyG: 120, kcal: 100, proteinG: 1, carbG: 24, fatG: 0, preparation: "Ao natural, picada por cima do iogurte ou à parte." }` (fica 438 kcal / 38 g de proteína).
- `lanche-2`: "Pão de forma (3 fatias)" → `{ name: "Pão de forma (2 fatias)", qtyG: 50, kcal: 130, proteinG: 4, carbG: 24, fatG: 2, ... }`, com o ingrediente `qty: 2`. Fica 423 kcal / 39 g.
- `lanche-3`: cuscuz → `{ name: "Cuscuz de milho (100g cozido, sem manteiga)", qtyG: 100, kcal: 153, proteinG: 4, carbG: 32, fatG: 1, preparation: "Hidrata 34g de flocão ..." }` (o resto do texto igual), ingrediente flocão `qty: 34`. Fica 441 kcal / 36 g.
- `jantar-1`: macaxeira → `{ name: "Macaxeira cozida (140g)", qtyG: 140, kcal: 175, proteinG: 2, carbG: 42, fatG: 0, ... }`, ingrediente `qty: 140`. Fica 660 kcal / 66 g.
- `jantar-2`: cuscuz → `{ name: "Cuscuz de milho (sem manteiga, 50g cozido)", qtyG: 50, kcal: 77, proteinG: 2, carbG: 16, fatG: 1, ... }`, flocão `qty: 17`. Fica 653 kcal / 52 g.
- `jantar-3`: arroz → `{ name: "Arroz cozido (85g)", qtyG: 85, kcal: 110, proteinG: 2, carbG: 24, fatG: 0, ... }`, arroz `qty: 45`. Fica 656 kcal / 55 g.
- Comentários que dizem "2300kcal" viram "2200 kcal".

`INITIAL_PLAN`: `name: "Plano padrão · emagrecimento (2200 kcal)"`, `kcalDaily: 2200`, `proteinG: 211`, `carbG: 207`, `fatG: 57` (variante 0: café-1 + almoço-1 + lanche-1 + jantar-1 = 2218 kcal).

- [ ] **Step 4: Planos da fase 2 — 2.750 e 2.950**

`MAINTENANCE_BOOST` (+550):
```ts
const MAINTENANCE_BOOST: Partial<Record<MealSlot["mealType"], Boost>> = {
  cafe: {
    foods: [{ name: "Castanha de caju da fase (27g, um punhado cheio)", qtyG: 27, kcal: 150, proteinG: 5, carbG: 8, fatG: 12, preparation: "Ao natural, junto do café — sem preparo." }],
    ingredients: [{ item: "Castanha de caju", qty: 27, unit: "g", category: "mercearia" }],
  },
  almoco: {
    foods: [{ name: "Arroz & feijão de corda extra da fase (+65g arroz, +65g feijão)", qtyG: 130, kcal: 150, proteinG: 6, carbG: 28, fatG: 1, preparation: "Porção maior dos dois — os dois já saem prontos do lote de domingo." }],
    ingredients: [
      { item: "Arroz", qty: 35, unit: "g", category: "carboidrato" },
      { item: "Feijão de corda (macassar)", qty: 33, unit: "g", category: "carboidrato" },
    ],
  },
  lanche: {
    foods: [{ name: "Macaxeira cozida do lote (80g)", qtyG: 80, kcal: 100, proteinG: 1, carbG: 24, fatG: 0, preparation: "Cozida no domingo, comida fria mesmo — ou 40s no micro-ondas do trabalho." }],
    ingredients: [{ item: "Macaxeira (aipim)", qty: 80, unit: "g", category: "carboidrato" }],
  },
  jantar: {
    foods: [{ name: "Arroz extra da fase (+38g cozido) & azeite (1 cs)", qtyG: 50, kcal: 150, proteinG: 1, carbG: 11, fatG: 11, preparation: "Um pouco mais de arroz e um fio generoso de azeite por cima do prato." }],
    ingredients: [
      { item: "Arroz", qty: 20, unit: "g", category: "carboidrato" },
      { item: "Azeite", qty: 12, unit: "ml", category: "gordura" },
    ],
  },
};
```
`SURPLUS_BOOST` (+750):
```ts
const SURPLUS_BOOST: Partial<Record<MealSlot["mealType"], Boost>> = {
  cafe: {
    foods: [
      { name: "Whey extra da fase (30 g de pó)", qtyG: 30, kcal: 120, proteinG: 24, carbG: 3, fatG: 1, preparation: "Bate junto na vitamina ou dissolve no leite/água." },
      { name: "Castanha de caju da fase (20g)", qtyG: 20, kcal: 110, proteinG: 4, carbG: 6, fatG: 9, preparation: "Ao natural, junto do café." },
    ],
    ingredients: [
      { item: "Whey protein", qty: 30, unit: "g", category: "laticinio" },
      { item: "Castanha de caju", qty: 20, unit: "g", category: "mercearia" },
    ],
  },
  almoco: {
    foods: [{ name: "Arroz & feijão de corda extra da fase (+90g arroz, +100g feijão)", qtyG: 190, kcal: 200, proteinG: 9, carbG: 39, fatG: 1, preparation: "Porção maior dos dois pra sustentar o ganho de glúteo e coxa." }],
    ingredients: [
      { item: "Arroz", qty: 48, unit: "g", category: "carboidrato" },
      { item: "Feijão de corda (macassar)", qty: 50, unit: "g", category: "carboidrato" },
    ],
  },
  lanche: {
    foods: [{ name: "Macaxeira cozida do lote (120g)", qtyG: 120, kcal: 150, proteinG: 1, carbG: 36, fatG: 0, preparation: "Cozida no domingo, comida fria — ou 40s no micro-ondas do trabalho." }],
    ingredients: [{ item: "Macaxeira (aipim)", qty: 120, unit: "g", category: "carboidrato" }],
  },
  jantar: {
    foods: [{ name: "Batata doce extra da fase (80g) & azeite (1 cs)", qtyG: 92, kcal: 170, proteinG: 1, carbG: 16, fatG: 11, preparation: "Cozida ou no vapor, junto com o jantar, com um fio generoso de azeite." }],
    ingredients: [
      { item: "Batata doce", qty: 80, unit: "g", category: "carboidrato" },
      { item: "Azeite", qty: 12, unit: "ml", category: "gordura" },
    ],
  },
};
```
Planos: `MAINTENANCE_PLAN` → `name: "Plano · manutenção (2750 kcal)"`, `kcalDaily: 2750`. `SURPLUS_PLAN` → `name: "Plano · superávit leve (2950 kcal)"`, `kcalDaily: 2950`. Os `proteinG/carbG/fatG` de cada um vêm da soma da variante 0 de cada slot. Calcular com um `vitest` descartável que imprime as somas (apagar o arquivo depois) e gravar os valores arredondados. Reescrever os comentários acima dos boosts com o raciocínio novo: manutenção dentro de 5% do gasto médio de 2.700, superávit acima do teto de 2.800.

- [ ] **Step 5: Milestone and comment**

`src/data/milestones-seed.ts:56`: trocar `"2.300 kcal, ..."` por um template string que começa com `${CONSUMO.metaKcal.toLocaleString("pt-BR")} kcal, ...` (importar `CONSUMO`). `src/lib/comer-fora.ts:10`: "2.300" → "2.200". `src/lib/path-seed.ts`: `MEAL_PLAN_VERSION = 14` com a linha `// v14: déficit a 2.200 (gasto real 2.600-2.800), manutenção 2.750, superávit 2.950.`; `MILESTONE_SEED_VERSION = 8`; dentro da migração de marcos, depois do bloco `< 7`:
```ts
      if (msVersion < 8) {
        // A meta caiu para 2.200 (spec Chun-Li macia): o marco que cita as
        // calorias tem que dizer o mesmo número que o plano.
        await regravaMarcosV7();
      }
```
Conferir em `tests/lib/path-seed-marcos-v7.test.ts` que `regravaMarcosV7` é idempotente, o que o teste "rodar a migração duas vezes" já garante.

- [ ] **Step 6: Run the whole suite**

Run: `npm test`
Expected: PASS. Os testes de coerência (`meal-plan-coerencia`, `proteina-por-refeicao`, `variantes-proximas-do-alvo`, `comer-fora`) derivam de `CONSUMO` e do seed, e têm que passar sem edição. Se algum cobrar número à mão, trocar pela derivação e registrar no commit.

- [ ] **Step 7: Commit**

```bash
git add src/lib/objetivo.ts src/data/meal-plan-seed.ts src/lib/comer-fora.ts src/data/milestones-seed.ts src/lib/path-seed.ts tests/
git commit -m "feat(comida): meta a 2.200 contra o gasto real, e as fases recalibradas

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Vitalidade na comida — whey em gramas, castanha-do-pará, melancia, texto honesto

**Files:**
- Modify: `src/data/meal-plan-seed.ts` (whey em gramas, `cafe-4`, `lanche-3`)
- Modify: `src/data/vitalidade-guide-seed.ts` (seção `comida` e correção do zinco)
- Modify: `src/lib/path-seed.ts` (`MEAL_PLAN_VERSION = 15`)
- Modify: `tests/lib/seeds-chegam-no-aparelho.test.ts` (pino 14→15)
- Test: `tests/data/vitalidade-comida.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/data/vitalidade-comida.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";
import { VITALIDADE_GUIA } from "../../src/data/vitalidade-guide-seed";

const todasAsComidas = ALL_MEAL_PLANS.flatMap((p) => p.slots.flatMap((s) => s.variants.flatMap((v) => v.foods)));

describe("vitalidade no prato", () => {
  it("whey aparece em gramas de pó, nunca em 'scoop' — o scoop muda de marca pra marca", () => {
    const comScoop = todasAsComidas.filter((f) => /scoop/i.test(f.name) || /scoop/i.test(f.preparation ?? "")).map((f) => f.name);
    expect(comScoop).toEqual([]);
  });

  it("castanha-do-pará: no máximo 2 unidades por dia em qualquer combinação do cardápio", () => {
    for (const p of ALL_MEAL_PLANS) {
      const porSlot = p.slots.map((s) =>
        Math.max(0, ...s.variants.map((v) =>
          v.ingredients.filter((i) => /castanha-do-par[áa]/i.test(i.item)).reduce((a, i) => a + (i.unit === "un" ? i.qty : 99), 0),
        )),
      );
      expect({ plano: p.name, maxDia: porSlot.reduce((a, b) => a + b, 0) }).toEqual({ plano: p.name, maxDia: 2 });
    }
  });

  it("melancia entra em algum lanche", () => {
    const lanches = ALL_MEAL_PLANS[0].slots.find((s) => s.mealType === "lanche")!;
    expect(lanches.variants.some((v) => v.foods.some((f) => /melancia/i.test(f.name)))).toBe(true);
  });

  it("o guia diz que o efeito da comida é modesto, e aponta o que pesa de verdade", () => {
    const comida = VITALIDADE_GUIA.find((s) => s.id === "comida");
    expect(comida).toBeDefined();
    const t = JSON.stringify(comida).toLowerCase();
    expect(t).toMatch(/modesto/);
    expect(t).toMatch(/beterraba/);
    expect(t).toMatch(/castanha-do-par[áa]/);
    expect(t).toMatch(/nunca mais (que|de) (duas|2)/);
    expect(t).toMatch(/sono/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/data/vitalidade-comida.test.ts`
Expected: FAIL.

- [ ] **Step 3: Whey em gramas**

Em `src/data/meal-plan-seed.ts`, para cada `food` com "scoop" no nome, escrever `(N g de pó)`, com N igual ao `qtyG` daquele food. No lanche-1, que junta whey e aveia, o nome fica `"Whey protein (30 g de pó) & aveia em flocos (40 g)"`. No café-1, a preparação "1 scoop de whey" vira "30 g de whey". O comentário da linha ~789 que diz "scoop inteiro" vira "a dose inteira de 30 g".

- [ ] **Step 4: Castanha-do-pará no café-4**

Em `cafe-4`, trocar o food de caju e o ingrediente:
```ts
          {
            // Castanha-do-pará no lugar do caju nesta opção: selênio. Duas
            // unidades bastam e é o teto — em excesso o selênio faz mal.
            name: "Castanha-do-pará (2 unidades)",
            qtyG: 8,
            kcal: 53,
            proteinG: 1,
            carbG: 1,
            fatG: 5,
            preparation: "Ao natural. Duas e só duas por dia — é o teto seguro.",
          },
```
```ts
          { item: "Castanha-do-pará", qty: 2, unit: "un", category: "mercearia" },
```
Os outros cafés continuam com caju (`variantes-proximas-do-alvo.test.ts` exige caju em ≥ 3 opções de café somando todos os planos).

- [ ] **Step 5: Melancia no lanche-3**

Em `lanche-3`, trocar "Banana média" por:
```ts
          {
            name: "Melancia (300g, sem casca)",
            qtyG: 300,
            kcal: 90,
            proteinG: 2,
            carbG: 22,
            fatG: 0,
            preparation: "Cortada em cubos no domingo, num pote fechado — dura 3 dias na geladeira. Come gelada antes da caminhada.",
          },
```
e o ingrediente `{ item: "Melancia", qty: 300, unit: "g", category: "hortifruti" }` no lugar da banana. Fica 431 kcal e 38 g de proteína, dentro de ±10% de 450.

- [ ] **Step 6: Guia de vitalidade**

Em `src/data/vitalidade-guide-seed.ts`:
- no tip do zinco, "entra fácil no lanche do dia a dia" → "entra fácil no café do dia a dia".
- nova seção logo antes de `o-que-derruba`:
```ts
  {
    id: "comida",
    title: "Comida — o que ajuda e quanto",
    intro: "O efeito da comida existe e é modesto. O que pesa de verdade é o déficit moderado (por isso 2.200 e não menos), dormir 7 horas, treinar e perder a barriga.",
    tips: [
      "Beterraba: melhora o fluxo de sangue, que é metade da firmeza. Jantar cedo ajuda, porque o efeito leva 2 a 3 horas pra aparecer.",
      "Melancia: entra no lanche porque é barata em Aracaju e ajuda na mesma direção da beterraba, com efeito pequeno.",
      "Castanha-do-pará: fonte de selênio. Uma ou duas por dia, nunca mais que duas — em excesso o selênio faz mal.",
      "Peixe duas vezes por semana e carne, ovo e feijão no resto: é daí que vêm o ômega-3 e o zinco.",
      "Fórmulas de farmácia que prometem testosterona ou firmeza estão sem evidência boa. O app não recomenda nenhuma.",
    ],
  },
```
Esse texto não cita nenhuma substância da lista proibida e não tem número+unidade de suplemento.

- [ ] **Step 7: Bump the version**

`MEAL_PLAN_VERSION = 15` com `// v15: whey em gramas de pó, castanha-do-pará no café-4, melancia no lanche-3.` Pino em `seeds-chegam-no-aparelho.test.ts` → `toBe(15)`.

- [ ] **Step 8: Run the whole suite**

Run: `npm test`
Expected: PASS, incluindo `vitalidade-guide.test.ts`, `proteina-por-refeicao.test.ts` e `variantes-proximas-do-alvo.test.ts`.

- [ ] **Step 9: Commit**

```bash
git add src/data/meal-plan-seed.ts src/data/vitalidade-guide-seed.ts src/lib/path-seed.ts tests/
git commit -m "feat(vitalidade): castanha-do-pará, melancia e whey em gramas — e o guia diz o tamanho do efeito

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Hoje — creatina e caminhada de fim de semana

**Files:**
- Create: `src/lib/creatina.ts`
- Modify: `src/lib/today-routine.ts` (`manhaItems` recebe `fimDeSemana`; `CREATINA`; `CAMINHADA_FDS`; subtítulo de `dormir`; comentário do domingo)
- Modify: `src/pages/Today.tsx` (`subtitleFor` com o aviso da creatina; query da primeira marcação)
- Modify: `tests/lib/rotina-fim-de-semana.test.ts` (fim de semana com duas caminhadas)
- Test: `tests/lib/creatina.test.ts`
- Test: `tests/lib/rotina-chun-li.test.ts`

**Interfaces:**
- Produces: `CREATINA_ITEM_ID = "creatina"`, `DIAS_AVISO_AGUA = 14`, `primeiraMarcacao(checks: readonly RoutineCheck[]): string | null`, `mostrarAvisoAgua(primeira: string | null, hoje: string): boolean`, `SUBTITULO_AVISO_AGUA: string`.

- [ ] **Step 1: Write the failing tests**

`tests/lib/creatina.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { primeiraMarcacao, mostrarAvisoAgua } from "../../src/lib/creatina";

describe("aviso de água da creatina", () => {
  it("antes de começar, avisa — ela precisa saber antes da balança subir", () => {
    expect(mostrarAvisoAgua(null, "2026-09-24")).toBe(true);
  });
  it("avisa nos primeiros 14 dias a partir da primeira marcação", () => {
    expect(mostrarAvisoAgua("2026-09-24", "2026-10-07")).toBe(true);
  });
  it("some no 14º dia depois da primeira marcação", () => {
    expect(mostrarAvisoAgua("2026-09-24", "2026-10-08")).toBe(false);
  });
  it("marcação desfeita (done: false) não conta como começo", () => {
    expect(primeiraMarcacao([
      { date: "2026-09-20", itemId: "creatina", done: false },
      { date: "2026-09-24", itemId: "creatina", done: true },
      { date: "2026-09-22", itemId: "agua", done: true },
    ])).toBe("2026-09-24");
  });
  it("sem nenhuma marcação feita, não há começo", () => {
    expect(primeiraMarcacao([{ date: "2026-09-20", itemId: "creatina", done: false }])).toBeNull();
  });
});
```

`tests/lib/rotina-chun-li.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

const itens = (dow: number) => buildDayRoutine(dow, 100, []).blocks.flatMap((b) => b.items);

describe("rotina da Chun-Li macia", () => {
  it("creatina todo dia, na manhã, com horário", () => {
    for (const dow of [0, 1, 2, 3, 4, 5, 6]) {
      const c = itens(dow).find((i) => i.id === "creatina");
      expect({ dow, bloco: c?.block, hora: !!c?.defaultTime }).toEqual({ dow, bloco: "manha", hora: true });
    }
  });

  it("sábado e domingo têm a caminhada de 5 km, que credita como caminhada", () => {
    for (const dow of [0, 6]) {
      const c = itens(dow).find((i) => i.id === "caminhada-fds");
      expect({ dow, walk: c?.control }).toEqual({ dow, walk: "walk" });
    }
  });

  it("dia útil não ganha a caminhada de fim de semana — já tem a do trabalho", () => {
    expect(itens(3).some((i) => i.id === "caminhada-fds")).toBe(false);
    expect(itens(3).some((i) => i.id === "caminhada-trabalho")).toBe(true);
  });

  it("o item de dormir diz a meta de horas", () => {
    expect(itens(1).find((i) => i.id === "dormir")?.subtitle).toMatch(/7/);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run tests/lib/creatina.test.ts tests/lib/rotina-chun-li.test.ts`
Expected: FAIL.

- [ ] **Step 3: `src/lib/creatina.ts`**

```ts
import type { RoutineCheck } from "./db";

// Creatina 3 g/dia entrou em 2026-09-23 (spec Chun-Li macia): mais força e
// mais músculo pra quem está começando. O custo é 1-2 kg de ÁGUA dentro do
// músculo nas primeiras semanas — e ela mede a balança. Sem o aviso, o
// primeiro número depois de começar parece fracasso da dieta.
export const CREATINA_ITEM_ID = "creatina";
export const DIAS_AVISO_AGUA = 14;
export const SUBTITULO_AVISO_AGUA =
  "Primeiras 2 semanas: a balança sobe 1–2 kg de água dentro do músculo. Não é gordura.";

export function primeiraMarcacao(checks: readonly RoutineCheck[]): string | null {
  const datas = checks.filter((c) => c.itemId === CREATINA_ITEM_ID && c.done).map((c) => c.date).sort();
  return datas[0] ?? null;
}

export function mostrarAvisoAgua(primeira: string | null, hoje: string): boolean {
  if (primeira === null) return true;
  const dias = Math.round((Date.parse(hoje) - Date.parse(primeira)) / 86_400_000);
  return dias < DIAS_AVISO_AGUA;
}
```

- [ ] **Step 4: Rotina**

Em `src/lib/today-routine.ts`:
```ts
/** Creatina 3 g no café, todo dia. O horário é o do café porque o efeito vem
 *  do acúmulo, não da hora — amarrar a um hábito que já existe é o que faz
 *  lembrar. O aviso de água das primeiras 2 semanas é derivado em Today.tsx
 *  (precisa do histórico de marcações; este módulo é puro). */
const CREATINA: RoutineItem = {
  id: "creatina", block: "manha", label: "Creatina · 3 g",
  subtitle: "No café, todo dia, com água ou na vitamina — funciona pelo acúmulo, não pelo horário",
  defaultTime: "06:35",
};

/** Os 5 km também no sábado e no domingo (decisão dela, 2026-09-23): é o
 *  acelerador que tira ~1 mês da fase 1 sem cortar comida. De manhã, antes
 *  do calor de Aracaju. Credita os 60 min como a do trabalho. */
const CAMINHADA_FDS: RoutineItem = {
  id: "caminhada-fds", block: "manha", label: "Caminhada · 5 km (fim de semana)",
  subtitle: "~1h em ritmo de zona 2 — o mesmo da volta do trabalho",
  control: "walk", to: "/treino/exercicio/cardio-zona2", defaultTime: "07:30",
};
```
`manhaItems(dayOfYear: number, fimDeSemana: boolean)`: depois de `cafe-marmita`, `items.push(CREATINA)`; se `fimDeSemana`, `items.push(CAMINHADA_FDS)` por último. Em `buildBlocks`: `manhaItems(dayOfYear, isSaturday || isSunday)`. No item `dormir`, o subtítulo passa a ser `"Meta: 7–7,5 h até as 6h · marcar registra a hora real que você deitou — sono curto sobe o cortisol e guarda gordura na barriga"`. O comentário do domingo que explica "Sem control:walk de propósito" vira: "Duas caminhadas reais no fim de semana também: os 5 km da manhã e o passeio. Cada uma credita as suas."

- [ ] **Step 5: Today.tsx**

Imports: `import { primeiraMarcacao, mostrarAvisoAgua, SUBTITULO_AVISO_AGUA, CREATINA_ITEM_ID } from "../lib/creatina";`. Junto das outras queries:
```ts
  // Primeira vez que ela marcou a creatina: é daqui que contam as 2 semanas
  // do aviso de água. Varre só as linhas do item — são uma por dia.
  const primeiraCreatina = useLiveQuery(
    async () => primeiraMarcacao(await db.routineChecks.filter((c) => c.itemId === CREATINA_ITEM_ID).toArray()),
    [],
  );
```
Em `subtitleFor`, antes do `return item.subtitle` final:
```ts
    if (item.id === CREATINA_ITEM_ID && mostrarAvisoAgua(primeiraCreatina ?? null, todayISO)) {
      return SUBTITULO_AVISO_AGUA;
    }
```

- [ ] **Step 6: Update the weekend test**

Em `tests/lib/rotina-fim-de-semana.test.ts`:
- "no fim de semana só há um item de movimento; em dia de semana são dois" → "fim de semana e dia útil têm duas caminhadas reais cada", cobrando `control === "walk"` contado igual a 2 nos sete dias.
- "no sábado o passeio é o único item de caminhada, e não invade a dança" → "no sábado, as caminhadas não invadem a dança": a caminhada das 07:30 e o passeio das 18:15 ficam fora da janela da dança das 17:30.

Os dois com um comentário citando a spec de 2026-09-23.

- [ ] **Step 7: Run the whole suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/creatina.ts src/lib/today-routine.ts src/pages/Today.tsx tests/
git commit -m "feat(hoje): creatina com aviso de água e os 5 km também no fim de semana

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Verificação final, memória e publicação

- [ ] **Step 1:** `npm test` e `npm run build`. Os dois precisam passar; colar a contagem de testes no relatório.
- [ ] **Step 2:** `npm run dev` e abrir o Hoje num dia útil e num sábado (usar `run`/navegador): conferir creatina, caminhada de fim de semana, subtítulo do dormir, e que o treino de segunda da adaptação abre com leg press pés no meio.
- [ ] **Step 3:** Atualizar a memória `reforma_seis_frentes_2026_08.md` ou criar `chun_li_macia_2026_09.md` com o que entrou, e deixar registrado: fase 2 reescrita na Smartfit com mini-entrada; entrega 2 pendente (partida automática).
- [ ] **Step 4:** Seguir `superpowers:finishing-a-development-branch`: merge `--no-ff` na main e **perguntar a ela antes do `git push origin main`**, que publica no celular.
