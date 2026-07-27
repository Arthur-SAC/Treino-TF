# Fase de Entrada + correções de ciclo + superávit condicionado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar uma Fase de Entrada de 3 semanas que faz a exposição do treino subir em rampa antes da Adaptação, corrigir seis erros de programação nos ciclos existentes, e condicionar o superávit calórico à cintura.

**Architecture:** Tudo em camada de dados + uma mudança de UI. Três novos ciclos (`entrada-1/2/3`) reaproveitam a máquina de progressão por contagem de sessões que já existe — sem mudança de schema do Dexie. O campo `exposureLevel` (1–5), que hoje só é exibido, passa a governar a prescrição e é travado por teste. Os exercícios de cada sessão da Entrada ganham um marcador de bloco (`maquina` | `solo`) para que a ordem seja trocável quando a academia estiver ocupada. A seleção de plano alimentar deixa de ser um lookup puro e passa a consultar a última medição.

**Tech Stack:** React 18 · TypeScript strict (`verbatimModuleSyntax: true`) · Dexie · Vitest + happy-dom · Tailwind v3

## Global Constraints

- Spec de origem: `docs/superpowers/specs/2026-07-27-revisao-profissional-treino-nutricao-design.md`
- Testes ficam em `tests/`, **não** ao lado do fonte. Import do fonte com `../../src/...`
- Rodar testes: `npm test` · build: `npm run build`
- TS tem `verbatimModuleSyntax: true` — sempre `import type` para tipos
- `tsconfig.json` é só project-references; edits de compilerOptions vão em `tsconfig.app.json`
- **Nunca usar emoji** em copy de UI ou de seed (preferência explícita da usuária). Ícones lineares/SVG ou símbolos geométricos apenas.
- Copy do app em pt-br, tratando a usuária por "você"
- Suíte existente deve permanecer verde (254 testes na última medição)
- Escopo deste plano: Blocos A, B e C1 da spec. Blocos C2–C6 e D ficam para um plano seguinte.

---

## File Structure

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `src/lib/db.ts` | Tipos `WorkoutTemplate.cycle` e o bloco por exercício | Modificar |
| `src/lib/settings-helpers.ts` | União de `Settings.activeCycle` | Modificar |
| `src/data/cycles-seed.ts` | `CYCLES`, `CycleId`, `CYCLE_TO_GOAL`, templates dos ciclos 2–5 | Modificar |
| `src/data/entrada-seed.ts` | Os 15 templates da Fase de Entrada | **Criar** |
| `src/data/exercises-seed.ts` | Catálogo — bike reclinada, zona 2, kettlebells | Modificar |
| `src/data/workout-plan-seed.ts` | Templates da Adaptação | Modificar |
| `src/lib/cycle-advisor.ts` | Mapa `NEXT` de progressão de ciclo | Modificar |
| `src/lib/meal-plan.ts` | `getActiveMealPlan()` com condição de cintura | Modificar |
| `src/lib/seed.ts` | Versões de seed e migração do ciclo ativo | Modificar |
| `src/pages/workout/SessionDetail.tsx` | Agrupar exercícios por bloco + trocar ordem | Modificar |
| `tests/data/entrada-rampa-exposicao.test.ts` | Trava a regra central da fase | **Criar** |
| `tests/data/correcoes-ciclo.test.ts` | Trava as correções do Bloco B | **Criar** |
| `tests/lib/meal-plan-cintura.test.ts` | Superávit condicionado | **Criar** |

A Fase de Entrada vai em arquivo próprio (`entrada-seed.ts`) e não dentro de `cycles-seed.ts` — este último já tem 400 linhas com quatro ciclos, e a Entrada tem regra de montagem própria (a rampa) que merece ficar documentada junto dos seus dados.

---

### Task 1: Tipos e registro dos três ciclos de Entrada

**Files:**
- Modify: `src/data/cycles-seed.ts:384-402` (blocos `CYCLES` e `CYCLE_TO_GOAL`)
- Modify: `src/lib/db.ts:60` (campo `cycle` de `WorkoutTemplate`)
- Modify: `src/lib/settings-helpers.ts:29` (união de `activeCycle`)
- Modify: `src/lib/cycle-advisor.ts:4-10` (mapa `NEXT`)
- Test: `tests/data/cycles-threshold.test.ts` (existente — estender)

**Interfaces:**
- Consumes: nada
- Produces: `CycleId` passa a incluir `"entrada-1" | "entrada-2" | "entrada-3"`. Tasks 3, 5, 6 e 8 dependem dessa união.

- [ ] **Step 1: Estender o teste existente de thresholds**

Em `tests/data/cycles-threshold.test.ts`, adicionar ao final do arquivo:

```ts
describe("Fase de Entrada", () => {
  it("os três ciclos de entrada vêm antes de adaptação, nesta ordem", () => {
    const ids = CYCLES.map((c) => c.id);
    expect(ids.slice(0, 4)).toEqual(["entrada-1", "entrada-2", "entrada-3", "adaptacao"]);
  });

  it("cada semana da entrada fecha em 5 sessões", () => {
    for (const id of ["entrada-1", "entrada-2", "entrada-3"]) {
      expect(CYCLES.find((c) => c.id === id)?.threshold).toBe(5);
    }
  });

  it("as três semanas de entrada usam o plano de déficit", () => {
    for (const id of ["entrada-1", "entrada-2", "entrada-3"] as const) {
      expect(CYCLE_TO_GOAL[id]).toBe("deficit");
    }
  });
});
```

