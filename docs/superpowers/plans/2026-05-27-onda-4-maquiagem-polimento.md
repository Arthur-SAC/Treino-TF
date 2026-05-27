# Trein-Final — Onda 4: Maquiagem + Polimento

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Sub-tab "Maquiagem" dentro de Beleza (terceira sub-tab, junto com Pele&Cabelo + Estilo). Catálogo de 15 produtos brasileiros + 5 rotinas de maquiagem (natural, work, sensual, sexy, festa). Polimento: gráfico de evolução de medidas em Corpo, atualizar copy do Onboarding pra refletir app maduro, streak de consistência no Hoje.

**Continua de:** Onda 3 — commit `4354fb0`

---

## File Structure (additions)

```
src/
├── data/
│   ├── makeup-products-seed.ts    # 15 produtos brasileiros
│   └── makeup-routines-seed.ts    # 5 rotinas
├── components/
│   ├── BeautyTabs.tsx             # MODIFICAR — adicionar terceira tab "Maquiagem"
│   ├── MeasurementChart.tsx       # NOVO — gráfico de evolução de medidas
│   └── StreakCard.tsx             # NOVO — card de streak de consistência
├── pages/beauty/makeup/
│   ├── MakeupHome.tsx             # lista de rotinas + acesso a produtos
│   └── MakeupDetail.tsx           # passos de uma rotina
└── lib/
    └── makeup-seed.ts
tests/lib/makeup-seed.test.ts
```

**Schema:** sem bump — reusa os stores existentes `skincareRoutines` e `products` adicionando filtro por `category` ou um novo campo. Pra evitar misturar com skincare/hair, vou usar a categoria `makeup` em produtos e criar um NOVO store `makeupRoutines`. Bump schema pra v3.

---

## Task 1: Schema v3 + seed de maquiagem

**Files:**
- Modify: `src/lib/db.ts`
- Create: `src/data/makeup-products-seed.ts`
- Create: `src/data/makeup-routines-seed.ts`
- Create: `src/lib/makeup-seed.ts`
- Create: `tests/lib/makeup-seed.test.ts`
- Modify: `src/lib/settings-helpers.ts`, `src/hooks/useSetting.ts`, `src/main.tsx`

- [ ] **Step 1: Schema v3**

Em `src/lib/db.ts`:

Adicione tipo:

```typescript
export interface MakeupRoutine {
  id?: number;
  name: string;
  occasion: "diario" | "trabalho" | "sensual" | "saida" | "festa";
  durationMin: number;
  steps: Array<{ productName: string; technique: string; areaOfFace?: string }>;
  notes?: string;
}
```

Em `Product`, mude `category` pra incluir `makeup`:

```typescript
export interface Product {
  id?: number;
  name: string;
  category: "skincare" | "haircare" | "supplements" | "makeup";
  boughtAt?: string;
  endDate?: string;
  notes?: string;
}
```

(Isso é adicionar opção ao union — não é breaking change pros dados existentes.)

Na classe TreinFinalDB, adicione:

```typescript
makeupRoutines!: Table<MakeupRoutine, number>;
```

E adicione bump:

```typescript
this.version(3).stores({
  makeupRoutines: "++id, occasion",
});
```

- [ ] **Step 2: Catálogo de produtos**

`src/data/makeup-products-seed.ts`:

