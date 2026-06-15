# Treino + Hoje — Conteúdo completo e coerente · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar o pilar Treino e a tela Hoje autossuficientes e conectados ao objetivo da usuária — propósito por sessão, segurança/dor, progressão explicada, coerência de reps, troca da polia baixa por equipamento disponível, e uma tela honesta de horizontes (sem TRH / com TRH / BBL).

**Architecture:** App React + Vite + TypeScript, dados em IndexedDB via Dexie, semeados de `src/data/*-seed.ts` na carga (`src/lib/seed.ts`). Campos novos são opcionais → sem migração de schema; o reseed popula. UI reaproveita `GuideAccordion` e as classes da paleta amazona (`card`, `text-nude`, `text-nude-warm`, `text-muted`).

**Tech Stack:** React 18, react-router-dom 7, Dexie 4, Tailwind, Vitest + happy-dom + Testing Library + fake-indexeddb.

---

## File Structure

- `src/lib/db.ts` — adiciona `purpose?` em `WorkoutTemplate` e `successCue?` em `Exercise`.
- `src/data/exercises-seed.ts` — cria exercício `good-morning`; adiciona `successCue` nos exercícios de glúteo principais.
- `src/data/workout-plan-seed.ts` — troca polia baixa; adiciona `purpose` aos 5 templates.
- `src/data/cycles-seed.ts` — troca polia baixa; adiciona `purpose` aos 20 templates.
- `src/data/horizontes-seed.ts` — **novo**: conteúdo da tela "Até onde dá pra chegar" (`GuideSection[]`).
- `src/pages/workout/Horizontes.tsx` — **nova** página.
- `src/pages/workout/WorkoutHome.tsx` — entrada pra Horizontes.
- `src/pages/workout/SessionDetail.tsx` — propósito no topo + card "Antes de começar".
- `src/pages/workout/ProgressionHistory.tsx` — card "Quando aumentar a carga".
- `src/pages/workout/ExerciseDetail.tsx` — exibe `successCue` + explica "exposição X/5".
- `src/pages/workout/ExerciseLibrary.tsx` — legenda "exposição".
- `src/components/SessionRecorder.tsx` — exibe `successCue`.
- `src/pages/Today.tsx` — propósito no card do treino + micro-notas em Movimento/Postura/Apresentação.
- `src/main.tsx` — rota `/treino/horizontes`.
- `tests/data/*` e `tests/pages/*` — testes novos no padrão existente.

---

## Task 1: Campos novos no schema (`purpose`, `successCue`)

**Files:**
- Modify: `src/lib/db.ts:47-60` (WorkoutTemplate), `src/lib/db.ts:30-45` (Exercise)

- [ ] **Step 1: Adicionar `purpose` a WorkoutTemplate**

Em `src/lib/db.ts`, na interface `WorkoutTemplate`, após a linha `durationMin: number;`:

```ts
  durationMin: number;
  purpose?: string; // frase curta: o que esta sessão faz pelo objetivo da usuária
  cycle?: "adaptacao" | "variacao" | "hipertrofia" | "refinamento" | "manutencao";
```

- [ ] **Step 2: Adicionar `successCue` a Exercise**

Em `src/lib/db.ts`, na interface `Exercise`, após a linha `proTips?: string[];`:

```ts
  proTips?: string[]; // dicas pra maximizar resultado
  successCue?: string; // "fez certo se sentir X" — sensação-alvo
```

- [ ] **Step 3: Verificar typecheck**

Run: `npx tsc -b`
Expected: sem erros (campos opcionais não quebram dados existentes).

- [ ] **Step 4: Commit**

```bash
git add src/lib/db.ts
git commit -m "feat(treino): campos purpose (template) e successCue (exercicio)"
```

---

## Task 2: Criar `good-morning` e trocar a polia baixa nos seeds

A polia baixa é curta e inviabiliza coice e pull-through. Substituir **só os baixos**, mantendo `face-pull-polia` e `crucifixo-polia` (polia alta).
- `coice-gluteo-polia` → `kickback` (coice 4 apoios com caneleira, já existe em `exercises-seed.ts:487`).
- `pull-through-polia` → `good-morning` (novo, barra/halteres — dobradiça de quadril, glúteo + posterior).

