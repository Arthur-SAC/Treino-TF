# Trein-Final — Onda 2 Parte 2: Beleza → Estilo

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Sub-tab Estilo dentro de Beleza. Inclui paleta pessoal inferida + wizard de re-análise, catálogo de ~20 peças estratégicas (dia/casual/formal) + ~10 peças íntimas/sensuais (separadas mas expostas, sem PIN), looks salvos com foto + rating, wishlist.

**Continua de:** Onda 2 Parte 1 — commit `aaf771e`

---

## File Structure

```
src/
├── data/
│   ├── garments-seed.ts          # ~20 peças cotidianas + ~10 íntimas
│   └── palette-seed.ts           # paleta inferida inicial
├── components/
│   ├── StyleTabs.tsx             # sub-nav interno: Paleta/Peças/Looks/Wishlist/Íntimo
│   ├── GarmentCard.tsx
│   ├── LookCard.tsx
│   └── ColorSwatch.tsx
├── pages/beauty/style/
│   ├── StyleHome.tsx             # substitui StylePlaceholder
│   ├── PaletteView.tsx           # análise + wizard
│   ├── GarmentsView.tsx          # lista de peças cotidianas
│   ├── GarmentDetail.tsx         # detalhe (por que funciona)
│   ├── LooksView.tsx             # galeria de looks
│   ├── LookNew.tsx               # adicionar look
│   ├── WishlistView.tsx
│   └── IntimateView.tsx          # catálogo íntimo
└── lib/
    └── style-seed.ts
tests/lib/style-seed.test.ts
```

---

## Task 1: Seed de peças + paleta

- [ ] **Step 1: Test**

`tests/lib/style-seed.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { seedStyle } from "../../src/lib/style-seed";
import { db } from "../../src/lib/db";

describe("seedStyle", () => {
  it("popula garments e palette", async () => {
    await seedStyle();
    expect((await db.garments.toArray()).length).toBeGreaterThanOrEqual(20);
    expect((await db.stylePalette.toArray()).length).toBe(1);
  });

  it("é idempotente", async () => {
    await seedStyle();
    const a = (await db.garments.toArray()).length;
    await seedStyle();
    expect((await db.garments.toArray()).length).toBe(a);
  });

  it("peças têm whyItWorks", async () => {
    await seedStyle();
    for (const g of await db.garments.toArray()) {
      expect(g.whyItWorks).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Catálogo de peças**

`src/data/garments-seed.ts`:

```typescript
import type { Garment } from "../lib/db";

