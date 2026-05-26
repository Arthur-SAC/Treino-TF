# Trein-Final — Onda 1 Parte 1: Fundação + Aba Corpo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a fundação técnica do PWA Trein-Final (Vite + React + TypeScript + Tailwind + Dexie + PWA) com tema amazona, ícones lineares finos, layout shell navegável (5 abas), libs utilitárias testadas, e a aba Corpo 100% funcional com onboarding inicial que importa as fotos/medidas existentes da usuária.

**Architecture:** PWA mobile-first, offline-first (IndexedDB via Dexie), zero servidor. Casca completa com 5 abas; nesta parte, Corpo tem profundidade total; Treino/Hoje/Beleza/Trilha são placeholders calmos. TDD para todas as libs utilitárias (progressão, WHR, compressão, backup). UI testada por smoke tests.

**Tech Stack:** Vite + React 18 + TypeScript + Tailwind CSS + Dexie.js + dexie-react-hooks + React Router 6 + vite-plugin-pwa (Workbox) + Vitest + @testing-library/react + happy-dom

**Spec:** [`docs/superpowers/specs/2026-05-26-app-transicao-design.md`](../specs/2026-05-26-app-transicao-design.md)

---

## File Structure

Cada arquivo tem uma única responsabilidade clara. Estrutura projetada para crescer nos planos seguintes sem reorganização:

```
trein-final/
├── package.json                       # deps + scripts
├── pnpm-lock.yaml                     # lockfile (ou package-lock.json se usar npm)
├── vite.config.ts                     # build, PWA plugin, base path
├── tsconfig.json                      # TS config
├── tsconfig.node.json                 # TS config pra arquivos de build
├── tailwind.config.ts                 # tema amazona
├── postcss.config.js                  # tailwind + autoprefixer
├── index.html                         # entry HTML
├── README.md                          # quick start
├── .gitignore
├── public/
│   ├── manifest.webmanifest           # PWA manifest
│   └── icons/
│       ├── icon-192.png               # placeholder gerado
│       ├── icon-512.png               # placeholder gerado
│       └── maskable-icon.png          # placeholder gerado
├── src/
│   ├── main.tsx                       # bootstrap React + registra SW
│   ├── App.tsx                        # shell: BottomNav + Outlet do router
│   ├── index.css                      # tailwind directives + globals
│   ├── lib/
│   │   ├── db.ts                      # Dexie schema (todos os stores)
│   │   ├── progression.ts             # cálculo de progressão de carga (lógica pura)
│   │   ├── waist-hip-ratio.ts         # cálculo WHR + classificação
│   │   ├── image-compress.ts          # comprime BLOB de imagem
│   │   ├── backup.ts                  # export/import AES-256
│   │   └── format.ts                  # formatação de números/datas
│   ├── icons/
│   │   ├── HomeIcon.tsx               # SVG inline linear fino
│   │   ├── DumbbellIcon.tsx
│   │   ├── RulerIcon.tsx
│   │   ├── HeartIcon.tsx
│   │   └── RoseIcon.tsx
│   ├── components/
│   │   ├── BottomNav.tsx              # navegação inferior 5 abas
│   │   ├── Card.tsx                   # container reutilizável
│   │   ├── EmptyState.tsx             # "em breve" placeholder
│   │   ├── PageHeader.tsx             # título de tela + voltar
│   │   ├── PhotoUpload.tsx            # tirar/importar foto + comprimir
│   │   ├── PhotoComparator.tsx        # comparação lado a lado
│   │   └── MeasurementForm.tsx        # form de medidas
│   ├── pages/
│   │   ├── Today.tsx                  # placeholder calmo
│   │   ├── workout/
│   │   │   └── WorkoutHome.tsx        # placeholder calmo
│   │   ├── body/
│   │   │   ├── BodyHome.tsx           # menu da aba
│   │   │   ├── Measurements.tsx       # form + lista
│   │   │   ├── Photos.tsx             # upload + galeria
│   │   │   ├── Comparison.tsx         # comparação visual
│   │   │   └── Onboarding.tsx         # wizard inicial
│   │   ├── Beauty.tsx                 # placeholder calmo
│   │   ├── Path.tsx                   # placeholder calmo
│   │   └── Settings.tsx               # placeholder (será expandido na parte 2)
│   └── data/
│       └── seed-photos.json           # metadata pra importar as fotos da pasta /eu e /objetivo
└── tests/
    ├── setup.ts                       # config global de testes
    └── lib/
        ├── progression.test.ts
        ├── waist-hip-ratio.test.ts
        ├── backup.test.ts
        └── format.test.ts
```

---

## Fase A — Setup do projeto

### Task 1: Inicializar repositório Git + projeto Vite

**Files:**
- Create: `C:/Users/ASCalderon/Desktop/Trein-Final/.gitignore`
- Create: `C:/Users/ASCalderon/Desktop/Trein-Final/package.json` (via Vite scaffold)
- Create: outros arquivos do Vite scaffold (`vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`)

- [ ] **Step 1: Inicializar Git no diretório do projeto**

```bash
cd "C:/Users/ASCalderon/Desktop/Trein-Final"
git init
git branch -M main
```

- [ ] **Step 2: Adicionar .gitignore antes de qualquer scaffold**

Crie `C:/Users/ASCalderon/Desktop/Trein-Final/.gitignore`:

```gitignore
node_modules/
dist/
dist-ssr/
.DS_Store
*.local
.env
.env.local
.env.*.local
.vite/
.cache/
coverage/
.idea/
.vscode/*
!.vscode/extensions.json
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.superpowers/
```

- [ ] **Step 3: Scaffold do Vite com React + TS**

Como já existem pastas `eu/`, `objetivo/`, `docs/` e `.superpowers/` na raiz, scaffolduamos num subdiretório temporário e copiamos:

```bash
cd "C:/Users/ASCalderon/Desktop"
npm create vite@latest trein-final-scaffold -- --template react-ts
# Aceitar defaults
cd trein-final-scaffold
# Copiar arquivos pro projeto principal sem sobrescrever as pastas existentes
cp -r ./* "../Trein-Final/" 2>/dev/null || true
cp -r ./.* "../Trein-Final/" 2>/dev/null || true
cd ..
rm -rf trein-final-scaffold
```

Verifique que `C:/Users/ASCalderon/Desktop/Trein-Final/` agora contém `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, e `src/` ao lado das pastas existentes (`eu/`, `objetivo/`, `docs/`, etc.).

- [ ] **Step 4: Ajustar `package.json` com nome e scripts**

Edite `package.json` pra:

```json
{
  "name": "trein-final",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.3.4"
  }
}
```

- [ ] **Step 5: Instalar deps e rodar `dev` pra validar**

```bash
cd "C:/Users/ASCalderon/Desktop/Trein-Final"
npm install
npm run dev
```

Esperado: servidor em `http://localhost:5173` mostra "Vite + React" boilerplate. Mate o processo com Ctrl+C depois de validar.

- [ ] **Step 6: Commit**

```bash
cd "C:/Users/ASCalderon/Desktop/Trein-Final"
git add .gitignore package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts index.html src/ public/
git commit -m "chore: scaffold Vite + React + TypeScript"
```

---

### Task 2: Instalar e configurar Tailwind CSS com tema amazona

**Files:**
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Modify: `src/index.css` (substituir conteúdo)
- Delete: `src/App.css` (não vamos usar — Tailwind cobre)

- [ ] **Step 1: Instalar Tailwind, PostCSS e autoprefixer**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 2: Configurar `tailwind.config.ts` com a paleta amazona**

Substitua `tailwind.config.js` por `tailwind.config.ts`:

```bash
rm tailwind.config.js
```

Crie `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#1a0a0e",
          raised: "#2a1419",
          deep: "#0a0506",
          border: "#4a2935",
        },
        wine: {
          DEFAULT: "#5c1a2b",
          light: "#8b3a4a",
        },
        nude: {
          DEFAULT: "#d4a373",
          light: "#e8b9a6",
          warm: "#f4e4d6",
        },
        muted: "#a87a6a",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      borderRadius: {
        card: "16px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 3: Configurar `src/index.css`**

Substitua TODO o conteúdo de `src/index.css` por:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root {
    @apply h-full bg-bg-base text-nude-warm;
    font-family: system-ui, -apple-system, sans-serif;
  }
  body {
    @apply m-0 antialiased;
  }
  button {
    -webkit-tap-highlight-color: transparent;
  }
}

@layer components {
  .card {
    @apply bg-bg-raised border border-bg-border rounded-card p-4;
  }
}
```

