# Vídeos dos exercícios — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colar um link de vídeo (YouTube etc.) por exercício de treino e por sequência de movimento, e assistir embutido no app — protegendo o link de re-seeds futuros.

**Architecture:** Lib pura `video.ts` (parse de URL → embed, testável) + componentes `VideoEmbed`/`VideoSection` + fiação em ExerciseDetail/SequenceDetail (persistem em IndexedDB) + re-seed preservador de `videoUrl`.

**Tech Stack:** React 18 + TypeScript + Vite, Dexie, Vitest + Testing Library.

---

### Task 1: Lib pura `video.ts`

**Files:**
- Create: `src/lib/video.ts`
- Test: `tests/lib/video.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/video.test.ts
import { describe, it, expect } from "vitest";
import { toEmbed } from "../../src/lib/video";

describe("toEmbed", () => {
  it("YouTube watch → embed", () => {
    expect(toEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      kind: "youtube",
      src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    });
  });
  it("youtu.be → embed", () => {
    expect(toEmbed("https://youtu.be/dQw4w9WgXcQ")?.src).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
  });
  it("shorts → embed", () => {
    expect(toEmbed("https://www.youtube.com/shorts/dQw4w9WgXcQ")?.src).toContain("/embed/dQw4w9WgXcQ");
  });
  it("watch com list antes do v= → embed", () => {
    expect(toEmbed("https://www.youtube.com/watch?list=PLabc&v=dQw4w9WgXcQ")?.src).toContain("/embed/dQw4w9WgXcQ");
  });
  it("arquivo .mp4 → video", () => {
    expect(toEmbed("https://site.com/clip.mp4")).toEqual({ kind: "video", src: "https://site.com/clip.mp4" });
  });
  it("link comum → link", () => {
    expect(toEmbed("https://site.com/aula")).toEqual({ kind: "link", src: "https://site.com/aula" });
  });
  it("não-URL → null", () => {
    expect(toEmbed("nada")).toBeNull();
    expect(toEmbed("")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- video`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Write implementation**