export const GARMENTS: Garment[] = [
  // === DIA / CASUAL ===
  {
    id: "decote-v-profundo",
    name: "Top/blusa com decote V profundo",
    category: "top",
    occasion: ["casual", "trabalho"],
    whyItWorks: "Alonga o pescoço verticalmente e quebra a linha horizontal dos ombros. Cria ponto focal no centro do peito, atraindo o olhar pra baixo dos ombros.",
    cautions: "Evite com gola alta sem decote — gola alta junto com ombros largos vira look masculino.",
  },
  {
    id: "decote-coracao",
    name: "Top decote coração / sweetheart",
    category: "top",
    occasion: ["casual", "sair"],
    whyItWorks: "Suaviza linha dos ombros e enquadra o busto, criando ilusão de mais volume.",
  },
  {
    id: "cinto-largo-cintura",
    name: "Cinto largo na cintura",
    category: "outerwear",
    occasion: ["casual", "trabalho", "sair"],
    whyItWorks: "Cria ponto focal forte na cintura e enfatiza a diferença cintura-quadril. Sozinho transforma silhueta.",
    cautions: "Use SEMPRE acima do quadril, na linha natural da cintura (umbigo).",
  },
  {
    id: "saia-rodada",
    name: "Saia rodada (godê / circle skirt)",
    category: "bottom",
    occasion: ["casual", "sair", "trabalho"],
    whyItWorks: "Volume na parte de baixo amplifica visual do quadril e cria proporção ampulheta instantânea com qualquer top justo.",
  },
  {
    id: "saia-lapis",
    name: "Saia lápis (cintura alta)",
    category: "bottom",
    occasion: ["trabalho", "sair"],
    whyItWorks: "Marca cintura e quadril, alongando pernas. Ideal pra silhueta ampulheta.",
    cautions: "Escolha cintura ALTA — cintura baixa empurra silhueta pra estilo masculino.",
  },
  {
    id: "calca-cintura-alta",
    name: "Calça de cintura alta",
    category: "bottom",
    occasion: ["casual", "trabalho", "sair"],
    whyItWorks: "Eleva o ponto da cintura, alonga torso visualmente e marca quadril. Funciona com qualquer top.",
  },
  {
    id: "vestido-peplum",
    name: "Vestido peplum",
    category: "dress",
    occasion: ["trabalho", "sair"],
    whyItWorks: "O peplum (saiote acima do quadril) dá volume aparente ao quadril, enfatizando cintura. Trabalha mesmo em corpos com quadril estreito.",
  },
  {
    id: "vestido-saia-rodada",
    name: "Vestido com saia rodada (fit and flare)",
    category: "dress",
    occasion: ["casual", "sair", "festa"],
    whyItWorks: "Top justo + saia rodada = ampulheta automática. Caimento clássico da silhueta feminina.",
  },
  {
    id: "blusa-com-franzido",
    name: "Blusa com franzido / busto franzido",
    category: "top",
    occasion: ["casual", "sair"],
    whyItWorks: "O franzido na frente cria volume aparente no busto sem postiço.",
  },
  {
    id: "macacao-cintura-marcada",
    name: "Macacão com cintura marcada",
    category: "dress",
    occasion: ["casual", "sair"],
    whyItWorks: "Cria silhueta vertical com ponto focal forte na cintura. Versátil.",
  },
  {
    id: "casaco-trench",
    name: "Trench coat / casaco com cinto",
    category: "outerwear",
    occasion: ["casual", "trabalho", "sair"],
    whyItWorks: "Cinto na cintura faz casaco abrir feito saia, mantendo silhueta feminina mesmo no inverno.",
    cautions: "Evite casacos quadrados e largos — eles esfumam a silhueta.",
  },
  {
    id: "tecido-com-caimento",
    name: "Peças em jersey / malha / viscose",
    category: "top",
    occasion: ["casual", "sair"],
    whyItWorks: "Tecidos com caimento abraçam o quadril e marcam curvas — funcionam contra estofamento rígido (alfaiataria pesada).",
  },
  {
    id: "vestido-envelope",
    name: "Vestido envelope (wrap dress)",
    category: "dress",
    occasion: ["trabalho", "sair"],
    whyItWorks: "Decote V + cintura amarrada + saia que abre. Combina TODOS os truques de ampulheta numa peça só.",
  },
  {
    id: "blusa-pescoco-aberto",
    name: "Blusa de gola aberta / boat neck",
    category: "top",
    occasion: ["casual", "sair"],
    whyItWorks: "Mostra mais pele do pescoço e clavícula sem revelar trapézio quando ombros não são pendentes pra trás.",
    cautions: "Combine com retração escapular boa — se ombros estão pra frente, gola boat acentua isso.",
  },
  {
    id: "salto-medio",
    name: "Salto médio (5-7cm) / scarpin baixo",
    category: "outerwear",
    occasion: ["trabalho", "sair", "festa"],
    whyItWorks: "Mudança sutil na postura projeta quadril e empina glúteo. Não precisa salto agulha — médio já transforma.",
  },
  {
    id: "leggin-cintura-alta",
    name: "Legging de cintura alta",
    category: "bottom",
    occasion: ["casual", "treino"],
    whyItWorks: "Compressão da cintura + abraço no quadril. Versão casual da ampulheta diária.",
  },
  {
    id: "cardigan-curto",
    name: "Cardigã curto / cropped",
    category: "outerwear",
    occasion: ["casual", "trabalho"],
    whyItWorks: "Pára na cintura, mantendo o ponto focal alto sem cobrir o quadril.",
  },
  {
    id: "blusa-ombro-cair",
    name: "Blusa com ombro a cair (off-shoulder)",
    category: "top",
    occasion: ["casual", "sair"],
    whyItWorks: "Revela clavícula e pescoço, suaviza linha dos ombros visualmente porque o tecido cai abaixo da articulação.",
  },
  {
    id: "vestido-bodycon",
    name: "Vestido justo (bodycon) cintura marcada",
    category: "dress",
    occasion: ["sair", "festa"],
    whyItWorks: "Quando seu quadril/coxa estiverem mais desenvolvidos, vestido justo revela toda a silhueta.",
    cautions: "Espera resultado de 6+ meses de treino de glúteo antes — em corpo com quadril menor, marca o que não quer marcar.",
  },
  {
    id: "saia-godê-midi",
    name: "Saia godê midi (até panturrilha)",
    category: "bottom",
    occasion: ["casual", "trabalho", "sair"],
    whyItWorks: "Mais discreta que rodada curta mas mantém o efeito ampulheta. Combina com qualquer top justo.",
  },

  // === ÍNTIMO / SENSUAL ===
  {
    id: "sutia-com-bojo",
    name: "Sutiã com bojo grosso / push-up",
    category: "intimate",
    occasion: ["intimo", "diario"],
    whyItWorks: "Bojo cria busto aparente e mantém forma redonda sem postiço removível.",
  },
  {
    id: "conjunto-tanga-sutia",
    name: "Conjunto sutiã + tanga combinando",
    category: "intimate",
    occasion: ["intimo", "diario"],
    whyItWorks: "Combinar peças cria sensação de ritual. Cor importa — vinho profundo e nude quente são suas tonalidades.",
  },
  {
    id: "body-de-renda",
    name: "Body de renda",
    category: "intimate",
    occasion: ["intimo"],
    whyItWorks: "Acentua cintura e quadril porque corta o corpo na cintura. Renda traz texture e feminilidade.",
  },
  {
    id: "camisola-transparente",
    name: "Camisola transparente / chemise curta",
    category: "intimate",
    occasion: ["intimo", "dormir"],
    whyItWorks: "Cai do busto pro quadril mostrando silhueta. Pode usar com calcinha visível por baixo (intencional).",
  },
  {
    id: "babydoll",
    name: "Babydoll",
    category: "intimate",
    occasion: ["intimo"],
    whyItWorks: "Peplum-like em vestido íntimo. Sustenta busto, abre na cintura, esconde nada importante mas insinua tudo.",
  },
  {
    id: "robe-curto-cetim",
    name: "Robe curto de cetim",
    category: "intimate",
    occasion: ["intimo", "dormir"],
    whyItWorks: "Mostra perna, marca cintura quando amarra o cinto. Vibe burlesca clássica.",
  },
  {
    id: "cinta-liga-meia",
    name: "Cinta-liga + meia 7/8",
    category: "intimate",
    occasion: ["intimo"],
    whyItWorks: "Alonga perna, divide visualmente coxa. Fetiche clássico — funciona se usado com confiança.",
    cautions: "Combine com calcinha que pegue bem na cintura, não na linha do quadril.",
  },
  {
    id: "calcinha-fio-dental",
    name: "Calcinha fio dental / tanga alta",
    category: "intimate",
    occasion: ["intimo", "diario"],
    whyItWorks: "Cintura alta da fio dental marca o quadril visualmente. Sem marca embaixo de roupa.",
  },
  {
    id: "sutia-balconet",
    name: "Sutiã balconet",
    category: "intimate",
    occasion: ["intimo", "diario"],
    whyItWorks: "Empurra busto pra cima e pra fora, criando decote profundo. Excelente sob decote V ou coração.",
  },
  {
    id: "espartilho-cintura",
    name: "Espartilho de cintura (waist trainer leve)",
    category: "intimate",
    occasion: ["intimo", "sair"],
    whyItWorks: "Comprime cintura temporariamente, exagera ampulheta. Use moderadamente — não substitui treino.",
    cautions: "Não use o dia todo. Tipo discreto debaixo da roupa pra ocasiões especiais.",
  },
];
```

- [ ] **Step 3: Paleta inicial**

`src/data/palette-seed.ts`:

```typescript
import type { StylePalette } from "../lib/db";