Ajustar o import do topo do arquivo para `import { CYCLES, CYCLE_TO_GOAL } from "../../src/data/cycles-seed";`

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- cycles-threshold`
Expected: FAIL — `entrada-1` não existe em `CYCLES`, e `CYCLE_TO_GOAL["entrada-1"]` não compila.

- [ ] **Step 3: Registrar os ciclos em `cycles-seed.ts`**

Substituir o array `CYCLES` (linha ~384) por:

```ts
export const CYCLES = [
  { id: "entrada-1", name: "Entrada · Semana 1", description: "Só máquina sentada, bike e solo. Aprende os padrões e se acostuma com o espaço.", threshold: 5 },
  { id: "entrada-2", name: "Entrada · Semana 2", description: "Entra a dobradiça de quadril com halteres leves e o step-up.", threshold: 5 },
  { id: "entrada-3", name: "Entrada · Semana 3", description: "Entra o hip thrust — primeiro com o peso do corpo, depois com a barra vazia.", threshold: 5 },
  { id: "adaptacao", name: "Adaptação", description: "Aprende os movimentos, ativa glúteo, seca a barriga (déficit). Cargas leves (~6 semanas).", threshold: 28 },
  { id: "variacao", name: "Variação", description: "Mesmo objetivo de glúteo, exercícios variados pra estímulo novo.", threshold: 60 },
  { id: "hipertrofia", name: "Hipertrofia", description: "Fase de ouro: volume alto, foco máximo em crescimento de glúteo.", threshold: 60 },
  { id: "refinamento", name: "Refinamento", description: "Cargas leves, reps altas, simetria e densidade do glúteo.", threshold: 60 },
  { id: "manutencao", name: "Manutenção", description: "Segura a forma com volume reduzido. Fase ideal pra alinhar com o início da TRH.", threshold: 120 },
] as const;
```

E estender `CYCLE_TO_GOAL` com as três primeiras entradas:

```ts
export const CYCLE_TO_GOAL: Record<CycleId, "deficit" | "manutencao" | "superavit"> = {
  "entrada-1": "deficit",
  "entrada-2": "deficit",
  "entrada-3": "deficit",
  adaptacao: "deficit",
  variacao: "deficit",
  hipertrofia: "superavit", // Task 8 torna isso condicional à cintura
  refinamento: "manutencao",
  manutencao: "manutencao",
};
```

Nota: a descrição de `hipertrofia` perdeu o trecho "sai do déficit" de propósito — a Task 8 torna essa decisão condicional, e a descrição não pode mais prometer superávit.

- [ ] **Step 4: Estender as uniões de tipo em `db.ts` e `settings-helpers.ts`**

Em `src/lib/db.ts`, no campo `cycle` de `WorkoutTemplate`:

```ts
  cycle?: "entrada-1" | "entrada-2" | "entrada-3" | "adaptacao" | "variacao" | "hipertrofia" | "refinamento" | "manutencao";
```

Em `src/lib/settings-helpers.ts`, no campo `activeCycle` da interface `Settings`:

```ts
  activeCycle: "entrada-1" | "entrada-2" | "entrada-3" | "adaptacao" | "variacao" | "hipertrofia" | "refinamento" | "manutencao";
```

- [ ] **Step 5: Ligar a progressão no `cycle-advisor.ts`**

Substituir o mapa `NEXT` (linha 4):

```ts
const NEXT: Record<CycleId, CycleId | null> = {
  "entrada-1": "entrada-2",
  "entrada-2": "entrada-3",
  "entrada-3": "adaptacao",
  adaptacao: "variacao",
  variacao: "hipertrofia",
  hipertrofia: "refinamento",
  refinamento: "manutencao",
  manutencao: null,
};
```

Nenhuma outra mudança é necessária em `recommendCycleChange`: os ciclos de entrada não são `variacao` nem `hipertrofia`, então caem no ramo final de "piso de sessões" (linha 57), que é exatamente o comportamento desejado — 5 sessões e promove.

- [ ] **Step 6: Rodar os testes**

Run: `npm test`
Expected: PASS. Se houver erro de tipo em algum `Record<CycleId, …>` que não listamos, adicionar as três chaves lá também.

- [ ] **Step 7: Commit**

```bash
git add src/data/cycles-seed.ts src/lib/db.ts src/lib/settings-helpers.ts src/lib/cycle-advisor.ts tests/data/cycles-threshold.test.ts
git commit -m "feat(entrada): registra os 3 ciclos da Fase de Entrada antes da Adaptação"
```

---

### Task 2: Exercícios de cardio que faltam no catálogo

A Entrada apoia-se na bike reclinada (sentada, `exposureLevel 1` — o cardio mais discreto que ela tem) e o Bloco B5 da spec exige que a zona 2 vire item explícito de template. Nenhum dos dois existe hoje: o catálogo só tem `cardio-leve-esteira`.

**Files:**
- Modify: `src/data/exercises-seed.ts` (adicionar ao final do array `EXERCISES`)
- Test: `tests/data/entrada-rampa-exposicao.test.ts` (criado na Task 3 — este task só adiciona dados)

**Interfaces:**
- Consumes: tipo `Exercise` de `src/lib/db.ts`
- Produces: ids `bike-reclinada` e `cardio-zona2`, usados pelas Tasks 3 e 6

- [ ] **Step 1: Escrever o teste**

Criar `tests/data/cardio-catalogo.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";

