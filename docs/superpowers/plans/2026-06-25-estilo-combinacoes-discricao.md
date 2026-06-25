# Estilo — Combinações + eixo de discrição — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar ao módulo Estilo a entidade **Combinações** (conjuntos montados com status ideia→comprando→tenho→testei) e um eixo de **discrição** (Discreto/Livre) nas peças, sem duplicar a aba Discreto existente.

**Architecture:** Dexie/IndexedDB com seed idempotente por flag. Nova tabela `outfits` (`db.version(8)`); `Garment` ganha `discretion` + `fitTip`. Novas telas React (CombosView/ComboNew/ComboDetail) seguem os padrões dos componentes de Estilo já existentes (BeautyTabs + StyleTabs, paleta amazona, filtros em `rounded-pill`).

**Tech Stack:** React 18 + react-router-dom (createBrowserRouter), Dexie + dexie-react-hooks (`useLiveQuery`), Tailwind, Vitest + @testing-library/react, fake-indexeddb (via `tests/setup.ts`).

## Global Constraints

- Paleta amazona obrigatória: classes `bg-wine-light`, `text-nude-warm`, `text-nude`, `text-muted`, `bg-bg-deep`, `border-bg-border`, `card`, `rounded-pill`, `rounded-md`, `font-serif` — copiar dos componentes existentes, nada de cores cruas novas.
- Idioma de toda copy visível: pt-br com acentuação correta.
- Seed sempre **idempotente** e **não destrutivo** (nunca apagar looks/wishlist/combinações da usuária).
- Páginas de Estilo começam com header `← Beleza` + `<h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>`, depois `<BeautyTabs />` e `<StyleTabs />`.
- `db.outfits` usa id numérico autoincremento; em rotas o `:id` vem como string → converter com `Number(id)`.
- Não criar card de "Princípios" próprio — linkar pra `/beleza/estilo/discreto`.

---

## Task 1: Modelo de dados (db.ts)

**Files:**
- Modify: `src/lib/db.ts` (interface `Garment` ~176-184; nova interface `Outfit`; classe `TreinFinalDB`; `version(8)`)
- Test: `tests/lib/outfits-db.test.ts` (criar)

**Interfaces:**
- Produces:
  - `Garment` com campos novos `discretion: "discreto" | "livre"` e `fitTip?: string`.
  - `Outfit { id?: number; name: string; context: "discreto" | "livre"; occasion: string; pieces: string[]; whyItWorks: string; silhouetteNote: string; status: "ideia" | "comprando" | "tenho" | "testei"; notes?: string; lookId?: number }`.
  - `db.outfits: Table<Outfit, number>`.

- [ ] **Step 1: Write the failing test**

Criar `tests/lib/outfits-db.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { db, type Outfit } from "../../src/lib/db";

describe("db.outfits", () => {
  it("adiciona e lê uma combinação", async () => {
    const outfit: Omit<Outfit, "id"> = {
      name: "Teste",
      context: "discreto",
      occasion: "casual",
      pieces: ["calça cintura alta", "camiseta encorpada"],
      whyItWorks: "estrutura unissex marca a cintura",
      silhouetteNote: "linha vertical disfarça a barriga",
      status: "ideia",
    };
    const id = await db.outfits.add(outfit as Outfit);
    const read = await db.outfits.get(id);
    expect(read?.name).toBe("Teste");
    expect(read?.pieces).toHaveLength(2);
  });

  it("consulta por context", async () => {
    await db.outfits.add({
      name: "Livre teste", context: "livre", occasion: "casa",
      pieces: ["vestido"], whyItWorks: "x", silhouetteNote: "y", status: "ideia",
    } as Outfit);
    const livres = await db.outfits.where("context").equals("livre").toArray();
    expect(livres.length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- outfits-db`
Expected: FAIL — `db.outfits` é `undefined` (Property 'outfits' does not exist) / tabela não existe.

- [ ] **Step 3: Implement — adicionar campos ao Garment**

Em `src/lib/db.ts`, na interface `Garment`, adicionar os dois campos antes do fechamento:

```typescript
export interface Garment {
  id: string;
  name: string;
  category: "top" | "bottom" | "dress" | "outerwear" | "intimate";
  occasion: string[];
  whyItWorks: string;
  cautions?: string;
  imagePath?: string;
  discretion: "discreto" | "livre";   // passa despercebido no dia a dia × só casa/noiva
  fitTip?: string;                     // dica de corte/caimento/tamanho
}
```

- [ ] **Step 4: Implement — nova interface Outfit**

Logo depois da interface `WishlistItem` em `src/lib/db.ts`, adicionar:

```typescript
export interface Outfit {
  id?: number;
  name: string;
  context: "discreto" | "livre";       // dia a dia × casa/noiva
  occasion: string;                    // trabalho, casual, sair, casa…
  pieces: string[];                    // peças que compõem o look (texto livre)
  whyItWorks: string;
  silhouetteNote: string;              // efeito na silhueta (cria cintura / disfarça barriga)
  status: "ideia" | "comprando" | "tenho" | "testei";
  notes?: string;
  lookId?: number;                     // status "testei" pode linkar a um Look
}
```

