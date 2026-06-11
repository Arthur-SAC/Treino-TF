# Análise de Pitch (Web Audio) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Medir a voz dentro do app: algoritmo de pitch testável, medidor ao vivo no exercício, meta de pitch configurável, Hz médio por gravação, e conserto do backup (gravações de voz incluídas).

**Architecture:** Lib pura `pitch.ts` (autocorrelação, testável) + util browser `pitch-audio.ts` (decode de gravação) + componente `PitchMeter` (mic ao vivo) + fiação em VoiceDetail/VoiceRecordings/Settings. Web Audio só roda no navegador — a parte de áudio é verificada manualmente; o algoritmo é coberto por testes com onda sintética.

**Tech Stack:** React 18 + TypeScript + Vite, Web Audio API, Dexie, Vitest.

---

### Task 1: Lib pura `pitch.ts`

**Files:**
- Create: `src/lib/pitch.ts`
- Test: `tests/lib/pitch.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/pitch.test.ts
import { describe, it, expect } from "vitest";
import { detectPitchHz, classifyPitch, averagePitchHz } from "../../src/lib/pitch";

function sine(freq: number, sampleRate: number, length: number, amp = 0.8): Float32Array {
  const b = new Float32Array(length);
  for (let i = 0; i < length; i++) b[i] = amp * Math.sin((2 * Math.PI * freq * i) / sampleRate);
  return b;
}

describe("detectPitchHz", () => {
  it("detecta 200 Hz numa onda senoidal", () => {
    const hz = detectPitchHz(sine(200, 44100, 2048), 44100);
    expect(hz).not.toBeNull();
    expect(Math.abs((hz as number) - 200)).toBeLessThan(5);
  });
  it("detecta 150 Hz", () => {
    const hz = detectPitchHz(sine(150, 44100, 2048), 44100);
    expect(Math.abs((hz as number) - 150)).toBeLessThan(5);
  });
  it("retorna null em silêncio", () => {
    expect(detectPitchHz(new Float32Array(2048), 44100)).toBeNull();
  });
});

describe("classifyPitch", () => {
  it.each<[number, string]>([
    [140, "grave"],
    [165, "alvo"],
    [190, "alvo"],
    [220, "alvo"],
    [240, "agudo"],
  ])("classifica %i como %s", (hz, label) => {
    expect(classifyPitch(hz, 165, 220)).toBe(label);
  });
});

describe("averagePitchHz", () => {
  it("ignora nulls e arredonda", () => {
    expect(averagePitchHz([180, null, 200, null, 190])).toBe(190);
  });
  it("null quando não há válidos", () => {
    expect(averagePitchHz([null, null])).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- pitch`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Write implementation**

