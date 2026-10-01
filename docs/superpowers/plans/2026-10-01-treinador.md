# Treinador (entrega A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** o app passa a dizer se ela está no ritmo da fase 1 e o que mudar, com a conta ajustada ao modo real das caminhadas, e fecha a semana com uma revisão de domingo.

**Architecture:** um setting novo (`modoCaminhada`) alimenta o gasto em `objetivo.ts`, que a projeção (`partida.ts`), o comer fora (`comer-fora.ts`) e a rotina (`today-routine.ts`) passam a receber. Dois módulos puros novos (`ritmo.ts`, `revisao-semanal.ts`) decidem o veredito e a revisão; `adesao.ts` lê o banco e conta a adesão; dois cards novos mostram no Hoje e na Evolução.

**Tech Stack:** React 18 + TypeScript, Dexie (`dexie-react-hooks`), Vitest + Testing Library (happy-dom), Tailwind.

**Spec:** `docs/superpowers/specs/2026-10-01-treinador-design.md`

## Global Constraints

- Texto e comentário em **pt-BR com acentuação correta**; tratar por "você"; pronomes ela/dela nos comentários.
- **Nunca sugerir cortar comida** em nenhum texto do treinador (decisão dela, 2026-10-01). Abaixo do ritmo: só adesão e prazo. Acima: comer mais, em gramas.
- **Números-alvo só em `src/lib/objetivo.ts`** — nenhum número de gasto ou de alvo digitado em tela.
- Módulos declarados puros (`objetivo.ts`, `partida.ts`, `ritmo.ts`, `revisao-semanal.ts`, `today-routine.ts`, `comer-fora.ts`): **sem `db`, sem `new Date()`** — a data de hoje entra como argumento.
- Comentário explica o **porquê**, não o quê.
- Teste de tela **aguarda um texto que muda com o estado** antes de afirmar (o `useLiveQuery` começa `undefined`).
- Rede de texto proíbe a **afirmação**, não a palavra (lição 5.2 do `CONTINUAR-AQUI.md`).
- Nenhum seed do banco muda → **nenhuma versão de seed sobe**.
- Condição de commit: `npm run test` verde e `npm run build` limpo (`tsc -b` inclui os testes — nada de `node:*` em teste).
- Branch: `feat/treinador`. **Nunca** `git push` — publicar é decisão dela.

## Review Focus

- Medida com só peso ou só cintura depois da partida → é ignorada; o veredito usa a última medida com **os dois**. (Task 5)
- Duas medidas no mesmo dia → vale a de **maior id** (a correção que ela digitou por último). (Task 5)
- Peso **acima** da partida (ganhou peso) → veredito "abaixo" com "a fase 1 não tem data", sem `NaN`, `Infinity` ou mês absurdo. (Task 5)
- Ela troca o modo depois de medir → o veredito recalcula com o esperado do modo novo, sem precisar medir de novo. (Task 5)
- Domingo com a semana vazia (nenhum registro) → a revisão mostra zeros e um ajuste, sem quebrar. (Task 7)

---

### Task 1: Gasto pelo modo das caminhadas

**Files:**
- Modify: `src/lib/objetivo.ts` (depois de `CONSUMO`)
- Modify: `src/lib/settings-helpers.ts` (interface `Settings` e `DEFAULTS`)
- Modify: `src/lib/partida.ts` (`somaSemanas` exportada; `projetar` e `partidaPlausivel` recebem o modo)
- Modify: `src/hooks/usePartida.ts`
- Test: `tests/lib/gasto-modo.test.ts`

**Interfaces:**
- Produces: `type ModoCaminhada = "caminhada" | "esteira" | "pausada"`, `KCAL_CAMINHADA_DIA = 370`, `gastoEstimado(modo: ModoCaminhada): [number, number]` (em `objetivo.ts`); `projetar(p: Partida, alturaCm: number, modo?: ModoCaminhada): Projecao | null`; `partidaPlausivel(ms, alturaCm, recomeco?, modo?)`; `export function somaSemanas(data: string, semanas: number): string` (em `partida.ts`); setting `modoCaminhada` com padrão `"caminhada"`.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/lib/gasto-modo.test.ts
import { describe, it, expect } from "vitest";
import { CONSUMO, KCAL_CAMINHADA_DIA, gastoEstimado } from "../../src/lib/objetivo";
import { projetar } from "../../src/lib/partida";
import { DEFAULTS } from "../../src/lib/settings-helpers";

const P = { data: "2026-09-25", pesoKg: 96, cinturaCm: 99, pescocoCm: 40 };