- [ ] **Step 4: Limpar `src/App.css` e `src/App.tsx` placeholder**

```bash
rm src/App.css
```

Substitua TODO o conteúdo de `src/App.tsx` por:

```tsx
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-sm w-[90%] text-center">
        <h1 className="text-2xl font-serif text-nude mb-2">Trein-Final</h1>
        <p className="text-muted text-sm">Tema amazona funcionando.</p>
      </div>
    </div>
  );
}

export default App;
```

E em `src/main.tsx` remova o import do `App.css` se existir (mantém só `./index.css`).

- [ ] **Step 5: Validar visual**

```bash
npm run dev
```

Esperado: fundo vinho profundo `#1a0a0e`, card vinho mais claro com borda, título "Trein-Final" em dourado, texto secundário em nude desaturado. Mate o processo.

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.ts postcss.config.js src/index.css src/App.tsx src/main.tsx package.json package-lock.json
git rm -f src/App.css
git commit -m "feat(theme): aplicar paleta amazona via Tailwind"
```

---

### Task 3: Setup Vitest com happy-dom + Testing Library

**Files:**
- Create: `tests/setup.ts`
- Modify: `vite.config.ts`
- Modify: `package.json` (dev deps)

- [ ] **Step 1: Instalar deps de teste**

```bash
npm install -D vitest @vitest/ui happy-dom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Configurar `vite.config.ts` com testes**

Substitua TODO o conteúdo de `vite.config.ts` por:

```typescript
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
    css: false,
  },
});
```

- [ ] **Step 3: Criar `tests/setup.ts`**

```typescript
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 4: Adicionar tipo global em `tsconfig.json`**

Edite `tsconfig.json` adicionando `"types": ["vitest/globals", "@testing-library/jest-dom"]` ao `compilerOptions`.

Se o arquivo já tem `compilerOptions`, adicione apenas a linha; o restante das opções fica como estava.

- [ ] **Step 5: Smoke test inicial**

Crie `tests/sanity.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("vitest funciona", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Rode:

```bash
npm run test
```

Esperado: 1 teste passa.

- [ ] **Step 6: Commit**

```bash
git add tests/setup.ts tests/sanity.test.ts vite.config.ts tsconfig.json package.json package-lock.json
git commit -m "chore: configurar Vitest + Testing Library + happy-dom"
```

---

## Fase B — Libs utilitárias com TDD

### Task 4: Lib `progression.ts` — cálculo de progressão de carga

**Files:**
- Create: `tests/lib/progression.test.ts`
- Create: `src/lib/progression.ts`

**Regra de negócio (extraída do spec, seção 4):**
- Marcador "fácil" e completou todas as reps → +1kg (ou +0,5kg se carga < 5kg)
- Marcador "médio" e completou → mantém a carga
- Marcador "difícil" e completou → mantém a carga
- Falhou (não completou todas as reps em todas as séries) → -1kg (mínimo 0)

- [ ] **Step 1: Escrever testes que falham**

Crie `tests/lib/progression.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { suggestNextLoad, type SessionFeedback } from "../../src/lib/progression";

describe("suggestNextLoad", () => {
  it("sobe 1kg quando fácil e completou", () => {
    const next = suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: true });
    expect(next).toBe(11);
  });

  it("sobe 0.5kg quando fácil e completou com carga baixa (<5kg)", () => {
    const next = suggestNextLoad({ lastLoad: 4, feedback: "easy", completedAllReps: true });
    expect(next).toBe(4.5);
  });

  it("mantém quando médio e completou", () => {
    const next = suggestNextLoad({ lastLoad: 10, feedback: "medium", completedAllReps: true });
    expect(next).toBe(10);
  });

  it("mantém quando difícil e completou", () => {
    const next = suggestNextLoad({ lastLoad: 10, feedback: "hard", completedAllReps: true });
    expect(next).toBe(10);
  });

  it("desce 1kg quando não completou", () => {
    const next = suggestNextLoad({ lastLoad: 10, feedback: "hard", completedAllReps: false });
    expect(next).toBe(9);
  });

  it("nunca desce abaixo de 0", () => {
    const next = suggestNextLoad({ lastLoad: 0.5, feedback: "hard", completedAllReps: false });
    expect(next).toBe(0);
  });

  it("aceita feedback 'easy' mesmo sem completar e não sobe (regra de segurança)", () => {
    // se marcou "fácil" mas não completou, prevalece o não-completar -> desce
    const next = suggestNextLoad({ lastLoad: 10, feedback: "easy", completedAllReps: false });
    expect(next).toBe(9);
  });
});
```

- [ ] **Step 2: Rodar — deve falhar**

```bash
npm run test -- progression
```

Esperado: falha com "Cannot find module '../../src/lib/progression'".

- [ ] **Step 3: Implementação mínima**

Crie `src/lib/progression.ts`:

```typescript
export type SessionFeedback = "easy" | "medium" | "hard";

export interface ProgressionInput {
  lastLoad: number;
  feedback: SessionFeedback;
  completedAllReps: boolean;
}

export function suggestNextLoad({ lastLoad, feedback, completedAllReps }: ProgressionInput): number {
  if (!completedAllReps) {
    return Math.max(0, lastLoad - 1);
  }
  if (feedback === "easy") {
    const increment = lastLoad < 5 ? 0.5 : 1;
    return lastLoad + increment;
  }
  return lastLoad;
}
```

- [ ] **Step 4: Rodar — deve passar**

```bash
npm run test -- progression
```

Esperado: 7 testes passam.

- [ ] **Step 5: Commit**

```bash
git add tests/lib/progression.test.ts src/lib/progression.ts
git commit -m "feat(lib): progressão automática de carga"
```

---

### Task 5: Lib `waist-hip-ratio.ts` — relação cintura/quadril

**Files:**
- Create: `tests/lib/waist-hip-ratio.test.ts`
- Create: `src/lib/waist-hip-ratio.ts`

**Regra (do spec, seção 4):**
- WHR = cintura / quadril
- Classificação: < 0,72 = "ampulheta forte"; 0,72-0,79 = "ampulheta moderada"; 0,80-0,89 = "transição"; ≥ 0,90 = "perfil masculino"
- Alvo da usuária: 0,68

- [ ] **Step 1: Testes que falham**

Crie `tests/lib/waist-hip-ratio.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { calculateWhr, classifyWhr, type WhrCategory } from "../../src/lib/waist-hip-ratio";

describe("calculateWhr", () => {
  it("retorna razão correta", () => {
    expect(calculateWhr(80, 120)).toBeCloseTo(0.6667, 3);
  });

  it("arredonda para 4 casas", () => {
    expect(calculateWhr(99, 114)).toBeCloseTo(0.8684, 3);
  });

  it("retorna 0 se quadril for 0", () => {
    expect(calculateWhr(80, 0)).toBe(0);
  });
});

describe("classifyWhr", () => {
  it.each<[number, WhrCategory]>([
    [0.65, "ampulheta-forte"],
    [0.71, "ampulheta-forte"],
    [0.72, "ampulheta-moderada"],
    [0.79, "ampulheta-moderada"],
    [0.80, "transicao"],
    [0.89, "transicao"],
    [0.90, "perfil-masculino"],
    [1.0, "perfil-masculino"],
  ])("classifica %f como %s", (ratio, expected) => {
    expect(classifyWhr(ratio)).toBe(expected);
  });
});
```

- [ ] **Step 2: Rodar — deve falhar**

```bash
npm run test -- waist-hip-ratio
```

Esperado: falha "Cannot find module".

- [ ] **Step 3: Implementação**

Crie `src/lib/waist-hip-ratio.ts`:

```typescript
export type WhrCategory =
  | "ampulheta-forte"
  | "ampulheta-moderada"
  | "transicao"
  | "perfil-masculino";

export function calculateWhr(waistCm: number, hipCm: number): number {
  if (hipCm <= 0) return 0;
  return waistCm / hipCm;
}

export function classifyWhr(ratio: number): WhrCategory {
  if (ratio < 0.72) return "ampulheta-forte";
  if (ratio < 0.80) return "ampulheta-moderada";
  if (ratio < 0.90) return "transicao";
  return "perfil-masculino";
}
```

- [ ] **Step 4: Rodar — deve passar**

```bash
npm run test -- waist-hip-ratio
```

Esperado: 11 testes passam.

- [ ] **Step 5: Commit**

```bash
git add tests/lib/waist-hip-ratio.test.ts src/lib/waist-hip-ratio.ts
git commit -m "feat(lib): cálculo e classificação de WHR"
```

---

### Task 6: Lib `format.ts` — formatação de números e datas

**Files:**
- Create: `tests/lib/format.test.ts`
- Create: `src/lib/format.ts`

- [ ] **Step 1: Testes que falham**

Crie `tests/lib/format.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { formatCm, formatKg, formatDateBR, formatRelativeDays } from "../../src/lib/format";

describe("formatCm", () => {
  it("formata com 1 casa decimal e sufixo cm", () => {
    expect(formatCm(99)).toBe("99,0 cm");
    expect(formatCm(99.5)).toBe("99,5 cm");
    expect(formatCm(99.55)).toBe("99,6 cm");
  });
});

describe("formatKg", () => {
  it("formata sem decimal se inteiro", () => {
    expect(formatKg(10)).toBe("10 kg");
  });
  it("formata com 1 decimal se fracionário", () => {
    expect(formatKg(10.5)).toBe("10,5 kg");
  });
});

describe("formatDateBR", () => {
  it("formata data ISO em dd/mm/yyyy", () => {
    expect(formatDateBR(new Date("2026-05-26T12:00:00Z"))).toBe("26/05/2026");
  });
});

describe("formatRelativeDays", () => {
  it("retorna 'hoje' pra 0 dias", () => {
    expect(formatRelativeDays(0)).toBe("hoje");
  });
  it("retorna 'ontem' pra 1 dia atrás", () => {
    expect(formatRelativeDays(1)).toBe("ontem");
  });
  it("retorna 'há X dias' pra mais", () => {
    expect(formatRelativeDays(5)).toBe("há 5 dias");
  });
  it("retorna 'em X dias' pra futuro", () => {
    expect(formatRelativeDays(-3)).toBe("em 3 dias");
  });
});
```

- [ ] **Step 2: Rodar — deve falhar**

```bash
npm run test -- format
```

- [ ] **Step 3: Implementação**

Crie `src/lib/format.ts`:

```typescript
export function formatCm(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " cm";
}

export function formatKg(value: number): string {
  const isInteger = Number.isInteger(value);
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: isInteger ? 0 : 1,
    maximumFractionDigits: 1,
  }) + " kg";
}

export function formatDateBR(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatRelativeDays(days: number): string {
  if (days === 0) return "hoje";
  if (days === 1) return "ontem";
  if (days > 0) return `há ${days} dias`;
  return `em ${Math.abs(days)} dias`;
}
```

- [ ] **Step 4: Rodar — deve passar**

```bash
npm run test -- format
```

- [ ] **Step 5: Commit**

```bash
git add tests/lib/format.test.ts src/lib/format.ts
git commit -m "feat(lib): helpers de formatação"
```

---

### Task 7: Lib `image-compress.ts` — comprime foto antes de salvar

**Files:**
- Create: `src/lib/image-compress.ts`
- (Sem teste unitário automático — usa Canvas API do navegador; será coberto por smoke test na Photos.tsx)

- [ ] **Step 1: Implementação**

Crie `src/lib/image-compress.ts`:

```typescript
export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0..1
  type?: "image/jpeg" | "image/webp";
}

const DEFAULTS: Required<CompressOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.82,
  type: "image/webp",
};

export async function compressImage(file: File | Blob, opts: CompressOptions = {}): Promise<Blob> {
  const cfg = { ...DEFAULTS, ...opts };
  const bitmap = await createImageBitmap(file);
  const { width: srcW, height: srcH } = bitmap;
  const ratio = Math.min(cfg.maxWidth / srcW, cfg.maxHeight / srcH, 1);
  const w = Math.round(srcW * ratio);
  const h = Math.round(srcH * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D não disponível");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar blob"))),
      cfg.type,
      cfg.quality,
    );
  });
}

export function blobToObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeObjectUrl(url: string): void {
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Validar compilação**

```bash
npm run build
```

Esperado: build passa sem erros de TS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/image-compress.ts
git commit -m "feat(lib): compressão de imagem via Canvas"
```

---

### Task 8: Lib `backup.ts` — export/import AES-256

**Files:**
- Create: `tests/lib/backup.test.ts`
- Create: `src/lib/backup.ts`

Usa Web Crypto API (nativa no navegador).

- [ ] **Step 1: Testes que falham**

Crie `tests/lib/backup.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { encryptBackup, decryptBackup } from "../../src/lib/backup";

describe("encrypt/decrypt backup", () => {
  it("round-trip preserva dados", async () => {
    const payload = { hello: "mundo", n: 42, list: [1, 2, 3] };
    const password = "minha-senha-secreta";
    const encrypted = await encryptBackup(payload, password);
    expect(encrypted).toBeTypeOf("string");
    expect(encrypted.length).toBeGreaterThan(20);
    const decrypted = await decryptBackup<typeof payload>(encrypted, password);
    expect(decrypted).toEqual(payload);
  });

  it("senha errada falha decifrar", async () => {
    const encrypted = await encryptBackup({ x: 1 }, "senha-certa");
    await expect(decryptBackup(encrypted, "senha-errada")).rejects.toThrow();
  });

  it("payload corrompido falha", async () => {
    await expect(decryptBackup("conteudo-nao-base64-valido!!!", "qq")).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Rodar — deve falhar**

```bash
npm run test -- backup
```

- [ ] **Step 3: Implementação**

Crie `src/lib/backup.ts`:

```typescript
// AES-GCM com chave derivada por PBKDF2(SHA-256, 250k iterações).
// Formato do output: base64( salt(16) || iv(12) || ciphertext )

const ITERATIONS = 250_000;
const SALT_LEN = 16;
const IV_LEN = 12;

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encryptBackup(payload: unknown, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveKey(password, salt);
  const data = new TextEncoder().encode(JSON.stringify(payload));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data),
  );
  const buf = new Uint8Array(salt.length + iv.length + cipher.length);
  buf.set(salt, 0);
  buf.set(iv, salt.length);
  buf.set(cipher, salt.length + iv.length);
  return bytesToBase64(buf);
}