export const INITIAL_PALETTE: Omit<StylePalette, "id"> = {
  subtone: "warm",
  contrast: "medium",
  favorableColors: [
    "#5c1a2b", // vinho profundo
    "#8b3a4a", // vinho rosado
    "#a0522d", // siena / ferrugem
    "#cd853f", // mostarda escura / peru
    "#6b4423", // marrom chocolate
    "#bc8f5e", // camel
    "#d4a373", // nude/dourado
    "#f4e4d6", // off-white quente
    "#556b2f", // oliva escuro
    "#9b6b43", // bronze
  ],
  unfavorableColors: [
    "#ffc0cb", // rosa-bebê
    "#add8e6", // azul-bebê
    "#e6e6fa", // lavanda gelada
    "#98fb98", // verde-menta
    "#ffffff", // branco puro
    "#000000", // preto puro (use com moderação, com nude próximo do rosto)
  ],
  reanalyzed: false,
};
```

- [ ] **Step 4: Seed**

`src/lib/style-seed.ts`:

```typescript
import { db } from "./db";
import { GARMENTS } from "../data/garments-seed";
import { INITIAL_PALETTE } from "../data/palette-seed";

export async function seedStyle(): Promise<void> {
  const seeded = await db.settings.get("styleSeeded");
  if (seeded?.value === true) return;

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
```

Add to `Settings` interface in both files: `styleSeeded: boolean;`. DEFAULTS: `styleSeeded: false`.

- [ ] **Step 5: Wire in main.tsx**

Add `seedStyle()` to the Promise.all in `src/main.tsx`:

```tsx
import { seedStyle } from "./lib/style-seed";
// ...
Promise.all([seedDatabase(), seedBeauty(), seedStyle()]).then(() => { ... });
```

- [ ] **Step 6: Test + build + commit**

```bash
npm run test
npm run build
git add src/data/garments-seed.ts src/data/palette-seed.ts src/lib/style-seed.ts src/lib/settings-helpers.ts src/hooks/useSetting.ts src/main.tsx tests/lib/style-seed.test.ts
git commit -m "feat(style): seed de 30 peças estratégicas + paleta inicial"
```

---

## Task 2: StyleHome com sub-nav interno

**Files:** `src/components/StyleTabs.tsx`, `src/pages/beauty/style/StyleHome.tsx`, update routes

- [ ] **Step 1: StyleTabs (sub-nav horizontal)**

`src/components/StyleTabs.tsx`:

```tsx
import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/beleza/estilo", label: "Paleta", end: true },
  { to: "/beleza/estilo/pecas", label: "Peças" },
  { to: "/beleza/estilo/looks", label: "Looks" },
  { to: "/beleza/estilo/wishlist", label: "Wishlist" },
  { to: "/beleza/estilo/intimo", label: "Íntimo" },
];