describe("catálogo de cardio", () => {
  it("tem a bike reclinada, e ela é discreta (sentada)", () => {
    const bike = EXERCISES.find((e) => e.id === "bike-reclinada");
    expect(bike).toBeDefined();
    expect(bike?.exposureLevel).toBe(1);
  });

  it("tem um item de zona 2 explícito, separado do aquecimento", () => {
    const z2 = EXERCISES.find((e) => e.id === "cardio-zona2");
    expect(z2).toBeDefined();
    expect(z2?.exposureLevel).toBe(1);
    expect(z2?.category).toBe("cardio");
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test -- cardio-catalogo`
Expected: FAIL — "expected undefined to be defined"

- [ ] **Step 3: Adicionar os dois exercícios**

Ao final do array `EXERCISES` em `src/data/exercises-seed.ts`:

```ts
  {
    id: "bike-reclinada",
    name: "Bike reclinada",
    category: "cardio",
    equipment: ["bike-reclinada"],
    difficulty: "iniciante",
    description: "Sentada com as costas apoiadas, pedala em ritmo confortável. Ajusta o banco pra perna quase esticar no ponto mais longe, sem travar o joelho.",
    commonMistakes: [
      "Banco perto demais — joelho dobra muito e sobrecarrega a frente da coxa",
      "Resistência tão alta que vira treino de perna em vez de cardio",
    ],
    easierVariation: "Menos resistência, mesmo tempo",
    harderVariation: "Sobe a resistência até ficar ofegante mas ainda conseguindo falar",
    exposureLevel: 1,
    successCue: "Fez certo se terminar ofegante mas ainda conseguindo conversar.",
    proTips: [
      "É o cardio mais confortável que você tem: sentada, com apoio nas costas e sem impacto no joelho",
      "Serve tanto de aquecimento (5 min leve) quanto de zona 2 no fim do treino (15-20 min ofegante)",
    ],
  },
  {
    id: "cardio-zona2",
    name: "Cardio zona 2 (fim do treino)",
    category: "cardio",
    equipment: ["esteira", "bike-reclinada"],
    difficulty: "iniciante",
    description: "15 a 20 minutos contínuos num ritmo em que você fica ofegante mas ainda consegue conversar. Esteira em inclinação 6-10% a 4,5-5,5 km/h, ou bike reclinada numa resistência que puxe.",
    commonMistakes: [
      "Ir rápido demais — se não dá pra falar, saiu da zona 2",
      "Parar antes dos 15 min contínuos (fracionado não tem o mesmo efeito)",
      "Fazer antes do treino de força e chegar cansada no glúteo",
    ],
    easierVariation: "Começa com 15 min e sobe 2 min por semana",
    harderVariation: "20 min mantendo a mesma conversa possível",
    exposureLevel: 1,
    successCue: "Fez certo se conseguiu falar uma frase inteira sem engasgar, mas não cantaria.",
    proTips: [
      "Vai no FIM do treino, nunca antes — cardio antes rouba energia do glúteo",
      "A caminhada inclinada recruta mais glúteo que a corrida e poupa o joelho",
      "O passeio lento com os cães é movimento bônus e conta pra sua meta de passos, mas NÃO substitui isso aqui",
    ],
  },
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test -- cardio-catalogo`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/exercises-seed.ts tests/data/cardio-catalogo.test.ts
git commit -m "feat(treino): bike reclinada e zona 2 explícita entram no catálogo"
```

---

### Task 3: Os 15 templates da Fase de Entrada + o teste da rampa

Esta é a task central do plano. O teste da rampa é o que impede a regra da fase de se perder numa edição futura.

**Files:**
- Create: `src/data/entrada-seed.ts`
- Create: `tests/data/entrada-rampa-exposicao.test.ts`

**Interfaces:**
- Consumes: `WorkoutTemplate` de `src/lib/db.ts`; ids de exercício do catálogo; `bike-reclinada` e `cardio-zona2` da Task 2
- Produces: `export const ENTRADA_TEMPLATES: WorkoutTemplate[]` — consumido pela Task 5 (seed) e Task 4 (blocos)

- [ ] **Step 1: Escrever o teste da rampa**

Criar `tests/data/entrada-rampa-exposicao.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import { EXERCISES } from "../../src/data/exercises-seed";

const TETO: Record<string, number> = {
  "entrada-1": 2,
  "entrada-2": 3,
  "entrada-3": 4,
};

const nivel = new Map(EXERCISES.map((e) => [e.id, e.exposureLevel]));

describe("Fase de Entrada — rampa de exposição", () => {
  it("todo exercício respeita o teto de exposureLevel da sua semana", () => {
    const offenders = ENTRADA_TEMPLATES.flatMap((t) =>
      t.exercises
        .filter((e) => (nivel.get(e.exerciseId) ?? 99) > TETO[t.cycle as string])
        .map((e) => `${t.id} (teto ${TETO[t.cycle as string]}): ${e.exerciseId} é nível ${nivel.get(e.exerciseId)}`),
    );
    expect(offenders).toEqual([]);
  });

  it("todo exercício referenciado existe no catálogo", () => {
    const orfaos = ENTRADA_TEMPLATES.flatMap((t) =>
      t.exercises.filter((e) => !nivel.has(e.exerciseId)).map((e) => `${t.id}: ${e.exerciseId}`),
    );
    expect(orfaos).toEqual([]);
  });

  it("são 5 sessões por semana, de segunda a sexta, nas três semanas", () => {
    for (const cycle of ["entrada-1", "entrada-2", "entrada-3"]) {
      const dias = ENTRADA_TEMPLATES.filter((t) => t.cycle === cycle).map((t) => t.dayOfWeek).sort();
      expect(dias).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it("a semana 3 é a única que programa hip thrust", () => {
    const comHipThrust = ENTRADA_TEMPLATES.filter((t) =>
      t.exercises.some((e) => e.exerciseId.startsWith("hip-thrust")),
    );
    expect(comHipThrust.every((t) => t.cycle === "entrada-3")).toBe(true);
    expect(comHipThrust.length).toBeGreaterThan(0);
  });

  it("nenhuma sessão passa de 40 minutos (é fase de entrada, não de volume)", () => {
    for (const t of ENTRADA_TEMPLATES) {
      expect(t.durationMin).toBeLessThanOrEqual(40);
    }
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test -- entrada-rampa`
Expected: FAIL — módulo `entrada-seed` não existe.

- [ ] **Step 3: Criar `src/data/entrada-seed.ts`**

```ts
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
// Toda sessão se divide em bloco `maquina` e bloco `solo`, executáveis em
// qualquer ordem — a sessão nunca depende de a sala de solo estar livre.
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
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "maquina", notes: "Aquecimento leve — só pra soltar" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", notes: "Leg press. Pés na largura do quadril, no meio da plataforma. Empurra pelo calcanhar" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", notes: "Glúteo médio — é ele que arredonda a lateral" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina", notes: "Coxa interna — silhueta cheia" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "15", restSec: 30, block: "solo", notes: "Aperta o glúteo 1-2s lá em cima. É a contração que constrói" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "10min", restSec: 0, block: "maquina", notes: "Começa com 10 min nesta fase; sobe pra 15 na Adaptação" },
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
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "maquina" },
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
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "solo" },
      { exerciseId: "cat-cow", sets: 2, repsTarget: "10", restSec: 0, block: "solo" },
      { exerciseId: "clamshell", sets: 3, repsTarget: "15 cada", restSec: 30, block: "solo" },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "15 cada", restSec: 30, block: "solo" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "15", restSec: 30, block: "solo" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "10min", restSec: 0, block: "maquina" },
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
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0, block: "solo" },
      { exerciseId: "cat-cow", sets: 2, repsTarget: "10", restSec: 0, block: "solo" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "20min", restSec: 0, block: "maquina", notes: "Esteira inclinada ou bike — hoje o cardio é o treino" },
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
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "maquina" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", notes: "Leg press com os pés ALTOS na plataforma = foco glúteo. Se a mobilidade ainda não deixar, começa mais baixo e sobe com as semanas" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "12 cada", restSec: 30, block: "solo", notes: "Uma perna de cada vez — corrige diferença entre os lados" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "10min", restSec: 0, block: "maquina" },
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
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "maquina" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "15", restSec: 60, block: "maquina", notes: "Leg press. Se as 15 saírem fáceis, sobe uma placa" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30, block: "solo" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "12min", restSec: 0, block: "maquina" },
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
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "maquina" },
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
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "solo" },
      { exerciseId: "clamshell", sets: 3, repsTarget: "20 cada", restSec: 30, block: "solo" },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "20 cada", restSec: 30, block: "solo" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30, block: "solo" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "10min", restSec: 0, block: "maquina" },
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
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0, block: "solo" },
      { exerciseId: "step-up-gluteo", sets: 3, repsTarget: "10 cada", restSec: 45, block: "solo", notes: "Sobe empurrando pelo calcanhar da perna de cima. Desce devagar — a descida é metade do exercício" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "15min", restSec: 0, block: "maquina" },
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
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "maquina" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "12", restSec: 60, block: "maquina", notes: "Leg press pés altos" },
      { exerciseId: "stiff", sets: 3, repsTarget: "12", restSec: 60, block: "solo", notes: "AMPLITUDE CURTA por enquanto: halteres de 3-4 kg, empurra o quadril pra trás e desce SÓ até onde o posterior da coxa deixa, sem arredondar a lombar. A amplitude aumenta sozinha nas próximas semanas — forçar agora é como se machuca a lombar" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "12min", restSec: 0, block: "maquina" },
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
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "maquina" },
      { exerciseId: "ativacao-gluteo-band-walks", sets: 2, repsTarget: "12 cada", restSec: 30, block: "solo", notes: "Ativação — sente o glúteo ligar antes de carregar" },
      { exerciseId: "hip-thrust-barra", sets: 3, repsTarget: "15 (SEM PESO)", restSec: 60, block: "solo", notes: "ETAPA 1: só o peso do corpo, costas apoiadas no banco. Queixo pra baixo, costela fechada, empurra pelo calcanhar e aperta o glúteo 2s no topo. Quando as 3 séries saírem redondas, passa pra barra vazia (~10 kg) em 3x12 — e só depois disso começa a somar anilha" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "12min", restSec: 0, block: "maquina" },
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
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "maquina" },
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
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "4min", restSec: 0, block: "solo" },
      { exerciseId: "clamshell", sets: 3, repsTarget: "20 cada", restSec: 30, block: "solo" },
      { exerciseId: "abdutor-deitada", sets: 3, repsTarget: "20 cada", restSec: 30, block: "solo" },
      { exerciseId: "ponte-gluteo-band", sets: 3, repsTarget: "20", restSec: 30, block: "solo" },
      { exerciseId: "abdutor-maquina", sets: 3, repsTarget: "18", restSec: 45, block: "maquina" },
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "10min", restSec: 0, block: "maquina" },
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
      { exerciseId: "aquecimento-articular", sets: 1, repsTarget: "5min", restSec: 0, block: "solo" },
      { exerciseId: "step-up-gluteo", sets: 3, repsTarget: "12 cada", restSec: 45, block: "solo" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "15min", restSec: 0, block: "maquina" },
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
      { exerciseId: "bike-reclinada", sets: 1, repsTarget: "5min", restSec: 0, block: "maquina" },
      { exerciseId: "smith-squat", sets: 3, repsTarget: "15", restSec: 60, block: "maquina", notes: "Leg press pés altos" },
      { exerciseId: "stiff", sets: 3, repsTarget: "12", restSec: 60, block: "solo", notes: "Amplitude ainda controlada — desce só até onde o posterior deixa sem arredondar a lombar. Se já está descendo mais que na semana passada, é sinal de que a mobilidade está vindo" },
      { exerciseId: "adutora-maquina", sets: 3, repsTarget: "15", restSec: 45, block: "maquina" },
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "15min", restSec: 0, block: "maquina" },
    ],
  },
];

export const ENTRADA_TEMPLATES: WorkoutTemplate[] = [...SEMANA_1, ...SEMANA_2, ...SEMANA_3];
```

- [ ] **Step 4: Rodar o teste**

Run: `npm test -- entrada-rampa`
Expected: FAIL de tipo em `block` — o campo ainda não existe em `WorkoutTemplate`. Isso é esperado; a Task 4 adiciona. Se preferir manter a árvore compilando entre tasks, faça a Task 4 Step 3 antes deste Step 4.

- [ ] **Step 5: Commit**

```bash
git add src/data/entrada-seed.ts tests/data/entrada-rampa-exposicao.test.ts
git commit -m "feat(entrada): 15 templates da Fase de Entrada com rampa de exposição travada por teste"
```

---

### Task 4: Bloco máquina/solo — modelo e UI reordenável

A usuária relatou que desanima e cancela a sessão quando aparece gente. Isso é previsível o bastante para ser programado contra: cada sessão vira dois blocos independentes, e a ordem é trocável.

**Files:**
- Modify: `src/lib/db.ts:50-56` (shape de `WorkoutTemplate.exercises[]`)
- Modify: `src/pages/workout/SessionDetail.tsx:128-150`
- Create: `tests/data/entrada-blocos.test.ts`

**Interfaces:**
- Consumes: `ENTRADA_TEMPLATES` da Task 3
- Produces: campo opcional `block?: "maquina" | "solo"` em cada item de `WorkoutTemplate.exercises`

- [ ] **Step 1: Escrever o teste**

Criar `tests/data/entrada-blocos.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";

describe("Fase de Entrada — blocos independentes", () => {
  it("todo exercício da Entrada declara a que bloco pertence", () => {
    const semBloco = ENTRADA_TEMPLATES.flatMap((t) =>
      t.exercises.filter((e) => !e.block).map((e) => `${t.id}: ${e.exerciseId}`),
    );
    expect(semBloco).toEqual([]);
  });

  it("toda sessão tem pelo menos um exercício de cada bloco, senão não há o que reordenar", () => {
    const incompletas = ENTRADA_TEMPLATES.filter((t) => {
      const blocos = new Set(t.exercises.map((e) => e.block));
      return !(blocos.has("maquina") && blocos.has("solo"));
    }).map((t) => t.id);
    // e1-qui e e2-qui/e3-qui são dias leves e podem ter só um bloco
    expect(incompletas.every((id) => id.endsWith("-qui"))).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test -- entrada-blocos`
Expected: FAIL de compilação — propriedade `block` não existe no tipo.

- [ ] **Step 3: Adicionar o campo em `db.ts`**

Em `src/lib/db.ts`, no shape de `WorkoutTemplate.exercises`:

```ts
  exercises: Array<{
    exerciseId: string;
    sets: number;
    repsTarget: string;
    restSec: number;
    notes?: string;
    /** Bloco da sessão. Permite trocar a ordem quando a sala de solo está
     *  ocupada — a sessão não depende da academia estar vazia. */
    block?: "maquina" | "solo";
  }>;
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test -- entrada-blocos entrada-rampa`
Expected: PASS nos dois.

- [ ] **Step 5: Agrupar por bloco na `SessionDetail.tsx`**

Adicionar o estado e a derivação logo antes do `return` do componente:

```tsx
const [soloPrimeiro, setSoloPrimeiro] = useState(false);

const temBlocos = template?.exercises.some((e) => e.block) ?? false;
const ordenados = useMemo(() => {
  if (!template) return [];
  if (!temBlocos) return template.exercises;
  const maquina = template.exercises.filter((e) => e.block !== "solo");
  const solo = template.exercises.filter((e) => e.block === "solo");
  return soloPrimeiro ? [...solo, ...maquina] : [...maquina, ...solo];
}, [template, temBlocos, soloPrimeiro]);
```

Adicionar `useMemo` e `useState` ao import de `react` no topo do arquivo, se ainda não estiverem.

Acima do `.map(...)` dos exercícios, inserir o controle de troca (apenas quando há blocos):

```tsx
{temBlocos && (
  <div className="card mb-4">
    <p className="text-sm text-nude-warm">
      Esta sessão tem dois blocos independentes. Se a área de colchonete estiver ocupada, troca a ordem e faz o outro primeiro — a sessão não depende da sala estar vazia.
    </p>
    <button
      type="button"
      onClick={() => setSoloPrimeiro((v) => !v)}
      className="btn-secondary mt-3 text-sm"
    >
      {soloPrimeiro ? "Começar pelas máquinas" : "Começar pelo colchonete"}
    </button>
  </div>
)}
```

Trocar `template.exercises.map((tplEx, i) => {` por `ordenados.map((tplEx, i) => {`.

- [ ] **Step 6: Rodar a suíte e o build**

Run: `npm test && npm run build`
Expected: tudo verde. Se a classe `btn-secondary` não existir no projeto, usar a classe de botão secundário já em uso em `Settings.tsx`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/db.ts src/pages/workout/SessionDetail.tsx tests/data/entrada-blocos.test.ts
git commit -m "feat(entrada): sessão em dois blocos com ordem trocável quando a academia está ocupada"
```

---

### Task 5: Seed e migração — a Entrada vira o ciclo ativo

**Files:**
- Modify: `src/lib/seed.ts` (imports, blocos de seed e de re-seed)
- Modify: `src/lib/settings-helpers.ts` (`DEFAULTS.activeCycle`)
- Create: `tests/lib/seed-entrada.test.ts`

**Interfaces:**
- Consumes: `ENTRADA_TEMPLATES` (Task 3), `CYCLES` (Task 1)
- Produces: nada consumido adiante

- [ ] **Step 1: Escrever o teste**

Criar `tests/lib/seed-entrada.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";

describe("seed da Fase de Entrada", () => {
  it("os ids da Entrada não colidem com nenhum template existente", () => {
    const existentes = new Set([...WORKOUT_PLAN, ...CYCLE_TEMPLATES].map((t) => t.id));
    const colisoes = ENTRADA_TEMPLATES.filter((t) => existentes.has(t.id)).map((t) => t.id);
    expect(colisoes).toEqual([]);
  });

  it("são 15 templates ao todo", () => {
    expect(ENTRADA_TEMPLATES).toHaveLength(15);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que passa ou falha**

Run: `npm test -- seed-entrada`
Expected: PASS (é um teste de guarda; se falhar, há colisão de id a resolver na Task 3).

- [ ] **Step 3: Gravar os templates no seed**

Em `src/lib/seed.ts`, adicionar ao topo:

```ts
import { ENTRADA_TEMPLATES } from "../data/entrada-seed";
```

Nos **três** blocos que iteram `WORKOUT_PLAN` e `CYCLE_TEMPLATES` (linhas ~13, ~43 e ~78), adicionar o laço da Entrada logo após o de `CYCLE_TEMPLATES`:

```ts
      for (const tpl of ENTRADA_TEMPLATES) {
        await db.workoutTemplates.put(tpl);
      }
```

Bumpar `TEMPLATE_SEED_VERSION` de `7` para `8` (linha ~74) para que a instalação existente da usuária receba os novos templates.

- [ ] **Step 4: Migrar o ciclo ativo**

**Atenção — o default de `activeCycle` está duplicado em dois arquivos.** Trocar só um deixa a camada de
dados dizendo `entrada-1` enquanto a UI lê `adaptacao`, e a tela Hoje mostraria a Adaptação (que estreia com
hip thrust de barra) — exatamente o que esta fase existe para evitar. Os dois têm que mudar juntos:

Em `src/lib/settings-helpers.ts`, no objeto `DEFAULTS`:

```ts
  activeCycle: "entrada-1",
```

Em `src/hooks/useSetting.ts` (linha ~31), no objeto de defaults:

```ts
  activeCycle: "entrada-1",
```

Nenhuma outra mudança de UI é necessária: `Today.tsx:29` e `WeeklyPlan.tsx:13` já filtram os templates por
`(t.cycle ?? "adaptacao") === activeCycle`, então a tela Hoje passa a mostrar a sessão da Entrada do dia
automaticamente assim que o ciclo ativo mudar.

Em `src/lib/seed.ts`, ao final da função de seed, adicionar a migração de instalação existente:

```ts
  // Migração pontual: quem ainda não começou a treinar (nenhuma sessão
  // registrada) entra pela Fase de Entrada em vez da Adaptação, que estreava
  // com hip thrust de barra no primeiro dia.
  const ENTRADA_MIGRATION = 1;
  const migrated = await db.settings.get("entradaMigration");
  if (((migrated?.value as number) ?? 0) < ENTRADA_MIGRATION) {
    const sessoes = await db.workoutSessions.count();
    if (sessoes === 0) {
      await db.settings.put({ key: "activeCycle", value: "entrada-1" });
      await db.settings.put({ key: "cycleStartSessionCount", value: 0 });
    }
    await db.settings.put({ key: "entradaMigration", value: ENTRADA_MIGRATION });
  }
```

Adicionar `entradaMigration: number` à interface `Settings` e `entradaMigration: 0` a `DEFAULTS`, em `settings-helpers.ts`.

Nota: a guarda `sessoes === 0` é deliberada — quem já treinou não deve ser jogada de volta para uma fase de entrada.

- [ ] **Step 5: Rodar a suíte e o build**

Run: `npm test && npm run build`
Expected: verde.

- [ ] **Step 6: Commit**

```bash
git add src/lib/seed.ts src/lib/settings-helpers.ts tests/lib/seed-entrada.test.ts
git commit -m "feat(entrada): grava os templates e migra quem ainda não treinou para a Entrada"
```

---

### Task 6: As seis correções do Bloco B

**Files:**
- Modify: `src/data/workout-plan-seed.ts` (Adaptação: búlgaro, dobradiça, zona 2)
- Modify: `src/data/cycles-seed.ts` (Hipertrofia: puxada, peitoral; zona 2 nos demais)
- Create: `tests/data/correcoes-ciclo.test.ts`

**Interfaces:**
- Consumes: `cardio-zona2` da Task 2
- Produces: nada consumido adiante

- [ ] **Step 1: Escrever o teste**

Criar `tests/data/correcoes-ciclo.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";

const TODOS = [...WORKOUT_PLAN, ...CYCLE_TEMPLATES];

describe("correções de programação (Bloco B da spec 2026-07-27)", () => {
  it("nenhum template usa puxada aberta — ela alarga o dorsal", () => {
    const usos = TODOS.filter((t) =>
      t.exercises.some((e) => e.exerciseId === "puxada-frente-maquina"),
    ).map((t) => t.id);
    expect(usos).toEqual([]);
  });

  it("búlgaro não aparece na Adaptação — é avançado demais pra iniciante a 96 kg", () => {
    const naAdaptacao = WORKOUT_PLAN.filter((t) =>
      t.exercises.some((e) => e.exerciseId === "agachamento-bulgaro"),
    ).map((t) => t.id);
    expect(naAdaptacao).toEqual([]);
  });

  it("a Adaptação ensina dobradiça de quadril", () => {
    const temHinge = WORKOUT_PLAN.some((t) =>
      t.exercises.some((e) => ["stiff", "good-morning", "stiff-unilateral"].includes(e.exerciseId)),
    );
    expect(temHinge).toBe(true);
  });

  it("o peitoral da hipertrofia é leve — pesado constrói peito masculino", () => {
    const h = CYCLE_TEMPLATES.find((t) => t.id === "h-ter-cintura-costas");
    const supino = h?.exercises.find((e) => e.exerciseId === "supino-inclinado-halteres");
    expect(supino?.sets).toBeLessThanOrEqual(3);
    expect(supino?.repsTarget.toLowerCase()).toContain("leve");
  });

  it("todo dia de força fecha com zona 2 explícita, não com uma observação solta", () => {
    const diasDeForca = TODOS.filter(
      (t) => t.cycle && t.exercises.some((e) => e.exerciseId === "hip-thrust-barra" || e.exerciseId === "smith-squat"),
    );
    const semZona2 = diasDeForca
      .filter((t) => !t.exercises.some((e) => e.exerciseId === "cardio-zona2"))
      .map((t) => t.id);
    expect(semZona2).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test -- correcoes-ciclo`
Expected: FAIL em pelo menos quatro dos cinco casos.

- [ ] **Step 3: Corrigir a Adaptação em `workout-plan-seed.ts`**

Em `qui-gluteo-coxa`, trocar a linha do búlgaro por step-up:

```ts
      { exerciseId: "step-up-gluteo", sets: 3, repsTarget: "10 cada", restSec: 60, notes: "Sobe empurrando pelo calcanhar da perna de cima, desce devagar. Substitui o búlgaro, que é avançado demais pra esta fase" },
```

Na mesma sessão, adicionar a dobradiça logo após o step-up:

```ts
      { exerciseId: "stiff", sets: 3, repsTarget: "12", restSec: 60, notes: "Dobradiça de quadril — o padrão que mais constrói glúteo. Amplitude só até onde o posterior deixa, sem arredondar a lombar" },
```

Em **cada um** dos cinco templates da Adaptação, adicionar como último exercício:

```ts
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "15min", restSec: 0, notes: "Fecha aqui — cardio no fim não rouba energia do glúteo" },
```

E remover das `notes` de `cardio-leve-esteira` em `seg-gluteo-mobilidade` o trecho "se quiser, deixa a zona 2 mais longa pro fim", que agora é redundante:

```ts
      { exerciseId: "cardio-leve-esteira", sets: 1, repsTarget: "5min", restSec: 0, notes: "Aquece leve" },
```

- [ ] **Step 4: Corrigir a Hipertrofia em `cycles-seed.ts`**

Em `h-ter-cintura-costas`, **remover** a linha inteira de `puxada-frente-maquina` e ajustar o supino:

```ts
      { exerciseId: "supino-inclinado-halteres", sets: 3, repsTarget: "12 (LEVE)", restSec: 60, notes: "Leve de propósito: peitoral leve dá base que projeta o busto, pesado constrói um peito que lê como masculino" },
```

- [ ] **Step 5: Adicionar zona 2 aos dias de força dos ciclos 2–5**

Em `cycles-seed.ts`, adicionar como último exercício de cada template que contenha `hip-thrust-barra` ou `smith-squat`:

```ts
      { exerciseId: "cardio-zona2", sets: 1, repsTarget: "15-20min", restSec: 0 },
```

Os templates afetados: `v-seg-gluteo-unilateral`, `v-qui-gluteo-stiff`, `h-seg-gluteo-volume`, `h-sex-peitoral-postura`, `r-seg-gluteo-densidade`, `r-sex-peitoral-refinamento`, `m-seg-gluteo`, `m-sex-gluteo`.

- [ ] **Step 6: Rodar e confirmar que passa**

Run: `npm test`
Expected: PASS em tudo, incluindo a suíte antiga. O teste existente `tests/data/template-purpose.test.ts` pode exigir `purpose` nos templates alterados — eles já têm, mas confira.

- [ ] **Step 7: Commit**

```bash
git add src/data/workout-plan-seed.ts src/data/cycles-seed.ts tests/data/correcoes-ciclo.test.ts
git commit -m "fix(ciclos): tira puxada aberta e búlgaro da fase errada, ensina dobradiça e explicita a zona 2"
```

---

### Task 7: Kettlebell no catálogo e nos ciclos de variação

O inventário fotográfico da academia mostra 4 a 5 kettlebells que o app não sabia que existiam. O swing é glúteo, dobradiça e cardio no mesmo movimento.

**Files:**
- Modify: `src/data/exercises-seed.ts`
- Modify: `src/data/cycles-seed.ts` (`v-qui-gluteo-stiff`)
- Create: `tests/data/kettlebell.test.ts`

**Interfaces:**
- Consumes: tipo `Exercise`
- Produces: id `kettlebell-swing`

- [ ] **Step 1: Escrever o teste**

Criar `tests/data/kettlebell.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";

describe("kettlebell", () => {
  it("o swing existe no catálogo e é de dobradiça (glúteo)", () => {
    const swing = EXERCISES.find((e) => e.id === "kettlebell-swing");
    expect(swing).toBeDefined();
    expect(swing?.category).toBe("gluteo");
    expect(swing?.equipment).toContain("kettlebell");
  });

  it("o swing não aparece na Entrada nem na Adaptação — exige dobradiça já aprendida", () => {
    const swing = EXERCISES.find((e) => e.id === "kettlebell-swing");
    expect(swing?.difficulty).not.toBe("iniciante");
  });

  it("o swing é programado em algum ciclo de variação em diante", () => {
    const usado = CYCLE_TEMPLATES.some((t) =>
      t.exercises.some((e) => e.exerciseId === "kettlebell-swing"),
    );
    expect(usado).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test -- kettlebell`
Expected: FAIL — "expected undefined to be defined"

- [ ] **Step 3: Adicionar o exercício**

Ao final de `EXERCISES` em `src/data/exercises-seed.ts`:

```ts
  {
    id: "kettlebell-swing",
    name: "Swing com kettlebell",
    category: "gluteo",
    equipment: ["kettlebell"],
    difficulty: "intermediario",
    description: "Pés um pouco mais que a largura do quadril, kettlebell no chão à frente. Empurra o quadril pra TRÁS (não agacha), joga o peso entre as pernas e projeta o quadril pra frente com força — o kettlebell sobe sozinho até a altura do peito. Não é exercício de braço.",
    commonMistakes: [
      "Agachar em vez de empurrar o quadril pra trás",
      "Levantar o peso com o braço em vez do impulso do quadril",
      "Arquear a lombar no topo em vez de apertar o glúteo",
      "Subir acima da altura do ombro (não acrescenta nada e machuca)",
    ],
    easierVariation: "Swing só até a altura do umbigo, com peso menor",
    harderVariation: "Mais peso, mantendo a mesma velocidade de quadril",
    exposureLevel: 3,
    startLoadKg: 8,
    successCue: "Fez certo se o cansaço vier do glúteo e da respiração — não do ombro nem da lombar.",
    proTips: [
      "É glúteo, dobradiça e cardio no mesmo movimento — dos exercícios com melhor retorno pro seu objetivo",
      "Só entra depois que o stiff já sai redondo: é a mesma dobradiça, feita com velocidade",
      "A força vem de um movimento explosivo de quadril, como fechar a porta do carro com o bumbum",
    ],
  },
```

- [ ] **Step 4: Programar no ciclo de Variação**

Em `cycles-seed.ts`, template `v-qui-gluteo-stiff`, adicionar após o `good-morning`:

```ts
      { exerciseId: "kettlebell-swing", sets: 3, repsTarget: "15", restSec: 60, notes: "Mesma dobradiça do stiff, agora com velocidade. Começa no kettlebell de 8 kg" },
```

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/data/exercises-seed.ts src/data/cycles-seed.ts tests/data/kettlebell.test.ts
git commit -m "feat(treino): swing com kettlebell entra no catálogo e no ciclo de Variação"
```

---

### Task 8: Superávit condicionado à cintura (Bloco C1)

Superávit calórico a 96 kg deposita gordura abdominal — exatamente a métrica-rei e o ponto mais largo do corpo dela. Só libera quando estiver enxuta.

**Files:**
- Modify: `src/lib/meal-plan.ts`
- Create: `tests/lib/meal-plan-cintura.test.ts`

**Interfaces:**
- Consumes: `CYCLE_TO_GOAL` (Task 1), tabela `db.measurements`
- Produces: `export const CINTURA_LIBERA_SUPERAVIT_CM = 88` e `export function resolveGoal(...)`

- [ ] **Step 1: Escrever o teste**

Criar `tests/lib/meal-plan-cintura.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveGoal, CINTURA_LIBERA_SUPERAVIT_CM } from "../../src/lib/meal-plan";

describe("superávit condicionado à cintura", () => {
  it("o limiar é 88 cm", () => {
    expect(CINTURA_LIBERA_SUPERAVIT_CM).toBe(88);
  });

  it("na hipertrofia com cintura acima do limiar, fica em manutenção", () => {
    expect(resolveGoal("hipertrofia", 99)).toBe("manutencao");
  });

  it("na hipertrofia com cintura no limiar ou abaixo, libera superávit", () => {
    expect(resolveGoal("hipertrofia", 88)).toBe("superavit");
    expect(resolveGoal("hipertrofia", 84)).toBe("superavit");
  });

  it("sem medição registrada, fica em manutenção — o conservador é o correto", () => {
    expect(resolveGoal("hipertrofia", null)).toBe("manutencao");
  });

  it("a condição só vale pra hipertrofia; os outros ciclos não mudam", () => {
    expect(resolveGoal("entrada-1", null)).toBe("deficit");
    expect(resolveGoal("adaptacao", 99)).toBe("deficit");
    expect(resolveGoal("refinamento", 84)).toBe("manutencao");
    expect(resolveGoal("manutencao", 84)).toBe("manutencao");
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test -- meal-plan-cintura`
Expected: FAIL — `resolveGoal` não é exportado.

- [ ] **Step 3: Implementar em `src/lib/meal-plan.ts`**

Substituir o arquivo por:

```ts
import type { Meal, MealSlot, MealPlan } from "./db";
import { db } from "./db";
import { getSetting } from "./settings-helpers";
import { CYCLE_TO_GOAL, type CycleId } from "../data/cycles-seed";

/** Deriva `defaultMeals` (uma lista de foods por período) da variante 0 de cada slot. */
export function deriveDefaultMeals(slots: MealSlot[]): Meal["foods"][] {
  return slots.map((slot) => slot.variants[0]?.foods ?? []);
}

/** Cintura a partir da qual o superávit calórico passa a fazer sentido.
 *  Acima disso, superávit deposita gordura abdominal — que é justamente a
 *  métrica-rei e hoje o ponto mais largo do corpo. Com o percentual de gordura
 *  atual e sendo iniciante, o glúteo cresce em manutenção (recomposição). */
export const CINTURA_LIBERA_SUPERAVIT_CM = 88;

/** Meta nutricional da fase. Só a hipertrofia é condicional: ela pediria
 *  superávit, mas só o recebe se a cintura já estiver abaixo do limiar.
 *  Sem medição (`null`), assume o caminho conservador. */
export function resolveGoal(
  cycle: CycleId,
  cinturaCm: number | null,
): "deficit" | "manutencao" | "superavit" {
  const base = CYCLE_TO_GOAL[cycle] ?? "deficit";
  if (base !== "superavit") return base;
  if (cinturaCm === null) return "manutencao";
  return cinturaCm <= CINTURA_LIBERA_SUPERAVIT_CM ? "superavit" : "manutencao";
}

/** Cintura da medição mais recente que a tenha registrado, ou null. */
export async function getLatestWaist(): Promise<number | null> {
  const todas = await db.measurements.orderBy("date").reverse().toArray();
  const comCintura = todas.find((m) => typeof m.waistCm === "number" && m.waistCm > 0);
  return comCintura?.waistCm ?? null;
}

/** Plano alimentar da fase atual. Cai no primeiro plano se não achar a meta
 *  (retrocompat com instalações de plano único). */
export async function getActiveMealPlan(): Promise<MealPlan | undefined> {
  const cycle = await getSetting("activeCycle");
  const goal = resolveGoal(cycle as CycleId, await getLatestWaist());
  const all = await db.mealPlans.toArray();
  return all.find((p) => p.goal === goal) ?? all[0];
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npm test -- meal-plan-cintura`
Expected: PASS nos cinco casos.

- [ ] **Step 5: Explicar a condição na tela do plano alimentar**

Em `src/pages/path/MealPlanView.tsx`, abaixo do cabeçalho de macros, adicionar o aviso — só quando o ciclo ativo é `hipertrofia` e a meta resolvida não é superávit:

```tsx
{plan?.goal !== "superavit" && activeCycle === "hipertrofia" && (
  <div className="card mb-4 border-nude">
    <p className="text-sm text-nude-warm">
      Você está no ciclo de crescimento, mas o plano segue em manutenção de propósito: superávit calórico com a cintura acima de {CINTURA_LIBERA_SUPERAVIT_CM} cm deposita gordura na barriga, que é o que mais atrapalha a silhueta agora. O glúteo cresce em manutenção nesta fase. Registre uma medição nova pra liberar o superávit quando chegar lá.
    </p>
  </div>
)}
```

Importar `CINTURA_LIBERA_SUPERAVIT_CM` de `../../lib/meal-plan` e ler `activeCycle` com o hook `useSetting` já usado no projeto.

- [ ] **Step 6: Rodar a suíte e o build**

Run: `npm test && npm run build`
Expected: verde.

- [ ] **Step 7: Commit**

```bash
git add src/lib/meal-plan.ts src/pages/path/MealPlanView.tsx tests/lib/meal-plan-cintura.test.ts
git commit -m "fix(nutricao): superávit só é liberado com cintura <= 88 cm; sem medição, fica em manutenção"
```

---

## Self-Review

**Cobertura da spec (Blocos A, B, C1):**

| Requisito da spec | Task |
|---|---|
| A · três sub-fases com teto de exposição 2/3/4 | 1, 3 |
| A · threshold de 5 sessões cada | 1 |
| A · templates das 3 semanas | 3 |
| A · blocos máquina/solo reordenáveis | 4 |
| A · stiff com amplitude curta (flexibilidade) | 3 (notes de `e2-sex` e `e3-sex`) |
| A · leg press pés altos ajustável | 3 (notes de `e1-sex`) |
| A · graduação do hip thrust em duas etapas | 3 (notes de `e3-seg`) |
| B1 · búlgaro sai da Adaptação | 6 |
| B2 · dobradiça entra na Adaptação | 6 |
| B3 · puxada sai da Hipertrofia | 6 |
| B4 · peitoral leve na Hipertrofia | 6 |
| B5 · zona 2 explícita | 2, 6 |
| B6 · kettlebell no catálogo | 7 |
| C1 · superávit condicionado à cintura | 8 |
| Testes da seção "Testes" da spec | 1, 3, 4, 6, 8 |

Fora de escopo deste plano, conforme a spec: C2 (marcos honestos), C3 (passos e `activeBreakCount`), C4 (rotina do dia real), C5 (comida fácil de Aracaju), C6 (meta de sono) e todo o Bloco D (barba, voz, cabelo, postura, exame, medição). Cada um vira plano próprio.

**Placeholders:** nenhum. Todo step de código traz o código.

**Consistência de tipos:** `CycleId` (Task 1) é usado nas Tasks 3, 5 e 8. `ENTRADA_TEMPLATES` (Task 3) é consumido nas Tasks 4 e 5. `block` (Task 4) é usado no seed da Task 3 — a Task 3 Step 4 avisa dessa ordem e oferece a alternativa de antecipar a Task 4 Step 3. `cardio-zona2` (Task 2) é usado nas Tasks 3 e 6. `resolveGoal` e `CINTURA_LIBERA_SUPERAVIT_CM` (Task 8) são usados na `MealPlanView` do mesmo task.

**Nota de ordem de execução:** as Tasks 3 e 4 têm dependência cruzada (o seed usa `block`, que o modelo só ganha na Task 4). Executar Task 4 Step 3 antes de rodar os testes da Task 3, ou simplesmente executar a Task 4 imediatamente após a 3 sem rodar a suíte entre elas.