export async function decryptBackup<T = unknown>(encoded: string, password: string): Promise<T> {
  const buf = base64ToBytes(encoded);
  if (buf.length < SALT_LEN + IV_LEN + 1) throw new Error("Backup inválido");
  const salt = buf.slice(0, SALT_LEN);
  const iv = buf.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const cipher = buf.slice(SALT_LEN + IV_LEN);
  const key = await deriveKey(password, salt);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}
```

- [ ] **Step 4: Rodar — deve passar**

```bash
npm run test -- backup
```

Esperado: 3 testes passam.

- [ ] **Step 5: Commit**

```bash
git add tests/lib/backup.test.ts src/lib/backup.ts
git commit -m "feat(lib): backup criptografado AES-256"
```

---

## Fase C — Persistência (Dexie)

### Task 9: Setup do Dexie com todos os stores (esquema completo)

**Files:**
- Create: `src/lib/db.ts`

Inclui TODOS os stores do spec (mesmo os que serão preenchidos na parte 2/Onda 2). Schema versão 1.

- [ ] **Step 1: Instalar Dexie**

```bash
npm install dexie dexie-react-hooks
```

- [ ] **Step 2: Criar `src/lib/db.ts`**

```typescript
import Dexie, { Table } from "dexie";

export interface Measurement {
  id?: number;
  date: string; // ISO yyyy-mm-dd
  neckCm?: number;
  shouldersCm?: number;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
  thighLeftCm?: number;
  thighRightCm?: number;
  armCm?: number;
  forearmCm?: number;
  calfCm?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id?: number;
  date: string; // ISO yyyy-mm-dd
  blob: Blob;
  tag: "front" | "side" | "back" | "custom";
  bodyPart?: string;
  category: "self" | "goal";
  notes?: string;
}