```typescript
import type { Product } from "../lib/db";

export const MAKEUP_PRODUCTS: Omit<Product, "id">[] = [
  // === PREPARAÇÃO ===
  {
    name: "Primer Ruby Rose 5 em 1",
    category: "makeup",
    notes: "Preparação base. Aplica fina camada após skincare, antes da base. Hidrata + segura maquiagem.",
  },
  {
    name: "Base líquida Vult Soft Matte",
    category: "makeup",
    notes: "Acabamento natural-matte. Cobertura média construível. Aplica com esponja úmida pra ficar leve.",
  },
  {
    name: "Corretivo Vult Camuflagem",
    category: "makeup",
    notes: "Pra olheiras + cobrir marquinhas. Aplica em 'V' invertido sob os olhos, dá leve tapinhas pra espalhar.",
  },
  {
    name: "Pó compacto Vult",
    category: "makeup",
    notes: "Fixa a base. Use só na zona T (testa, nariz, queixo) se quiser look com brilho na bochecha. Pincel grande.",
  },
  // === ESCULPIDO ===
  {
    name: "Paleta de contorno Ruby Rose",
    category: "makeup",
    notes: "Marrom acinzentado pra sombra (não laranja). Aplica embaixo da maçã, lateral do nariz, mandíbula. Esfuma SEMPRE.",
  },
  {
    name: "Blush Mariana Saad rosado",
    category: "makeup",
    notes: "Aplica no topo da maçã do rosto, sentido pra têmpora. Cor rosada favorece subtom quente.",
  },
  {
    name: "Iluminador Mariana Saad champagne",
    category: "makeup",
    notes: "Topo da maçã (acima do blush), arco do cupido, ponta do nariz, lacrimal. Pincel pequeno.",
  },
  {
    name: "Bronzer Ruby Rose",
    category: "makeup",
    notes: "Cor quente pra dar 'sol' no rosto. Aplica em '3' (testa, maçã, mandíbula). Sutil.",
  },
  // === OLHOS ===
  {
    name: "Paleta sombras Vult Nude",
    category: "makeup",
    notes: "Tons quentes (bege, marrom, bronze). Combina com paleta amazona. Esfuma sempre da cor mais clara pra mais escura.",
  },
  {
    name: "Delineador caneta Vult",
    category: "makeup",
    notes: "Linha rente aos cílios. Pra começar, faz só uma linha fina. Gato (winged) é evolução.",
  },
  {
    name: "Máscara cílios Maybelline The Falsies",
    category: "makeup",
    notes: "Aplica zigue-zague da raiz à ponta. 2 camadas pra volume. Não passa em cima de máscara seca.",
  },
  {
    name: "Lápis de sobrancelha Vult",
    category: "makeup",
    notes: "Preenche falhas com tracinhos no sentido do pelo. Pincel goupil pra esfumar. Sobrancelha define muito o rosto.",
  },
  // === LÁBIOS ===
  {
    name: "Batom líquido matte Ruby Rose vinho",
    category: "makeup",
    notes: "Cor vinho favorece sua paleta amazona. Aplica do centro pra fora. Espera 1 min secar.",
  },
  {
    name: "Batom hidratante Bruna Tavares BT Tint nude",
    category: "makeup",
    notes: "Pra dia a dia. Hidrata + cor sutil. Aplica direto sem contorno.",
  },
  {
    name: "Gloss Mariana Saad transparente",
    category: "makeup",
    notes: "Por cima de batom matte pra dar brilho 'glass'. Vibe sensual.",
  },
  // === FIXAÇÃO ===
  {
    name: "Fixador Ruby Rose Fix It",
    category: "makeup",
    notes: "Borrifa após terminar maquiagem. Aumenta duração + une os produtos.",
  },
];
```

- [ ] **Step 3: Rotinas de maquiagem**

`src/data/makeup-routines-seed.ts`:

```typescript
import type { MakeupRoutine } from "../lib/db";

export const MAKEUP_ROUTINES: Omit<MakeupRoutine, "id">[] = [
  {
    name: "Natural · diário (5 min)",
    occasion: "diario",
    durationMin: 5,
    notes: "Look minimal pra dia normal. Pele saudável + traços leves. Subtle, não fake.",
    steps: [
      { productName: "Skincare + protetor solar", technique: "Como sempre. Espera 2 min absorver antes de começar maquiagem.", areaOfFace: "rosto inteiro" },
      { productName: "BT Tint nude (Bruna Tavares)", technique: "Aplica com esponja úmida em pontinhos pelo rosto e espalha. Sem corretivo, sem pó.", areaOfFace: "rosto inteiro" },
      { productName: "Corretivo Vult Camuflagem", technique: "Só nas olheiras. 'V' invertido + tapinhas.", areaOfFace: "olheiras" },
      { productName: "Blush Mariana Saad rosado", technique: "Pincel grande, topo da maçã com leve sorriso. Cor sutil.", areaOfFace: "maçãs" },
      { productName: "Lápis de sobrancelha Vult", technique: "Preencha falhas, esfume com goupil. Não exagera no formato.", areaOfFace: "sobrancelha" },
      { productName: "Máscara cílios Maybelline", technique: "1 camada zigue-zague. Não precisa de delineador.", areaOfFace: "cílios" },
      { productName: "Batom hidratante BT Tint", technique: "Direto, sem contorno. Dá um leve toque de cor.", areaOfFace: "lábios" },
    ],
  },
  {
    name: "Trabalho · profissional (8 min)",
    occasion: "trabalho",
    durationMin: 8,
    notes: "Mais polida que diário. Equilibra autoridade com feminilidade. Sem chamar muita atenção.",
    steps: [
      { productName: "Skincare + protetor solar", technique: "Como sempre.", areaOfFace: "rosto" },
      { productName: "Primer Ruby Rose 5 em 1", technique: "Camada fina, espalha com as mãos.", areaOfFace: "zona T" },
      { productName: "Base Vult Soft Matte", technique: "Esponja úmida em pontinhos, espalha em movimentos suaves de dentro pra fora.", areaOfFace: "rosto inteiro" },
      { productName: "Corretivo Vult", technique: "Olheiras + qualquer mancha. Tapinhas pra cobrir sem marcar.", areaOfFace: "olheiras + manchas" },
      { productName: "Pó compacto Vult", technique: "Pincel grande, só zona T. Esponja embaixo dos olhos se houver brilho.", areaOfFace: "zona T" },
      { productName: "Bronzer Ruby Rose", technique: "Em '3' (testa, maçã, mandíbula). Sutil pra dar saúde.", areaOfFace: "perímetro do rosto" },
      { productName: "Blush rosado", technique: "Topo da maçã. Mais difuso que no look diário.", areaOfFace: "maçãs" },
      { productName: "Lápis de sobrancelha", technique: "Preenchimento mais marcado que no diário (autoridade), mas natural.", areaOfFace: "sobrancelha" },
      { productName: "Máscara de cílios", technique: "2 camadas. Sem postiço.", areaOfFace: "cílios" },
      { productName: "Batom líquido matte (cor neutra ou nude rosado)", technique: "Aplica do centro pra fora.", areaOfFace: "lábios" },
    ],
  },
  {
    name: "Sensual · com a namorada (10 min)",
    occasion: "sensual",
    durationMin: 10,
    notes: "Glow rosado, brilho, vibe romântica. Acabamento dewy (brilhante), não matte. Lábios suculentos.",
    steps: [
      { productName: "Skincare", technique: "Especial atenção em hidratante (vai dar glow).", areaOfFace: "rosto" },
      { productName: "Primer", technique: "Fina camada.", areaOfFace: "rosto" },
      { productName: "Base BT Tint (ou base com gota de iluminador líquido misturado)", technique: "Cobertura leve, deixa pele aparecer. Esponja úmida.", areaOfFace: "rosto" },
      { productName: "Corretivo APENAS onde precisa", technique: "Não cobre tudo — deixa pele respirar.", areaOfFace: "pontos" },
      { productName: "Blush rosado MAIS pigmentado", technique: "Mais cor na maçã. Pode arriscar um pouco pro nariz pra efeito 'corado'.", areaOfFace: "maçãs + nariz" },
      { productName: "Iluminador Mariana Saad", technique: "GENEROSO no topo da maçã, arco do cupido, ponta do nariz, lacrimal, ombros (se decote).", areaOfFace: "pontos altos" },
      { productName: "Sombra paleta nude (tom champagne)", technique: "1 cor só, espalha na pálpebra inteira. Esfuma na côncava com tom marrom MUITO leve.", areaOfFace: "pálpebras" },
      { productName: "Lápis de sobrancelha", technique: "Preenchimento natural.", areaOfFace: "sobrancelha" },
      { productName: "Máscara cílios", technique: "2 camadas. Cílios curvados convidam.", areaOfFace: "cílios" },
      { productName: "Batom hidratante + gloss por cima", technique: "Cor nude-rosado. Gloss generoso no centro. Lábio suculento.", areaOfFace: "lábios" },
    ],
  },
  {
    name: "Sexy · saída noturna (15 min)",
    occasion: "saida",
    durationMin: 15,
    notes: "Vibe amazona/burlesca. Olhos esfumados, lábio vinho, contorno marcado. Pra arrasar.",
    steps: [
      { productName: "Skincare completo + primer", technique: "Base bem preparada pra durar a noite toda.", areaOfFace: "rosto" },
      { productName: "Base Vult Soft Matte", technique: "Cobertura média-alta. Esponja úmida + finalizar com mão pra aquecer e espalhar.", areaOfFace: "rosto" },
      { productName: "Corretivo Vult", technique: "Mais opaco. Cobre olheiras + manchas.", areaOfFace: "olheiras + manchas" },
      { productName: "Pó compacto", technique: "Pra fixar bem. Pincel.", areaOfFace: "rosto inteiro" },
      { productName: "Paleta de contorno (sombra marrom acinzentada)", technique: "Embaixo da maçã (puxa pra orelha), lateral do nariz, mandíbula. Esfuma SEMPRE pra ficar suave.", areaOfFace: "perímetro" },
      { productName: "Blush rosado-pêssego", technique: "Topo da maçã, mais difuso.", areaOfFace: "maçãs" },
      { productName: "Iluminador", technique: "Pontos altos + arco do cupido.", areaOfFace: "pontos altos" },
      { productName: "Sombra paleta nude (esfumado)", technique: "Bege na pálpebra inteira. Marrom escuro na côncava esfumando pra cima. Esfuma BEM com pincel limpo.", areaOfFace: "pálpebras" },
      { productName: "Sombra escura no canto externo (efeito gatinho)", technique: "Cor mais escura no canto externo da pálpebra superior, puxa diagonal. Esfuma.", areaOfFace: "canto externo do olho" },
      { productName: "Delineador caneta Vult", technique: "Linha rente cílios + gatinho na ponta externa. Demora um pouco mas vale.", areaOfFace: "pálpebra superior" },
      { productName: "Máscara cílios + cílios postiços (opcional)", technique: "3 camadas de máscara. Se for usar postiço, recorta no tamanho, cola na linha dos cílios naturais.", areaOfFace: "cílios" },
      { productName: "Sobrancelha marcada", technique: "Mais densa que no look trabalho.", areaOfFace: "sobrancelha" },
      { productName: "Lápis labial + batom líquido matte vinho", technique: "Contorna lábios, preenche com batom líquido. Cor vinho é sua paleta.", areaOfFace: "lábios" },
      { productName: "Fixador Ruby Rose Fix It", technique: "Borrifa o rosto pra dura a noite.", areaOfFace: "rosto inteiro" },
    ],
  },
  {
    name: "Festa · produção completa (20 min)",
    occasion: "festa",
    durationMin: 20,
    notes: "Maquiagem elaborada pra ocasiões especiais. Glitter, cílios postiços completos, lábio marcado. Quando você quer ARRASAR.",
    steps: [
      { productName: "Skincare completo + primer", technique: "Base impecável.", areaOfFace: "rosto" },
      { productName: "Base + corretivo + pó", technique: "Como look sexy mas com mais cobertura. Pode usar 2 tons de corretivo (claro pra iluminar, igual ao tom da pele pra cobrir).", areaOfFace: "rosto" },
      { productName: "Contorno completo + esfumado", technique: "Marca todos os pontos (maçã, nariz, mandíbula, têmpora). Esfuma muito bem.", areaOfFace: "perímetro" },
      { productName: "Blush + iluminador generosos", technique: "Faz GLOW visível à distância.", areaOfFace: "maçãs" },
      { productName: "Olhos esfumados com glitter no centro", technique: "Esfumado completo + dab de glitter (ou sombra metálica) no centro da pálpebra pra dar dimensão.", areaOfFace: "pálpebras" },
      { productName: "Delineador gatinho marcado", technique: "Mais grosso, ponta mais longa.", areaOfFace: "pálpebra" },
      { productName: "Cílios postiços completos + máscara", technique: "Postiços longos, deixa secar a cola antes. Camada de máscara nos cílios próprios pra unir.", areaOfFace: "cílios" },
      { productName: "Sobrancelha definida", technique: "Mais marcada. Pode usar gel fixador transparente.", areaOfFace: "sobrancelha" },
      { productName: "Lápis + batom + gloss", technique: "Contorno marcado, batom matte cor escolhida, gloss no centro inferior.", areaOfFace: "lábios" },
      { productName: "Fixador SPRAY ABUNDANTE", technique: "Borrifa duas camadas. Garante que dure a noite.", areaOfFace: "rosto" },
    ],
  },
];
```