`abducao-quadril-polia` existe no catálogo mas **não** é referenciado por nenhum template — não precisa troca.

**Files:**
- Modify: `src/data/exercises-seed.ts` (adicionar good-morning ao array `EXERCISES` e ao map `EXERCISE_VIDEOS`)
- Modify: `src/data/workout-plan-seed.ts:93-94`
- Modify: `src/data/cycles-seed.ts:77-78, 92, 179, 201, 350`
- Test: `tests/data/polia-troca.test.ts`

- [ ] **Step 1: Escrever o teste de integridade (falha primeiro)**

Create `tests/data/polia-troca.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import { EXERCISES } from "../../src/data/exercises-seed";

const allTemplates = [...WORKOUT_PLAN, ...CYCLE_TEMPLATES];
const referenced = allTemplates.flatMap((t) => t.exercises.map((e) => e.exerciseId));
const ids = new Set(EXERCISES.map((e) => e.id));

describe("troca da polia baixa", () => {
  it("não referencia mais os exercícios de polia baixa", () => {
    expect(referenced).not.toContain("coice-gluteo-polia");
    expect(referenced).not.toContain("pull-through-polia");
  });

  it("usa os substitutos com caneleira/barra", () => {
    expect(referenced).toContain("kickback");
    expect(referenced).toContain("good-morning");
  });

  it("todo exerciseId referenciado existe no catálogo", () => {
    const missing = [...new Set(referenced)].filter((id) => !ids.has(id));
    expect(missing).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npx vitest run tests/data/polia-troca.test.ts`
Expected: FAIL (good-morning não existe; ids de polia ainda referenciados).

- [ ] **Step 3: Criar o exercício `good-morning`**

Em `src/data/exercises-seed.ts`, dentro do array `EXERCISES` (junto aos exercícios de glúteo, ex.: logo após o objeto `stiff`), adicionar:

```ts
  {
    id: "good-morning",
    name: "Bom dia (good morning) com barra",
    category: "gluteo",
    equipment: ["barra", "halteres"],
    difficulty: "intermediario",
    description: "Barra leve apoiada nas costas (ou halteres no colo). Pés na largura do quadril, joelhos levemente flexionados. Empurra o quadril pra trás (dobradiça de quadril) descendo o tronco com a COLUNA RETA até sentir o alongamento atrás da coxa, depois sobe apertando o glúteo. 12-15 reps.",
    commonMistakes: [
      "Arredondar a coluna ao descer — mantém o peito aberto e a coluna neutra",
      "Dobrar muito o joelho (vira agachamento) — o movimento é do quadril indo pra trás",
      "Carga pesada demais — comece leve, é exercício de controle",
    ],
    easierVariation: "Stiff com halteres (amplitude menor)",
    harderVariation: "Aumentar levemente a carga mantendo a forma perfeita",
    exposureLevel: 2,
    successCue: "Fez certo se sentir o alongamento atrás da coxa na descida e o glúteo puxando na subida — nunca dor na lombar.",
    proTips: [
      "Substitui o pull-through da polia: mesma dobradiça de quadril, sem precisar da polia",
      "Respira fundo e trava o core antes de descer",
    ],
  },
```

- [ ] **Step 4: Registrar o vídeo do good-morning**

Em `src/data/exercises-seed.ts`, no map `EXERCISE_VIDEOS` (linha ~1084), adicionar a entrada:

```ts
  "good-morning": "https://www.youtube.com/watch?v=vKPGe8zb2S4",
```

- [ ] **Step 5: Trocar no plano base**

Em `src/data/workout-plan-seed.ts`, substituir as duas linhas (93-94):

```ts
      { exerciseId: "good-morning", sets: 3, repsTarget: "15", restSec: 45, notes: "Dobradiça de quadril — glúteo + posterior" },
      { exerciseId: "kickback", sets: 3, repsTarget: "15 cada", restSec: 30, notes: "Pico de glúteo — caneleira pesada, controla a volta" },
```

- [ ] **Step 6: Trocar nos ciclos**

Em `src/data/cycles-seed.ts`:
- Linha 77 (`pull-through-polia`) →
  ```ts
      { exerciseId: "good-morning", sets: 3, repsTarget: "12-15", restSec: 60, notes: "Dobradiça de quadril — estímulo novo do ciclo" },
  ```