export interface Exercise {
  id: string; // slug
  name: string;
  category: string;
  equipment: string[];
  difficulty: "iniciante" | "intermediario" | "avancado";
  videoUrl?: string;
  gifPath?: string;
  description: string;
  commonMistakes: string[];
  easierVariation?: string;
  harderVariation?: string;
  exposureLevel: 1 | 2 | 3 | 4 | 5;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  dayOfWeek: number; // 0=domingo..6=sábado, -1 = livre
  exercises: Array<{
    exerciseId: string;
    sets: number;
    repsTarget: string; // "10-12" ou "30s"
    restSec: number;
    notes?: string;
  }>;
  durationMin: number;
}

export interface WorkoutSession {
  id?: number;
  date: string;
  templateId?: string;
  exercises: Array<{
    exerciseId: string;
    sets: Array<{ reps: number; weight: number; rpe?: number }>;
    notes?: string;
  }>;
  durationMin?: number;
  difficultySelf?: "easy" | "medium" | "hard";
}

export interface Meal {
  id?: number;
  date: string;
  mealType: "cafe" | "almoco" | "lanche" | "jantar";
  foods: Array<{ name: string; qtyG: number; kcal: number; proteinG?: number; carbG?: number; fatG?: number }>;
  notes?: string;
  checked: boolean;
}

export interface MealPlan {
  id?: number;
  name: string;
  kcalDaily: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  defaultMeals: Meal["foods"][];
}

export interface SkincareRoutine {
  id?: number;
  name: string;
  time: "morning" | "evening";
  target: "face" | "back" | "armpit" | "intimate" | "general";
  steps: Array<{ productName: string; technique: string; waitMin: number }>;
}

export interface SkincareLog {
  id?: number;
  date: string;
  routineId: number;
  completed: boolean;
}

export interface HaircareEntry {
  id?: number;
  date: string;
  type: "hidratacao" | "nutricao" | "reconstrucao";
  products: string[];
  completed: boolean;
}

export interface Product {
  id?: number;
  name: string;
  category: "skincare" | "haircare" | "supplements";
  boughtAt?: string;
  endDate?: string;
  notes?: string;
}

export interface StylePalette {
  id?: number;
  subtone: "warm" | "cool" | "neutral";
  contrast: "low" | "medium" | "high";
  favorableColors: string[];
  unfavorableColors: string[];
  reanalyzed: boolean;
}

export interface Garment {
  id: string; // slug
  name: string;
  category: "top" | "bottom" | "dress" | "outerwear" | "intimate";
  occasion: string[];
  whyItWorks: string;
  cautions?: string;
  imagePath?: string;
}

export interface Look {
  id?: number;
  date: string;
  blob: Blob;
  occasion: string;
  rating: "love" | "ok" | "no";
  notes?: string;
}

export interface WishlistItem {
  id?: number;
  name: string;
  category: string;
  url?: string;
  imagePath?: string;
  notes?: string;
}

export interface Milestone {
  id?: number;
  datePlanned: string;
  dateCompleted?: string;
  title: string;
  category: "medico" | "fisico" | "social" | "fertilidade";
  notes?: string;
}

export interface DailyLog {
  date: string; // primary key
  mood?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  activeBreakCount: number;
  waterMl: number;
}

export interface Setting {
  key: string;
  value: unknown;
}

export class TreinFinalDB extends Dexie {
  measurements!: Table<Measurement, number>;
  photos!: Table<ProgressPhoto, number>;
  exercises!: Table<Exercise, string>;
  workoutTemplates!: Table<WorkoutTemplate, string>;
  workoutSessions!: Table<WorkoutSession, number>;
  meals!: Table<Meal, number>;
  mealPlans!: Table<MealPlan, number>;
  skincareRoutines!: Table<SkincareRoutine, number>;
  skincareLogs!: Table<SkincareLog, number>;
  haircare!: Table<HaircareEntry, number>;
  products!: Table<Product, number>;
  stylePalette!: Table<StylePalette, number>;
  garments!: Table<Garment, string>;
  looks!: Table<Look, number>;
  wishlist!: Table<WishlistItem, number>;
  milestones!: Table<Milestone, number>;
  dailyLog!: Table<DailyLog, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super("trein-final");
    this.version(1).stores({
      measurements: "++id, date",
      photos: "++id, date, category, tag, [category+tag]",
      exercises: "id, category, exposureLevel",
      workoutTemplates: "id, dayOfWeek",
      workoutSessions: "++id, date, templateId",
      meals: "++id, date, mealType",
      mealPlans: "++id",
      skincareRoutines: "++id, time, target",
      skincareLogs: "++id, date, routineId",
      haircare: "++id, date",
      products: "++id, category",
      stylePalette: "++id",
      garments: "id, category",
      looks: "++id, date, occasion",
      wishlist: "++id, category",
      milestones: "++id, datePlanned, category",
      dailyLog: "date",
      settings: "key",
    });
  }
}

export const db = new TreinFinalDB();
```

- [ ] **Step 3: Validar compilação**

```bash
npm run build
```

Esperado: build passa.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db.ts package.json package-lock.json
git commit -m "feat(db): schema completo do IndexedDB via Dexie"
```

---

## Fase D — Ícones e shell

### Task 10: Ícones lineares finos (5 abas)

**Files:**
- Create: `src/icons/HomeIcon.tsx`
- Create: `src/icons/DumbbellIcon.tsx`
- Create: `src/icons/RulerIcon.tsx`
- Create: `src/icons/HeartIcon.tsx`
- Create: `src/icons/RoseIcon.tsx`

Todos seguem o mesmo padrão: SVG inline, `stroke-width: 1.2`, `stroke="currentColor"`, sem fill.

- [ ] **Step 1: Criar componente base de ícone**

Cada arquivo segue o template abaixo. Faça os 5 num lote.

`src/icons/HomeIcon.tsx`:

```tsx
import type { SVGProps } from "react";

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12 L12 3 L21 12" />
      <path d="M5 10 V20 H19 V10" />
    </svg>
  );
}
```

`src/icons/DumbbellIcon.tsx`:

```tsx
import type { SVGProps } from "react";

export function DumbbellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="12" r="3" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  );
}
```

`src/icons/RulerIcon.tsx`:

```tsx
import type { SVGProps } from "react";

export function RulerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="9" width="18" height="6" rx="1" />
      <line x1="7" y1="9" x2="7" y2="11" />
      <line x1="11" y1="9" x2="11" y2="13" />
      <line x1="15" y1="9" x2="15" y2="11" />
      <line x1="19" y1="9" x2="19" y2="13" />
    </svg>
  );
}
```

`src/icons/HeartIcon.tsx`:

```tsx
import type { SVGProps } from "react";

export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11z" />
    </svg>
  );
}
```

`src/icons/RoseIcon.tsx`:

```tsx
import type { SVGProps } from "react";

export function RoseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 21 L6 12" />
      <path d="M6 12 C6 6, 10 4, 12 8 C14 4, 18 6, 18 12" />
      <circle cx="12" cy="10" r="1.5" />
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/icons/
git commit -m "feat(icons): ícones lineares finos das 5 abas"
```

---

### Task 11: Componente `BottomNav` + roteamento

**Files:**
- Create: `src/components/BottomNav.tsx`
- Create: `src/pages/Today.tsx` (placeholder)
- Create: `src/pages/workout/WorkoutHome.tsx` (placeholder)
- Create: `src/pages/body/BodyHome.tsx` (placeholder mínimo)
- Create: `src/pages/Beauty.tsx` (placeholder)
- Create: `src/pages/Path.tsx` (placeholder)
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Instalar React Router**

```bash
npm install react-router-dom
```

- [ ] **Step 2: Criar componente `EmptyState`**

`src/components/EmptyState.tsx`:

```tsx
interface Props {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: Props) {
  return (
    <div className="card text-center py-12 px-6">
      <h2 className="font-serif text-nude text-xl mb-2">{title}</h2>
      {description && <p className="text-muted text-sm">{description}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Criar páginas placeholder**

`src/pages/Today.tsx`:

```tsx
import { EmptyState } from "../components/EmptyState";

export function Today() {
  return (
    <div className="p-4 pb-24">
      <EmptyState title="Hoje" description="Dashboard chega na próxima parte. Por enquanto, vai em Corpo pra registrar suas medidas e fotos." />
    </div>
  );
}
```

`src/pages/workout/WorkoutHome.tsx`:

```tsx
import { EmptyState } from "../../components/EmptyState";

export function WorkoutHome() {
  return (
    <div className="p-4 pb-24">
      <EmptyState title="Treino" description="Plano completo chega na próxima parte." />
    </div>
  );
}
```

`src/pages/body/BodyHome.tsx` (mínimo — Tasks 13+ aprofundam):

```tsx
import { Link } from "react-router-dom";