- [ ] **Step 4: Test**

`tests/lib/makeup-seed.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { seedMakeup } from "../../src/lib/makeup-seed";
import { db } from "../../src/lib/db";

describe("seedMakeup", () => {
  it("popula produtos e rotinas de maquiagem", async () => {
    await seedMakeup();
    const products = await db.products.where("category").equals("makeup").toArray();
    const routines = await db.makeupRoutines.toArray();
    expect(products.length).toBeGreaterThanOrEqual(10);
    expect(routines.length).toBeGreaterThanOrEqual(5);
  });

  it("é idempotente", async () => {
    await seedMakeup();
    const a = (await db.products.where("category").equals("makeup").toArray()).length;
    await seedMakeup();
    expect((await db.products.where("category").equals("makeup").toArray()).length).toBe(a);
  });

  it("rotinas têm passos não-vazios", async () => {
    await seedMakeup();
    for (const r of await db.makeupRoutines.toArray()) {
      expect(r.steps.length).toBeGreaterThan(0);
      expect(r.durationMin).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 5: Seed function**

`src/lib/makeup-seed.ts`:

```typescript
import { db } from "./db";
import { MAKEUP_PRODUCTS } from "../data/makeup-products-seed";
import { MAKEUP_ROUTINES } from "../data/makeup-routines-seed";