- Linhas 78, 92, 350 (`coice-gluteo-polia`, "Pico de glúteo com tensão constante") → cada uma vira:
  ```ts
      { exerciseId: "kickback", sets: 3, repsTarget: "15 cada", restSec: 30, notes: "Pico de glúteo — caneleira pesada, controla a volta" },
  ```
- Linha 179 (`coice-gluteo-polia`, sets 4, "Tensão constante na polia") →
  ```ts
      { exerciseId: "kickback", sets: 4, repsTarget: "15 cada", restSec: 30, notes: "Pico de glúteo — caneleira pesada" },
  ```
- Linha 201 (`coice-gluteo-polia`, sets 4 reps "20 cada", "Densidade — tensão constante na polia") →
  ```ts
      { exerciseId: "kickback", sets: 4, repsTarget: "20 cada", restSec: 30, notes: "Densidade — caneleira, alta repetição" },
  ```

(Confira por busca: após a edição não pode restar `coice-gluteo-polia` nem `pull-through-polia` em `cycles-seed.ts` nem `workout-plan-seed.ts`.)

- [ ] **Step 7: Rodar o teste e ver passar**

Run: `npx vitest run tests/data/polia-troca.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/data/exercises-seed.ts src/data/workout-plan-seed.ts src/data/cycles-seed.ts tests/data/polia-troca.test.ts
git commit -m "feat(treino): troca polia baixa por caneleira/good-morning + teste de integridade"
```

---

## Task 3: Propósito da sessão em todos os templates

**Files:**
- Modify: `src/data/workout-plan-seed.ts` (5 templates), `src/data/cycles-seed.ts` (20 templates)
- Test: `tests/data/template-purpose.test.ts`

- [ ] **Step 1: Escrever o teste (falha primeiro)**

Create `tests/data/template-purpose.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";

const all = [...WORKOUT_PLAN, ...CYCLE_TEMPLATES];

describe("propósito da sessão", () => {
  it("todo template tem purpose não-vazio", () => {
    const semProposito = all.filter((t) => !t.purpose || t.purpose.trim().length < 10).map((t) => t.id);
    expect(semProposito).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/data/template-purpose.test.ts`
Expected: FAIL (nenhum purpose definido ainda).

- [ ] **Step 3: Preencher `purpose` no plano base**

Em cada objeto template de `src/data/workout-plan-seed.ts`, adicionar a propriedade `purpose` logo após `cycle:`. Valores por id:

| id | purpose |
|---|---|
| `seg-gluteo-mobilidade` | `"Hoje é glúteo pesado: construir a base de músculo que dá volume e forma ao bumbum — a fundação que a TRH vai arredondar depois."` |
| `ter-cintura-costas` | `"Hoje afina a cintura e cuida da postura e do busto, com carga leve pra deixar o tronco elegante sem engrossar."` |
| `qua-mobilidade-danca` | `"Hoje solta o quadril e trabalha o glúteo médio — o que arredonda a lateral do bumbum e dá o gingado."` |
| `qui-gluteo-coxa` | `"Hoje é glúteo e coxa um lado de cada vez: corrige assimetria e deixa as pernas mais cheias e femininas."` |
| `sex-peitoral-postura` | `"Hoje é bombeamento de glúteo (muita repetição) + core que segura a cintura fina."` |

Exemplo de aplicação (primeiro template):

```ts
    cycle: "adaptacao",
    purpose: "Hoje é glúteo pesado: construir a base de músculo que dá volume e forma ao bumbum — a fundação que a TRH vai arredondar depois.",
    exercises: [
```

- [ ] **Step 4: Preencher `purpose` nos ciclos**

Em `src/data/cycles-seed.ts`, adicionar `purpose` após `cycle:` em cada template. Valores por id:

| id | purpose |
|---|---|
| `v-seg-gluteo-unilateral` | `"Glúteo pesado com exercícios novos — mesmo objetivo de volume, estímulo diferente pra não estagnar."` |
| `v-ter-cintura-costas` | `"Cintura e postura com variação leve — tronco feminino sem engrossar."` |
| `v-qua-mobilidade-danca` | `"Quadril solto + glúteo médio — gingado e lateral arredondada."` |
| `v-qui-gluteo-stiff` | `"Foco no posterior e no glúteo pela dobradiça de quadril — bumbum e parte de trás da coxa."` |
| `v-sex-peitoral-postura` | `"Volume de glúteo em alta repetição — bomba de sangue que enche o músculo."` |
| `h-seg-gluteo-volume` | `"Fase de ouro do glúteo: empurra a carga, é agora que ele cresce de verdade."` |
| `h-ter-cintura-costas` | `"Superior e cintura em volume — postura forte que valoriza o busto."` |
| `h-qua-mobilidade-danca` | `"Mobilidade + glúteo médio no volume — mantém o quadril solto enquanto cresce."` |
| `h-qui-gluteo-posterior` | `"Glúteo e posterior pesados — coxa cheia e bumbum projetado."` |
| `h-sex-peitoral-postura` | `"Mais volume de glúteo e coxa — aproveita a fase de crescimento ao máximo."` |
| `r-seg-gluteo-densidade` | `"Densidade do glúteo: muita repetição pra deixar o músculo durinho e desenhado."` |
| `r-ter-cintura-postura` | `"Cintura e postura — refina a silhueta e levanta o busto."` |
| `r-qua-mobilidade-danca` | `"Mobilidade livre + glúteo médio — fluidez e lateral redonda."` |
| `r-qui-gluteo-simetria` | `"Glúteo um lado de cada vez — corrige diferença entre os lados pra ficar simétrico."` |
| `r-sex-peitoral-refinamento` | `"Densidade de glúteo + core — acabamento da forma."` |
| `m-seg-gluteo` | `"Manutenção do glúteo: segura o que você construiu sem forçar — base pronta pra TRH arredondar."` |
| `m-ter-superior` | `"Mantém postura e cintura — silhueta firme com pouco volume."` |
| `m-qua-mobilidade` | `"Mobilidade + glúteo médio leve — mantém o quadril solto e a lateral."` |
| `m-qui-gluteo` | `"Manutenção do glúteo unilateral — preserva simetria e coxa."` |
| `m-sex-gluteo` | `"Bombeamento leve de glúteo — mantém o músculo ativo e cheio."` |

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run tests/data/template-purpose.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/workout-plan-seed.ts src/data/cycles-seed.ts tests/data/template-purpose.test.ts
git commit -m "feat(treino): proposito conectado ao objetivo em todos os templates"
```

---

## Task 4: `successCue` nos exercícios de glúteo + exibição

**Files:**
- Modify: `src/data/exercises-seed.ts` (5 exercícios)
- Modify: `src/pages/workout/ExerciseDetail.tsx:52` (após Dicas)
- Modify: `src/components/SessionRecorder.tsx:138-142`

- [ ] **Step 1: Adicionar `successCue` aos exercícios principais**

Em `src/data/exercises-seed.ts`, adicionar a propriedade `successCue` nos seguintes objetos (good-morning já recebeu na Task 2):

```ts
// hip-thrust-barra:
successCue: "Fez certo se sentir o glúteo apertando no topo — não a lombar nem só a coxa.",
// smith-squat (leg press pés altos):
successCue: "Fez certo se sentir o glúteo e a parte de trás da coxa empurrando — não o joelho.",
// stiff:
successCue: "Fez certo se sentir o alongamento atrás da coxa e o glúteo puxando na subida — coluna sempre reta.",
// agachamento-bulgaro:
successCue: "Fez certo se o glúteo da perna da frente queimar — peso no calcanhar.",
// abdutor-maquina:
successCue: "Fez certo se sentir a lateral do bumbum (glúteo médio) abrir — sem jogar o tronco.",
```

- [ ] **Step 2: Exibir no ExerciseDetail**

Em `src/pages/workout/ExerciseDetail.tsx`, após o bloco de "Dicas pra maximizar" (fecha na linha 52) e antes do bloco de Equipamento (linha 54), inserir:

```tsx
      {ex.successCue && (
        <div className="card mb-3 border-nude/40">
          <h2 className="text-nude-warm font-medium mb-2">Como saber que fez certo</h2>
          <p className="text-sm">{ex.successCue}</p>
        </div>
      )}