export function BodyHome() {
  return (
    <div className="p-4 pb-24 space-y-3">
      <h1 className="font-serif text-2xl text-nude mb-2">Corpo</h1>
      <Link to="/corpo/medidas" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Medidas</h3>
        <p className="text-muted text-sm mt-1">Registrar e ver evolução</p>
      </Link>
      <Link to="/corpo/fotos" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Fotos</h3>
        <p className="text-muted text-sm mt-1">Progresso por imagem</p>
      </Link>
      <Link to="/corpo/comparacao" className="card block hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Comparação</h3>
        <p className="text-muted text-sm mt-1">Atual × objetivo × antiga</p>
      </Link>
    </div>
  );
}
```

`src/pages/Beauty.tsx`:

```tsx
import { EmptyState } from "../components/EmptyState";

export function Beauty() {
  return (
    <div className="p-4 pb-24">
      <EmptyState title="Beleza" description="Skincare, hair e estilo chegam na Onda 2." />
    </div>
  );
}
```

`src/pages/Path.tsx`:

```tsx
import { EmptyState } from "../components/EmptyState";

export function Path() {
  return (
    <div className="p-4 pb-24">
      <EmptyState title="Trilha" description="Marcos da transição e alimentação chegam na Onda 2." />
    </div>
  );
}
```

- [ ] **Step 4: Criar `BottomNav`**

`src/components/BottomNav.tsx`:

```tsx
import { NavLink } from "react-router-dom";
import { HomeIcon } from "../icons/HomeIcon";
import { DumbbellIcon } from "../icons/DumbbellIcon";
import { RulerIcon } from "../icons/RulerIcon";
import { HeartIcon } from "../icons/HeartIcon";
import { RoseIcon } from "../icons/RoseIcon";

