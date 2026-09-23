# Chun-Li macia — Entrega 2 (partida automática, fases, horizontes, advisor) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A primeira medição que ela registrar a partir de 23/09/2026 vira a partida. Dela o app calcula o peso-alvo da fase 1 (pela massa magra), o ritmo e as datas em mês de calendário. Os horizontes passam a descrever a Chun-Li macia com os tetos reais (natural × BBL × implante). O conselheiro de ciclo passa a liberar a fase 2 pela cintura 84.

**Architecture:** Uma lib pura nova, `src/lib/partida.ts`, escolhe a partida e projeta a fase 1. Um hook, `usePartida`, a lê do IndexedDB. O Hoje mostra um card enquanto não houver partida. A seção "Linha do tempo" dos Horizontes vira função pura da projeção. As constantes continuam todas em `objetivo.ts`.

**Tech Stack:** React 18 + TS strict (`verbatimModuleSyntax`), Dexie + dexie-react-hooks, Vitest + Testing Library + fake-indexeddb.

**Spec:** `docs/superpowers/specs/2026-09-23-chun-li-macia-design.md` (parte 1). Norte: `docs/OBJETIVO.md`.

## Global Constraints

- pt-BR com acento, sem emoji, "você". Nunca "enquanto a TRH não vem", "por enquanto", "até lá". O impossível é chamado de "impossível".
- Números-alvo só em `src/lib/objetivo.ts`. Telas e seeds interpolam.
- Toda mudança de seed sobe a versão (`MILESTONE_SEED_VERSION` 8→9), com o pino atualizado em `tests/lib/seeds-chegam-no-aparelho.test.ts` quando a versão for pinada lá.
- Módulos em `src/lib/` puros: sem `db` e sem `new Date()`. A data de hoje entra como parâmetro.
- Sem partida, nenhuma tela mostra prazo ou peso-alvo contado de maio. Mostra "aparece depois da sua primeira medição".
- Rótulos visíveis continuam neutros (`tests/lib/discricao-rotulos.test.ts`).
- Commits terminam com `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`. Sem push sem o ok dela.

## Review Focus

1. **Medição antiga no banco:** a medição de 13/05 que o seed gravou não pode virar a partida (data < `RECOMECO_DATA`).
2. **Medição incompleta:** se ela registrar só peso, sem cintura ou pescoço, não há partida (o cálculo precisa dos três) e o card continua pedindo.
3. **Partida com cintura já ≤ 88:** o marco 88 aparece como "já passou", não como data futura nem negativa.
4. **Duas medições no mesmo dia:** a partida é a primeira válida pela data e, no empate, pelo menor id. O teste cobre o desempate.
5. **Horizontes sem partida:** a linha do tempo não quebra e não mostra `NaN` nem datas de maio.

---

### Task 1: Constantes do objetivo — consumo real, recomeço, fase 3

**Files:**
- Modify: `src/lib/objetivo.ts` (`CONSUMO`, `FASES`, `MARCOS_CINTURA`, novas constantes)
- Test: `tests/lib/objetivo.test.ts`

**Interfaces:**
- Produces: `RECOMECO_DATA = "2026-09-23"`; `PCT_GORDURA_FIM_FASE1: readonly [number, number] = [0.11, 0.13]`; `FIM_FASE2_MESES: readonly [number, number] = [21, 27]`; `FaseObjetivo["id"]` inclui `"fase-3"`; `CONSUMO.gastoEstimadoKcalMin = 2700`, `gastoEstimadoKcalMax = 2900`.

- [ ] **Step 1: Failing tests** — acrescentar em `tests/lib/objetivo.test.ts`:
```ts
describe("recomeço e fase 3 (2026-09-23)", () => {
  it("a data do recomeço é 23/09/2026", () => {
    expect(RECOMECO_DATA).toBe("2026-09-23");
  });
  it("o gasto conta a caminhada de 5 km nos sete dias", () => {
    expect([CONSUMO.gastoEstimadoKcalMin, CONSUMO.gastoEstimadoKcalMax]).toEqual([2700, 2900]);
  });
  it("existe a fase 3 (marcar de leve), encadeada depois da fase 2", () => {
    const f2 = FASES.find((f) => f.id === "fase-2")!;
    const f3 = FASES.find((f) => f.id === "fase-3")!;
    expect(f3.mesInicio).toBe(f2.mesFim);
    expect(f3.pesoKgMax).toBeLessThan(f2.pesoKgMax);
  });
  it("a faixa de gordura do fim da fase 1 reproduz os 80-82 kg da partida de maio", () => {
    const magra = MEDIDAS_PARTIDA.pesoKg * (1 - 0.257);
    expect(Math.round(magra / (1 - PCT_GORDURA_FIM_FASE1[0]))).toBe(80);
    expect(Math.round(magra / (1 - PCT_GORDURA_FIM_FASE1[1]))).toBe(82);
  });
});
```
(importar `RECOMECO_DATA`, `PCT_GORDURA_FIM_FASE1`, `MEDIDAS_PARTIDA` e `CONSUMO` de `objetivo`).