- [ ] **Step 5: Implement — tabela + versão**

Em `src/lib/db.ts`, na classe `TreinFinalDB`, declarar a tabela (junto das outras, perto de `wishlist!`):

```typescript
  outfits!: Table<Outfit, number>;
```

E adicionar a nova versão depois do bloco `this.version(7)`:

```typescript
    this.version(8).stores({
      outfits: "++id, context, status",
    });
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test -- outfits-db`
Expected: PASS (2 testes).

- [ ] **Step 7: Commit**

```bash
git add src/lib/db.ts tests/lib/outfits-db.test.ts
git commit -m "feat(estilo): modelo de dados de combinações + discrição nas peças"
```

---

## Task 2: Seed — discrição nas peças + peças novas + combinações

**Files:**
- Modify: `src/data/garments-seed.ts` (adicionar `discretion`/`fitTip` em todas as peças; +6 peças discretas)
- Create: `src/data/outfits-seed.ts`
- Modify: `src/lib/style-seed.ts` (flag `styleSeededV2`)
- Test: `tests/lib/style-seed.test.ts` (estender)

**Interfaces:**
- Consumes: `Garment`, `Outfit` (Task 1).
- Produces: `OUTFITS: Omit<Outfit, "id">[]` exportado de `src/data/outfits-seed.ts`; `seedStyle()` popula peças (com discrição), peças novas e combinações.

- [ ] **Step 1: Write the failing test**

Substituir o conteúdo de `tests/lib/style-seed.test.ts` por:

```typescript
import { describe, it, expect } from "vitest";
import { seedStyle } from "../../src/lib/style-seed";
import { db } from "../../src/lib/db";

describe("seedStyle", () => {
  it("popula garments e palette", async () => {
    await seedStyle();
    expect((await db.garments.toArray()).length).toBeGreaterThanOrEqual(26);
    expect((await db.stylePalette.toArray()).length).toBe(1);
  });

  it("toda peça tem discretion válida e whyItWorks", async () => {
    await seedStyle();
    for (const g of await db.garments.toArray()) {
      expect(g.whyItWorks).toBeTruthy();
      expect(["discreto", "livre"]).toContain(g.discretion);
    }
  });

  it("popula combinações com campos obrigatórios", async () => {
    await seedStyle();
    const outfits = await db.outfits.toArray();
    expect(outfits.length).toBeGreaterThanOrEqual(6);
    for (const o of outfits) {
      expect(["discreto", "livre"]).toContain(o.context);
      expect(o.silhouetteNote).toBeTruthy();
      expect(["ideia", "comprando", "tenho", "testei"]).toContain(o.status);
    }
    expect(outfits.some((o) => o.context === "discreto")).toBe(true);
    expect(outfits.some((o) => o.context === "livre")).toBe(true);
  });

  it("é idempotente (peças e combinações)", async () => {
    await seedStyle();
    const g = (await db.garments.toArray()).length;
    const o = (await db.outfits.toArray()).length;
    await seedStyle();
    expect((await db.garments.toArray()).length).toBe(g);
    expect((await db.outfits.toArray()).length).toBe(o);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- style-seed`
Expected: FAIL — peças sem `discretion`; `db.outfits` vazio.

- [ ] **Step 3: Implement — discrição nas peças existentes**

Em `src/data/garments-seed.ts`, adicionar `discretion` (e `fitTip` quando indicado) a cada peça já existente, conforme esta tabela:

| id | discretion | fitTip (adicionar quando listado) |
|----|-----------|-----------------------------------|
| decote-v-profundo | livre | |
| decote-coracao | livre | |
| cinto-largo-cintura | livre | |
| saia-rodada | livre | |
| saia-lapis | livre | |
| calca-cintura-alta | discreto | "Quanto mais alta a cintura, mais a barriga fica contida e a perna alonga. Prefira tecido firme com leve elastano." |
| vestido-peplum | livre | |
| vestido-saia-rodada | livre | |
| blusa-com-franzido | livre | |
| macacao-cintura-marcada | livre | |
| casaco-trench | discreto | "Use o cinto frouxo ou só apoiado — marca a cintura sem gritar feminino." |
| tecido-com-caimento | discreto | "Malha/viscose que desliza sobre a barriga em vez de colar. Um número que não aperte no meio." |
| vestido-envelope | livre | |
| blusa-pescoco-aberto | livre | |
| salto-medio | livre | |
| leggin-cintura-alta | discreto | "Cintura alta e tecido encorpado (não fino) contêm a barriga; combine com top que cubra o quadril." |
| cardigan-curto | discreto | "Pára na cintura, mantendo o ponto focal alto sem cobrir o quadril." |
| blusa-ombro-cair | livre | |
| vestido-bodycon | livre | |
| saia-godê-midi | livre | |
| sutia-com-bojo | livre | |
| conjunto-tanga-sutia | livre | |
| body-de-renda | livre | |
| camisola-transparente | livre | |
| babydoll | livre | |
| robe-curto-cetim | livre | |
| cinta-liga-meia | livre | |
| calcinha-fio-dental | livre | |
| sutia-balconet | livre | |
| espartilho-cintura | livre | |

Exemplo do shape final (uma peça já existente):