```ts
// src/lib/pitch.ts
const MIN_HZ = 50;
const MAX_HZ = 500;
const MIN_RMS = 0.01;

/** Detecção de pitch por autocorrelação (cwilso PitchDetect). null em silêncio/fora de faixa. */
export function detectPitchHz(buffer: Float32Array, sampleRate: number): number | null {
  const SIZE = buffer.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < MIN_RMS) return null;

  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
  }
  const trimmed = buffer.slice(r1, r2);
  const n = trimmed.length;
  if (n < 2) return null;

  const c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i; j++) c[i] += trimmed[j] * trimmed[j + i];
  }

  let d = 0;
  while (d < n - 1 && c[d] > c[d + 1]) d++;

  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < n; i++) {
    if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  }
  let T0 = maxpos;
  if (T0 <= 0) return null;

  if (T0 > 0 && T0 < n - 1) {
    const x1 = c[T0 - 1];
    const x2 = c[T0];
    const x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a !== 0) T0 = T0 - b / (2 * a);
  }

  const freq = sampleRate / T0;
  if (freq < MIN_HZ || freq > MAX_HZ) return null;
  return freq;
}

export function classifyPitch(hz: number, lowHz: number, highHz: number): "grave" | "alvo" | "agudo" {
  if (hz < lowHz) return "grave";
  if (hz > highHz) return "agudo";
  return "alvo";
}

export function averagePitchHz(values: Array<number | null>): number | null {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- pitch`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pitch.ts tests/lib/pitch.test.ts
git commit -m "feat(voz): lib pitch (deteccao por autocorrelacao, testavel)"
```

---

### Task 2: Settings de meta de pitch

**Files:**
- Modify: `src/lib/settings-helpers.ts` (interface + DEFAULTS)
- Modify: `src/hooks/useSetting.ts` (DEFAULTS)
- Test: `tests/lib/settings-helpers.test.ts` (append)

- [ ] **Step 1: Write the failing test (append)**

```ts
// adicionar ao fim de tests/lib/settings-helpers.test.ts (reusar import getSetting existente)
describe("settings de voz (pitch)", () => {
  it("defaults 165/220", async () => {
    expect(await getSetting("voicePitchTargetLowHz")).toBe(165);
    expect(await getSetting("voicePitchTargetHighHz")).toBe(220);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- settings-helpers`
Expected: FAIL — chave inexistente.

- [ ] **Step 3a: `src/lib/settings-helpers.ts`**

Na interface `Settings`, após `targetShoulderHipRatio: number;`, adicionar:

```ts
  voicePitchTargetLowHz: number;
  voicePitchTargetHighHz: number;
```

No `DEFAULTS` (settings-helpers.ts), após `targetShoulderHipRatio: 1.0,`, adicionar:

```ts
  voicePitchTargetLowHz: 165,
  voicePitchTargetHighHz: 220,
```

- [ ] **Step 3b: `src/hooks/useSetting.ts`**

No `DEFAULTS` desse arquivo, após `targetShoulderHipRatio: 1.0,`, adicionar as mesmas duas linhas:

```ts
  voicePitchTargetLowHz: 165,
  voicePitchTargetHighHz: 220,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- settings-helpers` e depois `npx tsc -b`
Expected: PASS e tipos OK (os dois DEFAULTS batem com a interface).

- [ ] **Step 5: Commit**

```bash
git add src/lib/settings-helpers.ts src/hooks/useSetting.ts tests/lib/settings-helpers.test.ts
git commit -m "feat(voz): settings de meta de pitch (165-220 Hz)"
```

---

### Task 3: Campo `avgPitchHz` + util de análise de gravação

**Files:**
- Modify: `src/lib/db.ts` (`VoiceRecording`)
- Create: `src/lib/pitch-audio.ts`

(Sem unit test: `decodeAudioData`/`AudioContext` não existem no happy-dom. Verificação manual.)

- [ ] **Step 1: Adicionar o campo em `src/lib/db.ts`**

Na interface `VoiceRecording`, após `notes?: string;`, adicionar:

```ts
  avgPitchHz?: number;
```

(Não precisa bump de versão Dexie — campo não indexado.)

- [ ] **Step 2: Criar `src/lib/pitch-audio.ts`**

```ts
// src/lib/pitch-audio.ts
import { detectPitchHz, averagePitchHz } from "./pitch";

/** Estima o pitch médio de uma gravação. Browser-only; retorna null se decode falhar. */
export async function analyzeRecordingPitch(blob: Blob): Promise<number | null> {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const arrayBuffer = await blob.arrayBuffer();
    const audio = await ctx.decodeAudioData(arrayBuffer);
    const channel = audio.getChannelData(0);
    const sampleRate = audio.sampleRate;
    const win = 2048;
    const hop = 1024;
    const pitches: Array<number | null> = [];
    for (let i = 0; i + win <= channel.length; i += hop) {
      pitches.push(detectPitchHz(channel.slice(i, i + win), sampleRate));
    }
    await ctx.close();
    return averagePitchHz(pitches);
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db.ts src/lib/pitch-audio.ts
git commit -m "feat(voz): campo avgPitchHz + analise de pitch da gravacao"
```

---

### Task 4: Componente `PitchMeter` (microfone ao vivo)

**Files:**
- Create: `src/components/PitchMeter.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/PitchMeter.tsx
import { useEffect, useRef, useState } from "react";
import { detectPitchHz, classifyPitch } from "../lib/pitch";

interface Props {
  targetLowHz: number;
  targetHighHz: number;
}

export function PitchMeter({ targetLowHz, targetHighHz }: Props) {
  const [on, setOn] = useState(false);
  const [hz, setHz] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!on) return;
    let cancelled = false;
    const bufferLength = 2048;
    const data = new Float32Array(bufferLength);

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        ctxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = bufferLength;
        source.connect(analyser);
        const loop = () => {
          analyser.getFloatTimeDomainData(data);
          setHz(detectPitchHz(data, ctx.sampleRate));
          rafRef.current = requestAnimationFrame(loop);
        };
        loop();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao acessar microfone");
        setOn(false);
      }
    }
    void start();

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      void ctxRef.current?.close();
      ctxRef.current = null;
      streamRef.current = null;
      setHz(null);
    };
  }, [on]);

  const label = hz !== null ? classifyPitch(hz, targetLowHz, targetHighHz) : null;

  return (
    <div>
      {error && <p className="text-red-300 text-sm mb-2">{error}</p>}
      <div className="flex items-center justify-between mb-2">
        <span className={`font-serif text-3xl tabular-nums ${label === "alvo" ? "text-nude" : "text-nude-warm"}`}>
          {hz !== null ? `${Math.round(hz)} Hz` : "— Hz"}
        </span>
        {label && (
          <span className={`text-xs uppercase tracking-wider ${label === "alvo" ? "text-nude" : "text-muted"}`}>
            {label}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={`w-full rounded-md py-2 text-sm ${on ? "bg-red-900/40 border border-red-900 text-red-200" : "bg-bg-deep border border-bg-border text-muted"}`}
      >
        {on ? "■ Parar microfone" : "● Ligar microfone"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/PitchMeter.tsx
git commit -m "feat(voz): componente PitchMeter (microfone ao vivo)"
```

---

### Task 5: Fiação em `VoiceDetail.tsx`

**Files:**
- Modify: `src/pages/beauty/voice/VoiceDetail.tsx`

- [ ] **Step 1: Ajustar imports**

Após `import { db, type VoicePracticeLog, type VoiceRecording } from "../../../lib/db";`,
adicionar:

```ts
import { useSetting } from "../../../hooks/useSetting";
import { analyzeRecordingPitch } from "../../../lib/pitch-audio";
import { PitchMeter } from "../../../components/PitchMeter";
```

- [ ] **Step 2: Ler a meta de pitch**

Logo após `const navigate = useNavigate();`, adicionar:

```ts
  const targetLow = useSetting("voicePitchTargetLowHz");
  const targetHigh = useSetting("voicePitchTargetHighHz");
```

- [ ] **Step 3: Calcular `avgPitchHz` ao salvar a gravação**

Localizar o handler `mr.onstop`:

```ts
      mr.onstop = async () => {
        const duration = Math.round((Date.now() - recStartRef.current) / 1000);
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        if (!exercise) return;
        await db.voiceRecordings.add({
          date: todayISO(),
          blob,
          durationSec: duration,
          exerciseId: exercise.id,
        } as VoiceRecording);
        stream.getTracks().forEach((t) => t.stop());
      };
```

e trocar por:

```ts
      mr.onstop = async () => {
        const duration = Math.round((Date.now() - recStartRef.current) / 1000);
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        if (!exercise) return;
        const avgPitchHz = await analyzeRecordingPitch(blob);
        await db.voiceRecordings.add({
          date: todayISO(),
          blob,
          durationSec: duration,
          exerciseId: exercise.id,
          avgPitchHz: avgPitchHz ?? undefined,
        } as VoiceRecording);
        stream.getTracks().forEach((t) => t.stop());
      };
```

- [ ] **Step 4: Adicionar a seção do medidor ao vivo**

Localizar o card de gravação:

```tsx
      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Gravar pra comparar evolução</h2>
```

e inserir IMEDIATAMENTE ANTES dele:

```tsx
      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Pitch ao vivo</h2>
        <p className="text-muted text-xs mb-3">
          Meta: {targetLow}-{targetHigh} Hz. Ligue o microfone e veja sua frequência em tempo real.
        </p>
        <PitchMeter targetLowHz={targetLow} targetHighHz={targetHigh} />
      </div>
```

- [ ] **Step 5: Verificar tipos e build**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/pages/beauty/voice/VoiceDetail.tsx
git commit -m "feat(voz): medidor ao vivo + avgPitchHz na gravacao (VoiceDetail)"
```

---

### Task 6: Mostrar Hz médio em `VoiceRecordings.tsx`

**Files:**
- Modify: `src/pages/beauty/voice/VoiceRecordings.tsx`

- [ ] **Step 1: Imports e settings**

Trocar:

```ts
import { db } from "../../../lib/db";
import { formatDateBR } from "../../../lib/format";
```

por:

```ts
import { db } from "../../../lib/db";
import { formatDateBR } from "../../../lib/format";
import { useSetting } from "../../../hooks/useSetting";
import { classifyPitch } from "../../../lib/pitch";
```

Dentro de `VoiceRecordings()`, logo após `const exMap = ...`, adicionar:

```ts
  const targetLow = useSetting("voicePitchTargetLowHz");
  const targetHigh = useSetting("voicePitchTargetHighHz");
```

- [ ] **Step 2: Exibir o Hz por gravação**

Localizar:

```tsx
            <p className="text-muted text-xs">{r.durationSec}s</p>
            <RecordingPlayer blob={r.blob} />
```

e trocar por:

```tsx
            <p className="text-muted text-xs">
              {r.durationSec}s
              {r.avgPitchHz !== undefined && ` · ~${r.avgPitchHz} Hz · ${classifyPitch(r.avgPitchHz, targetLow, targetHigh)}`}
            </p>
            <RecordingPlayer blob={r.blob} />
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc -b`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/pages/beauty/voice/VoiceRecordings.tsx
git commit -m "feat(voz): mostra Hz medio e faixa nas gravacoes"
```

---

### Task 7: Settings — card de Voz + conserto do backup

**Files:**
- Modify: `src/pages/Settings.tsx`

- [ ] **Step 1: Ler a meta de pitch no componente**

Junto dos outros `useSetting` no topo de `Settings()`, adicionar:

```ts
  const pitchLow = useSetting("voicePitchTargetLowHz");
  const pitchHigh = useSetting("voicePitchTargetHighHz");
```

- [ ] **Step 2: Adicionar o card de Voz antes do card "Backup"**

Localizar o card de Backup:

```tsx
      <div className="card space-y-2">
        <h2 className="text-nude-warm font-medium">Backup</h2>
```

e inserir IMEDIATAMENTE ANTES dele:

```tsx
      <div className="card space-y-3">
        <h2 className="text-nude-warm font-medium">Voz</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Pitch alvo mín (Hz)</label>
            <input type="number" min={100} max={300} value={pitchLow}
                   onChange={(e) => void setSetting("voicePitchTargetLowHz", Number(e.target.value))}
                   className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Pitch alvo máx (Hz)</label>
            <input type="number" min={100} max={350} value={pitchHigh}
                   onChange={(e) => void setSetting("voicePitchTargetHighHz", Number(e.target.value))}
                   className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          </div>
        </div>
        <p className="text-muted text-xs">Faixa feminina típica: 165-220 Hz. Use o medidor ao vivo nos exercícios de voz.</p>
      </div>
```

- [ ] **Step 3: Incluir voz/marcos no EXPORT do backup**

Localizar o objeto `payload` dentro de `exportBackup`:

```ts
      const payload = {
        measurements: await db.measurements.toArray(),
        photos: await Promise.all(
          (await db.photos.toArray()).map(async (p) => ({
            ...p,
            blob: await blobToBase64(p.blob),
          })),
        ),
        sessions: await db.workoutSessions.toArray(),
        meals: await db.meals.toArray(),
        skincareLogs: await db.skincareLogs.toArray(),
        haircare: await db.haircare.toArray(),
        dailyLog: await db.dailyLog.toArray(),
      };
```

e trocar por (acrescenta 4 coleções no fim):

```ts
      const payload = {
        measurements: await db.measurements.toArray(),
        photos: await Promise.all(
          (await db.photos.toArray()).map(async (p) => ({
            ...p,
            blob: await blobToBase64(p.blob),
          })),
        ),
        sessions: await db.workoutSessions.toArray(),
        meals: await db.meals.toArray(),
        skincareLogs: await db.skincareLogs.toArray(),
        haircare: await db.haircare.toArray(),
        dailyLog: await db.dailyLog.toArray(),
        voiceRecordings: await Promise.all(
          (await db.voiceRecordings.toArray()).map(async (r) => ({
            ...r,
            blob: await blobToBase64(r.blob),
          })),
        ),
        voicePracticeLogs: await db.voicePracticeLogs.toArray(),
        practiceLogs: await db.practiceLogs.toArray(),
        milestones: await db.milestones.toArray(),
      };
```

- [ ] **Step 4: Incluir voz/marcos no IMPORT do backup**

4a. Localizar o tipo `ImportPayload`:

```ts
      type ImportPayload = {
        measurements: unknown[];
        photos: Array<{ blob: string; date: string; tag: string; category: string }>;
        sessions: unknown[];
        meals: unknown[];
        skincareLogs: unknown[];
        haircare: unknown[];
        dailyLog: unknown[];
      };
```

e trocar por:

```ts
      type ImportPayload = {
        measurements: unknown[];
        photos: Array<{ blob: string; date: string; tag: string; category: string }>;
        sessions: unknown[];
        meals: unknown[];
        skincareLogs: unknown[];
        haircare: unknown[];
        dailyLog: unknown[];
        voiceRecordings?: Array<{ blob: string; date: string; durationSec: number; exerciseId?: string; avgPitchHz?: number }>;
        voicePracticeLogs?: unknown[];
        practiceLogs?: unknown[];
        milestones?: unknown[];
      };
```

4b. Localizar a transação de import:

```ts
      await db.transaction("rw", [db.measurements, db.photos, db.workoutSessions, db.meals, db.skincareLogs, db.haircare, db.dailyLog], async () => {
        await db.measurements.bulkAdd(payload.measurements as never);
        await db.photos.bulkAdd(
          await Promise.all(
            payload.photos.map(async (p) => ({
              ...p,
              blob: await base64ToBlob(p.blob),
            })),
          ) as never,
        );
        await db.workoutSessions.bulkAdd(payload.sessions as never);
        await db.meals.bulkAdd(payload.meals as never);
        await db.skincareLogs.bulkAdd(payload.skincareLogs as never);
        await db.haircare.bulkAdd(payload.haircare as never);
        await db.dailyLog.bulkAdd(payload.dailyLog as never);
      });
```

e trocar por (adiciona as tabelas na lista da transação e os bulkAdd no fim, com guarda `?? []` pra backups antigos):

```ts
      await db.transaction("rw", [db.measurements, db.photos, db.workoutSessions, db.meals, db.skincareLogs, db.haircare, db.dailyLog, db.voiceRecordings, db.voicePracticeLogs, db.practiceLogs, db.milestones], async () => {
        await db.measurements.bulkAdd(payload.measurements as never);
        await db.photos.bulkAdd(
          await Promise.all(
            payload.photos.map(async (p) => ({
              ...p,
              blob: await base64ToBlob(p.blob),
            })),
          ) as never,
        );
        await db.workoutSessions.bulkAdd(payload.sessions as never);
        await db.meals.bulkAdd(payload.meals as never);
        await db.skincareLogs.bulkAdd(payload.skincareLogs as never);
        await db.haircare.bulkAdd(payload.haircare as never);
        await db.dailyLog.bulkAdd(payload.dailyLog as never);
        await db.voiceRecordings.bulkAdd(
          await Promise.all(
            (payload.voiceRecordings ?? []).map(async (r) => ({
              ...r,
              blob: await base64ToBlob(r.blob),
            })),
          ) as never,
        );
        await db.voicePracticeLogs.bulkAdd((payload.voicePracticeLogs ?? []) as never);
        await db.practiceLogs.bulkAdd((payload.practiceLogs ?? []) as never);
        await db.milestones.bulkAdd((payload.milestones ?? []) as never);
      });
```

- [ ] **Step 5: Verificar tipos e build**

Run: `npx tsc -b`
Expected: sem erros (confirme que `db.voiceRecordings`, `db.voicePracticeLogs`, `db.practiceLogs`, `db.milestones` existem no schema Dexie — devem existir).

- [ ] **Step 6: Commit**

```bash
git add src/pages/Settings.tsx
git commit -m "feat(voz): meta de pitch em Settings + backup inclui voz e marcos"
```

---

### Task 8: Verificação final

- [ ] **Step 1: Suíte completa**

Run: `npm test`
Expected: todos verdes (novos: `pitch`, settings de voz; antigos intactos).

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `tsc -b` + `vite build` sem erros.

- [ ] **Step 3: Checklist de verificação MANUAL (não automatizável — Web Audio)**

Anotar no relatório que estes itens precisam de teste no aparelho/navegador real:
- Medidor de pitch ao vivo mostra Hz coerente ao falar (e "alvo" na faixa).
- Gravar voz → a gravação aparece em Gravações com `~Hz · faixa`.
- Configurar pitch mín/máx em Configurações reflete no medidor.
- Exportar backup e reimportar mantém as gravações de voz.

---

## Notas

- **Ambiente Windows:** `npm` fora do PATH; use
  `$env:Path = "C:\Program Files\nodejs;" + $env:Path; & "C:\Program Files\nodejs\npm.cmd" ...`
  em cada linha.
- **Por que sem teste de áudio:** happy-dom não implementa `AudioContext`/`getUserMedia`. O
  algoritmo (`pitch.ts`) é puro e testado; o resto é integração de browser, verificada à mão.
- **Backup retrocompatível:** os `?? []` garantem que backups antigos (sem voz/marcos) importam
  sem erro.
- **Sem bump de schema Dexie:** `avgPitchHz` não é indexado; as tabelas usadas no backup já existem.