export async function seedMakeup(): Promise<void> {
  const seeded = await db.settings.get("makeupSeeded");
  if (seeded?.value === true) return;

  await db.transaction("rw", [db.products, db.makeupRoutines, db.settings], async () => {
    for (const p of MAKEUP_PRODUCTS) {
      await db.products.add(p as never);
    }
    for (const r of MAKEUP_ROUTINES) {
      await db.makeupRoutines.add(r as never);
    }
    await db.settings.put({ key: "makeupSeeded", value: true });
  });
}
```

Add `makeupSeeded: boolean` to `Settings` + DEFAULTS in BOTH `settings-helpers.ts` and `useSetting.ts`.

- [ ] **Step 6: Wire + commit**

```tsx
import { seedMakeup } from "./lib/makeup-seed";
// ...
Promise.all([seedDatabase(), seedBeauty(), seedStyle(), seedPath(), seedMovement(), seedMakeup()]).then(() => { ... });
```

```bash
npm run test
npm run build
git add src/lib/db.ts src/data/makeup-products-seed.ts src/data/makeup-routines-seed.ts src/lib/makeup-seed.ts src/lib/settings-helpers.ts src/hooks/useSetting.ts src/main.tsx tests/lib/makeup-seed.test.ts
git commit -m "feat(maquiagem): schema v3 + seed de 16 produtos + 5 rotinas"
```

---

## Task 2: BeautyTabs com 3 tabs + MakeupHome

**Files:**
- Modify: `src/components/BeautyTabs.tsx`
- Modify: `src/pages/beauty/BeautyHome.tsx`
- Create: `src/pages/beauty/makeup/MakeupHome.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: BeautyTabs com 3 tabs**

Atualize `src/components/BeautyTabs.tsx`:

```tsx
import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/beleza/pele-cabelo", label: "Pele & cabelo" },
  { to: "/beleza/estilo", label: "Estilo" },
  { to: "/beleza/maquiagem", label: "Maquiagem" },
];

export function BeautyTabs() {
  return (
    <div className="flex gap-2 mb-4">
      {ITEMS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 py-2 rounded-md text-xs text-center ${
              isActive ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </div>
  );
}
```