```typescript
  {
    id: "calca-cintura-alta",
    name: "Calça de cintura alta",
    category: "bottom",
    occasion: ["casual", "trabalho", "sair"],
    whyItWorks: "Eleva o ponto da cintura, alonga torso visualmente e marca quadril. Funciona com qualquer top.",
    discretion: "discreto",
    fitTip: "Quanto mais alta a cintura, mais a barriga fica contida e a perna alonga. Prefira tecido firme com leve elastano.",
  },
```

- [ ] **Step 4: Implement — 6 peças discretas novas**

Ainda em `src/data/garments-seed.ts`, adicionar dentro do array `GARMENTS` (pode ser logo após a seção DIA/CASUAL, antes da seção ÍNTIMO):

```typescript
  // === DISCRETAS (dia a dia, passa despercebido, pró-barriga) ===
  {
    id: "calca-alfaiataria-alta",
    name: "Calça de alfaiataria de cintura alta",
    category: "bottom",
    occasion: ["trabalho", "casual", "sair"],
    whyItWorks: "Corte unissex que alonga e marca a cintura sem parecer 'roupa feminina'. Cai reto sobre a barriga.",
    discretion: "discreto",
    fitTip: "Cintura alta + caimento reto/leve flare. Tecido com estrutura (não fino) esconde o ventre; barra na altura do sapato alonga.",
  },
  {
    id: "camisa-estruturada-entallada",
    name: "Camisa de botão estruturada (leve entalhe)",
    category: "top",
    occasion: ["trabalho", "casual"],
    whyItWorks: "Estrutura no ombro + leve curva na cintura criam a base do V invertido feminino, em peça totalmente unissex.",
    discretion: "discreto",
    fitTip: "Escolha com pences/recorte na cintura, mas folgada na barriga. Use por fora com a frente meio aberta sobre uma camiseta pra fazer linha vertical.",
  },
  {
    id: "blazer-estruturado-cintura",
    name: "Blazer estruturado com leve cintura",
    category: "outerwear",
    occasion: ["trabalho", "sair"],
    whyItWorks: "Ombro marcado + entalhe na cintura desenham a ampulheta por cima de qualquer base, sem expor o corpo.",
    discretion: "discreto",
    fitTip: "Aberto, vira duas linhas verticais que afinam e somem com a barriga. Comprimento que pare na virilha, não no quadril largo.",
  },
  {
    id: "camiseta-encorpada-slim",
    name: "Camiseta encorpada de corte slim",
    category: "top",
    occasion: ["casual", "trabalho"],
    whyItWorks: "Sugere as curvas sem expor: o tecido encorpado abraça os ombros e a cintura mas desliza sobre o ventre.",
    discretion: "discreto",
    fitTip: "Tecido grosso/pesado (não camiseta fininha que cola). Um número que marque ombro e cintura mas não aperte na barriga.",
  },
  {
    id: "colete-cardiga-longo",
    name: "Colete ou cardigã longo aberto",
    category: "outerwear",
    occasion: ["casual", "trabalho", "sair"],
    whyItWorks: "Cria uma coluna vertical contínua que afina o corpo todo e disfarça a barriga — o truque mais discreto que existe.",
    discretion: "discreto",
    fitTip: "Sempre aberto, descendo reto. Por cima de top e calça em tom escuro pra reforçar a linha do centro.",
  },
  {
    id: "jaqueta-curta-cintura",
    name: "Jaqueta curta na cintura (jeans/bomber)",
    category: "outerwear",
    occasion: ["casual", "sair"],
    whyItWorks: "Pára exatamente na cintura, mantendo o ponto focal alto e empurrando o olhar pra parte mais fina.",
    discretion: "discreto",
    fitTip: "Comprimento na linha do umbigo. Fechada marca a cintura; aberta sobre camiseta de caimento sugere curva sem expor.",
  },
```

- [ ] **Step 5: Implement — outfits-seed.ts**

Criar `src/data/outfits-seed.ts`:

```typescript
import type { Outfit } from "../lib/db";

export const OUTFITS: Omit<Outfit, "id">[] = [
  // === DISCRETAS (dia a dia) ===
  {
    name: "Trabalho neutro",
    context: "discreto",
    occasion: "trabalho",
    pieces: [
      "Calça de alfaiataria cintura alta (preta)",
      "Camiseta encorpada slim (areia)",
      "Blazer estruturado com leve cintura",
      "Tênis branco minimalista ou mocassim",
      "Esmalte nude",
    ],
    whyItWorks: "Tudo lê como roupa unissex de trabalho, mas o blazer entalhado + cintura alta desenham a silhueta por baixo do radar.",
    silhouetteNote: "Blazer aberto faz duas linhas verticais que afinam e disfarçam a barriga; cintura alta + leve entalhe criam ampulheta sutil.",
    status: "ideia",
  },
  {
    name: "Casual fim de semana",
    context: "discreto",
    occasion: "casual",
    pieces: [
      "Jeans cintura alta reto/wide",
      "Camiseta de caimento (malha que abraça sem marcar)",
      "Jaqueta jeans curta na cintura",
      "Tênis",
      "Anéis + pulseira fina",
    ],
    whyItWorks: "Combo básico que ninguém estranha, mas cada peça empurra pro feminino pela modelagem.",
    silhouetteNote: "Jaqueta curta mantém o foco na cintura; jeans wide alonga e a malha sugere curva sem expor o ventre.",
    status: "ideia",
  },
  {
    name: "Camadas verticais",
    context: "discreto",
    occasion: "casual",
    pieces: [
      "Calça escura cintura alta",
      "Top escuro de caimento",
      "Colete ou cardigã longo aberto",
      "Lenço/echarpe neutro",
      "Tênis",
    ],
    whyItWorks: "Monocromático escuro no centro + camada longa = ilusão de corpo mais longo e fino, totalmente discreto.",
    silhouetteNote: "A coluna escura contínua e a camada aberta criam uma linha vertical que some com a barriga e estreita a silhueta.",
    status: "ideia",
  },
  {
    name: "Monocromático esperto",
    context: "discreto",
    occasion: "sair",
    pieces: [
      "Calça cintura alta marrom/areia",
      "Blusa do mesmo tom com leve gola V",
      "Cardigã curto",
      "Bolsa pequena",
      "Esmalte nude",
    ],
    whyItWorks: "Um tom só da paleta quente alonga o corpo inteiro; a gola V sutil puxa o olhar pra cima.",
    silhouetteNote: "Tom único alonga; gola V + cardigã curto levam o olhar pra cintura e pro rosto, não pra barriga.",
    status: "ideia",
  },
  // === LIVRES (casa / com a noiva) ===
  {
    name: "Noite com a noiva",
    context: "livre",
    occasion: "casa",
    pieces: [
      "Vestido envelope (wrap)",
      "Sutiã balconet",
      "Salto médio",
      "Brincos",
      "Batom",
    ],
    whyItWorks: "Num espaço seguro, dá pra usar a peça que combina todos os truques de ampulheta de uma vez.",
    silhouetteNote: "Decote V + cintura amarrada + saia que abre = ampulheta completa, marcando cintura e disfarçando o ventre no nó.",
    status: "ideia",
  },
  {
    name: "Aconchego sensual em casa",
    context: "livre",
    occasion: "casa",
    pieces: [
      "Robe curto de cetim",
      "Conjunto sutiã + tanga (vinho)",
      "Meia 7/8",
    ],
    whyItWorks: "Ritual de autoimagem em casa, na paleta amazona, sem peso de 'passar despercebido'.",
    silhouetteNote: "O cinto do robe marca a cintura; as peças na cor vinho reforçam a feminilidade do conjunto.",
    status: "ideia",
  },
];
```

- [ ] **Step 6: Implement — seedStyle com flag V2**

Substituir o conteúdo de `src/lib/style-seed.ts` por:

```typescript
import { db } from "./db";
import { GARMENTS } from "../data/garments-seed";
import { INITIAL_PALETTE } from "../data/palette-seed";
import { OUTFITS } from "../data/outfits-seed";

export async function seedStyle(): Promise<void> {
  const v1 = await db.settings.get("styleSeeded");
  if (v1?.value !== true) {
    await db.transaction("rw", [db.garments, db.stylePalette, db.settings], async () => {
      for (const g of GARMENTS) {
        await db.garments.put(g);
      }
      if ((await db.stylePalette.count()) === 0) {
        await db.stylePalette.add(INITIAL_PALETTE as never);
      }
      await db.settings.put({ key: "styleSeeded", value: true });
    });
  }

  // V2: aplica discrição/fitTip + peças novas + combinações. Idempotente e não destrutivo.
  const v2 = await db.settings.get("styleSeededV2");
  if (v2?.value !== true) {
    await db.transaction("rw", [db.garments, db.outfits, db.settings], async () => {
      for (const g of GARMENTS) {
        await db.garments.put(g); // put atualiza as existentes e cria as novas
      }
      for (const o of OUTFITS) {
        await db.outfits.add(o as never);
      }
      await db.settings.put({ key: "styleSeededV2", value: true });
    });
  }
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm run test -- style-seed`
Expected: PASS (4 testes).

- [ ] **Step 8: Build**

Run: `npm run build`
Expected: build limpo (TypeScript sem erros — confirma que todas as peças têm `discretion`).

- [ ] **Step 9: Commit**

```bash
git add src/data/garments-seed.ts src/data/outfits-seed.ts src/lib/style-seed.ts tests/lib/style-seed.test.ts
git commit -m "feat(estilo): seed de combinações + discrição/peças novas (V2)"
```

---

## Task 3: Aba Combinações — StyleTabs + OutfitCard + CombosView

**Files:**
- Modify: `src/components/StyleTabs.tsx` (inserir aba Combinações)
- Create: `src/components/OutfitCard.tsx`
- Create: `src/pages/beauty/style/CombosView.tsx`
- Modify: `src/main.tsx` (import + rota `/beleza/estilo/combinacoes`)
- Test: `tests/pages/combos.smoke.test.tsx`

**Interfaces:**
- Consumes: `Outfit`, `db.outfits` (Task 1); `OUTFITS`/`seedStyle` (Task 2).
- Produces: `OutfitCard({ outfit })`; rota `/beleza/estilo/combinacoes` → `<CombosView />`.