export function StyleTabs() {
  return (
    <div className="overflow-x-auto -mx-4 px-4 mb-4">
      <div className="flex gap-2 w-max">
        {ITEMS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
                isActive ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update main.tsx — remove StylePlaceholder, register style routes**

Add imports for all style pages (will be created in subsequent tasks). Replace `{ path: "beleza/estilo", element: <StylePlaceholder /> }` with multiple routes. Don't worry about the not-yet-created imports for now — we'll create them progressively. Just register all routes ahead of time:

Actually, to keep build clean, only register routes for pages that EXIST. Create only the routes that have a target. Update main.tsx now ONLY for `/beleza/estilo` (will be `PaletteView` after Task 3).

Skip this task's route registration if PaletteView isn't yet built — chain it into Task 3 instead.

- [ ] **Step 3: Commit just StyleTabs.tsx**

```bash
git add src/components/StyleTabs.tsx
git commit -m "feat(estilo): componente de sub-navegação"
```

---

## Task 3: PaletteView (paleta pessoal)

**Files:**
- Create: `src/components/ColorSwatch.tsx`
- Create: `src/pages/beauty/style/PaletteView.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: ColorSwatch**

`src/components/ColorSwatch.tsx`:

```tsx
interface Props {
  color: string;
  label?: string;
}

export function ColorSwatch({ color, label }: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-14 h-14 rounded-card border border-bg-border"
        style={{ backgroundColor: color }}
      />
      {label && <span className="text-muted text-[0.65rem]">{label}</span>}
    </div>
  );
}
```

- [ ] **Step 2: PaletteView**

`src/pages/beauty/style/PaletteView.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { useState } from "react";
import { db, type StylePalette } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { ColorSwatch } from "../../../components/ColorSwatch";
import { DisclaimerCard } from "../../../components/DisclaimerCard";

const SUBTONE_LABEL: Record<StylePalette["subtone"], string> = {
  warm: "Quente",
  cool: "Frio",
  neutral: "Neutro",
};

const CONTRAST_LABEL: Record<StylePalette["contrast"], string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
};

export function PaletteView() {
  const palette = useLiveQuery(async () => (await db.stylePalette.toArray())[0], []);
  const [showWizard, setShowWizard] = useState(false);
  const [subtone, setSubtone] = useState<StylePalette["subtone"]>("warm");
  const [contrast, setContrast] = useState<StylePalette["contrast"]>("medium");

  async function reanalyze() {
    if (!palette?.id) return;
    await db.stylePalette.update(palette.id, { subtone, contrast, reanalyzed: true });
    setShowWizard(false);
  }

  if (!palette) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      {!palette.reanalyzed && (
        <DisclaimerCard text="Esta análise é inicial — inferida pelas suas fotos em luz de cabine. Pra confirmar, faça o wizard de re-análise em luz natural (de dia, perto da janela)." />
      )}

      <div className="card mt-3">
        <h2 className="text-nude-warm font-medium mb-3">Sua paleta atual</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Subtom</p>
            <p className="text-nude-warm">{SUBTONE_LABEL[palette.subtone]}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Contraste</p>
            <p className="text-nude-warm">{CONTRAST_LABEL[palette.contrast]}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowWizard((v) => !v)}
          className="text-nude text-sm underline"
        >
          {showWizard ? "Cancelar" : palette.reanalyzed ? "Re-analisar" : "Confirmar em luz natural"}
        </button>

        {showWizard && (
          <div className="mt-4 pt-4 border-t border-bg-border space-y-3">
            <p className="text-muted text-sm">
              Faça em luz natural (perto da janela, sem luz amarela artificial). Tire uma foto sem maquiagem.
            </p>
            <div>
              <label className="block text-muted text-xs uppercase tracking-wider mb-1">Veia do pulso parece</label>
              <div className="flex gap-2">
                {(["warm", "cool", "neutral"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubtone(s)}
                    className={`flex-1 py-2 rounded-md text-sm ${
                      subtone === s ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                    }`}
                  >
                    {s === "warm" ? "Esverdeada (quente)" : s === "cool" ? "Azulada (fria)" : "Mista (neutra)"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-muted text-xs uppercase tracking-wider mb-1">Contraste cabelo × pele</label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setContrast(c)}
                    className={`flex-1 py-2 rounded-md text-sm ${
                      contrast === c ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                    }`}
                  >
                    {CONTRAST_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void reanalyze()}
              className="w-full bg-wine-light text-nude-warm rounded-md py-2 text-sm"
            >
              Salvar nova análise
            </button>
          </div>
        )}
      </div>

      <div className="card mt-3">
        <h2 className="text-nude-warm font-medium mb-3">Cores que te favorecem</h2>
        <div className="flex flex-wrap gap-3">
          {palette.favorableColors.map((c) => (
            <ColorSwatch key={c} color={c} />
          ))}
        </div>
      </div>

      <div className="card mt-3">
        <h2 className="text-nude-warm font-medium mb-3">Cores que te apagam</h2>
        <div className="flex flex-wrap gap-3">
          {palette.unfavorableColors.map((c) => (
            <ColorSwatch key={c} color={c} />
          ))}
        </div>
        <p className="text-muted text-xs mt-3">
          Não significa que você nunca pode usar — apenas que ficam melhor longe do rosto (em saias, calças, sapatos), e melhor ainda com algo da sua paleta perto do pescoço.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update main.tsx**

Replace import of `StylePlaceholder` with `PaletteView`. Set `{ path: "beleza/estilo", element: <PaletteView /> }`. Delete `StylePlaceholder.tsx` since it's not used.

```bash
rm src/pages/beauty/StylePlaceholder.tsx
```

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add src/components/ColorSwatch.tsx src/pages/beauty/style/ src/main.tsx
git rm src/pages/beauty/StylePlaceholder.tsx
git commit -m "feat(estilo): paleta pessoal com wizard de re-análise"
```

---

## Task 4: GarmentsView + GarmentDetail (peças cotidianas)

**Files:**
- Create: `src/components/GarmentCard.tsx`
- Create: `src/pages/beauty/style/GarmentsView.tsx`
- Create: `src/pages/beauty/style/GarmentDetail.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: GarmentCard**

`src/components/GarmentCard.tsx`:

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

export function GarmentCard({ garment }: { garment: Garment }) {
  return (
    <Link to={`/beleza/estilo/pecas/${garment.id}`} className="card block hover:border-nude/40 transition">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">{CATEGORY_LABEL[garment.category]}</span>
        <span className="text-muted text-xs">{garment.occasion.join(" · ")}</span>
      </div>
      <h3 className="text-nude-warm font-medium">{garment.name}</h3>
    </Link>
  );
}
```

- [ ] **Step 2: GarmentsView**

`src/pages/beauty/style/GarmentsView.tsx`:

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

export function GarmentsView() {
  const [filter, setFilter] = useState<Garment["category"] | "all">("all");
  const garments = useLiveQuery(async () => {
    if (filter === "all") {
      // exclui íntimas (aparecem só na aba Íntimo)
      const all = await db.garments.toArray();
      return all.filter((g) => g.category !== "intimate");
    }
    return db.garments.where("category").equals(filter).toArray();
  }, [filter]);

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <div className="overflow-x-auto -mx-4 px-4 mb-4">
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

      <div className="space-y-2">
        {garments?.map((g) => <GarmentCard key={g.id} garment={g} />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: GarmentDetail**

`src/pages/beauty/style/GarmentDetail.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useParams } from "react-router-dom";
import { db } from "../../../lib/db";

export function GarmentDetail() {
  const { id } = useParams<{ id: string }>();
  const garment = useLiveQuery(
    async () => (id ? await db.garments.get(id) : undefined),
    [id],
  );

  if (!garment) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/estilo/pecas" className="text-muted text-sm">&larr; Peças</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{garment.name}</h1>
      <p className="text-muted text-xs mb-4">{garment.occasion.join(" · ")}</p>

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Por que funciona pra você</h2>
        <p className="text-sm">{garment.whyItWorks}</p>
      </div>

      {garment.cautions && (
        <div className="card !bg-wine/20 !border-wine-light">
          <h2 className="text-nude font-medium mb-2">Cuidado</h2>
          <p className="text-sm text-nude-warm">{garment.cautions}</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Routes + build + commit**

```tsx
import { GarmentsView } from "./pages/beauty/style/GarmentsView";
import { GarmentDetail } from "./pages/beauty/style/GarmentDetail";
// ...
{ path: "beleza/estilo/pecas", element: <GarmentsView /> },
{ path: "beleza/estilo/pecas/:id", element: <GarmentDetail /> },
```

```bash
npm run build
git add src/components/GarmentCard.tsx src/pages/beauty/style/GarmentsView.tsx src/pages/beauty/style/GarmentDetail.tsx src/main.tsx
git commit -m "feat(estilo): catálogo de peças com explicação"
```

---

## Task 5: LooksView + LookNew

**Files:**
- Create: `src/components/LookCard.tsx`
- Create: `src/pages/beauty/style/LooksView.tsx`
- Create: `src/pages/beauty/style/LookNew.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: LookCard**

`src/components/LookCard.tsx`:

```tsx
import type { Look } from "../lib/db";
import { BlobImage } from "./BlobImage";
import { formatDateBR } from "../lib/format";

const RATING_LABEL: Record<Look["rating"], string> = {
  love: "Amei",
  ok: "Ok",
  no: "Não rolou",
};

interface Props {
  look: Look;
  onDelete?: () => void;
}

export function LookCard({ look, onDelete }: Props) {
  return (
    <div className="card !p-2">
      <BlobImage blob={look.blob} alt={look.occasion} className="w-full rounded-md mb-2 aspect-[3/4] object-cover" />
      <div className="flex justify-between items-baseline text-xs">
        <span className="text-nude-warm">{look.occasion}</span>
        <span className="text-muted">{RATING_LABEL[look.rating]}</span>
      </div>
      <p className="text-muted text-xs mt-0.5">{formatDateBR(new Date(look.date))}</p>
      {look.notes && <p className="text-muted text-xs mt-1">{look.notes}</p>}
      {onDelete && (
        <button onClick={onDelete} type="button" className="text-muted text-xs hover:text-red-300 mt-1">
          apagar
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: LooksView**

`src/pages/beauty/style/LooksView.tsx`:

```tsx
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { LookCard } from "../../../components/LookCard";

const OCCASIONS = ["all", "trabalho", "casual", "sair", "noite", "namorada", "festa"];

export function LooksView() {
  const [filter, setFilter] = useState<string>("all");
  const looks = useLiveQuery(async () => {
    const all = await db.looks.toArray();
    const sorted = all.sort((a, b) => b.date.localeCompare(a.date));
    if (filter === "all") return sorted;
    return sorted.filter((l) => l.occasion === filter);
  }, [filter]);

  async function handleDelete(id?: number) {
    if (id === undefined) return;
    if (!confirm("Apagar este look?")) return;
    await db.looks.delete(id);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
        <Link to="/beleza/estilo/looks/novo" className="text-muted text-sm">+ novo</Link>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <div className="overflow-x-auto -mx-4 px-4 mb-4">
        <div className="flex gap-2 w-max">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setFilter(o)}
              className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap capitalize ${
                filter === o ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {o === "all" ? "Todos" : o}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {looks?.map((l) => <LookCard key={l.id} look={l} onDelete={() => void handleDelete(l.id)} />)}
        {looks?.length === 0 && (
          <p className="text-muted text-sm col-span-2 text-center py-4">Sem looks ainda.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: LookNew**

`src/pages/beauty/style/LookNew.tsx`:

```tsx
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Look } from "../../../lib/db";
import { compressImage } from "../../../lib/image-compress";

const OCCASIONS = ["trabalho", "casual", "sair", "noite", "namorada", "festa"];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function LookNew() {
  const navigate = useNavigate();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [occasion, setOccasion] = useState("casual");
  const [rating, setRating] = useState<Look["rating"]>("ok");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      setBlob(await compressImage(file));
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!blob) return;
    await db.looks.add({ date: todayISO(), blob, occasion, rating, notes: notes.trim() || undefined } as Look);
    navigate("/beleza/estilo/looks", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/estilo/looks" className="text-muted text-sm">&larr; Looks</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Novo look</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block w-full bg-wine text-nude-warm text-center rounded-md py-3 font-medium cursor-pointer">
          {busy ? "Processando..." : blob ? "Foto adicionada — trocar?" : "Tirar / escolher foto"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            disabled={busy}
            className="hidden"
          />
        </label>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Ocasião</label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          >
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Avaliação</label>
          <div className="flex gap-2">
            {(["love", "ok", "no"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                className={`flex-1 py-2 rounded-md text-sm ${
                  rating === r ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                }`}
              >
                {r === "love" ? "Amei" : r === "ok" ? "Ok" : "Não rolou"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!blob}
          className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium disabled:opacity-50"
        >
          Salvar look
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Routes + build + commit**

```tsx
import { LooksView } from "./pages/beauty/style/LooksView";
import { LookNew } from "./pages/beauty/style/LookNew";
// ...
{ path: "beleza/estilo/looks", element: <LooksView /> },
{ path: "beleza/estilo/looks/novo", element: <LookNew /> },
```

```bash
npm run build
git add src/components/LookCard.tsx src/pages/beauty/style/LooksView.tsx src/pages/beauty/style/LookNew.tsx src/main.tsx
git commit -m "feat(estilo): looks salvos com foto e avaliação"
```

---

## Task 6: WishlistView

**Files:**
- Create: `src/pages/beauty/style/WishlistView.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: WishlistView (form + lista no mesmo componente)**

`src/pages/beauty/style/WishlistView.tsx`:

```tsx
import { useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type WishlistItem } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";

export function WishlistView() {
  const items = useLiveQuery(() => db.wishlist.toArray(), []);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("top");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await db.wishlist.add({
      name: name.trim(),
      category,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
    } as WishlistItem);
    setName("");
    setUrl("");
    setNotes("");
  }

  async function remove(id?: number) {
    if (id === undefined) return;
    await db.wishlist.delete(id);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <form onSubmit={handleAdd} className="card mb-4 space-y-2">
        <h2 className="text-nude-warm font-medium">Adicionar</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da peça"
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          >
            <option value="top">Top</option>
            <option value="bottom">Calça/Saia</option>
            <option value="dress">Vestido</option>
            <option value="outerwear">Casaco</option>
            <option value="intimate">Íntimo</option>
            <option value="acessorio">Acessório</option>
            <option value="calcado">Calçado</option>
          </select>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="link (opcional)"
            className="bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas (opcional)"
          rows={2}
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
        />
        <button type="submit" className="w-full bg-wine-light text-nude-warm rounded-md py-2 text-sm">
          Salvar
        </button>
      </form>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Minha wishlist</h2>
      <div className="space-y-2">
        {items?.map((it) => (
          <div key={it.id} className="card">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-muted text-xs uppercase tracking-wider">{it.category}</span>
              <button onClick={() => void remove(it.id)} className="text-muted text-xs hover:text-red-300" type="button">
                apagar
              </button>
            </div>
            <h3 className="text-nude-warm font-medium">{it.name}</h3>
            {it.url && (
              <a href={it.url} target="_blank" rel="noreferrer" className="text-nude text-xs underline mt-1 inline-block">
                ver link
              </a>
            )}
            {it.notes && <p className="text-muted text-sm mt-1">{it.notes}</p>}
          </div>
        ))}
        {items?.length === 0 && <p className="text-muted text-sm text-center py-4">Vazio.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Route + commit**

```tsx
import { WishlistView } from "./pages/beauty/style/WishlistView";
// ...
{ path: "beleza/estilo/wishlist", element: <WishlistView /> },
```

```bash
npm run build
git add src/pages/beauty/style/WishlistView.tsx src/main.tsx
git commit -m "feat(estilo): wishlist de peças"
```

---

## Task 7: IntimateView (catálogo íntimo)

**Files:**
- Create: `src/pages/beauty/style/IntimateView.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: IntimateView**

`src/pages/beauty/style/IntimateView.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { GarmentCard } from "../../../components/GarmentCard";

export function IntimateView() {
  const garments = useLiveQuery(
    () => db.garments.where("category").equals("intimate").toArray(),
    [],
  );

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <div className="card mb-3 !bg-wine/20 !border-wine-light">
        <p className="text-nude-warm text-sm">
          Catálogo de peças íntimas e sensuais — alinhadas com a paleta amazona (vinho, preto, nude quente).
          Cada peça tem explicação do efeito visual e como usar.
        </p>
      </div>

      <div className="space-y-2">
        {garments?.map((g) => <GarmentCard key={g.id} garment={g} />)}
        {garments?.length === 0 && (
          <p className="text-muted text-sm text-center py-4">Catálogo carregando…</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Route + commit**

```tsx
import { IntimateView } from "./pages/beauty/style/IntimateView";
// ...
{ path: "beleza/estilo/intimo", element: <IntimateView /> },
```

```bash
npm run build
git add src/pages/beauty/style/IntimateView.tsx src/main.tsx
git commit -m "feat(estilo): catálogo íntimo/sensual"
```

---

## Task 8: README + push final

- [ ] **Step 1: Update README**

`README.md` Status:

```markdown
## Status

- **Onda 1:** ✅ Concluída — fundação, libs, Corpo, Treino, Hoje, Notif, Settings
- **Onda 2 Parte 1:** ✅ Concluída — Beleza Pele & cabelo
- **Onda 2 Parte 2:** ✅ Concluída — Beleza Estilo (paleta + peças + looks + wishlist + íntimo)
- **Onda 2 Parte 3 (próximo):** Trilha (alimentação + marcos + diário)
- **Onda 3:** dança/movimento profundo
- **Onda 4:** polimento + maquiagem
```

- [ ] **Step 2: Final tests + build + commit + push**

```bash
npm run test
npm run build
git add README.md docs/superpowers/plans/2026-05-26-onda-2-parte-2-estilo.md
git commit -m "docs: README — Onda 2 Parte 2 concluída"
git push origin main
```

## Report

Status, test count, build clean, commit SHA, push success, total commits.