(Tirou o `end: true` do Pele&Cabelo porque agora não é a tab default.)

- [ ] **Step 2: BeautyHome atualizar pra incluir link de Maquiagem**

Atualize `src/pages/beauty/BeautyHome.tsx`. Adicione link DEPOIS dos 3 existentes:

```tsx
<Link to="/beleza/maquiagem" className="card block hover:border-nude/40 transition">
  <h3 className="text-nude-warm font-medium">Maquiagem</h3>
  <p className="text-muted text-sm mt-1">5 rotinas pra ocasiões diferentes + produtos brasileiros</p>
</Link>
```

- [ ] **Step 3: MakeupHome**

`src/pages/beauty/makeup/MakeupHome.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type MakeupRoutine } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { DisclaimerCard } from "../../../components/DisclaimerCard";

const OCCASION_LABEL: Record<MakeupRoutine["occasion"], string> = {
  diario: "Diário",
  trabalho: "Trabalho",
  sensual: "Sensual",
  saida: "Saída",
  festa: "Festa",
};

export function MakeupHome() {
  const routines = useLiveQuery(() => db.makeupRoutines.toArray(), []);
  const products = useLiveQuery(
    () => db.products.where("category").equals("makeup").toArray(),
    [],
  );

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Maquiagem</h1>
      </div>
      <BeautyTabs />

      <DisclaimerCard text="Comece com as rotinas mais simples (diário, trabalho) e vai evoluindo. Maquiagem é prática — quanto mais você faz, melhor fica." />

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2 mt-3">Rotinas</h2>
      <div className="space-y-2 mb-4">
        {routines?.map((r) => (
          <Link key={r.id} to={`/beleza/maquiagem/${r.id}`} className="card block hover:border-nude/40 transition">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-muted text-xs uppercase tracking-wider">{OCCASION_LABEL[r.occasion]}</span>
              <span className="text-muted text-xs">{r.durationMin} min · {r.steps.length} passos</span>
            </div>
            <h3 className="text-nude-warm font-medium">{r.name}</h3>
            {r.notes && <p className="text-muted text-sm mt-1">{r.notes}</p>}
          </Link>
        ))}
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Produtos sugeridos ({products?.length ?? 0})</h2>
      <Link to="/beleza/pele-cabelo/produtos" className="text-nude text-sm underline">
        Ver catálogo completo →
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Routes + commit**

Em `src/main.tsx`:

```tsx
import { MakeupHome } from "./pages/beauty/makeup/MakeupHome";
// ...
{ path: "beleza/maquiagem", element: <MakeupHome /> },
```

```bash
npm run build
git add src/components/BeautyTabs.tsx src/pages/beauty/BeautyHome.tsx src/pages/beauty/makeup/MakeupHome.tsx src/main.tsx
git commit -m "feat(maquiagem): home + integração com BeautyTabs (3 tabs)"
```

---

## Task 3: MakeupDetail (passos da rotina)

**Files:**
- Create: `src/pages/beauty/makeup/MakeupDetail.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: MakeupDetail**