- [ ] **Step 1: Write the failing test**

Criar `tests/pages/combos.smoke.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { CombosView } from "../../src/pages/beauty/style/CombosView";
import { seedStyle } from "../../src/lib/style-seed";

beforeEach(async () => {
  await seedStyle();
});

describe("Combinações smoke", () => {
  it("renderiza combinações e filtra por contexto", async () => {
    render(
      <MemoryRouter initialEntries={["/beleza/estilo/combinacoes"]}>
        <Routes>
          <Route path="/beleza/estilo/combinacoes" element={<CombosView />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Trabalho neutro")).toBeInTheDocument());
    // combinação livre aparece em "Todas"
    expect(screen.getByText("Noite com a noiva")).toBeInTheDocument();

    // filtra por Discreto → some a livre
    fireEvent.click(screen.getByRole("button", { name: "Discreto" }));
    await waitFor(() => expect(screen.queryByText("Noite com a noiva")).not.toBeInTheDocument());
    expect(screen.getByText("Trabalho neutro")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- combos.smoke`
Expected: FAIL — `CombosView` não existe (import quebra).

- [ ] **Step 3: Implement — OutfitCard**

Criar `src/components/OutfitCard.tsx`:

```tsx
import { Link } from "react-router-dom";
import type { Outfit } from "../lib/db";

const STATUS_LABEL: Record<Outfit["status"], string> = {
  ideia: "Ideia",
  comprando: "Comprando",
  tenho: "Tenho",
  testei: "Testei",
};

const CONTEXT_LABEL: Record<Outfit["context"], string> = {
  discreto: "Discreto",
  livre: "Casa/Livre",
};

export function OutfitCard({ outfit }: { outfit: Outfit }) {
  return (
    <Link
      to={`/beleza/estilo/combinacoes/${outfit.id}`}
      className="card block hover:border-nude/40 transition"
    >
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">
          {CONTEXT_LABEL[outfit.context]} · {outfit.occasion}
        </span>
        <span className="text-nude text-xs">{STATUS_LABEL[outfit.status]}</span>
      </div>
      <h3 className="text-nude-warm font-medium">{outfit.name}</h3>
      <p className="text-muted text-xs mt-1">{outfit.pieces.join(" · ")}</p>
      <p className="text-nude-warm/80 text-xs mt-1">{outfit.silhouetteNote}</p>
    </Link>
  );
}
```

- [ ] **Step 4: Implement — CombosView**

Criar `src/pages/beauty/style/CombosView.tsx`:

```tsx
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type Outfit } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { OutfitCard } from "../../../components/OutfitCard";

const CONTEXTS: Array<{ value: Outfit["context"] | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "discreto", label: "Discreto" },
  { value: "livre", label: "Casa/Livre" },
];

export function CombosView() {
  const [filter, setFilter] = useState<Outfit["context"] | "all">("all");
  const outfits = useLiveQuery(async () => {
    const all = await db.outfits.toArray();
    if (filter === "all") return all;
    return all.filter((o) => o.context === filter);
  }, [filter]);

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
        <Link to="/beleza/estilo/combinacoes/novo" className="text-muted text-sm">+ novo</Link>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <p className="text-muted text-xs mb-3">
        Os princípios (níveis, o que passa, peças-curinga) estão na aba{" "}
        <Link to="/beleza/estilo/discreto" className="text-nude underline">Discreto</Link>.
      </p>

      <div className="overflow-x-auto -mx-4 px-4 mb-4">
        <div className="flex gap-2 w-max">
          {CONTEXTS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setFilter(c.value)}
              className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
                filter === c.value ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {outfits?.map((o) => <OutfitCard key={o.id} outfit={o} />)}
        {outfits?.length === 0 && (
          <p className="text-muted text-sm text-center py-4">Sem combinações ainda.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Implement — aba no StyleTabs**

Em `src/components/StyleTabs.tsx`, inserir a aba Combinações entre Peças e Looks no array `ITEMS`:

```tsx
const ITEMS = [
  { to: "/beleza/estilo", label: "Paleta", end: true },
  { to: "/beleza/estilo/pecas", label: "Peças" },
  { to: "/beleza/estilo/combinacoes", label: "Combinações" },
  { to: "/beleza/estilo/looks", label: "Looks" },
  { to: "/beleza/estilo/wishlist", label: "Wishlist" },
  { to: "/beleza/estilo/intimo", label: "Íntimo" },
  { to: "/beleza/estilo/discreto", label: "Discreto" },
];
```

- [ ] **Step 6: Implement — rota**

Em `src/main.tsx`, adicionar o import (junto dos outros de `style`):

```tsx
import { CombosView } from "./pages/beauty/style/CombosView";
```

E a rota logo após `{ path: "beleza/estilo/pecas/:id", element: <GarmentDetail /> }`:

```tsx
        { path: "beleza/estilo/combinacoes", element: <CombosView /> },
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm run test -- combos.smoke`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/StyleTabs.tsx src/components/OutfitCard.tsx src/pages/beauty/style/CombosView.tsx src/main.tsx tests/pages/combos.smoke.test.tsx
git commit -m "feat(estilo): aba Combinações com filtro discreto/livre"
```