describe("gasto pelo modo das caminhadas", () => {
  it("caminhada e esteira gastam o mesmo; pausada perde a caminhada nas duas pontas", () => {
    const base: [number, number] = [CONSUMO.gastoEstimadoKcalMin, CONSUMO.gastoEstimadoKcalMax];
    expect(gastoEstimado("caminhada")).toEqual(base);
    expect(gastoEstimado("esteira")).toEqual(base);
    expect(gastoEstimado("pausada")).toEqual([base[0] - KCAL_CAMINHADA_DIA, base[1] - KCAL_CAMINHADA_DIA]);
  });

  it("a projeção em pausada é mais lenta e termina depois", () => {
    const andando = projetar(P, 173, "caminhada")!;
    const parada = projetar(P, 173, "pausada")!;
    expect(parada.ritmoKgSemana[0]).toBeLessThan(andando.ritmoKgSemana[0]);
    expect(parada.ritmoKgSemana[1]).toBeLessThan(andando.ritmoKgSemana[1]);
    expect(parada.fimFase1[1] > andando.fimFase1[1]).toBe(true);
  });

  it("sem modo, a projeção continua a de antes (caminhada)", () => {
    expect(projetar(P, 173)).toEqual(projetar(P, 173, "caminhada"));
  });

  it("o padrão do setting é caminhada — quem nunca mexeu continua igual", () => {
    expect(DEFAULTS.modoCaminhada).toBe("caminhada");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/gasto-modo.test.ts`
Expected: FAIL — `gastoEstimado` / `KCAL_CAMINHADA_DIA` não existem.

- [ ] **Step 3: Implementar**

Em `src/lib/objetivo.ts`, logo depois do bloco `export const CONSUMO = { ... } as const;`:

```ts
/** Como as caminhadas estão agora. Em 2026-09-28 ela parou os 5 km "por
 *  agora", e o gasto acima continuava contando a caminhada todo dia — a
 *  projeção prometia um ritmo que ela já sabia que não ia bater. */
export type ModoCaminhada = "caminhada" | "esteira" | "pausada";

/** Os 5 km do trabalho para casa (~1h em zona 2) para o corpo dela. É o mesmo
 *  número que `CAMINHADA_TRABALHO` em today-routine.ts sempre citou. */
export const KCAL_CAMINHADA_DIA = 370;

/** Gasto diário estimado [mínimo, máximo] no modo atual. Esteira inclinada no
 *  mesmo tempo e ritmo gasta o mesmo que a rua — só a pausa muda a conta. */
export function gastoEstimado(modo: ModoCaminhada): [number, number] {
  const tira = modo === "pausada" ? KCAL_CAMINHADA_DIA : 0;
  return [CONSUMO.gastoEstimadoKcalMin - tira, CONSUMO.gastoEstimadoKcalMax - tira];
}
```

Em `src/lib/settings-helpers.ts`:
- no import de `./objetivo`, acrescente `type ModoCaminhada`;
- na interface `Settings`, depois de `walkGoalMin: number;`, acrescente `modoCaminhada: ModoCaminhada;`;
- em `DEFAULTS`, logo depois de `walkGoalMin: 120,`:

```ts
  // Padrão = a rotina que o app sempre supôs. Ela troca em Configurações quando
  // a caminhada muda; o gasto, a projeção e o Hoje acompanham.
  modoCaminhada: "caminhada",
```

Em `src/lib/partida.ts`:
- no import de `./objetivo`, acrescente `gastoEstimado, type ModoCaminhada`;
- troque `function somaSemanas(` por `export function somaSemanas(`;
- `partidaPlausivel` ganha o quarto parâmetro e o repassa:

```ts
export function partidaPlausivel(
  ms: readonly Measurement[],
  alturaCm: number,
  recomeco: string = RECOMECO_DATA,
  modo: ModoCaminhada = "caminhada",
): { resultado: Projecao | null; invalida: boolean } {
  const cs = candidatas(ms, recomeco);
  for (const c of cs) {
    if (c.cinturaCm <= c.pescocoCm) continue;
    const pr = projetar(c, alturaCm, modo);
    if (pr && pr.gorduraPct > 0 && pr.pesoAlvoFase1[1] < c.pesoKg) return { resultado: pr, invalida: false };
  }
  return { resultado: null, invalida: cs.length > 0 };
}
```

- `projetar` passa a usar o gasto do modo (substitua a assinatura e o cálculo de `ritmo`):

```ts
export function projetar(p: Partida, alturaCm: number, modo: ModoCaminhada = "caminhada"): Projecao | null {
```

```ts
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const [gastoMin, gastoMax] = gastoEstimado(modo);
  const ritmo: [number, number] = [
    r2(((gastoMin - CONSUMO.metaKcal) * 7) / KCAL_POR_KG_GORDURA),
    r2(((gastoMax - CONSUMO.metaKcal) * 7) / KCAL_POR_KG_GORDURA),
  ];
```

Em `src/hooks/usePartida.ts`, substitua o corpo por:

```ts
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { partidaPlausivel, type Partida, type Projecao } from "../lib/partida";
import { MEDIDAS_PARTIDA, RECOMECO_DATA, type ModoCaminhada } from "../lib/objetivo";

/** A partida dela lida do banco (primeira medição válida desde o recomeço) e a
 *  projeção da fase 1 no modo de caminhada atual. A altura não muda: sem o
 *  setting, usa a da medição de maio. `carregando` existe pra o Hoje não piscar
 *  o pedido de medição antes do banco responder. */
export function usePartida(): { partida: Partida | null; projecao: Projecao | null; invalida: boolean; carregando: boolean } {
  const medidas = useLiveQuery(() => db.measurements.toArray(), []);
  // `null` = não existe o setting; `undefined` = o banco ainda não respondeu.
  // O useSetting devolveria o padrão enquanto carrega, e o card calcularia um
  // frame com o valor padrão antes de pular pro dela.
  const alturaSalva = useLiveQuery(async () => ((await db.settings.get("heightCm"))?.value as number | undefined) ?? null, []);
  const modo = useLiveQuery(async () => ((await db.settings.get("modoCaminhada"))?.value as ModoCaminhada | undefined) ?? "caminhada", []);
  if (medidas === undefined || alturaSalva === undefined || modo === undefined) {
    return { partida: null, projecao: null, invalida: false, carregando: true };
  }
  const altura = alturaSalva && alturaSalva > 0 ? alturaSalva : Math.round(MEDIDAS_PARTIDA.alturaM * 100);
  const { resultado, invalida } = partidaPlausivel(medidas, altura, RECOMECO_DATA, modo);
  return { partida: resultado?.partida ?? null, projecao: resultado, invalida, carregando: false };
}
```

(`RECOMECO_DATA` já é exportado por `objetivo.ts` — `partida.ts` importa de lá.)

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/gasto-modo.test.ts tests/lib/objetivo.test.ts tests/components/partida-card.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/objetivo.ts src/lib/settings-helpers.ts src/lib/partida.ts src/hooks/usePartida.ts tests/lib/gasto-modo.test.ts
git commit -m "feat(treinador): gasto e projeção pelo modo das caminhadas"
```

---

### Task 2: Comer fora pelo modo

**Files:**
- Modify: `src/lib/comer-fora.ts`
- Modify: `src/data/comer-fora-seed.ts`
- Modify: `src/pages/path/MealPlanView.tsx:8,210`
- Test: `tests/data/comer-fora-modo.test.ts`

**Interfaces:**
- Consumes: `gastoEstimado`, `ModoCaminhada` (Task 1).
- Produces: `deficitSemanalKcal(modo?: ModoCaminhada): number`; `ritmoDaSemana(kcalGastas: number, modo?: ModoCaminhada)`; `ritmoComNoitesFora(noites: number, modo?: ModoCaminhada)`; `comerForaDoModo(modo: ModoCaminhada): GuideSection[]`; `COMER_FORA` continua exportado (= modo caminhada).

**Por quê:** com a caminhada pausada o déficit da semana (~1.610 kcal) fica **menor** que a verba (1.750). A tela atual diria "você continua emagrecendo em todos os cenários" — falso nesse modo.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/data/comer-fora-modo.test.ts
import { describe, it, expect } from "vitest";
import { deficitSemanalKcal, ritmoComNoitesFora, DEFICIT_SEMANAL_KCAL } from "../../src/lib/comer-fora";
import { comerForaDoModo, COMER_FORA } from "../../src/data/comer-fora-seed";

describe("comer fora pelo modo das caminhadas", () => {
  it("sem modo, a conta é a de antes", () => {
    expect(deficitSemanalKcal()).toBe(DEFICIT_SEMANAL_KCAL);
    expect(COMER_FORA).toEqual(comerForaDoModo("caminhada"));
  });

  it("pausada encolhe o déficit e três noites fora zeram a perda", () => {
    expect(deficitSemanalKcal("pausada")).toBeLessThan(deficitSemanalKcal("caminhada"));
    expect(ritmoComNoitesFora(3, "pausada").kgPorSemana).toBe(0);
  });

  it("em pausada a tela não promete emagrecer em todos os cenários e diz o porquê", () => {
    const texto = JSON.stringify(comerForaDoModo("pausada"));
    expect(texto).not.toMatch(/continua emagrecendo em todos os cenários/);
    expect(texto).toMatch(/caminhada pausada/i);
    // A verba inteira passa do déficit: "100% mais devagar" seria jeito torto
    // de dizer que a perda zerou.
    expect(texto).not.toMatch(/100% mais devagar/);
  });

  it("com caminhada, a frase original continua", () => {
    expect(JSON.stringify(comerForaDoModo("caminhada"))).toMatch(/continua emagrecendo em todos os cenários/);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/data/comer-fora-modo.test.ts`
Expected: FAIL — `deficitSemanalKcal` / `comerForaDoModo` não existem.

- [ ] **Step 3: Implementar**

Em `src/lib/comer-fora.ts`:
- troque `import { CONSUMO } from "./objetivo";` por `import { CONSUMO, gastoEstimado, type ModoCaminhada } from "./objetivo";`;
- substitua `GASTO_MEDIO_KCAL`, `DEFICIT_DIARIO_KCAL` e `DEFICIT_SEMANAL_KCAL` por:

```ts
/** Déficit da semana com o plano seguido à risca, no modo de caminhada dado.
 *  Com a caminhada pausada ele encolhe ~2.600 kcal na semana, e a verba deixa
 *  de caber nele inteira. */
export function deficitSemanalKcal(modo: ModoCaminhada = "caminhada"): number {
  const [min, max] = gastoEstimado(modo);
  return ((min + max) / 2 - CONSUMO.metaKcal) * 7;
}

/** Déficit do plano seguido à risca, sem tocar na verba (modo caminhada). */
export const DEFICIT_SEMANAL_KCAL = deficitSemanalKcal("caminhada");
export const DEFICIT_DIARIO_KCAL = DEFICIT_SEMANAL_KCAL / 7;
```

- `ritmoDaSemana` e `ritmoComNoitesFora` ganham o modo:

```ts
export function ritmoDaSemana(kcalGastas: number, modo: ModoCaminhada = "caminhada"): RitmoDaSemana {
  const total = deficitSemanalKcal(modo);
  const deficitSemanalKcal_ = Math.max(0, total - kcalGastas);
  return {
    deficitSemanalKcal: deficitSemanalKcal_,
    kgPorSemana: arredonda2(deficitSemanalKcal_ / KCAL_POR_KG_GORDURA),
    perdaDeRitmoPct: Math.round((1 - deficitSemanalKcal_ / total) * 100),
  };
}

/** O mesmo, contado em noites fora em vez de calorias. */
export function ritmoComNoitesFora(noites: number, modo: ModoCaminhada = "caminhada"): RitmoDaSemana {
  return ritmoDaSemana(noites * CUSTO_MARGINAL_REFEICAO_FORA_KCAL, modo);
}
```

Em `src/data/comer-fora-seed.ts`:
- acrescente `deficitSemanalKcal` ao import de `../lib/comer-fora` e retire `DEFICIT_SEMANAL_KCAL`; acrescente `import type { ModoCaminhada } from "../lib/objetivo";` (junto do import de `CONSUMO`);
- apague as quatro linhas `const semNoite = ...` até `const tresNoites = ...`;
- troque `export const COMER_FORA: GuideSection[] = [` por:

```ts
/** A tela narra a conta do modo atual. Com a caminhada pausada o déficit fica
 *  menor que a verba, e a frase "você continua emagrecendo em todos os
 *  cenários" viraria mentira — então ela troca pelo número verdadeiro. */
export function comerForaDoModo(modo: ModoCaminhada): GuideSection[] {
  const semNoite = ritmoDaSemana(0, modo);
  const umaNoite = ritmoComNoitesFora(1, modo);
  const duasNoites = ritmoComNoitesFora(2, modo);
  const tresNoites = ritmoComNoitesFora(3, modo);
  const zeraAlguma = tresNoites.kgPorSemana === 0;
  return [
```

- dentro do array, troque `${DEFICIT_SEMANAL_KCAL}` por `${deficitSemanalKcal(modo)}`;
- troque a dica que começa com `` `Gastar a verba inteira toda semana continua sendo emagrecimento`` por:

```ts
      ritmoDaSemana(VERBA_SEMANAL_KCAL, modo).kgPorSemana === 0
        ? "Com a caminhada pausada, gastar a verba inteira toda semana zera a perda: ela é maior que o déficit da semana inteiro."
        : `Gastar a verba inteira toda semana continua sendo emagrecimento, só que ${ritmoDaSemana(VERBA_SEMANAL_KCAL, modo).perdaDeRitmoPct}% mais devagar. Isso é uma escolha legítima com preço conhecido, não uma recaída.`,
```
- troque a dica `"Repare no formato da conta: você continua emagrecendo em todos os cenários. O plano não quebra com uma noite fora — ele anda mais devagar, e você escolhe a velocidade.",` por:

```ts
      zeraAlguma
        ? "Com a caminhada pausada o déficit da semana é tão pequeno que três noites fora zeram a perda. A verba inteira não cabe nele: religar a caminhada (ou a esteira) é o que devolve a folga."
        : "Repare no formato da conta: você continua emagrecendo em todos os cenários. O plano não quebra com uma noite fora — ele anda mais devagar, e você escolhe a velocidade.",
```

- feche a função depois do `]` final do array original com `;\n}` e acrescente no fim do arquivo:

```ts
/** O modo padrão — quem importava a constante continua funcionando. */
export const COMER_FORA: GuideSection[] = comerForaDoModo("caminhada");
```

Em `src/pages/path/MealPlanView.tsx`:
- troque `import { COMER_FORA } from "../../data/comer-fora-seed";` por `import { comerForaDoModo } from "../../data/comer-fora-seed";` e, se ainda não houver, `import { useSetting } from "../../hooks/useSetting";`;
- no topo do componente: `const modoCaminhada = useSetting("modoCaminhada");`;
- linha 210: `<GuideAccordion sections={comerForaDoModo(modoCaminhada)} className="mb-4" />`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/data/comer-fora-modo.test.ts tests/data/comer-fora.test.ts tests/data/meal-plan-coerencia.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/comer-fora.ts src/data/comer-fora-seed.ts src/pages/path/MealPlanView.tsx tests/data/comer-fora-modo.test.ts
git commit -m "feat(treinador): comer fora conta o déficit do modo das caminhadas"
```

---

### Task 3: Rotina do Hoje pelo modo

**Files:**
- Modify: `src/lib/today-routine.ts` (`CAMINHADA_FDS` ~l.76, `manhaItems`, `CAMINHADA_TRABALHO` ~l.222, `tardeSemana`, `buildBlocks`, `buildDayRoutine`)
- Modify: `src/pages/Today.tsx:128,179,342`
- Test: `tests/lib/today-routine-modo.test.ts`

**Interfaces:**
- Consumes: `ModoCaminhada` (Task 1).
- Produces: `buildDayRoutine(dayOfWeek, dayOfYear, horariosDePausa?, modo?: ModoCaminhada)`; `metaCaminhadaMin(walkGoalMin: number, modo: ModoCaminhada): number`; `ITENS_CAMINHADA = ["caminhada-trabalho", "caminhada-fds"] as const`.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/lib/today-routine-modo.test.ts
import { describe, it, expect } from "vitest";
import { buildDayRoutine, metaCaminhadaMin, ITENS_CAMINHADA } from "../../src/lib/today-routine";

const itens = (dow: number, modo?: Parameters<typeof buildDayRoutine>[3]) =>
  buildDayRoutine(dow, 2, [], modo).blocks.flatMap((b) => b.items);

describe("rotina pelo modo das caminhadas", () => {
  it("os ids de caminhada existem na rotina (segunda e sábado)", () => {
    const ids = [...itens(1), ...itens(6)].map((i) => i.id);
    for (const id of ITENS_CAMINHADA) expect(ids).toContain(id);
  });

  it("esteira troca rótulo e instrução nos dois itens e mantém o controle de caminhada", () => {
    for (const dow of [1, 6]) {
      const item = itens(dow, "esteira").find((i) => (ITENS_CAMINHADA as readonly string[]).includes(i.id))!;
      expect(item.label).toMatch(/Esteira inclinada/);
      expect(item.subtitle).toMatch(/6–10%/);
      expect(item.control).toBe("walk");
    }
  });

  it("pausada tira os dois itens e mantém o passeio com os cães", () => {
    for (const dow of [1, 6, 0]) {
      const ids = itens(dow, "pausada").map((i) => i.id);
      for (const id of ITENS_CAMINHADA) expect(ids).not.toContain(id);
      expect(ids.some((id) => id.startsWith("caes"))).toBe(true);
    }
  });

  it("sem modo, a rotina é a de antes", () => {
    expect(itens(1)).toEqual(itens(1, "caminhada"));
  });

  it("na pausada a meta de minutos perde a caminhada (só os cães)", () => {
    expect(metaCaminhadaMin(120, "caminhada")).toBe(120);
    expect(metaCaminhadaMin(120, "esteira")).toBe(120);
    expect(metaCaminhadaMin(120, "pausada")).toBe(60);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/today-routine-modo.test.ts`
Expected: FAIL — `metaCaminhadaMin` / `ITENS_CAMINHADA` não existem.

- [ ] **Step 3: Implementar**

Em `src/lib/today-routine.ts`:
- acrescente no topo `import type { ModoCaminhada } from "./objetivo";`;
- logo depois dos tipos exportados, acrescente:

```ts
/** Os dois itens que mudam com o modo das caminhadas. Exportado porque a
 *  adesão (src/lib/adesao.ts) conta os dias de cardio por estes ids — e um
 *  teste prende os dois aqui, pra renomear um não zerar a conta em silêncio. */
export const ITENS_CAMINHADA = ["caminhada-trabalho", "caminhada-fds"] as const;

/** O item de caminhada no modo atual: igual, trocado pela esteira, ou fora do
 *  dia. Esteira mantém `control: "walk"` e o mesmo `to` — é a mesma zona 2,
 *  só que parada no lugar. */
function noModo(item: RoutineItem, modo: ModoCaminhada): RoutineItem | null {
  if (modo === "pausada") return null;
  if (modo === "esteira") {
    return {
      ...item,
      label: item.id === "caminhada-fds" ? "Esteira inclinada · 45–60 min (fim de semana)" : "Esteira inclinada · 45–60 min",
      subtitle: "6–10% a 4,5–5,5 km/h, ou bike nível 5–6 · ofegante, mas falando em frases curtas",
    };
  }
  return item;
}

/** A meta de minutos de caminhada do dia. Ela soma duas caminhadas de 60 min
 *  (ver `walkGoalMin` em settings-helpers.ts); com a caminhada pausada sobra
 *  só o passeio com os cães, e a meta cheia ficaria vermelha todo dia por uma
 *  coisa que ela decidiu não fazer. */
export function metaCaminhadaMin(walkGoalMin: number, modo: ModoCaminhada): number {
  return modo === "pausada" ? Math.max(0, walkGoalMin - 60) : walkGoalMin;
}
```

- `manhaItems` recebe o modo e aplica `noModo` ao item de fim de semana. Leia a função: onde ela insere a constante de `caminhada-fds` (definida perto da l.76 — o objeto com `id: "caminhada-fds"`), troque a inserção por uma que passe por `noModo` e descarte `null`. Forma:

```ts
function manhaItems(dayOfYear: number, fimDeSemana: boolean, modo: ModoCaminhada): RoutineItem[] {
```
e, no ponto em que o item de fim de semana entra na lista, use
```ts
...(fimDeSemana ? [noModo(CAMINHADA_FDS, modo)].filter((i): i is RoutineItem => i !== null) : []),
```
(use o nome real da constante do item `caminhada-fds`; se ele estiver inline, extraia para `const CAMINHADA_FDS: RoutineItem = {...}` sem mudar nenhum campo).

- `tardeSemana` recebe o modo:

```ts
function tardeSemana(modo: ModoCaminhada): RoutineItem[] {
  return [
    ...[noModo(CAMINHADA_TRABALHO, modo)].filter((i): i is RoutineItem => i !== null),
    caes("semana"),
```
(mantenha o resto do array como está).

- `buildBlocks` ganha `modo: ModoCaminhada` como quarto parâmetro e repassa: `manhaItems(dayOfYear, isSaturday || isSunday, modo)` e `...tardeSemana(modo)`.
- `buildDayRoutine` ganha `modo: ModoCaminhada = "caminhada"` como quarto parâmetro e chama `buildBlocks(dayOfWeek, dayOfYear, horariosDePausa, modo)`. Atualize o comentário dele com uma frase: "`modo` vem do setting `modoCaminhada` — a tela lê, este módulo continua puro."

Em `src/pages/Today.tsx`:
- import: acrescente `metaCaminhadaMin` ao import de `../lib/today-routine`;
- perto da l.128 (`const walkGoalMin = useSetting("walkGoalMin");`) acrescente `const modoCaminhada = useSetting("modoCaminhada");`;
- l.179: `const routine = buildDayRoutine(dayOfWeek, diaDoAno(today), horasDasPausas, modoCaminhada);`
- l.342: troque `${walkGoalMin}` por `${metaCaminhadaMin(walkGoalMin, modoCaminhada)}`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/today-routine-modo.test.ts tests/lib tests/pages/Today.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/today-routine.ts src/pages/Today.tsx tests/lib/today-routine-modo.test.ts
git commit -m "feat(treinador): o Hoje troca ou tira a caminhada conforme o modo"
```

---

### Task 4: Configurações — "Caminhadas agora"

**Files:**
- Modify: `src/pages/Settings.tsx` (depois da l.105, antes do card "Notificações")
- Test: `tests/pages/settings-caminhada.test.tsx`

**Interfaces:**
- Consumes: setting `modoCaminhada` (Task 1).

- [ ] **Step 1: Escrever o teste que falha**

```tsx
// tests/pages/settings-caminhada.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { Settings } from "../../src/pages/Settings";

beforeEach(async () => {
  await db.settings.clear();
});

describe("Configurações · caminhadas agora", () => {
  it("começa em caminhada e grava esteira ao escolher", async () => {
    render(<MemoryRouter><Settings /></MemoryRouter>);
    const caminhada = await screen.findByLabelText(/^Caminhada/);
    await waitFor(() => expect(caminhada).toBeChecked());
    fireEvent.click(screen.getByLabelText(/Esteira ou bike/));
    await waitFor(async () => expect((await db.settings.get("modoCaminhada"))?.value).toBe("esteira"));
  });

  it("explica o que muda na pausada", async () => {
    render(<MemoryRouter><Settings /></MemoryRouter>);
    expect(await screen.findByText(/somem do Hoje/)).toBeInTheDocument();
  });
});
```

(Confira o nome do export de `src/pages/Settings.tsx` antes; se for `export function SettingsPage`, ajuste o import do teste.)

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/pages/settings-caminhada.test.tsx`
Expected: FAIL — não acha o rótulo "Caminhada".

- [ ] **Step 3: Implementar**

Em `src/pages/Settings.tsx`, acima do componente:

```tsx
import type { ModoCaminhada } from "../lib/objetivo";

// Uma frase por opção dizendo o que muda — ela escolhe sabendo o efeito, e não
// descobre depois que o Hoje mudou.
const OPCOES_CAMINHADA: { modo: ModoCaminhada; rotulo: string; efeito: string }[] = [
  { modo: "caminhada", rotulo: "Caminhada", efeito: "Os 5 km do trabalho e os do fim de semana, como sempre." },
  { modo: "esteira", rotulo: "Esteira ou bike", efeito: "Os itens viram esteira inclinada 45–60 min. A conta do ritmo não muda." },
  { modo: "pausada", rotulo: "Pausada", efeito: "Os itens de caminhada somem do Hoje e o ritmo esperado da fase 1 fica mais lento — o app para de cobrar uma meta que você já sabe que não vai bater." },
];
```

Dentro do componente, junto dos outros `useSetting`: `const modoCaminhada = useSetting("modoCaminhada");`

E, antes do `<div className="card space-y-3">` que abre "Notificações":

```tsx
      <div className="card space-y-3">
        <h2 className="text-nude-warm font-medium">Caminhadas agora</h2>
        <p className="text-muted text-xs">Muda os itens de caminhada do Hoje e a conta do seu ritmo.</p>
        {OPCOES_CAMINHADA.map((o) => (
          <label key={o.modo} className="flex items-start gap-2">
            <input
              type="radio"
              name="modoCaminhada"
              checked={modoCaminhada === o.modo}
              onChange={() => void setSetting("modoCaminhada", o.modo)}
              className="mt-1"
            />
            <span>
              <span className="text-sm">{o.rotulo}</span>
              <span className="block text-muted text-xs">{o.efeito}</span>
            </span>
          </label>
        ))}
      </div>
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/pages/settings-caminhada.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/Settings.tsx tests/pages/settings-caminhada.test.tsx
git commit -m "feat(treinador): escolher o modo das caminhadas em Configurações"
```

---

### Task 5: O veredito do ritmo (módulo puro)

**Files:**
- Modify: `src/lib/today-date.ts` (função nova `somarDiasISO`)
- Create: `src/lib/ritmo.ts`
- Test: `tests/lib/ritmo.test.ts`

**Interfaces:**
- Consumes: `Projecao`, `projetar`, `somaSemanas`, `mesAno` (`partida.ts`); `FASES`, `ModoCaminhada`, `KCAL_CAMINHADA_DIA` (`objetivo.ts`); `Measurement` (`db.ts`, só tipo).
- Produces:
  - `somarDiasISO(data: string, dias: number): string` em `today-date.ts`
  - `interface Adesao { dias: number; treinos: number; diasCardio: number; noitesNoAlvo: number }`
  - `type Alavanca = "treino" | "cardio" | "sono"`
  - `alavancaMaisFraca(a: Adesao, modo: ModoCaminhada): { alavanca: Alavanca; fracao: number; frase: string }`
  - `type Veredito = { estado: "sem-partida" } | { estado: "cedo"; primeiraComparacao: string } | { estado: "rapido" | "no-ritmo" | "abaixo"; kgSemana: number; cmSemana: number; titulo: string; texto: string[] }`
  - `avaliarRitmo(projecao: Projecao | null, medidas: readonly Measurement[], adesao: Adesao, modo: ModoCaminhada): Veredito`
  - `DIAS_PARA_COMPARAR = 10`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/lib/ritmo.test.ts
import { describe, it, expect } from "vitest";
import { avaliarRitmo, alavancaMaisFraca, type Adesao, type Veredito } from "../../src/lib/ritmo";
import { projetar } from "../../src/lib/partida";
import { somarDiasISO } from "../../src/lib/today-date";
import type { Measurement } from "../../src/lib/db";

const P = { data: "2026-09-25", pesoKg: 96, cinturaCm: 99, pescocoCm: 40 };
const PR = projetar(P, 173, "caminhada")!;
const BOA: Adesao = { dias: 14, treinos: 10, diasCardio: 14, noitesNoAlvo: 14 };
const partida: Measurement = { id: 1, date: P.data, weightKg: 96, waistCm: 99, neckCm: 40 };
// 28 dias depois = 4 semanas exatas
const em = (pesoKg: number, cinturaCm: number, id = 2, date = "2026-10-23"): Measurement =>
  ({ id, date, weightKg: pesoKg, waistCm: cinturaCm, neckCm: 40 });

const textos = (v: Veredito) => ("texto" in v ? v.texto.join(" ") : "");

describe("somarDiasISO", () => {
  it("soma em UTC puro, atravessando o mês", () => {
    expect(somarDiasISO("2026-09-25", 10)).toBe("2026-10-05");
    expect(somarDiasISO("2026-10-05", -10)).toBe("2026-09-25");
  });
});

describe("veredito do ritmo", () => {
  it("sem projeção não avalia", () => {
    expect(avaliarRitmo(null, [], BOA, "caminhada")).toEqual({ estado: "sem-partida" });
  });

  it("antes de 10 dias diz quando sai a primeira comparação", () => {
    expect(avaliarRitmo(PR, [partida, em(95.5, 98.5, 2, "2026-10-01")], BOA, "caminhada"))
      .toEqual({ estado: "cedo", primeiraComparacao: "2026-10-05" });
  });

  it("peso e cintura descendo no plano = no ritmo", () => {
    const v = avaliarRitmo(PR, [partida, em(94, 97)], BOA, "caminhada");
    expect(v.estado).toBe("no-ritmo");
    expect(v).toMatchObject({ kgSemana: 0.5, cmSemana: 0.5 });
  });

  it("balança quase parada com a cintura no ritmo = no ritmo, e diz que é músculo", () => {
    const v = avaliarRitmo(PR, [partida, em(95.8, 97.5)], BOA, "caminhada");
    expect(v.estado).toBe("no-ritmo");
    expect(textos(v)).toMatch(/músculo/);
  });

  it("abaixo aponta a alavanca mais fraca e o prazo real", () => {
    const fraca: Adesao = { dias: 14, treinos: 4, diasCardio: 13, noitesNoAlvo: 12 };
    const v = avaliarRitmo(PR, [partida, em(95.6, 98.6)], fraca, "caminhada");
    expect(v.estado).toBe("abaixo");
    expect(textos(v)).toMatch(/Treino/);
    expect(textos(v)).toMatch(/termina em/);
  });

  it("rápido demais pelo teto do plano manda comer mais, em gramas", () => {
    const v = avaliarRitmo(PR, [partida, em(91.6, 95)], BOA, "caminhada");
    expect(v.estado).toBe("rapido");
    expect(textos(v)).toMatch(/Coma mais/);
    expect(textos(v)).toMatch(/\d+ g/);
  });

  it("rápido demais por 1% do peso por semana, mesmo dentro de 1,3× o teto", () => {
    const largo = { ...PR, ritmoKgSemana: [0.9, 1.2] as [number, number] };
    expect(avaliarRitmo(largo, [partida, em(91.6, 95)], BOA, "caminhada").estado).toBe("rapido");
  });

  // Review Focus
  it("ignora medida sem cintura e usa a última com os dois", () => {
    const soPeso: Measurement = { id: 3, date: "2026-10-25", weightKg: 90 };
    expect(avaliarRitmo(PR, [partida, em(94, 97), soPeso], BOA, "caminhada")).toMatchObject({ kgSemana: 0.5 });
  });

  it("duas medidas no mesmo dia: vale a de maior id", () => {
    const v = avaliarRitmo(PR, [partida, em(90, 90, 5), em(94, 97, 6)], BOA, "caminhada");
    expect(v).toMatchObject({ kgSemana: 0.5 });
  });

  it("ganhou peso: abaixo, sem data e sem número quebrado", () => {
    const v = avaliarRitmo(PR, [partida, em(97, 99.5)], BOA, "caminhada");
    expect(v.estado).toBe("abaixo");
    expect(textos(v)).toMatch(/não tem data/);
    expect(textos(v)).not.toMatch(/NaN|Infinity|undefined/);
  });

  it("trocar o modo recalcula o esperado sem medir de novo", () => {
    const medidas = [partida, em(95.6, 98.6)];
    const andando = avaliarRitmo(PR, medidas, BOA, "caminhada");
    const parada = avaliarRitmo(projetar(P, 173, "pausada")!, medidas, BOA, "pausada");
    expect(andando.estado).toBe("abaixo");
    expect(parada.estado).not.toBe("abaixo");
  });
});

describe("alavanca mais fraca", () => {
  it("aponta a menor fração; empate fica com treino", () => {
    expect(alavancaMaisFraca({ dias: 14, treinos: 10, diasCardio: 5, noitesNoAlvo: 12 }, "caminhada").alavanca).toBe("cardio");
    expect(alavancaMaisFraca({ dias: 14, treinos: 10, diasCardio: 14, noitesNoAlvo: 3 }, "caminhada").alavanca).toBe("sono");
    expect(alavancaMaisFraca({ dias: 14, treinos: 0, diasCardio: 0, noitesNoAlvo: 0 }, "caminhada").alavanca).toBe("treino");
  });

  it("com a caminhada pausada, cardio vira religar", () => {
    const r = alavancaMaisFraca({ dias: 14, treinos: 10, diasCardio: 0, noitesNoAlvo: 14 }, "pausada");
    expect(r.alavanca).toBe("cardio");
    expect(r.frase).toMatch(/[Rr]eligar/);
  });
});

describe("nunca sugere cortar comida (decisão dela, 2026-10-01)", () => {
  // Proíbe a AFIRMAÇÃO. Se a palavra aparecer, tem que estar negando (lição 5.2).
  const CORTE = /(cort|reduz|diminu|tir)\w*[^.]{0,40}(kcal|calori|comida)|comer menos|comendo menos/i;
  const NEGA = /\b(não|nunca|nem)\b/i;
  const cenarios: Veredito[] = [];
  const fracas: Adesao[] = [
    { dias: 14, treinos: 0, diasCardio: 14, noitesNoAlvo: 14 },
    { dias: 14, treinos: 10, diasCardio: 0, noitesNoAlvo: 14 },
    { dias: 14, treinos: 10, diasCardio: 14, noitesNoAlvo: 0 },
  ];
  for (const modo of ["caminhada", "esteira", "pausada"] as const) {
    const pr = projetar(P, 173, modo)!;
    for (const a of fracas) {
      for (const m of [em(95.6, 98.6), em(97, 99.5), em(94, 97), em(91.6, 95), em(95.8, 97.5)]) {
        cenarios.push(avaliarRitmo(pr, [partida, m], a, modo));
      }
    }
  }

  it("nenhuma frase afirma corte de comida", () => {
    for (const v of cenarios) {
      for (const frase of textos(v).split(/(?<=\.)\s/)) {
        if (CORTE.test(frase)) expect({ frase, nega: NEGA.test(frase) }).toEqual({ frase, nega: true });
      }
    }
  });

  it("a rede morde: uma frase de corte sem negação seria pega", () => {
    expect(CORTE.test("Corte 200 kcal do jantar.")).toBe(true);
    expect(NEGA.test("Corte 200 kcal do jantar.")).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/ritmo.test.ts`
Expected: FAIL — `src/lib/ritmo.ts` não existe.

- [ ] **Step 3: Implementar**

Em `src/lib/today-date.ts`, acrescente:

```ts
/** "YYYY-MM-DD" + n dias (n pode ser negativo). UTC puro, sem fuso local —
 *  a mesma conta de `somaSemanas` em partida.ts, em dias. */
export function somarDiasISO(data: string, dias: number): string {
  const d = new Date(`${data}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}
```

Crie `src/lib/ritmo.ts`:

```ts
// src/lib/ritmo.ts
// Ela está no ritmo da fase 1? Módulo puro — sem db, sem Date do relógio.
//
// Existe porque o app mandava fazer e guardava o que ela registrava, mas não
// fechava a conta: a projeção já sabia o ritmo esperado e as medidas estavam no
// banco, e nada comparava um com o outro (conversa de 2026-10-01).
//
// Duas regras dela moram aqui. A CINTURA decide, não a balança: quando o treino
// começa a construir músculo, o peso empaca e a cintura continua descendo — e
// isso é a fase 1 dando certo. E abaixo do ritmo o app NUNCA sugere cortar
// comida: as 2.200 kcal são moderadas de propósito, pra não derrubar a
// testosterona de que firmeza, libido e força dependem. Sobram adesão e prazo.

import type { Measurement } from "./db";
import { mesAno, somaSemanas, type Projecao } from "./partida";
import { FASES, KCAL_CAMINHADA_DIA, type ModoCaminhada } from "./objetivo";
import { somarDiasISO } from "./today-date";

/** Antes disso a fita e a balança oscilam mais do que ela perde. */
export const DIAS_PARA_COMPARAR = 10;
/** Cintura a 75% do esperado ainda conta como no ritmo — fita tem erro de
 *  meio centímetro, e duas semanas de dado não aguentam régua mais fina. */
const TOLERANCIA_CINTURA = 0.75;
/** Acima de 1,3× o teto do plano, ou de 1% do peso por semana, sai músculo
 *  junto — e o músculo é o que faz o glúteo da fase 2. */
const FATOR_RAPIDO = 1.3;
const TETO_FRACAO_PESO_SEMANA = 0.01;

const CINTURA_FIM_FASE1 = FASES.find((f) => f.id === "fase-1")!.cinturaCm;

export interface Adesao {
  /** Tamanho da janela, em dias. */
  dias: number;
  treinos: number;
  diasCardio: number;
  noitesNoAlvo: number;
}

export type Alavanca = "treino" | "cardio" | "sono";

export type Veredito =
  | { estado: "sem-partida" }
  | { estado: "cedo"; primeiraComparacao: string }
  | {
      estado: "rapido" | "no-ritmo" | "abaixo";
      kgSemana: number;
      cmSemana: number;
      titulo: string;
      texto: string[];
    };

const r2 = (n: number) => Math.round(n * 100) / 100;
const num = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

function frase(a: Adesao, modo: ModoCaminhada, alavanca: Alavanca): string {
  const planoTreinos = Math.round((5 * a.dias) / 7);
  if (alavanca === "treino") {
    return `Treino: ${a.treinos} em ${a.dias} dias, de ${planoTreinos} do plano. É o músculo que segura o gasto enquanto o peso cai.`;
  }
  if (alavanca === "cardio") {
    return modo === "pausada"
      ? `Cardio: a caminhada está pausada. Religar a caminhada ou a esteira devolve uns ${KCAL_CAMINHADA_DIA} kcal por dia — a maior alavanca que existe sem mexer na comida.`
      : `Cardio: ${a.diasCardio} de ${a.dias} dias com caminhada ou esteira. Cada dia que falta são uns ${KCAL_CAMINHADA_DIA} kcal a menos no déficit.`;
  }
  return `Sono: ${a.noitesNoAlvo} de ${a.dias} noites no horário. Sono curto sobe o cortisol e guarda gordura justamente na barriga.`;
}

/** A alavanca com a menor fração do esperado. Empate fica com a ordem treino →
 *  cardio → sono, que é a ordem de peso delas na fase 1. Exportada porque a
 *  revisão de domingo usa a MESMA regra — regra de negócio num lugar só. */
export function alavancaMaisFraca(a: Adesao, modo: ModoCaminhada): { alavanca: Alavanca; fracao: number; frase: string } {
  const dias = Math.max(1, a.dias);
  const fracoes: [Alavanca, number][] = [
    ["treino", a.treinos / ((5 * dias) / 7)],
    ["cardio", modo === "pausada" ? 0 : a.diasCardio / dias],
    ["sono", a.noitesNoAlvo / dias],
  ];
  const [alavanca, fracao] = fracoes.reduce((min, x) => (x[1] < min[1] ? x : min));
  return { alavanca, fracao, frase: frase(a, modo, alavanca) };
}

/** A última medida com peso E cintura; no mesmo dia, a de maior id (a correção
 *  que ela digitou por último). */
function ultimaValida(medidas: readonly Measurement[], desde: string): Measurement | null {
  const ok = medidas
    .filter((m) => m.date >= desde && !!m.weightKg && !!m.waistCm)
    .sort((a, b) => (a.date === b.date ? (a.id ?? 0) - (b.id ?? 0) : a.date < b.date ? -1 : 1));
  return ok.at(-1) ?? null;
}

function diasEntre(de: string, ate: string): number {
  return Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 86_400_000);
}

export function avaliarRitmo(
  projecao: Projecao | null,
  medidas: readonly Measurement[],
  adesao: Adesao,
  modo: ModoCaminhada,
): Veredito {
  if (!projecao) return { estado: "sem-partida" };
  const p = projecao.partida;
  const primeiraComparacao = somarDiasISO(p.data, DIAS_PARA_COMPARAR);
  const u = ultimaValida(medidas, primeiraComparacao);
  if (!u) return { estado: "cedo", primeiraComparacao };

  const semanas = diasEntre(p.data, u.date) / 7;
  const kgSemana = r2((p.pesoKg - u.weightKg!) / semanas);
  const cmSemana = r2((p.cinturaCm - u.waistCm!) / semanas);
  const [rMin, rMax] = projecao.ritmoKgSemana;
  const base = { kgSemana, cmSemana };

  if (kgSemana > rMax * FATOR_RAPIDO || kgSemana > u.weightKg! * TETO_FRACAO_PESO_SEMANA) {
    return {
      estado: "rapido",
      ...base,
      titulo: "Rápido demais",
      texto: [
        `Você está perdendo ${num(kgSemana)} kg por semana, acima do teto de ${num(rMax)} do plano. Nessa velocidade sai músculo junto com a gordura, e é o músculo que faz o glúteo.`,
        "Coma mais: +40 g de arroz (cru) e +1 ovo no lanche das 15h30, uns 200 kcal. Mede de novo em 14 dias.",
      ],
    };
  }

  // A cintura esperada cai em proporção ao caminho do peso — a mesma
  // heurística declarada em `projetar`. Na ponta lenta do ritmo, pra cobrar o
  // mínimo e não o ideal.
  const semanasAteFim = Math.max(0, p.pesoKg - projecao.pesoAlvoFase1[0]) / rMin;
  const cmEsperado = semanasAteFim > 0 ? Math.max(0, p.cinturaCm - CINTURA_FIM_FASE1) / semanasAteFim : 0;

  if (cmSemana >= cmEsperado * TOLERANCIA_CINTURA) {
    const balancaParada = kgSemana < rMin * TOLERANCIA_CINTURA;
    return {
      estado: "no-ritmo",
      ...base,
      titulo: "No ritmo",
      texto: balancaParada
        ? ["A cintura está descendo no ritmo e a balança quase parou. É músculo entrando enquanto a gordura sai — exatamente o que a fase 1 quer.", "Continua igual."]
        : ["Peso e cintura descendo no ritmo do plano.", "Continua igual."],
    };
  }

  const fraca = alavancaMaisFraca(adesao, modo);
  const restante = Math.max(0, u.weightKg! - projecao.pesoAlvoFase1[0]);
  const prazo =
    kgSemana > 0
      ? `Nesse ritmo, a fase 1 termina em ${mesAno(somaSemanas(u.date, restante / kgSemana))}. A projeção dizia até ${mesAno(projecao.fimFase1[1])}.`
      : "Nesse ritmo a balança não desce, e a fase 1 não tem data.";
  return {
    estado: "abaixo",
    ...base,
    titulo: "Abaixo do ritmo",
    texto: [
      `A cintura desce ${num(cmSemana)} cm por semana; o plano espera pelo menos ${num(r2(cmEsperado))}.`,
      fraca.frase,
      prazo,
      "A comida fica como está: as 2.200 kcal protegem testosterona e músculo, e o ajuste vem da rotina.",
    ],
  };
}
```

(Se `tsc` reclamar do `"2.200"` fixo: troque por `${CONSUMO.metaKcal.toLocaleString("pt-BR")}` importando `CONSUMO` de `./objetivo` — números do objetivo não ficam digitados.)

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/ritmo.test.ts`
Expected: PASS. Se o caso "trocar o modo" falhar porque a pausada também dá "abaixo", **pare e reporte** com os números (`kgSemana`, `cmSemana`, `cmEsperado` dos dois modos) — não ajuste o teste.

- [ ] **Step 5: Commit**

```bash
git add src/lib/today-date.ts src/lib/ritmo.ts tests/lib/ritmo.test.ts
git commit -m "feat(treinador): veredito do ritmo — a cintura decide, nunca cortar comida"
```

---

### Task 6: Adesão e o card "Seu ritmo" no Hoje e na Evolução

**Files:**
- Create: `src/lib/adesao.ts`
- Create: `src/hooks/useAdesao.ts`
- Create: `src/components/RitmoCard.tsx`
- Modify: `src/pages/Today.tsx` (perto da l.371-394)
- Modify: `src/pages/path/EvolucaoView.tsx`
- Test: `tests/lib/adesao.test.ts`, `tests/components/RitmoCard.test.tsx`, acrescentar caso em `tests/pages/Today.test.tsx`

**Interfaces:**
- Consumes: `Adesao`, `Veredito`, `avaliarRitmo` (Task 5); `ITENS_CAMINHADA`, `buildDayRoutine` (Task 3); `SEQUENCIAS_FLEX` (`flex-progression.ts`); `noitesNoAlvo` (`daily-log-helpers.ts`); `ultimosDiasISO`, `somarDiasISO` (`today-date.ts`); `resolverAlvoSono` (`routine-times.ts`).
- Produces: `interface AdesaoDetalhada extends Adesao { alongamentosNoite: number }`; `contarAdesao(janela: readonly string[], dados: DadosAdesao, alvoSono: string): AdesaoDetalhada`; `lerAdesao(hoje: string, dias: number, alvoSono: string): Promise<AdesaoDetalhada>`; `useAdesao(hoje: string, dias: number, alvoSono: string): AdesaoDetalhada | undefined`; `<RitmoCard veredito={Veredito} />`.

- [ ] **Step 1: Escrever os testes que falham**

```ts
// tests/lib/adesao.test.ts
import { describe, it, expect } from "vitest";
import { contarAdesao } from "../../src/lib/adesao";
import { SEQUENCIAS_FLEX } from "../../src/lib/flex-progression";

const JANELA = ["2026-10-05", "2026-10-06", "2026-10-07"];

describe("contar a adesão da janela", () => {
  it("conta dias distintos dentro da janela e ignora o que está fora", () => {
    const a = contarAdesao(JANELA, {
      sessoes: [{ date: "2026-10-05" }, { date: "2026-10-05" }, { date: "2026-10-07" }, { date: "2026-10-01" }],
      checks: [
        { date: "2026-10-05", itemId: "caminhada-trabalho", done: true },
        { date: "2026-10-06", itemId: "caminhada-trabalho", done: false },
        { date: "2026-10-06", itemId: "caes", done: true },
        { date: "2026-10-07", itemId: "caminhada-fds", done: true },
      ],
      logs: [
        { date: "2026-10-05", waterMl: 0, activeBreakCount: 0, sleepAt: "22:10" },
        { date: "2026-10-06", waterMl: 0, activeBreakCount: 0, sleepAt: "23:40" },
      ],
      praticas: [
        { date: "2026-10-06", sequenceId: SEQUENCIAS_FLEX.noite[0], completed: true },
        { date: "2026-10-07", sequenceId: SEQUENCIAS_FLEX.manha[0], completed: true },
      ],
    }, "22:30");
    expect(a).toEqual({ dias: 3, treinos: 2, diasCardio: 2, noitesNoAlvo: 1, alongamentosNoite: 1 });
  });
});
```

```tsx
// tests/components/RitmoCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RitmoCard } from "../../src/components/RitmoCard";

describe("card Seu ritmo", () => {
  it("cedo: mostra a data da primeira comparação", () => {
    render(<RitmoCard veredito={{ estado: "cedo", primeiraComparacao: "2026-10-05" }} />);
    expect(screen.getByText(/05\/10/)).toBeInTheDocument();
  });

  it("veredito: título, números e textos", () => {
    render(<RitmoCard veredito={{ estado: "abaixo", kgSemana: 0.1, cmSemana: 0.1, titulo: "Abaixo do ritmo", texto: ["Frase um.", "Frase dois."] }} />);
    expect(screen.getByText("Abaixo do ritmo")).toBeInTheDocument();
    expect(screen.getByText(/0,1 kg/)).toBeInTheDocument();
    expect(screen.getByText("Frase dois.")).toBeInTheDocument();
  });

  it("sem partida não renderiza nada", () => {
    const { container } = render(<RitmoCard veredito={{ estado: "sem-partida" }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

Em `tests/pages/Today.test.tsx`, dentro do `describe("Today (backbone)")`, acrescente (e importe `RECOMECO_DATA` de `../../src/lib/objetivo`):

```tsx
  it("com partida medida, mostra o card Seu ritmo", async () => {
    await db.measurements.clear();
    await db.settings.put({ key: "heightCm", value: 173 });
    await db.measurements.add({ date: RECOMECO_DATA, weightKg: 96, waistCm: 99, neckCm: 40 });
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText("Seu ritmo")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/adesao.test.ts tests/components/RitmoCard.test.tsx tests/pages/Today.test.tsx`
Expected: FAIL — módulos não existem; Today sem "Seu ritmo".

- [ ] **Step 3: Implementar**

`src/lib/adesao.ts`:

```ts
// O que ela fez numa janela de dias, contado do banco. A contagem é pura
// (`contarAdesao`) e a leitura fica separada (`lerAdesao`), pra o teste não
// precisar de banco e pra o treinador e a revisão de domingo contarem igual.

import { db, type DailyLog, type PracticeLog, type RoutineCheck } from "./db";
import type { Adesao } from "./ritmo";
import { ITENS_CAMINHADA } from "./today-routine";
import { SEQUENCIAS_FLEX } from "./flex-progression";
import { noitesNoAlvo } from "./daily-log-helpers";
import { ultimosDiasISO } from "./today-date";

export interface AdesaoDetalhada extends Adesao {
  alongamentosNoite: number;
}

export interface DadosAdesao {
  sessoes: readonly { date: string }[];
  checks: readonly RoutineCheck[];
  logs: readonly DailyLog[];
  praticas: readonly PracticeLog[];
}

const CAMINHADAS = new Set<string>(ITENS_CAMINHADA);
const NOITE = new Set<string>(SEQUENCIAS_FLEX.noite);

/** Dias DISTINTOS de cada coisa: dois treinos no mesmo dia são um dia de
 *  treino, e o plano conta dias. */
export function contarAdesao(janela: readonly string[], dados: DadosAdesao, alvoSono: string): AdesaoDetalhada {
  const dentro = new Set(janela);
  const dias = (datas: string[]) => new Set(datas.filter((d) => dentro.has(d))).size;
  return {
    dias: janela.length,
    treinos: dias(dados.sessoes.map((s) => s.date)),
    diasCardio: dias(dados.checks.filter((c) => c.done && CAMINHADAS.has(c.itemId)).map((c) => c.date)),
    noitesNoAlvo: noitesNoAlvo(dados.logs.filter((l) => dentro.has(l.date)), alvoSono),
    alongamentosNoite: dias(dados.praticas.filter((p) => p.completed && NOITE.has(p.sequenceId)).map((p) => p.date)),
  };
}

export async function lerAdesao(hoje: string, dias: number, alvoSono: string): Promise<AdesaoDetalhada> {
  const janela = ultimosDiasISO(hoje, dias);
  const [sessoes, checks, logs, praticas] = await Promise.all([
    db.workoutSessions.toArray(),
    db.routineChecks.toArray(),
    db.dailyLog.where("date").anyOf(janela).toArray(),
    db.practiceLogs.toArray(),
  ]);
  return contarAdesao(janela, { sessoes, checks, logs, praticas }, alvoSono);
}
```

(Confira em `src/lib/db.ts` se `DailyLog`, `PracticeLog`, `RoutineCheck` são exportados como tipos; são `export interface`, então `import { type ... }` funciona.)

`src/hooks/useAdesao.ts`:

```ts
import { useLiveQuery } from "dexie-react-hooks";
import { lerAdesao, type AdesaoDetalhada } from "../lib/adesao";

/** A adesão dos últimos `dias` dias, viva. `undefined` enquanto o banco não
 *  respondeu — quem mostra card espera, pra não piscar um veredito com zeros. */
export function useAdesao(hoje: string, dias: number, alvoSono: string): AdesaoDetalhada | undefined {
  return useLiveQuery(() => lerAdesao(hoje, dias, alvoSono), [hoje, dias, alvoSono]);
}
```

`src/components/RitmoCard.tsx`:

```tsx
import type { Veredito } from "../lib/ritmo";

const dataBR = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const num = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

/** Seu ritmo da fase 1 contra o plano. O título é o veredito; os textos vêm
 *  prontos de `ritmo.ts` — a tela não decide nada, só mostra. */
export function RitmoCard({ veredito }: { veredito: Veredito }) {
  if (veredito.estado === "sem-partida") return null;
  if (veredito.estado === "cedo") {
    return (
      <div className="card">
        <p className="text-muted text-xs uppercase tracking-wider">Seu ritmo</p>
        <p className="text-nude-warm text-sm mt-1">A primeira comparação sai em {dataBR(veredito.primeiraComparacao)}, com uma medida a partir desse dia.</p>
        <p className="text-muted text-xs mt-1">Antes de 10 dias a fita e a balança oscilam mais do que você perde.</p>
      </div>
    );
  }
  return (
    <div className="card">
      <p className="text-muted text-xs uppercase tracking-wider">Seu ritmo</p>
      <p className="text-nude-warm text-sm mt-1">{veredito.titulo}</p>
      <p className="text-muted text-xs mt-1">{num(veredito.kgSemana)} kg e {num(veredito.cmSemana)} cm de cintura por semana</p>
      {veredito.texto.map((t) => (
        <p key={t} className="text-xs mt-1">{t}</p>
      ))}
    </div>
  );
}
```

Em `src/pages/Today.tsx`:
- imports: `import { RitmoCard } from "../components/RitmoCard";`, `import { avaliarRitmo } from "../lib/ritmo";`, `import { useAdesao } from "../hooks/useAdesao";`, e acrescente `somarDiasISO` ao import de `../lib/today-date` (ou crie o import);
- depois de `const ultimaMedida = measurementsAsc?.at(-1);` (l.374), acrescente:

```tsx
  // 14 dias de adesão pro treinador: a mesma janela do lembrete de medir.
  const adesao14 = useAdesao(todayISO, 14, alvoSono);
  const veredito = adesao14 ? avaliarRitmo(projecao, measurementsAsc ?? [], adesao14, modoCaminhada) : null;
  // O card aparece por 14 dias depois de cada medida — é quando o número é
  // novo — e sempre enquanto ainda é cedo pra comparar.
  const mostrarRitmo =
    !!veredito &&
    (veredito.estado === "cedo" ||
      (veredito.estado !== "sem-partida" && !!ultimaMedida && todayISO <= somarDiasISO(ultimaMedida.date, 14)));
```

  (`alvoSono` é a const que o Hoje já calcula para o item "Dormir"; se ela for declarada depois desta linha, mova este bloco para logo depois dela. Hooks não podem ficar dentro de condição.)
- logo depois de `{!partidaCarregando && <PartidaCard ... />}` (l.394): `{mostrarRitmo && veredito && <RitmoCard veredito={veredito} />}`

Em `src/pages/path/EvolucaoView.tsx` — sempre visível, no topo, antes do `<h2>` "Evolução · últimos 30 dias":
- imports: `usePartida` (`../../hooks/usePartida`), `useAdesao` (`../../hooks/useAdesao`), `useSetting` (`../../hooks/useSetting`), `avaliarRitmo` (`../../lib/ritmo`), `RitmoCard` (`../../components/RitmoCard`), `buildDayRoutine` (`../../lib/today-routine`), `resolverAlvoSono` (`../../lib/routine-times`), `diaDoAno` (`../../lib/today-date`);
- no componente, depois de `const t = hojeISO();`:

```tsx
  const { projecao } = usePartida();
  const modoCaminhada = useSetting("modoCaminhada");
  const routineTimes = useSetting("routineTimes");
  // Mesmo alvo de sono do Hoje e da Vitalidade — `resolverAlvoSono` é a regra única.
  const agora = new Date();
  const alvoSono = resolverAlvoSono(buildDayRoutine(agora.getDay(), diaDoAno(agora)).blocks, routineTimes);
  const adesao14 = useAdesao(t, 14, alvoSono);
  const veredito = adesao14 ? avaliarRitmo(projecao, measurements ?? [], adesao14, modoCaminhada) : null;
```

- no JSX, depois de `<PathTabs />`: `{veredito && <div className="mb-4"><RitmoCard veredito={veredito} /></div>}`

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/adesao.test.ts tests/components/RitmoCard.test.tsx tests/pages/Today.test.tsx tests/pages/evolucao.smoke.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/adesao.ts src/hooks/useAdesao.ts src/components/RitmoCard.tsx src/pages/Today.tsx src/pages/path/EvolucaoView.tsx tests/lib/adesao.test.ts tests/components/RitmoCard.test.tsx tests/pages/Today.test.tsx
git commit -m "feat(treinador): card Seu ritmo no Hoje (14 dias após medir) e na Evolução"
```

---

### Task 7: Revisão de domingo

**Files:**
- Create: `src/lib/revisao-semanal.ts`
- Create: `src/components/RevisaoDomingoCard.tsx`
- Modify: `src/pages/Today.tsx`
- Test: `tests/lib/revisao-semanal.test.ts`, `tests/components/RevisaoDomingoCard.test.tsx`

**Interfaces:**
- Consumes: `alavancaMaisFraca` (Task 5); `AdesaoDetalhada`, `useAdesao` (Task 6); `ModoCaminhada` (Task 1).
- Produces: `interface DadosDaSemana extends AdesaoDetalhada { cinturaUltima?: number; cinturaAnterior?: number }`; `interface Revisao { linhas: string[]; ajuste: string }`; `revisarSemana(d: DadosDaSemana, modo: ModoCaminhada): Revisao`; `<RevisaoDomingoCard revisao={Revisao} />`.

- [ ] **Step 1: Escrever os testes que falham**

```ts
// tests/lib/revisao-semanal.test.ts
import { describe, it, expect } from "vitest";
import { revisarSemana } from "../../src/lib/revisao-semanal";

const CHEIA = { dias: 7, treinos: 5, diasCardio: 7, noitesNoAlvo: 7, alongamentosNoite: 7, cinturaUltima: 96.5, cinturaAnterior: 97.2 };

describe("revisão de domingo", () => {
  it("semana cheia: as cinco linhas e 'repete'", () => {
    const r = revisarSemana(CHEIA, "caminhada");
    expect(r.linhas).toEqual([
      "Treinos: 5 de 5",
      "Caminhada ou esteira: 7 de 7 dias",
      "Sono no horário: 7 de 7 noites",
      "Alongamento da noite: 7 de 7",
      "Cintura: 96,5 cm (−0,7 desde a medida anterior)",
    ]);
    expect(r.ajuste).toMatch(/[Rr]epete/);
  });

  it("pausada tira a linha de cardio", () => {
    expect(revisarSemana(CHEIA, "pausada").linhas.some((l) => /Caminhada/.test(l))).toBe(false);
  });

  // Review Focus: domingo com a semana vazia
  it("semana vazia: zeros, sem cintura, e o ajuste aponta o treino", () => {
    const r = revisarSemana({ dias: 7, treinos: 0, diasCardio: 0, noitesNoAlvo: 0, alongamentosNoite: 0 }, "caminhada");
    expect(r.linhas[0]).toBe("Treinos: 0 de 5");
    expect(r.linhas.at(-1)).toBe("Cintura: sem medida ainda");
    expect(r.ajuste).toMatch(/Treino/);
    expect(JSON.stringify(r)).not.toMatch(/NaN|undefined/);
  });
});
```

```tsx
// tests/components/RevisaoDomingoCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RevisaoDomingoCard } from "../../src/components/RevisaoDomingoCard";

describe("card da revisão de domingo", () => {
  it("mostra as linhas e o ajuste", () => {
    render(<RevisaoDomingoCard revisao={{ linhas: ["Treinos: 3 de 5"], ajuste: "Pra semana que vem: dormir mais cedo." }} />);
    expect(screen.getByText("Revisão da semana")).toBeInTheDocument();
    expect(screen.getByText("Treinos: 3 de 5")).toBeInTheDocument();
    expect(screen.getByText(/semana que vem/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/lib/revisao-semanal.test.ts tests/components/RevisaoDomingoCard.test.tsx`
Expected: FAIL — módulos não existem.

- [ ] **Step 3: Implementar**

`src/lib/revisao-semanal.ts`:

```ts
// A semana em uma tela, no domingo. Módulo puro.
//
// O resumo do Hoje (`semana.ts`) responde "estou progredindo?" com números
// soltos; a revisão fecha a semana com UMA frase do que mudar na próxima — a
// alavanca mais fraca, pela mesma regra do treinador (`alavancaMaisFraca`).

import { alavancaMaisFraca } from "./ritmo";
import type { AdesaoDetalhada } from "./adesao";
import type { ModoCaminhada } from "./objetivo";

export interface DadosDaSemana extends AdesaoDetalhada {
  cinturaUltima?: number;
  cinturaAnterior?: number;
}

export interface Revisao {
  linhas: string[];
  ajuste: string;
}

/** Acima disto em todas as alavancas a semana foi cheia — apontar "a mais
 *  fraca" numa semana boa seria inventar defeito. */
const SEMANA_CHEIA = 0.85;

const num = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
const sinal = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${num(Math.abs(n))}`;

export function revisarSemana(d: DadosDaSemana, modo: ModoCaminhada): Revisao {
  const linhas = [`Treinos: ${Math.min(d.treinos, 5)} de 5`];
  if (modo !== "pausada") linhas.push(`Caminhada ou esteira: ${d.diasCardio} de ${d.dias} dias`);
  linhas.push(`Sono no horário: ${d.noitesNoAlvo} de ${d.dias} noites`);
  linhas.push(`Alongamento da noite: ${d.alongamentosNoite} de ${d.dias}`);
  if (d.cinturaUltima === undefined) {
    linhas.push("Cintura: sem medida ainda");
  } else if (d.cinturaAnterior === undefined) {
    linhas.push(`Cintura: ${num(d.cinturaUltima)} cm`);
  } else {
    linhas.push(`Cintura: ${num(d.cinturaUltima)} cm (${sinal(Math.round((d.cinturaUltima - d.cinturaAnterior) * 10) / 10)} desde a medida anterior)`);
  }

  const fraca = alavancaMaisFraca(d, modo);
  const ajuste =
    fraca.fracao >= SEMANA_CHEIA
      ? "Semana cheia. Repete a mesma na próxima."
      : `Pra semana que vem — ${fraca.frase}`;
  return { linhas, ajuste };
}
```

`src/components/RevisaoDomingoCard.tsx`:

```tsx
import type { Revisao } from "../lib/revisao-semanal";

export function RevisaoDomingoCard({ revisao }: { revisao: Revisao }) {
  return (
    <div className="card">
      <p className="text-muted text-xs uppercase tracking-wider">Revisão da semana</p>
      {revisao.linhas.map((l) => (
        <p key={l} className="text-sm mt-1">{l}</p>
      ))}
      <p className="text-nude-warm text-sm mt-2">{revisao.ajuste}</p>
    </div>
  );
}
```

Em `src/pages/Today.tsx`:
- imports: `RevisaoDomingoCard` (`../components/RevisaoDomingoCard`), `revisarSemana` (`../lib/revisao-semanal`);
- junto do bloco do treinador (Task 6), sem condição (é hook):

```tsx
  // Domingo fecha a semana de segunda a domingo: 7 dias terminando hoje.
  const adesao7 = useAdesao(todayISO, 7, alvoSono);
  const cinturas = (measurementsAsc ?? []).filter((m) => !!m.waistCm).map((m) => m.waistCm!);
```

- no JSX, logo depois do `RitmoCard`:

```tsx
      {dayOfWeek === 0 && adesao7 && (
        <RevisaoDomingoCard
          revisao={revisarSemana({ ...adesao7, cinturaUltima: cinturas.at(-1), cinturaAnterior: cinturas.at(-2) }, modoCaminhada)}
        />
      )}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/lib/revisao-semanal.test.ts tests/components/RevisaoDomingoCard.test.tsx tests/pages/Today.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/revisao-semanal.ts src/components/RevisaoDomingoCard.tsx src/pages/Today.tsx tests/lib/revisao-semanal.test.ts tests/components/RevisaoDomingoCard.test.tsx
git commit -m "feat(treinador): revisão de domingo com uma frase de ajuste"
```

---

### Task 8: Suíte inteira, build e registro

**Files:**
- Modify: `docs/CONTINUAR-AQUI.md` (tabela da seção 1; dívidas na seção 9)

- [ ] **Step 1: Suíte e build**

Run: `npm run test` e `npm run build` e `npm run build:app`
Expected: tudo verde; `tsc -b` sem erro.

- [ ] **Step 2: Atualizar `docs/CONTINUAR-AQUI.md`**

Na tabela da seção 1, acrescente a linha:

```markdown
| A · Treinador | modo das caminhadas (gasto, projeção, comer fora, Hoje), card Seu ritmo (a cintura decide, nunca cortar comida), revisão de domingo | spec `docs/superpowers/specs/2026-10-01-treinador-design.md` · plano `docs/superpowers/plans/2026-10-01-treinador.md` |
```

Na seção 3 (decisões), acrescente:

```markdown
| 10-01 | Abaixo do ritmo o app **nunca sugere cortar comida** — só adesão e prazo. Acima: comer mais, em gramas. |
| 10-01 | Caminhada muda por **modo** em Configurações (caminhada / esteira / pausada), não por escolha diária. |
```

Na seção 9, em "Anteriores", acrescente:

```markdown
- Textos fixos que dizem que a caminhada entrega a zona 2 (`SessionDetail.tsx` ~l.170, `exercises-seed.ts` `cardio-zona2`) não acompanham o modo das caminhadas (entrega A deixou de fora).
```

- [ ] **Step 3: Commit**

```bash
git add docs/CONTINUAR-AQUI.md
git commit -m "docs: entrega A (treinador) registrada"
```
