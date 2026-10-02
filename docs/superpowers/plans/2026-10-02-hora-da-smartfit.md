# Hora da Smartfit (entrega C) Implementation Plan

> **Nota (execução):** o búlgaro ficou fora da adaptação (regra da revisão de 2026-07-27); onde este plano fala em 'leve na adaptação', vale a spec.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** o app aprende o teto de carga do prédio no uso, ensina o que fazer no teto, avisa a hora da Smartfit, põe o lado fraco primeiro nos unilaterais e coloca o agachamento búlgaro no treino.

**Architecture:** dois settings novos (`tetoPredio`, `ladoFraco`); um módulo puro `src/lib/teto-predio.ts` (teto, táticas, progresso, unilateral); a UI fica no `SessionRecorder` (onde a carga é sugerida), num card do Hoje e numa linha do Treino; o búlgaro entra pelos seeds com bump de versão.

**Tech Stack:** React 18 + TypeScript, Dexie, Vitest + Testing Library (happy-dom), Tailwind.

**Spec:** `docs/superpowers/specs/2026-10-02-hora-da-smartfit-design.md`

## Global Constraints

- pt-BR com acentuação correta; fala com ela por "você"; comentários explicam o porquê.
- Ombro nunca é treinado; nada aqui adiciona exercício de ombro.
- Toda sessão ≤ 60 min e `durationMin` = `estimarDuracaoMin` (há teste). As faixas de volume da fase 1 (`tests/data/fase1-chun-li.test.ts`) continuam verdes.
- Seed mudou → `EXERCISE_SEED_VERSION` e `TEMPLATE_SEED_VERSION` sobem (+1 cada) e os pinos em `tests/lib/seeds-chegam-no-aparelho.test.ts` acompanham.
- Ids de template e de exercício existentes não mudam (o histórico dela aponta pra eles).
- Módulo `teto-predio.ts` puro: sem `db`, sem `new Date()`.
- Teste de tela aguarda estado carregado.
- `npm run test`, `npm run build`, `npm run build:app` limpos. Branch `feat/smartfit`; nunca `git push`.

## Review Focus

- Exercício de peso corporal (sem sugestão de carga) → nenhum botão de teto aparece. (Task 3)
- Teto gravado e depois o aparelho ganha peso → o link "o aparelho tem mais peso" desfaz e a sugestão volta. (Task 3)
- Exercício com "cada" mas bilateral (prancha "6 trocas cada lado") → não pergunta lado. (Task 2/4)
- Teto em exercícios fora da chave → não conta para a Smartfit. (Task 2)
- Primeira vez num exercício (sem histórico) → sem botão de teto (não há carga anterior). (Task 3)

---

### Task 1: Búlgaro no treino