```

- [ ] **Step 3: Exibir no SessionRecorder**

Em `src/components/SessionRecorder.tsx`, logo após o bloco `isHoldLight(...)` (linha 140-142) e antes da sugestão de carga, inserir:

```tsx
      {exercise.successCue && (
        <p className="text-xs text-nude/80 mb-2">✦ {exercise.successCue}</p>
      )}
```

- [ ] **Step 4: Verificar typecheck**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/data/exercises-seed.ts src/pages/workout/ExerciseDetail.tsx src/components/SessionRecorder.tsx
git commit -m "feat(treino): sensacao-alvo (successCue) nos exercicios de gluteo"
```

---

## Task 5: Tela Hoje — propósito do treino + micro-notas

**Files:**
- Modify: `src/pages/Today.tsx:202-211` (card do treino), `:254-277` (Movimento/Postura/Apresentação)
- Test: `tests/pages/today-treino.smoke.test.tsx` (ajuste/assert novo)

- [ ] **Step 1: Mostrar `purpose` no card do treino do dia**

Em `src/pages/Today.tsx`, no bloco `todayTemplate ? (...)`, adicionar a prop `note` ao `TodayCard` do treino:

```tsx
        <TodayCard
          title={todayTemplate.name}
          subtitle={`Treino · ${todayTemplate.durationMin} min · ${(sessionsToday ?? 0) > 0 ? "concluído ✓" : "ainda não feito"}`}
          note={todayTemplate.purpose}
          to={`/treino/sessao/${todayTemplate.id}`}
          variant={(sessionsToday ?? 0) > 0 ? "default" : "highlight"}
        />
```

(Confirme que `TodayCard` aceita `note` — já é usado no card de Caminhada em `Today.tsx:230`.)

- [ ] **Step 2: Micro-nota em Movimento, Postura e Apresentação**

Em `src/pages/Today.tsx`, adicionar `note` aos três cards:

```tsx
// Movimento (bloco suggestedSeq):
          note="Solta o quadril e treina o gingado — mobilidade que dá fluidez feminina"
// Postura:
        note="Alinhamento que feminiliza a silhueta na hora — ombro pra trás, peito aberto"
// Apresentação (bloco apresentacaoSeq):
          note="Gestos, olhar e caminhada — a feminilização que aparece antes mesmo da TRH"
```

- [ ] **Step 3: Adicionar assert ao smoke test**

Em `tests/pages/today-treino.smoke.test.tsx`, garantir que o propósito aparece quando há treino do dia. Adicionar (dentro do teste que renderiza com um template do dia) um assert no padrão já usado no arquivo:

```tsx
expect(await screen.findByText(/glúteo|cintura|quadril/i)).toBeInTheDocument();
```

(Se a estrutura do arquivo diferir, seguir o padrão de render/seed já presente nele; o objetivo é apenas provar que `purpose` é renderizado.)

- [ ] **Step 4: Rodar o smoke test**

Run: `npx vitest run tests/pages/today-treino.smoke.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Today.tsx tests/pages/today-treino.smoke.test.tsx
git commit -m "feat(hoje): proposito do treino do dia + micro-notas conectadas ao objetivo"
```

---

## Task 6: Sessão — propósito no topo + "Antes de começar"

**Files:**
- Modify: `src/pages/workout/SessionDetail.tsx:42-48`
- Test: `tests/pages/workout-session.smoke.test.tsx` (assert novo)

- [ ] **Step 1: Importar GuideAccordion**

Em `src/pages/workout/SessionDetail.tsx`, adicionar ao topo:

```tsx
import { GuideAccordion } from "../../components/GuideAccordion";
```

- [ ] **Step 2: Mostrar propósito + card de segurança**

Em `src/pages/workout/SessionDetail.tsx`, logo após o `<div>` do cabeçalho (após a linha 47 `</div>`) e antes do `{template.exercises.map(...)}`, inserir:

```tsx
      {template.purpose && (
        <p className="text-sm text-nude/90 mb-3">✦ {template.purpose}</p>
      )}

      <GuideAccordion
        className="mb-4"
        sections={[
          {
            id: "antes-de-comecar",
            title: "Antes de começar",
            intro: "Dois minutos que evitam lesão e fazem o treino render mais.",
            tips: [
              "Aqueça: 5-7 min de esteira leve + mobilidade articular (os dois primeiros itens do treino já fazem isso).",
              "Regra de ouro da dor: queimação e fadiga no músculo = normal, pode seguir. Dor aguda, em articulação ou uma fisgada = PARE na hora.",
              "Forma antes de carga: só sobe o peso quando o movimento sai redondo.",
              "Respira: solta o ar no esforço, puxa na volta.",
            ],
          },
        ]}
      />
```

- [ ] **Step 3: Assert no smoke test**

Em `tests/pages/workout-session.smoke.test.tsx`, adicionar assert de que "Antes de começar" aparece:

```tsx
expect(await screen.findByText(/Antes de começar/i)).toBeInTheDocument();
```

- [ ] **Step 4: Rodar o smoke test**

Run: `npx vitest run tests/pages/workout-session.smoke.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/workout/SessionDetail.tsx tests/pages/workout-session.smoke.test.tsx
git commit -m "feat(treino): proposito + card 'Antes de comecar' (aquecimento e regra da dor) na sessao"
```

---

## Task 7: Progressão — "Quando aumentar a carga"

**Files:**
- Modify: `src/pages/workout/ProgressionHistory.tsx:33-34`

- [ ] **Step 1: Importar GuideAccordion**

Em `src/pages/workout/ProgressionHistory.tsx`, adicionar:

```tsx
import { GuideAccordion } from "../../components/GuideAccordion";
```

- [ ] **Step 2: Inserir o card explicativo**

Em `src/pages/workout/ProgressionHistory.tsx`, logo após o `<div>` do cabeçalho (após a linha 33 `</div>`) e antes do `<div className="card mb-3">` do seletor, inserir:

```tsx
      <GuideAccordion
        className="mb-3"
        sections={[
          {
            id: "quando-subir",
            title: "Quando aumentar a carga",
            intro: "A bunda cresce quando o estímulo aumenta com o tempo — mas no ritmo certo.",
            tips: [
              "Completou todas as séries e reps com forma boa e ainda sobrou fôlego? Sobe o menor incremento (1-2 kg ou o próximo furo) no próximo treino.",
              "Não fechou as reps ou a forma piorou? Mantém a carga até dominar.",
              "Doeu articulação ou lombar? Baixa a carga e revê a técnica.",
              "Não precisa subir todo treino — semana sim, semana não já é progresso ótimo.",
            ],
          },
        ]}
      />
```

- [ ] **Step 3: Verificar typecheck + build**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/pages/workout/ProgressionHistory.tsx
git commit -m "feat(treino): card 'Quando aumentar a carga' na Progressao"
```

---

## Task 8: Explicar "exposição X/5"

**Files:**
- Modify: `src/pages/workout/ExerciseDetail.tsx:24-26`
- Modify: `src/pages/workout/ExerciseLibrary.tsx:32-33`

- [ ] **Step 1: Legenda no detalhe do exercício**

Em `src/pages/workout/ExerciseDetail.tsx`, substituir o parágrafo da linha 24-26 por:

```tsx
      <p className="text-muted text-xs mb-1">
        {ex.category} · {ex.difficulty} · exposição {ex.exposureLevel}/5
      </p>
      <p className="text-muted text-[0.7rem] mb-4">
        Exposição = quanto o corpo fica à mostra pra fazer o exercício (1 = discreto, dá pra fazer em casa; 5 = bem aparente na academia).
      </p>
```

- [ ] **Step 2: Nota curta na Biblioteca**

Em `src/pages/workout/ExerciseLibrary.tsx`, logo após o `<div>` do cabeçalho (após a linha 33 `</div>`) e antes do filtro de categorias, inserir:

```tsx
      <p className="text-muted text-[0.7rem] mb-3">
        "Exposição X/5" = quão à mostra o corpo fica no exercício (1 discreto → 5 aparente).
      </p>
```

- [ ] **Step 3: Verificar typecheck**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/pages/workout/ExerciseDetail.tsx src/pages/workout/ExerciseLibrary.tsx
git commit -m "feat(treino): explica o que e 'exposicao X/5'"
```