Run: `npx vitest run tests/lib/objetivo.test.ts` → FAIL.

- [ ] **Step 2: Implement** em `src/lib/objetivo.ts`:
  - `FaseObjetivo.id: "fase-1" | "fase-2" | "fase-3"`.
  - `FASES`: fase-1 `mesFim: 7`; fase-2 `mesInicio: 7, mesFim: 24`; nova fase-3:
```ts
  {
    id: "fase-3",
    nome: "Marcar de leve",
    resumo:
      "Opcional e curta: 2-3 meses de déficit leve pro 'durinha, levemente marcado'. Não acontece se o BBL estiver marcado — a cirurgia precisa de gordura pra colher.",
    mesInicio: 24,
    mesFim: 27,
    pesoKgMin: 82,
    pesoKgMax: 86,
    cinturaCm: 82,
    quadrilCm: 114,
    whrProvavel: 0.72,
  },
```
  - `MARCOS_CINTURA`: 88 → `mesMin: 4, mesMax: 5`; 84 continua `6–8`.
  - `CONSUMO`: `gastoEstimadoKcalMin: 2700`, `gastoEstimadoKcalMax: 2900`. O comentário ganha a linha: "(2.600-2.800 era a conta sem a caminhada de sábado e domingo — corrigido na entrega 2)".
  - Novas constantes, com comentário do porquê:
```ts
/** O dia em que ela recomeçou do zero (spec Chun-Li macia). A partida é a
 *  primeira medição registrada a partir daqui — ver src/lib/partida.ts. */
export const RECOMECO_DATA = "2026-09-23";

/** %G (régua androide) do fim da fase 1. A faixa foi escolhida por reproduzir
 *  os 80-82 kg já prometidos para a partida de maio (massa magra ~71 kg):
 *  peso-alvo = massa magra ÷ (1 − %G). Não é meta de secura — é a mesma
 *  massa magra com a barriga fora. */
export const PCT_GORDURA_FIM_FASE1: readonly [number, number] = [0.11, 0.13];

/** Fim da fase 2 em meses desde a partida (máximo natural). */
export const FIM_FASE2_MESES: readonly [number, number] = [21, 27];
```
- [ ] **Step 3:** `npm test`. Os testes de coerência do cardápio derivam de `CONSUMO`: manutenção 2.750 fica dentro de 5% de 2.800 e superávit 2.950 fica acima de 2.900. Se algo cobrar número à mão, derivar.
- [ ] **Step 4: Commit** `feat(objetivo): recomeço em 23/09, gasto com a caminhada dos sete dias e a fase 3`.

---

### Task 2: `partida.ts` — escolher a partida e projetar a fase 1

**Files:**
- Create: `src/lib/partida.ts`
- Test: `tests/lib/partida.test.ts`

**Interfaces:**
- Consumes: `RECOMECO_DATA`, `PCT_GORDURA_FIM_FASE1`, `CONSUMO`, `MARCOS_CINTURA`, `FASES`, `FIM_FASE2_MESES`, `DISTRIBUICAO_GORDURA_ATUAL` (objetivo.ts); `estimateBodyFatNavy` (body-composition.ts); `Measurement` (db.ts).
- Produces:
```ts
export interface Partida { data: string; pesoKg: number; cinturaCm: number; pescocoCm: number; quadrilCm?: number }
export interface Projecao {
  partida: Partida;
  gorduraPct: number;
  massaMagraKg: number;
  pesoAlvoFase1: [number, number];       // kg, arredondado
  ritmoKgSemana: [number, number];       // 2 casas
  fimFase1: [string, string];            // "YYYY-MM" (mais cedo, mais tarde)
  cintura88: [string, string] | "ja";    // "ja" se a partida já está ≤ 88
  fimFase2: [string, string];
}
export function escolherPartida(ms: readonly Measurement[], recomeco?: string): Partida | null
export function projetar(p: Partida, alturaCm: number): Projecao | null
export function mesAno(yyyyMm: string): string   // "2027-03" → "mar/2027"
```