**Files:**
- Modify: `src/data/exercises-seed.ts` (`agachamento-bulgaro`)
- Modify: `src/data/workout-plan-seed.ts` (`qua-mobilidade-danca`)
- Modify: `src/data/cycles-seed.ts` (`v-qua-mobilidade-danca`)
- Modify: `src/lib/seed.ts` (`EXERCISE_SEED_VERSION` 12→13, `TEMPLATE_SEED_VERSION` 14→15, com linha de histórico no comentário de cada)
- Modify: `tests/lib/seeds-chegam-no-aparelho.test.ts` (pinos)
- Test: `tests/data/bulgaro.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/data/bulgaro.test.ts
import { describe, it, expect } from "vitest";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";
import { EXERCISES } from "../../src/data/exercises-seed";
import { estimarDuracaoMin } from "../../src/lib/session-duration";

const tpl = (id: string) => [...WORKOUT_PLAN, ...CYCLE_TEMPLATES].find((t) => t.id === id)!;
const ex = (t: ReturnType<typeof tpl>, id: string) => t.exercises.find((e) => e.exerciseId === id);

describe("búlgaro (entrega C)", () => {
  it("entra leve na adaptação de quarta, pra aprender", () => {
    expect(ex(tpl("qua-mobilidade-danca"), "agachamento-bulgaro")).toMatchObject({ sets: 2, repsTarget: "8 cada", block: "solo" });
  });

  it("substitui o goblet na variação de quarta; o goblet fica no Inferior A", () => {
    const qua = tpl("v-qua-mobilidade-danca");
    expect(ex(qua, "agachamento-bulgaro")).toMatchObject({ sets: 3, repsTarget: "10-12 cada" });
    expect(ex(qua, "agachamento-goblet")).toBeUndefined();
    expect(ex(tpl("v-seg-gluteo-unilateral"), "agachamento-goblet")).toBeDefined();
  });

  it("as duas sessões continuam em até 60 min, com a duração do estimador", () => {
    for (const id of ["qua-mobilidade-danca", "v-qua-mobilidade-danca"]) {
      const t = tpl(id);
      expect({ id, d: t.durationMin }).toEqual({ id, d: estimarDuracaoMin(t) });
      expect(t.durationMin).toBeLessThanOrEqual(60);
    }
  });

  it("a descrição tem viés de glúteo e o lado fraco primeiro", () => {
    const b = EXERCISES.find((e) => e.id === "agachamento-bulgaro")!;
    expect(b.description).toMatch(/levemente inclinado/);
    expect(b.description).toMatch(/lado mais fraco/);
    expect(b.commonMistakes.join(" ")).not.toMatch(/Inclinar tronco demais pra frente/);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/data/bulgaro.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Em `agachamento-bulgaro` (`exercises-seed.ts`), troque `description` e `commonMistakes` por:

```ts
    description: "Pé de trás apoiado no banco (peito do pé), passada longa, halteres nas mãos. Tronco levemente inclinado pra frente e o peso no calcanhar da frente: é isso que leva o trabalho pro glúteo. Desce até a coxa da frente ficar paralela e sobe empurrando o calcanhar. Começa pelo lado mais fraco; o lado forte faz as mesmas repetições.",
    commonMistakes: [
      "Tronco ereto demais (vira exercício de coxa) ou inclinado demais (a lombar reclama)",
      "Passada curta: o joelho da frente passa muito da ponta do pé",
      "Empurrar com a ponta do pé em vez do calcanhar",
    ],
```

Em `qua-mobilidade-danca` (`workout-plan-seed.ts`), logo depois de `adutora-maquina`:

```ts
      { exerciseId: "agachamento-bulgaro", sets: 2, repsTarget: "8 cada", restSec: 60, block: "solo", notes: "Aprendendo: sem peso ou halter leve. Glúteo da frente trabalhando, peso no calcanhar. Lado mais fraco primeiro" },
```

Em `v-qua-mobilidade-danca` (`cycles-seed.ts`), troque a linha de `agachamento-goblet` por:

```ts
      { exerciseId: "agachamento-bulgaro", sets: 3, repsTarget: "10-12 cada", restSec: 75, block: "solo", notes: "Metade da carga do goblet e o dobro do trabalho por perna — e o prédio dura mais antes do teto" },
```

Atualize `durationMin` das duas sessões para `estimarDuracaoMin` (rode o estimador num script ou leia o valor que o teste imprime ao falhar). Em `src/lib/seed.ts`, `EXERCISE_SEED_VERSION` 12 → 13 e `TEMPLATE_SEED_VERSION` 14 → 15, cada um com uma linha de histórico ("v13/v15: búlgaro com viés de glúteo; entra na quarta (entrega C, 2026-10-02)"). Pinos no teste de chegada → 13 e 15.

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/data tests/lib/seeds-chegam-no-aparelho.test.ts`
Expected: PASS (incluindo `fase1-chun-li.test.ts` — faixas, adaptação ≤ variação, blocos contíguos). Se uma faixa de volume quebrar, **pare e reporte** com os números.

- [ ] **Step 5: Commit**