```ts
// src/lib/video.ts
export interface EmbeddedVideo {
  kind: "youtube" | "video" | "link";
  src: string;
}

export function toEmbed(url: string): EmbeddedVideo | null {
  const u = url.trim();
  if (!u) return null;

  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (yt) return { kind: "youtube", src: `https://www.youtube.com/embed/${yt[1]}` };

  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(u)) return { kind: "video", src: u };

  if (/^https?:\/\//i.test(u)) return { kind: "link", src: u };

  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- video`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/video.ts tests/lib/video.test.ts
git commit -m "feat(video): lib video (parse de link p/ embed, testavel)"
```

---

### Task 2: Componente `VideoEmbed`

**Files:**
- Create: `src/components/VideoEmbed.tsx`
- Test: `tests/components/video-embed.smoke.test.tsx`

- [ ] **Step 1: Write the smoke test**

```tsx
// tests/components/video-embed.smoke.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VideoEmbed } from "../../src/components/VideoEmbed";

describe("VideoEmbed", () => {
  it("renderiza iframe pra link do YouTube", () => {
    const { container } = render(<VideoEmbed url="https://youtu.be/dQw4w9WgXcQ" />);
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute("src")).toContain("/embed/dQw4w9WgXcQ");
  });
  it("não renderiza iframe pra url vazia", () => {
    const { container } = render(<VideoEmbed url="" />);
    expect(container.querySelector("iframe")).toBeNull();
  });
});
```

- [ ] **Step 2: Run it (fails — no component)**

Run: `npm test -- video-embed`
Expected: FAIL — `VideoEmbed` não existe.

- [ ] **Step 3: Criar `src/components/VideoEmbed.tsx`**

```tsx
import { toEmbed } from "../lib/video";

export function VideoEmbed({ url }: { url: string }) {
  const v = toEmbed(url);
  if (!v) return null;

  if (v.kind === "youtube") {
    return (
      <div className="relative w-full rounded-md overflow-hidden mb-1" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={v.src}
          title="Vídeo do exercício"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  if (v.kind === "video") {
    return <video controls src={v.src} className="w-full rounded-md mb-1" />;
  }

  return (
    <a href={v.src} target="_blank" rel="noreferrer" className="text-nude text-sm underline">
      Abrir vídeo ↗
    </a>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- video-embed`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/VideoEmbed.tsx tests/components/video-embed.smoke.test.tsx
git commit -m "feat(video): componente VideoEmbed (iframe/video/link)"
```

---

### Task 3: Componente `VideoSection` (mostrar + editar link)

**Files:**
- Create: `src/components/VideoSection.tsx`

- [ ] **Step 1: Criar `src/components/VideoSection.tsx`**

```tsx
import { useState } from "react";
import { VideoEmbed } from "./VideoEmbed";

interface Props {
  url?: string;
  onSave: (url: string) => void;
}

export function VideoSection({ url, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(url ?? "");

  return (
    <div className="card mb-3">
      <div className="flex justify-between items-baseline mb-2">
        <h2 className="text-nude-warm font-medium">Vídeo</h2>
        <button
          type="button"
          onClick={() => {
            setValue(url ?? "");
            setEditing((v) => !v);
          }}
          className="text-muted text-xs underline"
        >
          {url ? "editar" : "adicionar"}
        </button>
      </div>

      {url && !editing && <VideoEmbed url={url} />}
      {!url && !editing && (
        <p className="text-muted text-sm">Cole um link (YouTube etc.) pra ver o vídeo aqui.</p>
      )}

      {editing && (
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onSave(value.trim());
                setEditing(false);
              }}
              className="flex-1 bg-wine text-nude-warm rounded-md py-1.5 text-sm"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 bg-bg-deep border border-bg-border text-muted rounded-md text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/VideoSection.tsx
git commit -m "feat(video): componente VideoSection (mostrar + editar link)"
```

---

### Task 4: Fiação em `ExerciseDetail.tsx`

**Files:**
- Modify: `src/pages/workout/ExerciseDetail.tsx`

- [ ] **Step 1: Import**

Trocar:

```ts
import { db } from "../../lib/db";
```

por:

```ts
import { db } from "../../lib/db";
import { VideoSection } from "../../components/VideoSection";
```

- [ ] **Step 2: Inserir o VideoSection perto do topo**

Localizar:

```tsx
      <p className="text-muted text-xs mb-4">
        {ex.category} · {ex.difficulty} · exposição {ex.exposureLevel}/5
      </p>
```

e inserir IMEDIATAMENTE ABAIXO:

```tsx
      <VideoSection
        url={ex.videoUrl}
        onSave={(url) => { void db.exercises.update(ex.id, { videoUrl: url || undefined }); }}
      />
```

- [ ] **Step 3: Remover o link antigo do fim**

Localizar e REMOVER:

```tsx
      {ex.videoUrl && (
        <a href={ex.videoUrl} target="_blank" rel="noreferrer" className="card block text-center text-nude">
          Ver vídeo →
        </a>
      )}
```

- [ ] **Step 4: Verificar tipos e build**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/pages/workout/ExerciseDetail.tsx
git commit -m "feat(video): player + editor de link em ExerciseDetail"
```

---

### Task 5: Fiação em `SequenceDetail.tsx`

**Files:**
- Modify: `src/pages/workout/SequenceDetail.tsx`

- [ ] **Step 1: Import**

Trocar:

```ts
import { db, type PracticeLog } from "../../lib/db";
import { MoveStep } from "../../components/MoveStep";
```

por:

```ts
import { db, type PracticeLog } from "../../lib/db";
import { MoveStep } from "../../components/MoveStep";
import { VideoSection } from "../../components/VideoSection";
```

- [ ] **Step 2: Substituir o link antigo pelo VideoSection**

Localizar:

```tsx
      {sequence.videoUrl && (
        <a
          href={sequence.videoUrl}
          target="_blank"
          rel="noreferrer"
          className="card block text-center text-nude mb-4"
        >
          Ver vídeo de referência →
        </a>
      )}
```

e trocar por:

```tsx
      <VideoSection
        url={sequence.videoUrl}
        onSave={(url) => { void db.danceSequences.update(sequence.id, { videoUrl: url || undefined }); }}
      />
```

- [ ] **Step 3: Verificar tipos e build**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/pages/workout/SequenceDetail.tsx
git commit -m "feat(video): player + editor de link em SequenceDetail"
```

---

### Task 6: Re-seed preservador de `videoUrl`

**Files:**
- Modify: `src/lib/seed.ts`
- Modify: `src/lib/movement-seed.ts`

- [ ] **Step 1: `src/lib/seed.ts` — preservar no re-seed de exercícios**

Localizar (bloco do `EXERCISE_SEED_VERSION`):

```ts
    await db.transaction("rw", db.exercises, db.settings, async () => {
      for (const ex of EXERCISES) {
        await db.exercises.put(ex);
      }
      await db.settings.put({ key: "exerciseSeedVersion", value: EXERCISE_SEED_VERSION });
    });
```

e trocar por:

```ts
    await db.transaction("rw", db.exercises, db.settings, async () => {
      for (const ex of EXERCISES) {
        const existing = await db.exercises.get(ex.id);
        await db.exercises.put({
          ...ex,
          videoUrl: existing?.videoUrl ?? ex.videoUrl,
          gifPath: existing?.gifPath ?? ex.gifPath,
        });
      }
      await db.settings.put({ key: "exerciseSeedVersion", value: EXERCISE_SEED_VERSION });
    });
```

(O `put` do seed inicial — bloco do `seeded` — não muda: roda só uma vez, sem dados da usuária.)

- [ ] **Step 2: `src/lib/movement-seed.ts` — preservar na migração de versão**

Localizar:

```ts
  if (currentVersion < MOVEMENT_VERSION) {
    await db.transaction("rw", [db.danceSequences, db.settings], async () => {
      for (const s of SEQUENCES) {
        await db.danceSequences.put(s); // put = upsert, não duplica
      }
      await db.settings.put({ key: "movementVersion", value: MOVEMENT_VERSION });
    });
  }
```

e trocar por:

```ts
  if (currentVersion < MOVEMENT_VERSION) {
    await db.transaction("rw", [db.danceSequences, db.settings], async () => {
      for (const s of SEQUENCES) {
        const existing = await db.danceSequences.get(s.id);
        await db.danceSequences.put({ ...s, videoUrl: existing?.videoUrl ?? s.videoUrl }); // preserva o link do usuário
      }
      await db.settings.put({ key: "movementVersion", value: MOVEMENT_VERSION });
    });
  }
```

- [ ] **Step 3: Verificar tipos e testes de seed**

Run: `npx tsc -b` e `npm test -- seed` e `npm test -- movement`
Expected: sem erros; testes de seed/movement seguem verdes.

- [ ] **Step 4: Commit**

```bash
git add src/lib/seed.ts src/lib/movement-seed.ts
git commit -m "fix(video): re-seed preserva videoUrl/gifPath do usuario"
```

---

### Task 7: Verificação final

- [ ] **Step 1: Suíte completa**

Run: `npm test`
Expected: todos verdes (novos: `video`, `video-embed`; antigos intactos).

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `tsc -b` + `vite build` sem erros.

---

## Notas

- **Ambiente Windows:** `npm` fora do PATH; use
  `$env:Path = "C:\Program Files\nodejs;" + $env:Path; & "C:\Program Files\nodejs\npm.cmd" ...`.
- **`onSave` retorna void:** o `void db.exercises.update(...)` evita conflito de tipo
  (`update` devolve `Promise<number>`, e `onSave` é `(url) => void`).
- **Offline:** vídeos por link precisam de internet (escolha da usuária). O resto do app segue
  offline.
- **Voz fora de escopo:** só treino (exercícios) e movimento (sequências) ganham vídeo agora.