---

## Task 9: Tela "Até onde dá pra chegar" (horizontes)

**Files:**
- Create: `src/data/horizontes-seed.ts`
- Create: `src/pages/workout/Horizontes.tsx`
- Modify: `src/main.tsx` (import + rota)
- Modify: `src/pages/workout/WorkoutHome.tsx` (card de entrada)
- Test: `tests/data/horizontes-seed.test.ts`

- [ ] **Step 1: Teste do conteúdo (falha primeiro)**

Create `tests/data/horizontes-seed.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { HORIZONTES } from "../../src/data/horizontes-seed";

describe("horizontes de resultado", () => {
  it("tem as três etapas", () => {
    const ids = HORIZONTES.map((s) => s.id);
    expect(ids).toContain("sem-trh");
    expect(ids).toContain("com-trh");
    expect(ids).toContain("bbl-mama");
  });

  it("cada etapa tem dicas", () => {
    expect(HORIZONTES.every((s) => s.tips.length >= 3)).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/data/horizontes-seed.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Criar o seed de conteúdo**

Create `src/data/horizontes-seed.ts`:

```ts
import type { GuideSection } from "../components/GuideAccordion";

// Horizontes realistas de resultado corporal. Honesto pra não iludir, encorajador
// pra motivar. Os números de WHR (cintura/quadril) são estimativas, não promessas.
export const HORIZONTES: GuideSection[] = [
  {
    id: "sem-trh",
    title: "Etapa 1 — agora, sem TRH",
    intro: "O que dá pra conquistar só com treino e dieta, antes da hormonização.",
    tips: [
      "Corpo mais atlético, cintura mais marcada que hoje e glúteo maior — porém firme (sem estrogênio a gordura não migra pro quadril).",
      "Maior ganho imediato: perder a barriga. Só isso já faz a cintura aparecer.",
      "Estimativa de WHR (cintura÷quadril): de ~0,90 hoje pra ~0,83-0,85.",
      "A seu favor: ombros de largura moderada e 1,73 m ajudam muito na proporção.",
      "Tudo que você construir de glúteo agora vira a base pras próximas etapas — não é trabalho perdido, é investimento.",
    ],
  },
  {
    id: "com-trh",
    title: "Etapa 2 — depois, com TRH",
    intro: "Quando a hormonização entrar, o corpo muda de verdade.",
    tips: [
      "O estrogênio redistribui a gordura: sai do abdômen e vai pro quadril, coxa, glúteo e peito; a pele afina e amacia.",
      "O glúteo treinado agora vira a estrutura — a gordura macia se deposita por cima e o resultado fica natural e bonito.",
      "Estimativa de WHR: ~0,75-0,78, melhor ainda com a massa muscular que você já tiver.",
      "A mama desenvolve tecido glandular (modesto e variável, mas real).",
    ],
  },
  {
    id: "bbl-mama",
    title: "Etapa 3 — com BBL + prótese de mama",
    intro: "O teto estético, se quiser ir por cirurgia.",
    tips: [
      "BBL enxerta gordura no glúteo (volume, projeção, maciez) e costuma vir com lipo de cintura junto.",
      "Sobre glúteo já treinado, o cirurgião tem mais com o que trabalhar — resultado mais natural e durável.",
      "Prótese define o busto no tamanho que você escolher.",
      "Aí sim ampulheta plena: estimativa de WHR ~0,65-0,70.",
    ],
  },
];
```

- [ ] **Step 4: Criar a página**

Create `src/pages/workout/Horizontes.tsx`:

```tsx
import { Link } from "react-router-dom";
import { GuideAccordion } from "../../components/GuideAccordion";
import { HORIZONTES } from "../../data/horizontes-seed";

export function Horizontes() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino" className="text-muted text-sm">&larr; Treino</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Até onde dá pra chegar</h1>
      </div>
      <p className="text-muted text-sm mb-4">
        Três horizontes do seu corpo, com sinceridade pra não te iludir e carinho pra te motivar.
        O fio condutor: <span className="text-nude-warm">perder a barriga e construir glúteo agora</span> é
        pré-requisito de tudo — melhora o presente e multiplica o resultado da TRH e de uma cirurgia, se você quiser.
      </p>
      <GuideAccordion sections={HORIZONTES} />
      <p className="text-muted text-[0.7rem] mt-4">
        Os números de WHR são estimativas pra dar um norte — cada corpo responde do seu jeito.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Registrar a rota**