```bash
git add src/data/exercises-seed.ts src/data/workout-plan-seed.ts src/data/cycles-seed.ts src/lib/seed.ts tests/lib/seeds-chegam-no-aparelho.test.ts tests/data/bulgaro.test.ts
git commit -m "feat(treino): agachamento búlgaro com viés de glúteo — leve na adaptação, no lugar do goblet na variação"
```

---

### Task 2: Módulo do teto + settings

**Files:**
- Create: `src/lib/teto-predio.ts`
- Modify: `src/lib/settings-helpers.ts` (`Settings` + `DEFAULTS`: `tetoPredio`, `ladoFraco`)
- Test: `tests/lib/teto-predio.test.ts`

**Interfaces:**
- Produces: `EXERCICIOS_CHAVE: readonly string[]`; `noTeto(sugerido: number, teto?: number): boolean`; `TATICAS_NO_TETO: readonly string[]`; `taticasNoTeto(repsTarget: string): string[]`; `progressoTeto(tetos: Record<string, number>): { noTeto: number; total: number; todos: boolean }`; `ehUnilateral(repsTarget: string): boolean`; `type LadoFraco = "" | "esquerdo" | "direito"`; settings `tetoPredio: Record<string, number>` (padrão `{}`), `ladoFraco: LadoFraco` (padrão `""`).

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/lib/teto-predio.test.ts
import { describe, it, expect } from "vitest";
import { noTeto, progressoTeto, taticasNoTeto, ehUnilateral, EXERCICIOS_CHAVE } from "../../src/lib/teto-predio";
import { DEFAULTS } from "../../src/lib/settings-helpers";
import { EXERCISES } from "../../src/data/exercises-seed";