`src/pages/beauty/makeup/MakeupDetail.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../../lib/db";

export function MakeupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routine = useLiveQuery(
    async () => (id ? await db.makeupRoutines.get(Number(id)) : undefined),
    [id],
  );

  if (!routine) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  async function handleDelete() {
    if (!routine?.id) return;
    if (!confirm(`Apagar a rotina "${routine.name}"?`)) return;
    await db.makeupRoutines.delete(routine.id);
    navigate("/beleza/maquiagem", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/maquiagem" className="text-muted text-sm">&larr; Maquiagem</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{routine.name}</h1>
      <p className="text-muted text-sm mb-4">{routine.durationMin} min · {routine.steps.length} passos</p>

      {routine.notes && (
        <div className="card !bg-wine/20 !border-wine-light mb-3">
          <p className="text-nude-warm text-sm">{routine.notes}</p>
        </div>
      )}

      <ol className="space-y-2">
        {routine.steps.map((step, i) => (
          <li key={i} className="card">
            <div className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-wine text-nude-warm flex items-center justify-center text-sm font-medium flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-nude-warm font-medium">{step.productName}</h3>
                <p className="text-sm text-muted mt-1">{step.technique}</p>
                {step.areaOfFace && (
                  <p className="text-nude text-xs mt-1">área: {step.areaOfFace}</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => void handleDelete()}
        className="mt-6 text-muted text-xs hover:text-red-300"
      >
        Apagar rotina
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Route + commit**

```tsx
import { MakeupDetail } from "./pages/beauty/makeup/MakeupDetail";
// ...
{ path: "beleza/maquiagem/:id", element: <MakeupDetail /> },
```

```bash
npm run build
git add src/pages/beauty/makeup/MakeupDetail.tsx src/main.tsx
git commit -m "feat(maquiagem): detalhe de rotina com passos numerados"
```

---

## Task 4: Polimento — atualizar Onboarding copy

**Files:**
- Modify: `src/pages/body/Onboarding.tsx`

- [ ] **Step 1: Atualizar texto do step 4**

No `src/pages/body/Onboarding.tsx`, encontre o bloco do `step === 4` e substitua o texto:

```tsx
<p className="text-muted text-sm">
  Você pode adicionar mais medidas e fotos a qualquer momento na aba <strong>Corpo</strong>.
  Treino, beleza e trilha chegam nas próximas atualizações.
</p>
```

por:

```tsx
<p className="text-muted text-sm">
  Você pode adicionar mais medidas e fotos a qualquer momento na aba <strong>Corpo</strong>.
  O app inteiro está disponível: <strong>Treino</strong> (plano semanal + biblioteca + movimento), <strong>Beleza</strong> (skincare + cabelo + estilo + maquiagem), <strong>Trilha</strong> (marcos + alimentação + diário).
  Tudo offline, tudo seu.
</p>
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/pages/body/Onboarding.tsx
git commit -m "fix(onboarding): atualizar copy refletindo app maduro"
```

---

## Task 5: Polimento — gráfico de evolução de medidas

**Files:**
- Create: `src/components/MeasurementChart.tsx`
- Modify: `src/pages/body/Measurements.tsx`

- [ ] **Step 1: MeasurementChart**

`src/components/MeasurementChart.tsx`:

```tsx
interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  unit?: string;
  height?: number;
  color?: string;
}

export function MeasurementChart({ data, unit = "cm", height = 140, color = "#d4a373" }: Props) {
  if (data.length < 2) {
    return <p className="text-muted text-sm text-center py-3">Pelo menos 2 medidas pra ver evolução.</p>;
  }

  const w = 320;
  const h = height;
  const padding = 24;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const stepX = (w - padding * 2) / (data.length - 1);

  const points = data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y = padding + (1 - (d.value - min) / range) * (h - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" xmlns="http://www.w3.org/2000/svg">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {data.map((d, i) => {
        const cx = padding + i * stepX;
        const cy = padding + (1 - (d.value - min) / range) * (h - padding * 2);
        return <circle key={i} cx={cx} cy={cy} r={2.5} fill="#f4e4d6" />;
      })}
      <text x={padding} y={padding - 6} fontSize={9} fill="#a87a6a">{max.toFixed(1)} {unit}</text>
      <text x={padding} y={h - 6} fontSize={9} fill="#a87a6a">{min.toFixed(1)} {unit}</text>
    </svg>
  );
}
```

- [ ] **Step 2: Update Measurements.tsx — adicionar gráfico de evolução por medida**

No `src/pages/body/Measurements.tsx`, antes do `<h2>Histórico</h2>`, adicione um card com seletor e gráfico:

```tsx
import { useState } from "react";
import { MeasurementChart } from "../../components/MeasurementChart";

// dentro do componente:
const [selectedMetric, setSelectedMetric] = useState<keyof Measurement>("waistCm");

const metricOptions: Array<{ key: keyof Measurement; label: string }> = [
  { key: "waistCm", label: "Cintura" },
  { key: "hipCm", label: "Quadril" },
  { key: "chestCm", label: "Busto" },
  { key: "thighLeftCm", label: "Coxa E" },
  { key: "thighRightCm", label: "Coxa D" },
  { key: "shouldersCm", label: "Ombros" },
];