---

## Task 4: Criar e editar combinações — ComboNew + ComboDetail

**Files:**
- Create: `src/pages/beauty/style/ComboNew.tsx`
- Create: `src/pages/beauty/style/ComboDetail.tsx`
- Modify: `src/main.tsx` (imports + rotas `/novo` e `/:id`)
- Test: `tests/pages/combo-detail.smoke.test.tsx`

**Interfaces:**
- Consumes: `Outfit`, `db.outfits` (Task 1).
- Produces: rotas `/beleza/estilo/combinacoes/novo` → `<ComboNew />` e `/beleza/estilo/combinacoes/:id` → `<ComboDetail />`.

- [ ] **Step 1: Write the failing test**

Criar `tests/pages/combo-detail.smoke.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ComboDetail } from "../../src/pages/beauty/style/ComboDetail";
import { db, type Outfit } from "../../src/lib/db";

let id: number;

beforeEach(async () => {
  id = await db.outfits.add({
    name: "Combo teste",
    context: "discreto",
    occasion: "casual",
    pieces: ["calça cintura alta", "camiseta encorpada"],
    whyItWorks: "marca a cintura",
    silhouetteNote: "disfarça a barriga",
    status: "ideia",
  } as Outfit);
});

describe("ComboDetail smoke", () => {
  it("mostra a combinação e avança o status", async () => {
    render(
      <MemoryRouter initialEntries={[`/beleza/estilo/combinacoes/${id}`]}>
        <Routes>
          <Route path="/beleza/estilo/combinacoes/:id" element={<ComboDetail />} />
          <Route path="/beleza/estilo/combinacoes" element={<div>lista</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Combo teste")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Comprando" }));
    await waitFor(async () => {
      const updated = await db.outfits.get(id);
      expect(updated?.status).toBe("comprando");
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- combo-detail.smoke`
Expected: FAIL — `ComboDetail` não existe.

- [ ] **Step 3: Implement — ComboDetail**