describe("teto do prédio", () => {
  it("só está no teto quando há teto e a sugestão passa dele", () => {
    expect(noTeto(30, undefined)).toBe(false);
    expect(noTeto(30, 30)).toBe(false);
    expect(noTeto(32, 30)).toBe(true);
  });

  it("progresso conta só os exercícios-chave", () => {
    expect(progressoTeto({ "rosca-martelo": 12 })).toEqual({ noTeto: 0, total: 4, todos: false });
    const todos = Object.fromEntries(EXERCICIOS_CHAVE.map((id) => [id, 40]));
    expect(progressoTeto(todos)).toEqual({ noTeto: 4, total: 4, todos: true });
  });

  it("os exercícios-chave existem no catálogo", () => {
    for (const id of EXERCICIOS_CHAVE) expect(EXERCISES.some((e) => e.id === id)).toBe(true);
  });

  it("táticas: as três sempre; a unilateral só pra exercício bilateral", () => {
    expect(taticasNoTeto("10-12")).toHaveLength(4);
    expect(taticasNoTeto("10-12 cada")).toHaveLength(3);
    expect(taticasNoTeto("10-12").join(" ")).toMatch(/2 s/);
  });

  it("unilateral = 'cada', menos as trocas da prancha", () => {
    expect(ehUnilateral("12 cada")).toBe(true);
    expect(ehUnilateral("10-12 cada")).toBe(true);
    expect(ehUnilateral("6 trocas cada lado")).toBe(false);
    expect(ehUnilateral("10-12")).toBe(false);
  });

  it("padrões: sem teto e sem lado", () => {
    expect(DEFAULTS.tetoPredio).toEqual({});
    expect(DEFAULTS.ladoFraco).toBe("");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/teto-predio.test.ts` — Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar**

```ts
// src/lib/teto-predio.ts
// O teto de carga da academia do prédio, aprendido no uso. Módulo puro.
//
// A troca pra Smartfit acontece quando ela bater a carga máxima do prédio —
// e ela não sabe quanto é (2026-10-02). Então o app aprende: quando ele sugere
// subir e o aparelho não tem mais, ela toca "não tem mais peso aqui".

/** Os que constroem glúteo e coxa e mais vão pedir carga. Quando os quatro
 *  estiverem no teto, as táticas não seguram o crescimento por muito tempo. */
export const EXERCICIOS_CHAVE = ["hip-thrust-barra", "leg-press-pes-medios", "abdutor-maquina", "agachamento-bulgaro"] as const;

export type LadoFraco = "" | "esquerdo" | "direito";

export function noTeto(sugerido: number, teto?: number): boolean {
  return teto !== undefined && sugerido > teto;
}

export const TATICAS_NO_TETO = [
  "Faz 2 repetições acima do topo da faixa antes de pensar em carga.",
  "Segura 2 s na contração de cada repetição.",
  "Desce em 4 s — a descida lenta é trabalho que a carga não dá.",
] as const;

const TATICA_UNILATERAL = "Troca pela versão de uma perna (ou um braço): a mesma carga vira quase o dobro.";

export function taticasNoTeto(repsTarget: string): string[] {
  return ehUnilateral(repsTarget) ? [...TATICAS_NO_TETO] : [...TATICAS_NO_TETO, TATICA_UNILATERAL];
}

export function progressoTeto(tetos: Record<string, number>): { noTeto: number; total: number; todos: boolean } {
  const n = EXERCICIOS_CHAVE.filter((id) => tetos[id] !== undefined).length;
  return { noTeto: n, total: EXERCICIOS_CHAVE.length, todos: n === EXERCICIOS_CHAVE.length };
}

/** "12 cada" é um lado e depois o outro. A prancha "6 trocas cada lado" tem
 *  "cada" mas é bilateral — não faz sentido perguntar lado ali. */
export function ehUnilateral(repsTarget: string): boolean {
  return /\bcada\b/i.test(repsTarget) && !/troca/i.test(repsTarget);
}
```

Em `settings-helpers.ts`: importe `type LadoFraco` de `./teto-predio`; na interface `Settings` acrescente `tetoPredio: Record<string, number>;` e `ladoFraco: LadoFraco;`; em `DEFAULTS`, no fim:

```ts
  // Aprendido no uso (entrega C): ela não sabe as cargas máximas do prédio.
  tetoPredio: {},
  // Perguntado no primeiro exercício de um lado só.
  ladoFraco: "",
```

- [ ] **Step 4:** `npx vitest run tests/lib/teto-predio.test.ts` — PASS.
- [ ] **Step 5: Commit**

```bash
git add src/lib/teto-predio.ts src/lib/settings-helpers.ts tests/lib/teto-predio.test.ts
git commit -m "feat(treino): módulo do teto do prédio, táticas e lado fraco"
```

---

### Task 3: Teto no registro da sessão

**Files:**
- Modify: `src/components/SessionRecorder.tsx`
- Test: `tests/components/SessionRecorder-teto.test.tsx`

**Interfaces:** consome `noTeto`, `taticasNoTeto` (Task 2); `useSetting("tetoPredio")`; `setSetting`.

- [ ] **Step 1: Escrever o teste que falha**

Leia `tests/components/SessionRecorder-series.test.tsx` para o padrão de montar o componente (props, sessão anterior no `db.workoutSessions`, template). Escreva `tests/components/SessionRecorder-teto.test.tsx` com estes casos, semeando uma sessão anterior de `hip-thrust-barra` com 3 séries de 40 kg × 12 (topo da faixa "10-12") e feedback `"easy"`, de modo que a sugestão seja > 40:

1. aparece "Não tem mais peso aqui"; clicar grava `tetoPredio["hip-thrust-barra"] = 40` em `db.settings` (aguardar com `waitFor`);
2. com `tetoPredio = { "hip-thrust-barra": 40 }` já gravado, aparece "No teto do prédio (40 kg)" e o texto de uma tática ("2 s"), e **não** aparece "Sugestão: 42 kg";
3. clicar "o aparelho tem mais peso" remove a chave do setting e a sugestão volta;
4. exercício sem histórico: não aparece "Não tem mais peso aqui";
5. exercício de peso corporal (equipment `["peso-corporal"]`) com histórico: não aparece o botão.

- [ ] **Step 2:** rodar e ver falhar.

- [ ] **Step 3: Implementar**

No componente:

```tsx
  const tetos = useSetting("tetoPredio");
  const teto = tetos[exercise.id];
  const cargaAnterior = last ? last.sets[last.sets.length - 1].weight : 0;
  // Só faz sentido dizer "não tem mais peso" quando o app pede pra SUBIR.
  const podeMarcarTeto = suggested !== null && cargaAnterior > 0 && suggested > cargaAnterior && teto === undefined;
  const travado = suggested !== null && noTeto(suggested, teto);

  async function marcarTeto() {
    await setSetting("tetoPredio", { ...tetos, [exercise.id]: cargaAnterior });
  }
  async function desfazerTeto() {
    const { [exercise.id]: _, ...resto } = tetos;
    await setSetting("tetoPredio", resto);
  }
```

No JSX, troque o ramo `suggested !== null ? (<button …>Sugestão: …</button>)` por:

```tsx
      {suggested !== null && travado ? (
        <div className="text-xs mb-3">
          <p className="text-nude-warm">No teto do prédio ({teto} kg)</p>
          <ul className="text-muted list-disc pl-4 mt-1 space-y-0.5">
            {taticasNoTeto(repsTarget).map((t) => <li key={t}>{t}</li>)}
          </ul>
          <button type="button" onClick={() => void desfazerTeto()} className="text-muted underline mt-1">o aparelho tem mais peso</button>
        </div>
      ) : suggested !== null ? (
        <div className="mb-3">
          <button type="button" onClick={applySuggestion} className="text-xs text-nude underline block">
            Sugestão: {suggested} kg (aplicar em todas)
          </button>
          {podeMarcarTeto && (
            <button type="button" onClick={() => void marcarTeto()} className="text-xs text-muted underline block mt-1">
              Não tem mais peso aqui
            </button>
          )}
        </div>
      ) : exercise.startLoadKg ? (
```

(mantendo os ramos seguintes iguais; o `mb-3` do botão de sugestão passa para o `div`).

- [ ] **Step 4:** rodar o teste novo e `tests/components` — PASS.
- [ ] **Step 5: Commit** — `feat(treino): "não tem mais peso aqui" e táticas no teto do prédio`.

---

### Task 4: Lado fraco no registro da sessão

**Files:**
- Modify: `src/components/SessionRecorder.tsx`
- Test: `tests/components/SessionRecorder-lado.test.tsx`

- [ ] **Step 1: Escrever o teste que falha** — casos:
1. exercício com `repsTarget="12 cada"` e `ladoFraco=""`: aparece "Qual lado é o mais fraco?"; clicar "Esquerdo" grava `ladoFraco = "esquerdo"`;
2. com `ladoFraco = "direito"`: aparece "Comece pelo lado direito" e "nem uma a mais"; não aparece a pergunta;
3. `repsTarget="6 trocas cada lado"` e `"10-12"`: nada de lado aparece.

- [ ] **Step 2:** rodar e ver falhar.
- [ ] **Step 3: Implementar** — no componente, `const ladoFraco = useSetting("ladoFraco");` e, logo depois do bloco de `notes`:

```tsx
      {ehUnilateral(repsTarget) && (ladoFraco ? (
        <p className="text-xs text-nude/80 mb-2">
          Comece pelo lado {ladoFraco}. O lado forte faz as mesmas repetições — nem uma a mais.{" "}
          <button type="button" onClick={() => void setSetting("ladoFraco", "")} className="underline text-muted">trocar</button>
        </p>
      ) : (
        <div className="text-xs mb-2">
          <p className="text-nude/80">Qual lado é o mais fraco? O da perna que pareceu mais curta deitada, ou o que cansa primeiro.</p>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => void setSetting("ladoFraco", "esquerdo")} className="px-2 py-1 rounded-md bg-bg-deep border border-bg-border">Esquerdo</button>
            <button type="button" onClick={() => void setSetting("ladoFraco", "direito")} className="px-2 py-1 rounded-md bg-bg-deep border border-bg-border">Direito</button>
          </div>
        </div>
      ))}
```

- [ ] **Step 4:** rodar os testes de `tests/components` — PASS.
- [ ] **Step 5: Commit** — `feat(treino): lado fraco primeiro nos exercícios de um lado só`.

---

### Task 5: Hora da Smartfit no Hoje e no Treino

**Files:**
- Create: `src/components/SmartfitCard.tsx`
- Modify: `src/pages/Today.tsx` (card logo depois do `RitmoCard`), `src/pages/workout/WorkoutHome.tsx` (linha de progresso)
- Test: `tests/components/SmartfitCard.test.tsx`; caso em `tests/pages/Today.test.tsx`

- [ ] **Step 1: Testes que falham**
1. `SmartfitCard` renderiza "Hora da Smartfit" e "fotos" (roteiro);
2. Today: com `tetoPredio` contendo os 4 `EXERCICIOS_CHAVE`, aparece "Hora da Smartfit" (aguardar); com 3, não aparece;
3. WorkoutHome: com 2 no teto, aparece "Teto do prédio: 2 de 4"; com 0, não aparece.

- [ ] **Step 2:** rodar e ver falhar.
- [ ] **Step 3: Implementar**

```tsx
// src/components/SmartfitCard.tsx
/** Aparece quando os quatro exercícios que constroem glúteo e coxa batem o
 *  teto do prédio. O roteiro vem de docs/OBJETIVO.md §8. */
export function SmartfitCard() {
  return (
    <div className="card border-nude/40">
      <p className="text-muted text-xs uppercase tracking-wider">Hora da Smartfit</p>
      <p className="text-nude-warm text-sm mt-1">Você bateu o teto do prédio no hip thrust, no leg press, na abdutora e no búlgaro.</p>
      <p className="text-xs mt-1">As táticas seguram algumas semanas, mas daqui pra frente o glúteo cresce com carga — e o prédio não tem mais.</p>
      <p className="text-xs mt-1">Próximo passo: mande fotos ou a lista de aparelhos da sua unidade pra montar o treino novo, e comece com 1–2 semanas só nas máquinas sentadas.</p>
    </div>
  );
}
```

Today: `const tetos = useSetting("tetoPredio");` (junto dos outros `useSetting`) e, depois do `RitmoCard`, `{progressoTeto(tetos).todos && <SmartfitCard />}`.

WorkoutHome: `const tetos = useSetting("tetoPredio"); const teto = progressoTeto(tetos);` e, depois do card do treino de hoje:

```tsx
      {teto.noTeto > 0 && (
        <p className="text-muted text-xs px-1">Teto do prédio: {teto.noTeto} de {teto.total} exercícios principais{teto.todos ? " — hora da Smartfit" : ""}</p>
      )}
```

- [ ] **Step 4:** rodar testes — PASS.
- [ ] **Step 5: Commit** — `feat(treino): aviso da hora da Smartfit no Hoje e progresso no Treino`.

---

### Task 6: Suíte, builds e registro

- [ ] `npm run test`, `npm run build`, `npm run build:app` limpos.
- [ ] `docs/CONTINUAR-AQUI.md` seção 1, depois da linha "B · …":

```markdown
| C · Hora da Smartfit | búlgaro (leve na adaptação, no lugar do goblet na variação), lado fraco primeiro, "não tem mais peso aqui" + táticas no teto, aviso da Smartfit quando hip thrust/leg press/abdutora/búlgaro estão no teto | spec `docs/superpowers/specs/2026-10-02-hora-da-smartfit-design.md` · plano `docs/superpowers/plans/2026-10-02-hora-da-smartfit.md` |
```

  seção 3:

```markdown
| 10-02 | Cardio: esteira ~6% a 5 km/h por 1 h **depois do treino**, no lugar da caminhada (modo `esteira`). Jantar passa pra ~20h30. |
| 10-02 | Estrutura do treino mantida; entram búlgaro, lado fraco primeiro e táticas no teto. Teto do prédio é aprendido no uso. |
```

- [ ] Commit — `docs: entrega C (hora da Smartfit) registrada`.