const metricData = items
  ?.filter((m) => typeof m[selectedMetric] === "number")
  .map((m) => ({ date: m.date, value: m[selectedMetric] as number }))
  .reverse() ?? [];

// adicione antes do "<h2>Histórico":
{metricData.length > 0 && (
  <div className="card mb-4">
    <h2 className="text-nude-warm font-medium mb-3">Evolução de uma medida</h2>
    <div className="overflow-x-auto -mx-4 px-4 mb-3">
      <div className="flex gap-2 w-max">
        {metricOptions.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSelectedMetric(opt.key)}
            className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
              selectedMetric === opt.key ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
    <MeasurementChart data={metricData} />
  </div>
)}
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/components/MeasurementChart.tsx src/pages/body/Measurements.tsx
git commit -m "feat(corpo): gráfico de evolução por medida individual"
```

---

## Task 6: Polimento — streak de consistência no Hoje

**Files:**
- Create: `src/components/StreakCard.tsx`
- Modify: `src/pages/Today.tsx`

- [ ] **Step 1: StreakCard**

`src/components/StreakCard.tsx`:

```tsx
interface Props {
  label: string;
  count: number;
  total?: number;
  unit?: string;
}

export function StreakCard({ label, count, total, unit = "dias" }: Props) {
  return (
    <div className="card !p-3 text-center">
      <p className="text-muted text-xs uppercase tracking-wider">{label}</p>
      <p className="font-serif text-2xl text-nude mt-1">
        {count}
        {total !== undefined && <span className="text-muted text-base"> / {total}</span>}
      </p>
      <p className="text-muted text-[0.65rem] mt-0.5">{unit}</p>
    </div>
  );
}
```

- [ ] **Step 2: Update Today com streaks**

No `src/pages/Today.tsx`, adicione queries de streaks:

```tsx
// Conta últimos 7 dias com pelo menos 1 skincare feita
const last7DaysSkincare = useLiveQuery(async () => {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const logs = await db.skincareLogs.where("date").anyOf(dates).and((l) => l.completed).toArray();
  const uniqueDates = new Set(logs.map((l) => l.date));
  return uniqueDates.size;
}, []);

// Conta últimas 7 sessões de treino
const last7DaysTraining = useLiveQuery(async () => {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const sessions = await db.workoutSessions.where("date").anyOf(dates).toArray();
  const uniqueDates = new Set(sessions.map((s) => s.date));
  return uniqueDates.size;
}, []);
```

Importe `StreakCard` e adicione no JSX, logo depois do título do dia:

```tsx
import { StreakCard } from "../components/StreakCard";

// depois do <h1>Bom dia</h1>, antes do card de treino:
<div className="grid grid-cols-3 gap-2 mb-3">
  <StreakCard label="Treino" count={last7DaysTraining ?? 0} total={7} />
  <StreakCard label="Skincare" count={last7DaysSkincare ?? 0} total={7} />
  <StreakCard label="Pausas" count={dailyLog?.activeBreakCount ?? 0} unit="hoje" />
</div>
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/components/StreakCard.tsx src/pages/Today.tsx
git commit -m "feat(hoje): streaks de consistência (treino + skincare últimos 7 dias)"
```

---

## Task 7: README + push final

- [ ] **Step 1: README**

```markdown
## Status

- **Onda 1:** ✅ Concluída
- **Onda 2:** ✅ Concluída (Pele&Cabelo + Estilo + Trilha)
- **Onda 3:** ✅ Concluída — Movimento
- **Onda 4:** ✅ Concluída — Maquiagem + Polimento

App está pronto pra uso diário. Suporta todos os pilares da transição.
```

- [ ] **Step 2: Final tests + build + push**

```bash
npm run test
npm run build
git add README.md docs/superpowers/plans/2026-05-27-onda-4-maquiagem-polimento.md
git commit -m "docs: README — Onda 4 concluída, app maduro"
git push origin main
```

## Report

Tests, build, commit, push, total commits.