Em `src/main.tsx`, adicionar o import junto aos outros de workout:

```tsx
import { Horizontes } from "./pages/workout/Horizontes";
```

E a rota, junto às demais de `treino/...`:

```tsx
        { path: "treino/horizontes", element: <Horizontes /> },
```

- [ ] **Step 6: Card de entrada no WorkoutHome**

Em `src/pages/workout/WorkoutHome.tsx`, adicionar como primeiro card (logo após o `<h1>`):

```tsx
      <Link to="/treino/horizontes" className="card block hover:border-nude/40 transition border-nude/40">
        <h3 className="text-nude-warm font-medium">Até onde dá pra chegar ✦</h3>
        <p className="text-muted text-sm mt-1">Seus horizontes: agora, com TRH e com cirurgia — honesto e motivador</p>
      </Link>
```

- [ ] **Step 7: Rodar o teste do seed e o typecheck**

Run: `npx vitest run tests/data/horizontes-seed.test.ts && npx tsc -b`
Expected: PASS + sem erros de tipo.

- [ ] **Step 8: Commit**

```bash
git add src/data/horizontes-seed.ts src/pages/workout/Horizontes.tsx src/main.tsx src/pages/workout/WorkoutHome.tsx tests/data/horizontes-seed.test.ts
git commit -m "feat(treino): tela 'Ate onde da pra chegar' (horizontes sem TRH / com TRH / BBL)"
```

---

## Task 10: Verificação final

- [ ] **Step 1: Suíte completa**

Run: `npm test`
Expected: todos os testes passam (incluindo os existentes `templates-warmup-gluteo`, smoke tests etc.).

- [ ] **Step 2: Build de produção**

Run: `npm run build`
Expected: build conclui sem erros de tipo nem de bundling.

- [ ] **Step 3: Conferência manual rápida (opcional, recomendado)**

Run: `npm run dev` e verificar: tela Hoje mostra o propósito no card do treino; a sessão mostra "Antes de começar"; Progressão tem "Quando aumentar a carga"; Biblioteca/Detalhe explicam "exposição"; `/treino/horizontes` abre com as três etapas; nenhum exercício de polia baixa aparece nos treinos.

- [ ] **Step 4: Commit final (se houver ajustes da conferência)**

```bash
git add -A
git commit -m "chore(treino): ajustes finais da fatia Treino + Hoje"
```

---

## Self-Review

**Spec coverage:**
- §1 Propósito da sessão → Task 1 (campo), Task 3 (conteúdo), Task 5 (Hoje), Task 6 (sessão). ✓
- §2 Cards de Hoje conectados → Task 5. ✓ (Caminhada já tem nota; Movimento/Postura/Apresentação adicionados.)
- §3 Segurança & aquecimento → Task 6. ✓
- §4 Quando aumentar a carga → Task 7. ✓
- §5 Coerência de séries/reps → coberta implicitamente: a sessão (`SessionRecorder`) já é a fonte real exibida; `ExerciseDetail` não exibe séries/reps fixas, então não há contradição numérica a corrigir lá. **Nota:** o spec mencionava rotular a biblioteca — verificado que `ExerciseDetail`/`ExerciseCard` não mostram reps/sets, logo não há número conflitante; nenhum trabalho extra necessário. Se durante a execução aparecer reps fixas exibidas, adicionar a etiqueta "faixa de referência".
- §6 exposição X/5 + successCue → Task 8 + Task 4. ✓
- §7 Troca polia baixa → Task 2. ✓
- §8 Tela "Até onde dá pra chegar" → Task 9. ✓

**Placeholder scan:** sem TBD/TODO; todo passo de código mostra o código; textos reais (purposes, cues, horizontes) inclusos.

**Type consistency:** `purpose?: string` e `successCue?: string` usados consistentemente; `GuideSection` reaproveitado conforme `GuideAccordion.tsx`; ids de exercício batem com `exercises-seed.ts`.