const items = [
  { to: "/", label: "Hoje", Icon: HomeIcon, end: true },
  { to: "/treino", label: "Treino", Icon: DumbbellIcon },
  { to: "/corpo", label: "Corpo", Icon: RulerIcon },
  { to: "/beleza", label: "Beleza", Icon: HeartIcon },
  { to: "/trilha", label: "Trilha", Icon: RoseIcon },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-bg-deep border-t border-bg-border z-50">
      <ul className="flex">
        {items.map(({ to, label, Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-[0.7rem] ${
                  isActive ? "text-nude" : "text-muted"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={isActive ? "text-nude" : "text-muted"} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 5: Configurar router em `main.tsx`**

Substitua TODO `src/main.tsx` por:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { Today } from "./pages/Today";
import { WorkoutHome } from "./pages/workout/WorkoutHome";
import { BodyHome } from "./pages/body/BodyHome";
import { Beauty } from "./pages/Beauty";
import { Path } from "./pages/Path";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Today /> },
      { path: "treino", element: <WorkoutHome /> },
      { path: "corpo", element: <BodyHome /> },
      { path: "beleza", element: <Beauty /> },
      { path: "trilha", element: <Path /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

- [ ] **Step 6: Atualizar `App.tsx` como shell**

```tsx
import { Outlet } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
```

- [ ] **Step 7: Validar visual**

```bash
npm run dev
```

Esperado: app abre em `localhost:5173`, mostra "Hoje" como página inicial, bottom nav com 5 ícones lineares dourados, navegação entre abas funciona, cada placeholder calmo. Mate o processo depois.

- [ ] **Step 8: Commit**

```bash
git add src/ package.json package-lock.json
git commit -m "feat(shell): BottomNav + roteamento das 5 abas"
```

---

## Fase E — Aba Corpo: medidas e fotos

### Task 12: Tela de Medidas com form + lista

**Files:**
- Create: `src/components/MeasurementForm.tsx`
- Create: `src/pages/body/Measurements.tsx`
- Modify: `src/main.tsx` (registrar rota)

- [ ] **Step 1: Componente form**

`src/components/MeasurementForm.tsx`:

```tsx
import { useState, FormEvent } from "react";
import type { Measurement } from "../lib/db";

type MeasurementInput = Omit<Measurement, "id">;

interface Props {
  initial?: Partial<MeasurementInput>;
  onSubmit: (m: MeasurementInput) => void | Promise<void>;
}

const FIELDS: Array<{ key: keyof Measurement; label: string }> = [
  { key: "neckCm", label: "Pescoço" },
  { key: "shouldersCm", label: "Ombros" },
  { key: "chestCm", label: "Busto" },
  { key: "waistCm", label: "Cintura" },
  { key: "hipCm", label: "Quadril" },
  { key: "thighLeftCm", label: "Coxa esquerda" },
  { key: "thighRightCm", label: "Coxa direita" },
  { key: "armCm", label: "Braço" },
  { key: "forearmCm", label: "Antebraço" },
  { key: "calfCm", label: "Panturrilha" },
];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function validateCm(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const n = Number(value.replace(",", "."));
  if (!Number.isFinite(n) || n < 5 || n > 250) return undefined;
  return n;
}

export function MeasurementForm({ initial, onSubmit }: Props) {
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [values, setValues] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const { key } of FIELDS) {
      const v = initial?.[key];
      out[key] = typeof v === "number" ? String(v).replace(".", ",") : "";
    }
    return out;
  });
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [errors, setErrors] = useState<string[]>([]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const m: MeasurementInput = { date };
    const errs: string[] = [];
    for (const { key, label } of FIELDS) {
      const raw = values[key];
      if (raw.trim() === "") continue;
      const num = validateCm(raw);
      if (num === undefined) {
        errs.push(`${label}: valor inválido (entre 5 e 250 cm)`);
      } else {
        (m as Record<string, unknown>)[key] = num;
      }
    }
    if (notes.trim()) m.notes = notes.trim();
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    void onSubmit(m);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-muted text-xs uppercase tracking-wider mb-1">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">{label}</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={values[key]}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                placeholder="—"
                className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 pr-10 text-nude-warm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs">cm</span>
            </div>
          </div>
        ))}
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-wider mb-1">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
        />
      </div>
      {errors.length > 0 && (
        <ul className="text-red-300 text-sm space-y-1">
          {errors.map((er) => (
            <li key={er}>{er}</li>
          ))}
        </ul>
      )}
      <button
        type="submit"
        className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium hover:bg-wine transition"
      >
        Salvar medida
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Página Measurements**

`src/pages/body/Measurements.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type Measurement } from "../../lib/db";
import { MeasurementForm } from "../../components/MeasurementForm";
import { calculateWhr, classifyWhr } from "../../lib/waist-hip-ratio";
import { formatCm, formatDateBR } from "../../lib/format";

const CATEGORY_LABEL: Record<ReturnType<typeof classifyWhr>, string> = {
  "ampulheta-forte": "Ampulheta forte",
  "ampulheta-moderada": "Ampulheta moderada",
  transicao: "Transição",
  "perfil-masculino": "Perfil masculino",
};

export function Measurements() {
  const items = useLiveQuery(() => db.measurements.orderBy("date").reverse().toArray(), []);

  async function handleSave(m: Omit<Measurement, "id">) {
    await db.measurements.add(m as Measurement);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/corpo" className="text-muted text-sm">&larr; Corpo</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Medidas</h1>
      </div>

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Nova medida</h2>
        <MeasurementForm onSubmit={handleSave} />
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Histórico</h2>
      {!items?.length && (
        <p className="text-muted text-sm py-4 text-center">Sem medidas ainda. Adicione a primeira acima.</p>
      )}
      <div className="space-y-2">
        {items?.map((m) => {
          const whr = m.waistCm && m.hipCm ? calculateWhr(m.waistCm, m.hipCm) : null;
          return (
            <div key={m.id} className="card">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-nude-warm">{formatDateBR(new Date(m.date))}</span>
                {whr !== null && (
                  <span className="text-muted text-xs">WHR {whr.toFixed(2)} · {CATEGORY_LABEL[classifyWhr(whr)]}</span>
                )}
              </div>
              <div className="text-sm text-muted grid grid-cols-2 gap-x-3">
                {m.waistCm !== undefined && <span>Cintura: {formatCm(m.waistCm)}</span>}
                {m.hipCm !== undefined && <span>Quadril: {formatCm(m.hipCm)}</span>}
                {m.shouldersCm !== undefined && <span>Ombros: {formatCm(m.shouldersCm)}</span>}
                {m.chestCm !== undefined && <span>Busto: {formatCm(m.chestCm)}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Registrar rota**

Em `src/main.tsx`, adicione import e rota:

```tsx
import { Measurements } from "./pages/body/Measurements";
```

E dentro do `children: [...]`:

```tsx
{ path: "corpo/medidas", element: <Measurements /> },
```

- [ ] **Step 4: Validar**

```bash
npm run dev
```

Esperado: navegar `/corpo` → clicar "Medidas" → adicionar uma medida (digitar cintura 99, quadril 114) → ela aparece na lista com "WHR 0.87 · Transição". Mate o processo.

- [ ] **Step 5: Commit**

```bash
git add src/components/MeasurementForm.tsx src/pages/body/Measurements.tsx src/main.tsx
git commit -m "feat(corpo): tela de medidas com form e histórico"
```

---

### Task 13: Tela de Fotos com upload + galeria

**Files:**
- Create: `src/components/PhotoUpload.tsx`
- Create: `src/pages/body/Photos.tsx`
- Modify: `src/main.tsx` (rota)

- [ ] **Step 1: Componente de upload**

`src/components/PhotoUpload.tsx`:

```tsx
import { ChangeEvent, useState } from "react";
import { compressImage } from "../lib/image-compress";
import type { ProgressPhoto } from "../lib/db";

interface Props {
  onUpload: (photo: Omit<ProgressPhoto, "id">) => void | Promise<void>;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function PhotoUpload({ onUpload }: Props) {
  const [tag, setTag] = useState<ProgressPhoto["tag"]>("front");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      await onUpload({
        date: todayISO(),
        blob: compressed,
        tag,
        category: "self",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao processar imagem");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["front", "side", "back", "custom"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            className={`flex-1 py-2 rounded-md text-sm ${
              tag === t ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
            }`}
          >
            {t === "front" ? "Frente" : t === "side" ? "Lado" : t === "back" ? "Costas" : "Outra"}
          </button>
        ))}
      </div>
      <label className="block w-full bg-wine text-nude-warm text-center rounded-md py-3 font-medium cursor-pointer hover:bg-wine-light transition">
        {busy ? "Processando..." : "Tirar / escolher foto"}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          disabled={busy}
          className="hidden"
        />
      </label>
      {error && <p className="text-red-300 text-sm">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Hook utilitário para URL de Blob**

Crie `src/components/BlobImage.tsx`:

```tsx
import { useEffect, useState } from "react";
import { blobToObjectUrl, revokeObjectUrl } from "../lib/image-compress";

interface Props {
  blob: Blob;
  alt: string;
  className?: string;
}

export function BlobImage({ blob, alt, className }: Props) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    const u = blobToObjectUrl(blob);
    setUrl(u);
    return () => revokeObjectUrl(u);
  }, [blob]);
  if (!url) return null;
  return <img src={url} alt={alt} className={className} loading="lazy" />;
}
```

- [ ] **Step 3: Página Photos**

`src/pages/body/Photos.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type ProgressPhoto } from "../../lib/db";
import { PhotoUpload } from "../../components/PhotoUpload";
import { BlobImage } from "../../components/BlobImage";
import { formatDateBR } from "../../lib/format";

export function Photos() {
  const photos = useLiveQuery(async () => {
    const list = await db.photos.where("category").equals("self").sortBy("date");
    return list.reverse();
  }, []);

  async function handleUpload(p: Omit<ProgressPhoto, "id">) {
    await db.photos.add(p as ProgressPhoto);
  }

  async function handleDelete(id?: number) {
    if (id === undefined) return;
    if (!confirm("Apagar essa foto?")) return;
    await db.photos.delete(id);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/corpo" className="text-muted text-sm">&larr; Corpo</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Fotos</h1>
      </div>

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Nova foto</h2>
        <PhotoUpload onUpload={handleUpload} />
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Galeria</h2>
      {!photos?.length && (
        <p className="text-muted text-sm py-4 text-center">Sem fotos ainda.</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {photos?.map((p) => (
          <div key={p.id} className="card !p-2">
            <BlobImage blob={p.blob} alt={p.tag} className="w-full rounded-md mb-2 aspect-[3/4] object-cover" />
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-nude-warm">{formatDateBR(new Date(p.date))}</span>
              <span className="text-muted">{p.tag}</span>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-muted text-xs hover:text-red-300 mt-1"
              type="button"
            >
              apagar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Registrar rota**

Em `src/main.tsx`:

```tsx
import { Photos } from "./pages/body/Photos";
```

E na lista de children:

```tsx
{ path: "corpo/fotos", element: <Photos /> },
```

- [ ] **Step 5: Validar**

```bash
npm run dev
```

Esperado: `/corpo` → "Fotos" → escolhe tipo (Frente/Lado/Costas/Outra) → seleciona uma imagem da galeria → aparece comprimida na galeria. Apaga funciona. Mate o processo.

- [ ] **Step 6: Commit**

```bash
git add src/components/PhotoUpload.tsx src/components/BlobImage.tsx src/pages/body/Photos.tsx src/main.tsx
git commit -m "feat(corpo): tela de fotos com upload + galeria"
```

---

### Task 14: Tela de Comparação lado a lado

**Files:**
- Create: `src/components/PhotoComparator.tsx`
- Create: `src/pages/body/Comparison.tsx`
- Modify: `src/main.tsx` (rota)

- [ ] **Step 1: Componente comparador**

`src/components/PhotoComparator.tsx`:

```tsx
import type { ProgressPhoto } from "../lib/db";
import { BlobImage } from "./BlobImage";
import { formatDateBR } from "../lib/format";

interface Props {
  left?: ProgressPhoto;
  leftLabel: string;
  right?: ProgressPhoto;
  rightLabel: string;
}

export function PhotoComparator({ left, leftLabel, right, rightLabel }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <p className="text-muted text-xs uppercase tracking-wider mb-1">{leftLabel}</p>
        {left ? (
          <>
            <BlobImage blob={left.blob} alt={leftLabel} className="w-full rounded-md aspect-[3/4] object-cover" />
            <p className="text-muted text-xs mt-1">{formatDateBR(new Date(left.date))}</p>
          </>
        ) : (
          <div className="bg-bg-deep border border-bg-border rounded-md aspect-[3/4] flex items-center justify-center text-muted text-xs text-center px-2">
            sem foto
          </div>
        )}
      </div>
      <div>
        <p className="text-muted text-xs uppercase tracking-wider mb-1">{rightLabel}</p>
        {right ? (
          <>
            <BlobImage blob={right.blob} alt={rightLabel} className="w-full rounded-md aspect-[3/4] object-cover" />
            <p className="text-muted text-xs mt-1">{formatDateBR(new Date(right.date))}</p>
          </>
        ) : (
          <div className="bg-bg-deep border border-bg-border rounded-md aspect-[3/4] flex items-center justify-center text-muted text-xs text-center px-2">
            sem foto
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Página Comparison**

`src/pages/body/Comparison.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { useState } from "react";
import { db, type ProgressPhoto } from "../../lib/db";
import { PhotoComparator } from "../../components/PhotoComparator";

type Tag = ProgressPhoto["tag"];

export function Comparison() {
  const [tag, setTag] = useState<Tag>("front");
  const goals = useLiveQuery(
    () => db.photos.where("[category+tag]").equals(["goal", tag]).toArray(),
    [tag],
  );
  const selves = useLiveQuery(
    () => db.photos.where("[category+tag]").equals(["self", tag]).sortBy("date"),
    [tag],
  );

  const oldest = selves?.[0];
  const newest = selves?.[selves.length - 1];
  const goal = goals?.[0];

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/corpo" className="text-muted text-sm">&larr; Corpo</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Comparação</h1>
      </div>

      <div className="card mb-4">
        <label className="block text-muted text-xs uppercase tracking-wider mb-2">Vista</label>
        <div className="flex gap-2">
          {(["front", "side", "back", "custom"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={`flex-1 py-2 rounded-md text-sm ${
                tag === t ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {t === "front" ? "Frente" : t === "side" ? "Lado" : t === "back" ? "Costas" : "Outra"}
            </button>
          ))}
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Atual × Objetivo</h2>
        <PhotoComparator left={newest} leftLabel="Atual" right={goal} rightLabel="Objetivo" />
      </div>

      <div className="card">
        <h2 className="text-nude-warm font-medium mb-3">Atual × Mais antiga</h2>
        <PhotoComparator left={newest} leftLabel="Atual" right={oldest} rightLabel="Antiga" />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Registrar rota**

Em `src/main.tsx`:

```tsx
import { Comparison } from "./pages/body/Comparison";
```

E:

```tsx
{ path: "corpo/comparacao", element: <Comparison /> },
```

- [ ] **Step 4: Validar**

```bash
npm run dev
```

Esperado: `/corpo/comparacao` mostra comparações lado a lado. Sem fotos ainda, mostra "sem foto" nos cards. Mate o processo.

- [ ] **Step 5: Commit**

```bash
git add src/components/PhotoComparator.tsx src/pages/body/Comparison.tsx src/main.tsx
git commit -m "feat(corpo): tela de comparação lado a lado"
```

---

## Fase F — Onboarding com import das pastas existentes

### Task 15: Wizard de onboarding inicial (medidas + import de fotos)

**Files:**
- Create: `src/pages/body/Onboarding.tsx`
- Create: `src/components/OnboardingGate.tsx`
- Modify: `src/App.tsx` (gate)
- Modify: `src/main.tsx` (rota)

**Lógica:**
- Na primeira abertura do app, mostra wizard que:
  1. Coleta as medidas atuais (com os valores pré-preenchidos do spec: pescoço 40, ombros 120.5, busto 106.5, cintura 99, quadril 114, coxa L=R=82.5, braço 34, antebraço 27.5, panturrilha 42)
  2. Pede pra usuária importar as fotos das pastas `eu/` e `objetivo/` manualmente (PWA não consegue ler filesystem direto — botão "escolher fotos atuais" e "escolher fotos objetivo")
- Marca em settings `key="onboarded"` como `true` quando termina
- Gate redireciona pra `/corpo/onboarding` se não estiver onboarded

- [ ] **Step 1: Página de Onboarding**

`src/pages/body/Onboarding.tsx`:

```tsx
import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { db, type Measurement, type ProgressPhoto } from "../../lib/db";
import { MeasurementForm } from "../../components/MeasurementForm";
import { compressImage } from "../../lib/image-compress";

const PRESET_MEASUREMENT: Partial<Measurement> = {
  neckCm: 40,
  shouldersCm: 120.5,
  chestCm: 106.5,
  waistCm: 99,
  hipCm: 114,
  thighLeftCm: 82.5,
  thighRightCm: 82.5,
  armCm: 34,
  forearmCm: 27.5,
  calfCm: 42,
};

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [busy, setBusy] = useState(false);
  const [photosImported, setPhotosImported] = useState({ self: 0, goal: 0 });

  async function handleSaveMeasurement(m: Omit<Measurement, "id">) {
    await db.measurements.add(m as Measurement);
    setStep(2);
  }

  async function handleImportPhotos(category: "self" | "goal", e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
    let added = 0;
    for (const file of Array.from(files)) {
      try {
        const blob = await compressImage(file);
        await db.photos.add({
          date: new Date().toISOString().slice(0, 10),
          blob,
          tag: "front",
          category,
        });
        added++;
      } catch {
        // pula imagem com falha
      }
    }
    setPhotosImported((p) => ({ ...p, [category]: p[category] + added }));
    setBusy(false);
    e.target.value = "";
  }

  async function finish() {
    await db.settings.put({ key: "onboarded", value: true });
    navigate("/corpo", { replace: true });
  }

  return (
    <div className="p-4 pb-24 max-w-md mx-auto">
      <p className="text-muted text-xs uppercase tracking-wider mb-2">Passo {step} de 4</p>
      <h1 className="font-serif text-2xl text-nude mb-4">Bem-vinda ao Trein-Final</h1>

      {step === 1 && (
        <div className="card">
          <h2 className="text-nude-warm font-medium mb-1">Suas medidas atuais</h2>
          <p className="text-muted text-sm mb-3">
            Pré-preenchidas com as medidas que você já tem. Confirma e ajusta se mudou alguma coisa.
          </p>
          <MeasurementForm initial={PRESET_MEASUREMENT} onSubmit={handleSaveMeasurement} />
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2 className="text-nude-warm font-medium mb-1">Suas fotos atuais</h2>
          <p className="text-muted text-sm mb-3">
            Selecione as fotos da pasta <code className="text-nude">eu/</code> no seu computador (ou da galeria, se você já transferiu pro celular).
          </p>
          <label className="block w-full bg-wine text-nude-warm text-center rounded-md py-3 font-medium cursor-pointer hover:bg-wine-light transition">
            {busy ? "Processando..." : photosImported.self ? `${photosImported.self} foto(s) importada(s) — escolher mais?` : "Escolher fotos atuais"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImportPhotos("self", e)}
              disabled={busy}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => setStep(3)}
            disabled={busy}
            className="w-full mt-3 bg-bg-deep border border-bg-border text-nude-warm rounded-md py-2"
          >
            {photosImported.self > 0 ? "Próximo" : "Pular (adicionar depois)"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h2 className="text-nude-warm font-medium mb-1">Suas fotos objetivo</h2>
          <p className="text-muted text-sm mb-3">
            As referências de corpo-alvo que você salvou na pasta <code className="text-nude">objetivo/</code>.
          </p>
          <label className="block w-full bg-wine text-nude-warm text-center rounded-md py-3 font-medium cursor-pointer hover:bg-wine-light transition">
            {busy ? "Processando..." : photosImported.goal ? `${photosImported.goal} foto(s) importada(s) — escolher mais?` : "Escolher fotos objetivo"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImportPhotos("goal", e)}
              disabled={busy}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => setStep(4)}
            disabled={busy}
            className="w-full mt-3 bg-bg-deep border border-bg-border text-nude-warm rounded-md py-2"
          >
            {photosImported.goal > 0 ? "Próximo" : "Pular (adicionar depois)"}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="card text-center space-y-4">
          <h2 className="font-serif text-2xl text-nude">Pronto.</h2>
          <p className="text-muted text-sm">
            Você pode adicionar mais medidas e fotos a qualquer momento na aba <strong>Corpo</strong>.
            Treino, beleza e trilha chegam nas próximas atualizações.
          </p>
          <button
            type="button"
            onClick={finish}
            className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium"
          >
            Começar
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: OnboardingGate**

`src/components/OnboardingGate.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../lib/db";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    db.settings
      .get("onboarded")
      .then((s) => {
        if (!mounted) return;
        const onboarded = Boolean(s?.value);
        if (!onboarded && location.pathname !== "/corpo/onboarding") {
          navigate("/corpo/onboarding", { replace: true });
        }
        setReady(true);
      })
      .catch(() => mounted && setReady(true));
    return () => {
      mounted = false;
    };
  }, [navigate, location.pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted text-sm">Carregando…</span>
      </div>
    );
  }
  return <>{children}</>;
}
```

- [ ] **Step 3: Aplicar gate no App**

`src/App.tsx` atualizado:

```tsx
import { Outlet } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { OnboardingGate } from "./components/OnboardingGate";

function App() {
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

- [ ] **Step 4: Registrar rota**

Em `src/main.tsx`:

```tsx
import { Onboarding } from "./pages/body/Onboarding";
```

E:

```tsx
{ path: "corpo/onboarding", element: <Onboarding /> },
```

- [ ] **Step 5: Validar**

```bash
npm run dev
```

Esperado:
1. Primeira abertura redireciona pra `/corpo/onboarding`
2. Passo 1 mostra form com medidas pré-preenchidas — clique "Salvar medida" → vai pro passo 2
3. Passo 2 permite escolher fotos da pasta `eu/` → escolhe as 2 JPEGs → mostra "2 foto(s) importada(s)" → "Próximo"
4. Passo 3 idem com pasta `objetivo/` (3 JPEGs)
5. Passo 4 → "Começar" → vai pra `/corpo`
6. Recarrega o navegador → NÃO mostra mais onboarding, vai direto pra `/`

Pra testar de novo: abra DevTools → Application → IndexedDB → trein-final → delete database, e recarrega.

Mate o processo.

- [ ] **Step 6: Commit**

```bash
git add src/pages/body/Onboarding.tsx src/components/OnboardingGate.tsx src/App.tsx src/main.tsx
git commit -m "feat(onboarding): wizard inicial com medidas pré-preenchidas e import de fotos"
```

---

## Fase G — PWA + manifesto

### Task 16: Configurar PWA (manifest + service worker)

**Files:**
- Modify: `vite.config.ts`
- Create: `public/manifest.webmanifest`
- Create: `public/icons/icon-192.png` (placeholder gerado)
- Create: `public/icons/icon-512.png` (placeholder)
- Create: `public/icons/maskable-icon.png` (placeholder)
- Modify: `index.html`

- [ ] **Step 1: Instalar plugin**

```bash
npm install -D vite-plugin-pwa
```

- [ ] **Step 2: Gerar ícones placeholder**

Como ainda não temos arte oficial, geramos placeholders simples com a paleta amazona. Crie `scripts/generate-icons.mjs`:

```javascript
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

mkdirSync("public/icons", { recursive: true });

function svgIcon(size, mask = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#1a0a0e"/>
  ${mask ? "" : `<rect x="${size * 0.1}" y="${size * 0.1}" width="${size * 0.8}" height="${size * 0.8}" rx="${size * 0.15}" fill="#5c1a2b"/>`}
  <text x="50%" y="50%" font-family="Georgia, serif" font-size="${size * 0.4}" fill="#d4a373" text-anchor="middle" dominant-baseline="central" font-style="italic">T</text>
</svg>`;
}

writeFileSync(join("public", "icons", "icon-192.svg"), svgIcon(192));
writeFileSync(join("public", "icons", "icon-512.svg"), svgIcon(512));
writeFileSync(join("public", "icons", "maskable-icon.svg"), svgIcon(512, true));

console.log("Ícones SVG gerados em public/icons/");
```

Rode:

```bash
node scripts/generate-icons.mjs
```

Vamos usar SVGs como ícones do PWA (suportados por Android moderno). Se um dia quiser PNG, conversão por ferramenta externa.

- [ ] **Step 3: Atualizar `vite.config.ts`**

```typescript
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.svg"],
      manifest: {
        name: "Trein-Final",
        short_name: "Trein-Final",
        description: "App pessoal de transição",
        theme_color: "#1a0a0e",
        background_color: "#1a0a0e",
        display: "standalone",
        orientation: "portrait",
        scope: "./",
        start_url: "./",
        icons: [
          { src: "icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
          { src: "icons/maskable-icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
          },
          {
            urlPattern: ({ request }) =>
              ["script", "style", "image", "font"].includes(request.destination),
            handler: "StaleWhileRevalidate",
          },
        ],
      },
    }),
  ],
  base: "./",
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
    css: false,
  },
});
```

- [ ] **Step 4: Atualizar `index.html`**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#1a0a0e" />
    <link rel="icon" type="image/svg+xml" href="/icons/icon-192.svg" />
    <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
    <title>Trein-Final</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Build e validar**

```bash
npm run build
npm run preview
```

Esperado: `npm run build` gera `dist/sw.js`, `dist/manifest.webmanifest`, etc. `npm run preview` serve em `localhost:4173` e o Chrome DevTools (Application → Manifest) mostra o app instalável. Mate o processo.

- [ ] **Step 6: Commit**

```bash
git add scripts/ public/ vite.config.ts index.html package.json package-lock.json
git commit -m "feat(pwa): manifest + service worker + ícones"
```

---

## Fase H — Smoke tests + finalização

### Task 17: Smoke test do fluxo Medidas

**Files:**
- Create: `tests/pages/measurements.smoke.test.tsx`

- [ ] **Step 1: Instalar `fake-indexeddb` pra IndexedDB nos testes**

```bash
npm install -D fake-indexeddb
```

- [ ] **Step 2: Configurar polyfill no setup**

Edite `tests/setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { db } from "../src/lib/db";

afterEach(async () => {
  cleanup();
  await db.delete();
  await db.open();
});
```

- [ ] **Step 3: Smoke test**

`tests/pages/measurements.smoke.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Measurements } from "../../src/pages/body/Measurements";
import { db } from "../../src/lib/db";

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={["/corpo/medidas"]}>
      <Routes>
        <Route path="/corpo/medidas" element={<Measurements />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Measurements smoke", () => {
  it("salva uma medida e ela aparece no histórico", async () => {
    renderWithRouter();
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    // Encontra os campos por label
    const findInput = (labelText: string) => {
      const labels = screen.getAllByText(labelText);
      const label = labels[labels.length - 1];
      const wrapper = label.parentElement!;
      return wrapper.querySelector("input") as HTMLInputElement;
    };
    fireEvent.change(findInput("Cintura"), { target: { value: "99" } });
    fireEvent.change(findInput("Quadril"), { target: { value: "114" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar medida/i }));
    await waitFor(() => {
      expect(screen.getByText(/Cintura: 99,0 cm/)).toBeInTheDocument();
      expect(screen.getByText(/Quadril: 114,0 cm/)).toBeInTheDocument();
      expect(screen.getByText(/WHR 0\.87/)).toBeInTheDocument();
    });
    const stored = await db.measurements.toArray();
    expect(stored).toHaveLength(1);
    expect(stored[0].waistCm).toBe(99);
    expect(stored[0].hipCm).toBe(114);
  });
});
```

- [ ] **Step 4: Rodar**

```bash
npm run test
```

Esperado: todos os testes anteriores passam + smoke test do Measurements passa. Total ~22+ testes.

- [ ] **Step 5: Commit**

```bash
git add tests/setup.ts tests/pages/measurements.smoke.test.tsx package.json package-lock.json
git commit -m "test: smoke test do fluxo de medidas"
```

---

### Task 18: README + checklist final

**Files:**
- Create: `README.md`

- [ ] **Step 1: README com quick start**

Crie/substitua `README.md`:

```markdown
# Trein-Final

App pessoal de transição (PWA mobile-first, 100% local).

## Quick start

```bash
npm install
npm run dev          # localhost:5173
npm run test         # roda Vitest
npm run build        # gera dist/
npm run preview      # preview do build em localhost:4173
```

## Stack

React 18 + TypeScript + Vite + Tailwind CSS + Dexie.js + React Router 6 + vite-plugin-pwa + Vitest.

## Estrutura

Veja o [plano de implementação](docs/superpowers/plans/2026-05-26-onda-1-parte-1-fundacao-corpo.md) e o [spec](docs/superpowers/specs/2026-05-26-app-transicao-design.md).

## Status

- **Onda 1 Parte 1 (atual):** fundação, libs, aba Corpo (medidas, fotos, comparação, onboarding) — implementado
- **Onda 1 Parte 2 (próximo):** aba Treino, aba Hoje, notificações, configurações
- **Onda 2:** aba Beleza (skincare, hair, estilo), aba Trilha (alimentação)
- **Onda 3:** dança/movimento profundo
- **Onda 4:** trilha completa + polimento
```

- [ ] **Step 2: Build final e smoke manual**

```bash
npm run test
npm run build
```

Esperado: todos os testes passam, build sai sem erro, `dist/` é gerado.

- [ ] **Step 3: Commit final**

```bash
git add README.md
git commit -m "docs: README inicial"
git log --oneline
```

Espera-se ver ~17 commits da Parte 1.

---

## Notas pro engenheiro executor

1. **Vá em ordem.** As tasks têm dependências implícitas — não pule.
2. **Frequente: rode `npm run dev` e olha no celular real.** Use o IP da rede (`vite --host`) ou USB debug. Validar visual no celular detecta bug bem mais cedo do que no desktop.
3. **Quando um teste falha:** leia a mensagem, ajuste a implementação (não o teste). Só ajuste o teste se o requisito mudou e o spec foi atualizado primeiro.
4. **Compressão de imagem em ambiente de teste:** `happy-dom` não tem `Canvas` nem `createImageBitmap` real. Smoke tests que dependem de imagem (sem ser o `measurements.smoke.test.tsx`) podem precisar de mock — adicione conforme necessário, mas o teste de Measurements não usa imagem então passa.
5. **PWA no Android:** depois do `npm run build`, sirva `dist/` num HTTPS (GitHub Pages, ou `ngrok http 4173` pra teste local). PWA exige HTTPS pra instalar — `localhost` é exceção, IP da LAN não é.
6. **Onda 1 Parte 2 (próximo plano):** virá em arquivo separado, vai cobrir Treino, Hoje, Notificações, Configurações, e finalização da Onda 1.