- [ ] **Step 1: Failing tests** `tests/lib/partida.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { escolherPartida, projetar, mesAno } from "../../src/lib/partida";
import type { Measurement } from "../../src/lib/db";

const m = (x: Partial<Measurement> & { date: string }): Measurement => ({ ...x } as Measurement);

describe("escolher a partida", () => {
  it("ignora a medição de maio que o seed gravou", () => {
    expect(escolherPartida([m({ date: "2026-05-13", weightKg: 96, waistCm: 99, neckCm: 40 })])).toBeNull();
  });
  it("precisa de peso, cintura e pescoço — sem um deles não há partida", () => {
    expect(escolherPartida([m({ date: "2026-09-25", weightKg: 96, waistCm: 99 })])).toBeNull();
  });
  it("pega a primeira válida a partir do recomeço; no mesmo dia, o menor id", () => {
    const p = escolherPartida([
      m({ id: 9, date: "2026-10-10", weightKg: 94, waistCm: 97, neckCm: 40 }),
      m({ id: 5, date: "2026-09-25", weightKg: 96.4, waistCm: 99.5, neckCm: 40 }),
      m({ id: 3, date: "2026-09-25", weightKg: 96.2, waistCm: 99, neckCm: 40, hipCm: 114 }),
    ]);
    expect(p).toEqual({ data: "2026-09-25", pesoKg: 96.2, cinturaCm: 99, pescocoCm: 40, quadrilCm: 114 });
  });
});

describe("projeção da fase 1", () => {
  const partida = { data: "2026-09-25", pesoKg: 96, cinturaCm: 99, pescocoCm: 40 };
  const pr = projetar(partida, 173)!;

  it("a massa magra sai da régua androide e o peso-alvo reproduz 80-82", () => {
    expect(pr.gorduraPct).toBeCloseTo(25.7, 1);
    expect(pr.pesoAlvoFase1).toEqual([80, 82]);
  });
  it("o ritmo vem do déficit de CONSUMO (2.700-2.900 contra 2.200)", () => {
    expect(pr.ritmoKgSemana).toEqual([0.45, 0.64]);
  });
  it("as datas saem em mês de calendário a partir da partida, mais cedo antes de mais tarde", () => {
    expect(pr.fimFase1[0] <= pr.fimFase1[1]).toBe(true);
    expect(pr.fimFase1[0] >= "2027-02").toBe(true);
    expect(pr.fimFase1[1] <= "2027-06").toBe(true);
    expect(pr.fimFase2).toEqual(["2028-06", "2028-12"]);
  });
  it("com a cintura já em 88 ou menos, o marco é 'já'", () => {
    expect(projetar({ ...partida, cinturaCm: 87 }, 173)!.cintura88).toBe("ja");
  });
  it("sem altura não há projeção", () => {
    expect(projetar(partida, 0)).toBeNull();
  });
  it("mês por extenso curto", () => {
    expect(mesAno("2027-03")).toBe("mar/2027");
  });
});
```
Run → FAIL (o módulo não existe).