Criar `src/pages/beauty/style/ComboDetail.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useParams, useNavigate } from "react-router-dom";
import { db, type Outfit } from "../../../lib/db";

const STATUS_FLOW: Outfit["status"][] = ["ideia", "comprando", "tenho", "testei"];
const STATUS_LABEL: Record<Outfit["status"], string> = {
  ideia: "Ideia",
  comprando: "Comprando",
  tenho: "Tenho",
  testei: "Testei",
};
const CONTEXT_LABEL: Record<Outfit["context"], string> = {
  discreto: "Discreto",
  livre: "Casa/Livre",
};

export function ComboDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const outfit = useLiveQuery(
    async () => (id ? await db.outfits.get(Number(id)) : undefined),
    [id],
  );

  if (!outfit) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  async function setStatus(s: Outfit["status"]) {
    if (outfit?.id == null) return;
    await db.outfits.update(outfit.id, { status: s });
  }

  async function remove() {
    if (outfit?.id == null) return;
    if (!confirm("Apagar esta combinação?")) return;
    await db.outfits.delete(outfit.id);
    navigate("/beleza/estilo/combinacoes", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/estilo/combinacoes" className="text-muted text-sm">&larr; Combinações</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{outfit.name}</h1>
      <p className="text-muted text-xs mb-4">{CONTEXT_LABEL[outfit.context]} · {outfit.occasion}</p>

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Peças</h2>
        <ul className="space-y-1 text-sm list-disc pl-5">
          {outfit.pieces.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>

      {outfit.whyItWorks && (
        <div className="card mb-3">
          <h2 className="text-nude-warm font-medium mb-2">Por que funciona</h2>
          <p className="text-sm">{outfit.whyItWorks}</p>
        </div>
      )}

      {outfit.silhouetteNote && (
        <div className="card mb-3">
          <h2 className="text-nude-warm font-medium mb-2">Efeito na silhueta</h2>
          <p className="text-sm">{outfit.silhouetteNote}</p>
        </div>
      )}

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Status</h2>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void setStatus(s)}
              className={`px-3 py-1.5 rounded-pill text-xs ${
                outfit.status === s ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {outfit.notes && <p className="text-muted text-sm mb-3">{outfit.notes}</p>}

      <button onClick={() => void remove()} type="button" className="text-muted text-xs hover:text-red-300">
        apagar combinação
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Implement — ComboNew**

Criar `src/pages/beauty/style/ComboNew.tsx`:

```tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Outfit } from "../../../lib/db";

export function ComboNew() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [context, setContext] = useState<Outfit["context"]>("discreto");
  const [occasion, setOccasion] = useState("casual");
  const [piecesText, setPiecesText] = useState("");
  const [whyItWorks, setWhyItWorks] = useState("");
  const [silhouetteNote, setSilhouetteNote] = useState("");
  const [status, setStatus] = useState<Outfit["status"]>("ideia");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const pieces = piecesText.split("\n").map((p) => p.trim()).filter(Boolean);
    await db.outfits.add({
      name: name.trim(),
      context,
      occasion: occasion.trim() || "casual",
      pieces,
      whyItWorks: whyItWorks.trim(),
      silhouetteNote: silhouetteNote.trim(),
      status,
    } as Outfit);
    navigate("/beleza/estilo/combinacoes", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/estilo/combinacoes" className="text-muted text-sm">&larr; Combinações</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Nova combinação</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome (ex.: Trabalho neutro)"
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
        />

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Contexto</label>
          <div className="flex gap-2">
            {(["discreto", "livre"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setContext(c)}
                className={`flex-1 py-2 rounded-md text-sm ${
                  context === c ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                }`}
              >
                {c === "discreto" ? "Discreto" : "Casa/Livre"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Ocasião</label>
          <input
            type="text"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="trabalho, casual, sair, casa…"
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Peças (uma por linha)</label>
          <textarea
            value={piecesText}
            onChange={(e) => setPiecesText(e.target.value)}
            rows={4}
            placeholder={"Calça cintura alta\nCamiseta encorpada\nBlazer"}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Por que funciona</label>
          <textarea
            value={whyItWorks}
            onChange={(e) => setWhyItWorks(e.target.value)}
            rows={2}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Efeito na silhueta</label>
          <textarea
            value={silhouetteNote}
            onChange={(e) => setSilhouetteNote(e.target.value)}
            rows={2}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Status</label>
          <div className="flex gap-2 flex-wrap">
            {(["ideia", "comprando", "tenho", "testei"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-pill text-xs ${
                  status === s ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                }`}
              >
                {s === "ideia" ? "Ideia" : s === "comprando" ? "Comprando" : s === "tenho" ? "Tenho" : "Testei"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium disabled:opacity-50"
        >
          Salvar combinação
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Implement — rotas**

Em `src/main.tsx`, adicionar imports:

```tsx
import { ComboNew } from "./pages/beauty/style/ComboNew";
import { ComboDetail } from "./pages/beauty/style/ComboDetail";
```

E as rotas logo após `{ path: "beleza/estilo/combinacoes", element: <CombosView /> }` (a `/novo` ANTES da `/:id` pra não ser capturada pelo parâmetro):

```tsx
        { path: "beleza/estilo/combinacoes/novo", element: <ComboNew /> },
        { path: "beleza/estilo/combinacoes/:id", element: <ComboDetail /> },
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test -- combo-detail.smoke`
Expected: PASS.

- [ ] **Step 7: Build**

Run: `npm run build`
Expected: build limpo.

- [ ] **Step 8: Commit**

```bash
git add src/pages/beauty/style/ComboNew.tsx src/pages/beauty/style/ComboDetail.tsx src/main.tsx tests/pages/combo-detail.smoke.test.tsx
git commit -m "feat(estilo): criar/editar combinações + status comprar→testar"
```

---

## Task 5: Filtro de discrição nas Peças + fitTip no detalhe

**Files:**
- Modify: `src/pages/beauty/style/GarmentsView.tsx` (segundo filtro Discreto/Livre)
- Modify: `src/components/GarmentCard.tsx` (badge de discrição)
- Modify: `src/pages/beauty/style/GarmentDetail.tsx` (mostrar `fitTip`)
- Test: `tests/pages/garments-discretion.smoke.test.tsx`

**Interfaces:**
- Consumes: `Garment.discretion`, `Garment.fitTip` (Task 1); seed (Task 2).

- [ ] **Step 1: Write the failing test**

Criar `tests/pages/garments-discretion.smoke.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { GarmentsView } from "../../src/pages/beauty/style/GarmentsView";
import { seedStyle } from "../../src/lib/style-seed";

beforeEach(async () => {
  await seedStyle();
});

describe("Peças — filtro discrição", () => {
  it("filtra por Discreto e mostra peça discreta", async () => {
    render(
      <MemoryRouter initialEntries={["/beleza/estilo/pecas"]}>
        <Routes>
          <Route path="/beleza/estilo/pecas" element={<GarmentsView />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Calça de alfaiataria de cintura alta")).toBeInTheDocument());

    // saia rodada é "livre" → aparece em Todas
    expect(screen.getByText("Saia rodada (godê / circle skirt)")).toBeInTheDocument();

    // filtra Discreto → some a saia, fica a calça
    fireEvent.click(screen.getByRole("button", { name: "Discreto" }));
    await waitFor(() => expect(screen.queryByText("Saia rodada (godê / circle skirt)")).not.toBeInTheDocument());
    expect(screen.getByText("Calça de alfaiataria de cintura alta")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- garments-discretion`
Expected: FAIL — não existe botão "Discreto" em GarmentsView (filtro de discrição ainda não implementado).

- [ ] **Step 3: Implement — segundo filtro em GarmentsView**

Substituir o conteúdo de `src/pages/beauty/style/GarmentsView.tsx` por:

```tsx
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type Garment } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { GarmentCard } from "../../../components/GarmentCard";

const CATEGORIES: Array<{ value: Garment["category"] | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "top", label: "Tops" },
  { value: "bottom", label: "Calças/Saias" },
  { value: "dress", label: "Vestidos" },
  { value: "outerwear", label: "Casacos" },
];

const DISCRETIONS: Array<{ value: Garment["discretion"] | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "discreto", label: "Discreto" },
  { value: "livre", label: "Casa/Livre" },
];

export function GarmentsView() {
  const [filter, setFilter] = useState<Garment["category"] | "all">("all");
  const [discretion, setDiscretion] = useState<Garment["discretion"] | "all">("all");
  const garments = useLiveQuery(async () => {
    const all = await db.garments.toArray();
    return all
      .filter((g) => g.category !== "intimate") // íntimas só na aba Íntimo
      .filter((g) => filter === "all" || g.category === filter)
      .filter((g) => discretion === "all" || g.discretion === discretion);
  }, [filter, discretion]);

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <div className="overflow-x-auto -mx-4 px-4 mb-2">
        <div className="flex gap-2 w-max">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setFilter(c.value)}
              className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
                filter === c.value ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 mb-4">
        <div className="flex gap-2 w-max">
          {DISCRETIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDiscretion(d.value)}
              className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
                discretion === d.value ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {garments?.map((g) => <GarmentCard key={g.id} garment={g} />)}
      </div>
    </div>
  );
}
```

> Nota: há dois botões "Todas" (categoria e discrição). O teste usa `name: "Discreto"`, que é único — sem ambiguidade.

- [ ] **Step 4: Implement — badge de discrição no GarmentCard**

Substituir o conteúdo de `src/components/GarmentCard.tsx` por:

```tsx
import { Link } from "react-router-dom";
import type { Garment } from "../lib/db";

const CATEGORY_LABEL: Record<Garment["category"], string> = {
  top: "Top",
  bottom: "Calça/Saia",
  dress: "Vestido",
  outerwear: "Casaco/Acessório",
  intimate: "Íntimo",
};

const DISCRETION_LABEL: Record<Garment["discretion"], string> = {
  discreto: "Discreto",
  livre: "Casa/Livre",
};

export function GarmentCard({ garment }: { garment: Garment }) {
  return (
    <Link to={`/beleza/estilo/pecas/${garment.id}`} className="card block hover:border-nude/40 transition">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">{CATEGORY_LABEL[garment.category]}</span>
        <span className="text-nude text-xs">{DISCRETION_LABEL[garment.discretion]}</span>
      </div>
      <h3 className="text-nude-warm font-medium">{garment.name}</h3>
      <p className="text-muted text-xs mt-0.5">{garment.occasion.join(" · ")}</p>
    </Link>
  );
}
```

- [ ] **Step 5: Implement — fitTip no GarmentDetail**

Em `src/pages/beauty/style/GarmentDetail.tsx`, adicionar um card de `fitTip` entre o card "Por que funciona pra você" e o bloco `cautions`:

```tsx
      {garment.fitTip && (
        <div className="card mb-3">
          <h2 className="text-nude-warm font-medium mb-2">Caimento / corte</h2>
          <p className="text-sm">{garment.fitTip}</p>
        </div>
      )}
```

(Inserir logo após o `</div>` que fecha o card de "Por que funciona pra você", linha ~27.)

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test -- garments-discretion`
Expected: PASS.

- [ ] **Step 7: Build**

Run: `npm run build`
Expected: build limpo.

- [ ] **Step 8: Commit**

```bash
git add src/pages/beauty/style/GarmentsView.tsx src/components/GarmentCard.tsx src/pages/beauty/style/GarmentDetail.tsx tests/pages/garments-discretion.smoke.test.tsx
git commit -m "feat(estilo): filtro discreto/livre nas peças + dica de caimento"
```

---

## Task 6: Verificação final + README

**Files:**
- Modify: `README.md` (se houver seção Status)

- [ ] **Step 1: Suite completa**

Run: `npm run test`
Expected: todos os testes passam (inclui os 4 novos arquivos desta entrega).

- [ ] **Step 2: Build final**

Run: `npm run build`
Expected: build limpo, sem erros TypeScript.

- [ ] **Step 3: Atualizar README (se aplicável)**

Se `README.md` tiver uma seção de status/módulos de Estilo, acrescentar uma linha mencionando **Combinações** e o eixo **Discreto/Livre**. Se não houver seção relevante, pular este passo (não inventar seção).

- [ ] **Step 4: Commit (se README mudou)**

```bash
git add README.md
git commit -m "docs: README — Combinações no módulo Estilo"
```

- [ ] **Step 5: Report**

Reportar: nº de testes, build limpo, SHAs dos commits, e um resumo do que foi entregue (aba Combinações, status de compra/teste, filtro discreto/livre, peças novas).

---

## Self-Review (preenchido pelo autor do plano)

- **Cobertura do spec:** modelo de dados (T1), seed discrição+peças+combos (T2), aba/lista (T3), criar/editar+status (T4), filtro nas peças+fitTip (T5), verificação (T6). Card de Princípios foi intencionalmente substituído por link pra aba Discreto existente — coberto em T3 Step 4. ✓
- **Placeholders:** nenhum — todo código está completo; a única condicional é o README em T6 (pular se não houver seção). ✓
- **Consistência de tipos:** `Outfit`/`Garment` definidos em T1 e usados igual em T2–T5 (`context`, `discretion`, `silhouetteNote`, `status`, `pieces`). Conversão `Number(id)` em ComboDetail consistente com id numérico. Rota `/novo` registrada antes de `/:id`. ✓