- [ ] **Step 2: Implement** `src/lib/partida.ts`:
```ts
import type { Measurement } from "./db";
import { estimateBodyFatNavy } from "./body-composition";
import {
  RECOMECO_DATA, PCT_GORDURA_FIM_FASE1, CONSUMO, FIM_FASE2_MESES,
  DISTRIBUICAO_GORDURA_ATUAL, FASES,
} from "./objetivo";
import { KCAL_POR_KG_GORDURA } from "./comer-fora";

// A partida é a primeira medição dela a partir do recomeço (23/09/2026) — não
// um número escrito no código. Ela começou do zero sem ter como medir no dia;
// o app espera a medição e calcula tudo dela. Módulo puro: quem lê o banco é
// usePartida.

export interface Partida { data: string; pesoKg: number; cinturaCm: number; pescocoCm: number; quadrilCm?: number }
export interface Projecao {
  partida: Partida;
  gorduraPct: number;
  massaMagraKg: number;
  pesoAlvoFase1: [number, number];
  ritmoKgSemana: [number, number];
  fimFase1: [string, string];
  cintura88: [string, string] | "ja";
  fimFase2: [string, string];
}

const CINTURA_FIM_FASE1 = FASES.find((f) => f.id === "fase-1")!.cinturaCm;
const CINTURA_TRAVA = 88;
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function escolherPartida(ms: readonly Measurement[], recomeco: string = RECOMECO_DATA): Partida | null {
  const validas = ms
    .filter((x) => x.date >= recomeco && !!x.weightKg && !!x.waistCm && !!x.neckCm)
    .sort((a, b) => (a.date === b.date ? (a.id ?? 0) - (b.id ?? 0) : a.date < b.date ? -1 : 1));
  const p = validas[0];
  if (!p) return null;
  return {
    data: p.date, pesoKg: p.weightKg!, cinturaCm: p.waistCm!, pescocoCm: p.neckCm!,
    ...(p.hipCm ? { quadrilCm: p.hipCm } : {}),
  };
}

/** "YYYY-MM-DD" + semanas → "YYYY-MM". Sem Date local: conta em UTC puro. */
function somaSemanas(data: string, semanas: number): string {
  const d = new Date(`${data}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + Math.round(semanas * 7));
  return d.toISOString().slice(0, 7);
}
function somaMeses(data: string, meses: number): string {
  const [a, m] = data.split("-").map(Number);
  const total = a * 12 + (m - 1) + meses;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

export function mesAno(yyyyMm: string): string {
  const [a, m] = yyyyMm.split("-").map(Number);
  return `${MESES[m - 1]}/${a}`;
}

export function projetar(p: Partida, alturaCm: number): Projecao | null {
  const pct = estimateBodyFatNavy({
    heightCm: alturaCm, neckCm: p.pescocoCm, waistCm: p.cinturaCm, hipCm: p.quadrilCm,
    distribuicao: DISTRIBUICAO_GORDURA_ATUAL,
  });
  if (pct === null) return null;
  const magra = p.pesoKg * (1 - pct / 100);
  const alvo: [number, number] = [
    Math.round(magra / (1 - PCT_GORDURA_FIM_FASE1[0])),
    Math.round(magra / (1 - PCT_GORDURA_FIM_FASE1[1])),
  ];
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const ritmo: [number, number] = [
    r2(((CONSUMO.gastoEstimadoKcalMin - CONSUMO.metaKcal) * 7) / KCAL_POR_KG_GORDURA),
    r2(((CONSUMO.gastoEstimadoKcalMax - CONSUMO.metaKcal) * 7) / KCAL_POR_KG_GORDURA),
  ];
  // Mais cedo: menos quilos a perder no ritmo mais rápido. Mais tarde: o contrário.
  const semCedo = Math.max(0, p.pesoKg - alvo[1]) / ritmo[1];
  const semTarde = Math.max(0, p.pesoKg - alvo[0]) / ritmo[0];
  // Heurística declarada: a cintura cai em proporção ao caminho da fase 1.
  // Não é fisiologia exata — é a régua que o app usa pra dar um mês, e a
  // medição mensal corrige.
  const fracao88 = (p.cinturaCm - CINTURA_TRAVA) / (p.cinturaCm - CINTURA_FIM_FASE1);
  const cintura88: Projecao["cintura88"] =
    p.cinturaCm <= CINTURA_TRAVA || !(fracao88 > 0)
      ? "ja"
      : [somaSemanas(p.data, semCedo * fracao88), somaSemanas(p.data, semTarde * fracao88)];
  return {
    partida: p,
    gorduraPct: pct,
    massaMagraKg: Math.round(magra * 10) / 10,
    pesoAlvoFase1: alvo,
    ritmoKgSemana: ritmo,
    fimFase1: [somaSemanas(p.data, semCedo), somaSemanas(p.data, semTarde)],
    cintura88,
    fimFase2: [somaMeses(p.data, FIM_FASE2_MESES[0]), somaMeses(p.data, FIM_FASE2_MESES[1])],
  };
}
```
Conferir que `KCAL_POR_KG_GORDURA` é exportado de `comer-fora.ts` (ele é). Se `import` de `comer-fora` criar ciclo com `objetivo`, mover a constante para `objetivo.ts` e reexportar em `comer-fora`.

- [ ] **Step 3:** rodar o teste → PASS. Se os limites de data do teste não baterem por arredondamento, **conferir a conta à mão** antes de mexer no teste. A faixa esperada com 96 → 80–82 kg a 0,45–0,64 kg/sem é de 22 a 36 semanas.
- [ ] **Step 4: Commit** `feat(objetivo): a partida é a primeira medição dela, e a fase 1 se projeta dela`.

---

### Task 3: `usePartida` e o card de partida no Hoje

**Files:**
- Create: `src/hooks/usePartida.ts`, `src/components/PartidaCard.tsx`
- Modify: `src/pages/Today.tsx` (render do card no topo, antes dos StreakCards)
- Test: `tests/components/partida-card.test.tsx`

**Interfaces:**
- Produces: `usePartida(): { partida: Partida | null; projecao: Projecao | null; carregando: boolean }`, que lê `db.measurements.toArray()` e o setting `heightCm`; `<PartidaCard projecao={Projecao | null} />`.

- [ ] **Step 1: Failing test**:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PartidaCard } from "../../src/components/PartidaCard";
import { projetar } from "../../src/lib/partida";

describe("card de partida no Hoje", () => {
  it("sem partida, pede a medição com os três campos que a conta precisa e leva pro Corpo", () => {
    render(<MemoryRouter><PartidaCard projecao={null} /></MemoryRouter>);
    expect(screen.getByText(/medição de partida/i)).toBeInTheDocument();
    expect(screen.getByText(/umbigo/i)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/corpo/medidas");
  });
  it("com partida, mostra peso-alvo e o mês do fim da fase 1", () => {
    const pr = projetar({ data: "2026-09-25", pesoKg: 96, cinturaCm: 99, pescocoCm: 40 }, 173)!;
    render(<MemoryRouter><PartidaCard projecao={pr} /></MemoryRouter>);
    expect(screen.getByText(/80–82 kg/)).toBeInTheDocument();
    expect(screen.getByText(/fim da fase 1/i)).toBeInTheDocument();
  });
});
```
- [ ] **Step 2: Implement.**
  - `usePartida`: `useLiveQuery(() => db.measurements.toArray(), [])` + `useSetting("heightCm")`. Se a altura for 0, usar `Math.round(MEDIDAS_PARTIDA.alturaM * 100)`, porque a altura não muda.
  - `PartidaCard`: usa o estilo `card` dos outros cartões.
    - Sem projeção: título "Medição de partida" e o texto "Peso, cintura na altura do umbigo e pescoço — os prazos e o peso-alvo saem dela. Leva 3 minutos com a fita.", com um `Link to="/corpo/medidas"` "Medir agora".
    - Com projeção: "Fase 1 · peso-alvo {a}–{b} kg · fim da fase 1 entre {mesAno(c)} e {mesAno(d)}" e, se `cintura88 !== "ja"`, "cintura 88 entre …". O card fica sempre visível: é o norte do dia, uma linha, sem ocupar a tela.
  - Em `Today.tsx`, chamar `usePartida()` e renderizar `<PartidaCard projecao={projecao} />` logo depois do card de foco. Enquanto `carregando`, não renderizar nada, para não piscar o pedido de medição.
- [ ] **Step 3:** `npm test` → PASS. Conferir no navegador (`npx vite --port 5199`) que o card aparece com o banco vazio.
- [ ] **Step 4: Commit** `feat(hoje): sem medição de partida o Hoje pede a medição; com ela, mostra alvo e prazo`.

---

### Task 4: Horizontes — Chun-Li macia, peito, cirurgia e linha do tempo da partida

**Files:**
- Create: `src/lib/linha-do-tempo.ts`
- Modify: `src/data/horizontes-seed.ts` (tira a seção `linha-do-tempo`; reescreve `trilha-vestida` e `cirurgia`; nova `peito`), `src/pages/workout/Horizontes.tsx` (acrescenta a seção dinâmica)
- Modify: `tests/data/horizontes-seed.test.ts`
- Test: `tests/lib/linha-do-tempo.test.ts`

**Interfaces:**
- Produces: `linhaDoTempo(pr: Projecao | null): GuideSection` com `id: "linha-do-tempo"`.

- [ ] **Step 1: Failing tests** `tests/lib/linha-do-tempo.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { linhaDoTempo } from "../../src/lib/linha-do-tempo";
import { projetar } from "../../src/lib/partida";

describe("linha do tempo", () => {
  it("sem partida, diz que os prazos aparecem depois da primeira medição — sem datas de maio", () => {
    const s = JSON.stringify(linhaDoTempo(null));
    expect(s).toMatch(/depois da sua primeira medição/i);
    expect(s).not.toMatch(/2026-05|13\/05|maio/i);
    expect(s).not.toMatch(/NaN|undefined/);
  });
  it("com partida, dá mês de calendário pra cintura 88, fim da fase 1 e fim da fase 2", () => {
    const pr = projetar({ data: "2026-09-25", pesoKg: 96, cinturaCm: 99, pescocoCm: 40 }, 173)!;
    const s = JSON.stringify(linhaDoTempo(pr));
    expect(s).toMatch(/Cintura 88/);
    expect(s).toMatch(/\/2027/);
    expect(s).toMatch(/\/2028/);
    expect(s).toMatch(/balança SOBE/);
  });
  it("não ancora prazo em idade", () => {
    const pr = projetar({ data: "2026-09-25", pesoKg: 96, cinturaCm: 99, pescocoCm: 40 }, 173)!;
    expect(JSON.stringify(linhaDoTempo(pr))).not.toMatch(/\b\d{2}\s*anos\b/i);
  });
});
```
Em `tests/data/horizontes-seed.test.ts`:
- a lista de seções vira `["trilha-vestida", "peito", "trilha-cama", "cirurgia", "flexibilidade"]`;
- o teste "a linha do tempo não ancora prazo em idade" sai daqui, porque passou para o arquivo acima;
- acrescentar:
```ts
  it("a trilha vestida descreve a Chun-Li macia com glúteo destacado", () => {
    const v = JSON.stringify(HORIZONTES.find((s) => s.id === "trilha-vestida")!);
    expect(v).toMatch(/Chun-Li/);
    expect(v).toMatch(/destacad/i);
  });
  it("o peito diz o que dá sem hormônio e chama mama de impossível sem implante ou TRH", () => {
    const p = JSON.stringify(HORIZONTES.find((s) => s.id === "peito")!);
    expect(p).toMatch(/imposs[íi]vel/i);
    expect(p).toMatch(/implante/i);
  });
  it("a cirurgia dá os dois tetos e marca o fim da fase discreta como decisão dela", () => {
    const c = JSON.stringify(HORIZONTES.find((s) => s.id === "cirurgia")!);
    expect(c).toMatch(/0,62/);
    expect(c).toMatch(/0,72/);
    expect(c).toMatch(/discreta/i);
  });
```
Run → FAIL.

- [ ] **Step 2: Implement.**

`src/lib/linha-do-tempo.ts`:
```ts
import type { GuideSection } from "../components/GuideAccordion";
import type { Projecao } from "./partida";
import { mesAno } from "./partida";
import { FASES } from "./objetivo";

const FASE_2 = FASES.find((f) => f.id === "fase-2")!;
const entre = ([a, b]: [string, string]) => (a === b ? mesAno(a) : `${mesAno(a)} e ${mesAno(b)}`);

// Os prazos saem da medição de partida dela, nunca de maio (ela recomeçou do
// zero em 23/09/2026). Sem partida, a seção diz isso em vez de inventar data.
export function linhaDoTempo(pr: Projecao | null): GuideSection {
  const intro = "O que define o ritmo é adesão, não idade.";
  if (!pr) {
    return {
      id: "linha-do-tempo",
      title: "Linha do tempo",
      intro: `Os prazos aparecem depois da sua primeira medição — peso, cintura no umbigo e pescoço. ${intro}`,
      tips: ["Mede no aba Corpo e volta aqui: cada data sai da sua medição, não de uma conta genérica."],
    };
  }
  const tips = [
    `Partida: ${pr.partida.pesoKg} kg, cintura ${pr.partida.cinturaCm}. Ritmo esperado: ${pr.ritmoKgSemana[0].toLocaleString("pt-BR")}–${pr.ritmoKgSemana[1].toLocaleString("pt-BR")} kg por semana.`,
    pr.cintura88 === "ja"
      ? "Cintura 88: você já começou abaixo dela — a trava do superávit não te segura."
      : `Cintura 88 entre ${entre(pr.cintura88)}: é a trava que destrava o superávit.`,
    `Fim da fase 1 entre ${entre(pr.fimFase1)}: cintura 84 e peso por volta de ${pr.pesoAlvoFase1[0]}–${pr.pesoAlvoFase1[1]} kg.`,
    `Fase 2 até ${entre(pr.fimFase2)}: a balança SOBE de propósito, até ${FASE_2.pesoKgMin}-${FASE_2.pesoKgMax} kg, e o quadril volta a ${FASE_2.quadrilCm} feito de músculo.`,
    "Se a medição do mês ficar atrás da data, a pergunta é adesão (16h e jantar), não o plano.",
  ];
  return { id: "linha-do-tempo", title: "Linha do tempo", intro, tips };
}
```

`src/data/horizontes-seed.ts`:
- tirar a seção `linha-do-tempo`.
- reescrever a `trilha-vestida`. **Os tips não mudam** (continuam passando pelos testes de 0,87, 0,75-0,78, 0,72-0,74 e "impossível"). Muda o título, "Trilha 1 — o corpo vestida: Chun-Li macia", e entra um tip novo no topo: "O norte é a Chun-Li macia com glúteo destacado: perna forte e grossa, glúteo redondo que passa da linha da coxa, costas com postura, peito cheio em cima, pele lisa com o músculo aparecendo quando você contrai." O tip "Então o contorno que você constrói é ampulheta ATLÉTICA…" continua.
- nova seção `peito`, depois da `trilha-vestida`:
```ts
  {
    id: "peito",
    title: "Peito — o que dá e o que não dá",
    intro: "Sem estrogênio não existe mama: é tecido glandular, e ele só cresce com hormônio. Isso é impossível, não difícil.",
    tips: [
      "O que dá: peitoral de cima e do meio (supino inclinado, crucifixo) enche a parte de cima e aproxima o decote. Com sutiã e roupa, faz diferença de verdade.",
      "Sem roupa, isso lê como peitoral firme, não como seio — dito pra não ter surpresa.",
      "Na fase 1 o peito pode diminuir antes de o músculo compensar: a gordura sai dele também.",
      "Mama de verdade vem de implante (no mesmo horizonte cirúrgico do BBL) ou de TRH — as duas são decisões suas, sem data.",
    ],
  },
```
- `cirurgia` reescrita:
```ts
  {
    id: "cirurgia",
    title: "O horizonte cirúrgico",
    intro: "Lipo 360 com lombar + BBL com preenchimento lateral é o que leva a razão do máximo natural (0,72-0,76) para ~0,62-0,66. O implante de mama entra no mesmo horizonte, se você quiser.",
    tips: [
      "Quando: depois dos 30, por decisão sua — e depois do máximo natural, com peso estável por ~6 meses.",
      "Precisa de gordura pra colher: não faça a fase de marcar de leve se a cirurgia estiver marcada.",
      "É historicamente a cirurgia estética de maior mortalidade, por embolia gordurosa. A injeção só na camada acima do músculo reduziu muito o risco, mas ele não é zero. Cirurgião membro da SBCP, em hospital, e você pergunta em que camada ele injeta.",
      "2 a 3 semanas sem sentar sobre o glúteo: planeje afastamento do trabalho.",
      "O BBL marca o fim da fase discreta — de propósito. É escolha sua, não espera de nada.",
    ],
  },
```
- `Horizontes.tsx`: `const { projecao } = usePartida();` e `sections={[...HORIZONTES, linhaDoTempo(projecao)]}`. O texto de abertura troca "construir glúteo agora" por "construir a Chun-Li agora".
- [ ] **Step 3:** `npm test` → PASS. As redes `sem-trh-agendada`, `discricao-rotulos` e `publico-nao-e-masculino` continuam verdes.
- [ ] **Step 4: Commit** `feat(horizontes): Chun-Li macia, peito honesto, os dois tetos e a linha do tempo da sua partida`.

---

### Task 5: Conselheiro de ciclo libera a fase 2 pela cintura 84

**Files:**
- Modify: `src/lib/cycle-advisor.ts`, `src/hooks/useCycleAdvice.ts`, `tests/lib/cycle-advisor.test.ts`

- [ ] **Step 1: Failing tests** em `cycle-advisor.test.ts`:
  - trocar `whr`/`targetWhr` no `base` por `waistCm: 95, cinturaFimFase1: 84`;
  - "variacao -> hipertrofia quando a cintura chega à do fim da fase 1" com `waistCm: 84` → recomenda, e o `reason` contém "84";
  - "variacao NÃO avança se a cintura ainda cai e está acima de 84" com `waistCm: 90, waistTrend: down` → null;
  - "sem medição de cintura, só o platô libera" com `waistCm: null` e trend stable → recomenda.
- [ ] **Step 2: Implement.**
  - `CycleAdviceInput`: sai `whr` e `targetWhr`, entram `waistCm: number | null` e `cinturaFimFase1: number`.
  - `atTarget = i.waistCm !== null && i.waistCm <= i.cinturaFimFase1`.
  - Razão: `sua cintura chegou a ${i.cinturaFimFase1} — fim da fase 1`.
  - Comentário: "Antes pedia WHR 0,73 (alvo do FIM da fase 2) pra ENTRAR na fase 2 — nunca recomendaria enquanto a cintura caísse sem parar."
  - Em `useCycleAdvice`: `waistCm: latest?.waistCm ?? null`, `cinturaFimFase1: FASES.find((f) => f.id === "fase-1")!.cinturaCm`. Tirar o `useSetting("targetWhr")` se ele ficar sem uso nesse hook.
- [ ] **Step 3:** `npm test` → PASS.
- [ ] **Step 4: Commit** `fix(ciclos): a fase 2 começa quando a cintura chega a 84, não no alvo final de razão`.

---

### Task 6: Marcos e tamanhos acompanham as fases novas

**Files:**
- Modify: `src/data/milestones-seed.ts`, `src/data/tamanhos-seed.ts`, `src/lib/path-seed.ts` (`MILESTONE_SEED_VERSION = 9`, bloco `< 9`)
- Modify: `tests/data/milestones-objetivo.test.ts`, `tests/lib/path-seed-marcos-v7.test.ts` (versão 8→9)

- [ ] **Step 1: Failing tests** em `milestones-objetivo.test.ts`:
```ts
  it("os meses dos marcos saem de objetivo.ts — cintura 88, cintura 84 e fase 2", () => {
    const fonte = MILESTONES_MESES; // exportado de milestones-seed
    expect(fonte.cintura88).toBe(MARCOS_CINTURA[0].mesMin);
    expect(fonte.cintura84).toBe(MARCOS_CINTURA[1].mesMin);
    expect(fonte.fase2).toBe(FASES.find((f) => f.id === "fase-2")!.mesInicio);
  });
```
e em `tamanhos-seed` (teste existente `tamanhos-compra.test.ts`): o texto não pode conter "6 a 8 meses" escrito à mão. Precisa conter `${MARCOS_CINTURA[1].mesMin}` e `${MARCOS_CINTURA[1].mesMax}`.
- [ ] **Step 2: Implement.**
  - Em `milestones-seed.ts`, exportar `MILESTONES_MESES = { cintura88: MARCOS_CINTURA[0].mesMin, cintura84: MARCOS_CINTURA[1].mesMin, fase2: FASE_2.mesInicio }` e usar esses valores nos `isoFromMonthsFromNow` dos três marcos.
  - A nota do marco 84 passa a interpolar o peso de `FASES[0]` ("peso por volta de 80-82 kg"). A nota da fase 2 interpola `FASE_2.pesoKgMin/Max` e troca "~81" por `${FASE_1.pesoKgMax}`.
  - Em `tamanhos-seed.ts`, "Em 6 a 8 meses" vira `Em ${MARCOS_CINTURA[1].mesMin} a ${MARCOS_CINTURA[1].mesMax} meses`.
  - Em `path-seed.ts`: `MILESTONE_SEED_VERSION = 9` e `if (msVersion < 9) await regravaMarcosV7();`, com um comentário dizendo que a regravação reancora as datas dos marcos não concluídos no dia da atualização, o que coincide com o recomeço dela.
- [ ] **Step 3:** `npm test` → PASS.
- [ ] **Step 4: Commit** `feat(marcos): os meses dos marcos e do guia de tamanhos saem das fases`.

---

### Task 7: Fechamento

- [ ] `npm test`, `npx tsc -b`, `npm run build`: tudo verde.
- [ ] Navegador: o Hoje com o banco vazio mostra o card pedindo a medição. Depois de registrar peso 96, cintura 99, pescoço 40 com data de hoje, o card mostra "80–82 kg" e os meses. Os Horizontes mostram a linha do tempo com datas.
- [ ] `docs/OBJETIVO.md`: fase 1 "~5,5–7,5 meses" e gasto 2.700–2.900. `docs/CONTINUAR-AQUI.md`: entrega 2 ✅ e dívida 6 ✅. Memória `chun_li_macia_2026_09.md` atualizada.
- [ ] Revisão final da branch (revisor independente) → uma rodada de correção → merge. **Perguntar antes do push.**
