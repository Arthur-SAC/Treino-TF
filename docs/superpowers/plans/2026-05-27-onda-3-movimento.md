# Trein-Final — Onda 3: Movimento (Dança + Mobilidade Avançada)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Sub-área "Movimento" dentro da aba Treino. Inclui sequências guiadas de mobilidade pélvica/quadril (4 sequências) e dança/rebolado progressivo (4 sequências, semana 1 a 4). Player de sequência com timer + descrição passo a passo + opção de link de vídeo de referência. Histórico de prática.

**Continua de:** Onda 2 Parte 3 — commit `fddabee`

---

## File Structure (additions)

```
src/
├── data/
│   └── sequences-seed.ts          # 8 sequências (4 mobilidade + 4 dança)
├── components/
│   ├── SequenceCard.tsx
│   └── MoveStep.tsx               # 1 passo da sequência (timer + descrição)
├── pages/workout/
│   ├── MovementHome.tsx           # lista de sequências por categoria
│   ├── SequenceDetail.tsx         # player com passos
│   └── PracticeHistory.tsx
└── lib/
    └── movement-seed.ts
tests/lib/movement-seed.test.ts
```

DB schema v2 — adicionar 2 stores: `danceSequences` e `practiceLogs`.

---

## Task 1: Schema bump + seed de sequências

**Files:**
- Modify: `src/lib/db.ts` (bump version, add stores + types)
- Create: `src/data/sequences-seed.ts`
- Create: `src/lib/movement-seed.ts`
- Create: `tests/lib/movement-seed.test.ts`
- Modify: `src/lib/settings-helpers.ts`, `src/hooks/useSetting.ts`, `src/main.tsx`

- [ ] **Step 1: Atualizar `src/lib/db.ts`**

Adicione os tipos no topo do arquivo (depois dos existentes):

```typescript
export interface DanceMove {
  name: string;
  description: string;
  durationSec: number;
  repeat?: number;
}

export interface DanceSequence {
  id: string;
  name: string;
  category: "mobilidade" | "danca";
  level: "iniciante" | "intermediario" | "avancado";
  durationMin: number;
  focus: string;
  videoUrl?: string;
  moves: DanceMove[];
}

export interface PracticeLog {
  id?: number;
  date: string;
  sequenceId: string;
  completed: boolean;
  durationMin?: number;
  notes?: string;
}
```

Na classe `TreinFinalDB`, adicione as 2 properties:

```typescript
danceSequences!: Table<DanceSequence, string>;
practiceLogs!: Table<PracticeLog, number>;
```

Bump da versão. Mantenha a `this.version(1)` existente intacta e ADICIONE depois:

```typescript
this.version(2).stores({
  danceSequences: "id, category, level",
  practiceLogs: "++id, date, sequenceId",
});
```

(Dexie aceita esse padrão: version 1 declara todos os stores originais, version 2 só declara os NOVOS — não precisa repetir os existentes.)

- [ ] **Step 2: Seed**

`src/data/sequences-seed.ts`:

```typescript
import type { DanceSequence } from "../lib/db";

export const SEQUENCES: DanceSequence[] = [
  // === MOBILIDADE ===
  {
    id: "mobilidade-pelvica-matinal",
    name: "Mobilidade pélvica matinal",
    category: "mobilidade",
    level: "iniciante",
    durationMin: 10,
    focus: "Acordar o quadril, soltar lombar, ativar glúteo. Bom pra começar o dia depois de muito tempo sentada.",
    moves: [
      { name: "Respiração de quadril (deitada)", description: "Deitada de costas, mão na barriga. Inspira soltando o ventre, expira contraindo o transverso. 5 respirações lentas.", durationSec: 60 },
      { name: "Cat-cow (4 apoios)", description: "Em 4 apoios. Inspira arqueia a coluna pra baixo (vaca), expira arredonda pra cima (gato). Suave, sem forçar.", durationSec: 60, repeat: 10 },
      { name: "Círculos de quadril (4 apoios)", description: "Mantém 4 apoios. Movimenta o quadril em círculo grande, 5x cada sentido.", durationSec: 60, repeat: 10 },
      { name: "Mobilidade 90/90", description: "Sentada com uma perna à frente em 90° e outra ao lado em 90°. Inclina tronco sobre perna da frente, depois pra trás. Alterna lados.", durationSec: 120 },
      { name: "Ponte de glúteo (suave)", description: "Deitada, joelhos dobrados. Sobe quadril apertando glúteo. Não usa lombar. 12 repetições lentas.", durationSec: 90, repeat: 12 },
      { name: "Borboleta (alongamento)", description: "Sentada, planta dos pés juntas, joelhos pros lados. Respira fundo deixando joelhos descerem. 1 min.", durationSec: 60 },
      { name: "Respiração final", description: "Deitada, mão na barriga. 5 respirações profundas pra terminar.", durationSec: 60 },
    ],
  },
  {
    id: "soltura-tronco-quadril",
    name: "Soltura de tronco e quadril (pré-dança)",
    category: "mobilidade",
    level: "iniciante",
    durationMin: 12,
    focus: "Preparar corpo pra dançar. Solta cintura, ombros, quadril.",
    moves: [
      { name: "Pescoço lateral", description: "Inclina cabeça pro ombro esquerdo, depois direito. Suave, sem forçar.", durationSec: 30, repeat: 4 },
      { name: "Círculos de ombro", description: "Ombros pra frente 8 vezes, pra trás 8 vezes.", durationSec: 30 },
      { name: "Caixa torácica isolada", description: "Em pé, quadril parado. Move caixa torácica pra frente/trás (4x), depois lateral (4x).", durationSec: 60 },
      { name: "Onda corporal lenta", description: "Em pé, joelhos suaves. Cabeça pra trás, caixa pra trás, quadril pra trás, depois volta na sequência inversa. Bem devagar pra sentir cada articulação.", durationSec: 90, repeat: 6 },
      { name: "Círculos de quadril (em pé)", description: "Pés afastados, mãos na cintura. Quadril em círculo grande, 8x cada sentido.", durationSec: 60 },
      { name: "Isolamento de quadril lateral", description: "Move só o quadril pra um lado, depois o outro. Tronco parado. 30s cada lado.", durationSec: 60 },
      { name: "Boneca de pano", description: "Inclina tronco pra frente solta, deixa braços pendurarem. Faz balanços pequenos relaxando lombar. 1 min.", durationSec: 60 },
      { name: "Sacolejada de glúteo", description: "Em pé, pés afastados. Treme bumbum pequeno (twerk basic), só usando glúteo. Devagar pra sentir.", durationSec: 60 },
      { name: "Respiração final", description: "Mãos na cintura. 5 respirações profundas, corpo já preparado.", durationSec: 30 },
    ],
  },
  {
    id: "alongamento-pelvico-profundo",
    name: "Alongamento pélvico profundo (noturno)",
    category: "mobilidade",
    level: "iniciante",
    durationMin: 15,
    focus: "Desativar tensão acumulada do dia, abrir quadril, preparar pra dormir. Bom também pra flexibilidade pra vida íntima.",
    moves: [
      { name: "Respiração relaxante", description: "Deitada, joelhos dobrados. 10 respirações lentas (inspira 4s, segura 4s, expira 6s).", durationSec: 120 },
      { name: "Happy baby", description: "Deitada, segura plantas dos pés, joelhos abrem pros lados perto das axilas. 1-2 min respirando.", durationSec: 120 },
      { name: "Borboleta deitada", description: "Plantas dos pés juntas, joelhos pros lados. Mãos no chão. Respira fundo deixando peso da gravidade abrir.", durationSec: 120 },
      { name: "Joelho ao peito (alternado)", description: "Puxa joelho direito ao peito, mantém 30s. Troca pra esquerdo. 2x cada lado.", durationSec: 120, repeat: 4 },
      { name: "Figura 4 (alongamento piriforme)", description: "Deitada, cruza tornozelo sobre joelho oposto. Puxa perna apoiada em direção ao peito. 1 min cada lado.", durationSec: 120, repeat: 2 },
      { name: "Postura da criança", description: "Sentada sobre calcanhares, joelhos abertos, tronco descansa pra frente, braços estendidos. Respira fundo. 1-2 min.", durationSec: 120 },
      { name: "Torção espinhal deitada", description: "Deitada de costas, leva joelhos dobrados pra um lado, cabeça pro lado oposto. 1 min cada lado.", durationSec: 120, repeat: 2 },
      { name: "Respiração final (savasana)", description: "Deitada, palmas viradas pra cima, olhos fechados. 1 min de silêncio.", durationSec: 60 },
    ],
  },
  {
    id: "flexibilidade-intima",
    name: "Flexibilidade pra vida íntima (adutor + pélvico)",
    category: "mobilidade",
    level: "intermediario",
    durationMin: 12,
    focus: "Abrir quadril, soltar adutor, mobilizar pélvico. Aumenta amplitude de movimento. Pode ser feito antes de momentos íntimos pra reduzir tensão.",
    moves: [
      { name: "Aquecimento de quadril (em pé)", description: "Círculos grandes de quadril, 8x cada sentido. Solta a região.", durationSec: 60 },
      { name: "Posição do gafanhoto (alongamento adutor)", description: "Em pé, pés bem afastados. Inclina tronco pra um lado, dobra o joelho, sente alongar a parte interna da coxa oposta. 30s cada lado.", durationSec: 60, repeat: 2 },
      { name: "Borboleta com cotovelo (pressão suave)", description: "Sentada, planta dos pés juntas. Cotovelos pressionam joelhos pra baixo bem suavemente. Respira fundo. 2 min.", durationSec: 120 },
      { name: "Agachamento profundo com pausa", description: "Agacha bem profundo, pés afastados, mãos juntas. Pausa 30-60s sentindo abertura. Levanta lentamente.", durationSec: 90, repeat: 3 },
      { name: "Frog stretch", description: "4 apoios. Abre joelhos pros lados o quanto consegue. Empurra quadril pra trás. 1-2 min, respirando fundo.", durationSec: 120 },
      { name: "Happy baby (5 respirações)", description: "Deitada, segura plantas dos pés, joelhos pros lados. Respira profundo, 5 ciclos.", durationSec: 60 },
      { name: "Postura da deusa", description: "Pés bem afastados, pontas pra fora. Agacha mantendo tronco ereto. Mãos em prece. 1 min respirando.", durationSec: 60 },
      { name: "Liberação final", description: "Sentada na borboleta. Respira sentindo o trabalho feito.", durationSec: 60 },
    ],
  },

  // === DANÇA ===
  {
    id: "danca-semana-1",
    name: "Semana 1 · Isolamento pélvico básico",
    category: "danca",
    level: "iniciante",
    durationMin: 8,
    focus: "Aprender a mexer SÓ o quadril, sem mover tronco/cabeça. Base de tudo.",
    videoUrl: "https://www.youtube.com/results?search_query=hip+isolation+drill+tutorial",
    moves: [
      { name: "Aquecimento de quadril", description: "Círculos de quadril 8x cada sentido, soltando a região.", durationSec: 60 },
      { name: "Quadril pra frente (isolado)", description: "Em pé, joelhos suaves. Move SÓ o quadril pra frente, depois volta pra neutro. Tronco totalmente parado. Pequeno, devagar.", durationSec: 60, repeat: 16 },
      { name: "Quadril pra trás (isolado)", description: "Mesma ideia, agora puxando quadril pra trás. Tronco fica.", durationSec: 60, repeat: 16 },
      { name: "Frente-trás combinado (rebolado básico)", description: "Alterna frente-trás continuamente. Comece bem devagar, vai pegando ritmo. Mãos na cintura ajudam a sentir.", durationSec: 90 },
      { name: "Quadril pra um lado", description: "Move quadril SÓ pra direita, depois SÓ pra esquerda. Tronco parado. Devagar.", durationSec: 60, repeat: 16 },
      { name: "Lado-lado contínuo", description: "Alterna esquerda-direita ritmadamente. Mantém tronco parado.", durationSec: 60 },
      { name: "Round (círculo)", description: "Combine pra fazer círculo de quadril em pé. Pra frente → lado → trás → outro lado. 8x cada sentido.", durationSec: 60 },
      { name: "Relaxamento", description: "Respira fundo, balança levemente.", durationSec: 30 },
    ],
  },
  {
    id: "danca-semana-2",
    name: "Semana 2 · Pélvico + onda corporal",
    category: "danca",
    level: "iniciante",
    durationMin: 10,
    focus: "Adicionar onda corporal — movimento da cabeça até o quadril em ondulação. Combinar com isolamento.",
    videoUrl: "https://www.youtube.com/results?search_query=body+wave+dance+tutorial",
    moves: [
      { name: "Aquecimento (quadril + ombros)", description: "Círculos de quadril 8x. Círculos de ombros 8x. Solta região.", durationSec: 60 },
      { name: "Revisão da semana 1 — rebolado frente-trás", description: "Aquece o que aprendeu, 1 min contínuo.", durationSec: 60 },
      { name: "Onda corporal pequena (em pé)", description: "Joelhos suaves. Cabeça vai pra trás → caixa torácica vai pra trás → quadril vai pra trás → volta na ordem inversa. Bem devagar pra sentir cada parte. 6x.", durationSec: 120, repeat: 6 },
      { name: "Onda invertida", description: "Mesma coisa começando do quadril, subindo. 6x.", durationSec: 120, repeat: 6 },
      { name: "Combinação: rebolado + onda", description: "4 rebolados frente-trás, depois 1 onda corporal. Repete a sequência 4x.", durationSec: 180, repeat: 4 },
      { name: "Free dance (improvisação leve)", description: "1 min livre, sem coreografia. Usa o que aprendeu. Tenta com música.", durationSec: 60 },
      { name: "Relaxamento + respiração", description: "Movimentos suaves, respira fundo. 1 min.", durationSec: 60 },
    ],
  },
  {
    id: "danca-semana-3",
    name: "Semana 3 · Rebolado contínuo + figure 8",
    category: "danca",
    level: "intermediario",
    durationMin: 12,
    focus: "Soltar mais o quadril, fazer figura 8 (rebolado em forma de oito). Aumentar velocidade.",
    videoUrl: "https://www.youtube.com/results?search_query=figure+8+hip+dance+tutorial",
    moves: [
      { name: "Aquecimento completo (3 min)", description: "Círculos de quadril, ombros, caixa torácica. Solta tudo.", durationSec: 180 },
      { name: "Rebolado contínuo (acelerar)", description: "Frente-trás começando lento, vai acelerando até ritmo médio. 1 min.", durationSec: 60 },
      { name: "Lado-lado acelerado", description: "Mesma coisa lateral. Acelera gradualmente.", durationSec: 60 },
      { name: "Figura 8 pra frente (in)", description: "Quadril desenha um '8' invisível na frente. Direita-frente-esquerda-frente, depois inverte. Devagar primeiro. 8x.", durationSec: 180, repeat: 8 },
      { name: "Figura 8 pra trás (out)", description: "8 invertido — quadril desenha 8 puxando pra trás. 8x.", durationSec: 180, repeat: 8 },
      { name: "Twerk básico", description: "Pés afastados, joelhos suaves, mãos nas coxas. Empurra quadril pra trás, depois pra frente. Treme só o glúteo. 1-2 min.", durationSec: 120 },
      { name: "Free dance com tudo", description: "Combina o que aprendeu nas 3 semanas. Coloca música. 2 min.", durationSec: 120 },
      { name: "Cooldown", description: "Movimentos lentos, respiração funda. 30s.", durationSec: 30 },
    ],
  },
  {
    id: "danca-semana-4",
    name: "Semana 4 · Walk + combo coreográfico",
    category: "danca",
    level: "intermediario",
    durationMin: 12,
    focus: "Andar dançando (sensual walk) + combinar tudo num pequeno combo coreográfico.",
    videoUrl: "https://www.youtube.com/results?search_query=sensual+walk+dance+tutorial",
    moves: [
      { name: "Aquecimento completo", description: "Como sempre. Solta corpo.", durationSec: 120 },
      { name: "Sensual walk no lugar", description: "Anda no lugar marcando quadril em cada passo. Pé cruza ligeiramente o outro. 1-2 min.", durationSec: 120 },
      { name: "Sensual walk pra frente e atrás", description: "4 passos pra frente, marcando quadril. 4 passos pra trás. Repete 4x.", durationSec: 90, repeat: 4 },
      { name: "Combo: 8 rebolados + 4 figura 8 + 1 onda", description: "Sequência: 8 rebolados frente-trás → 4 figura 8 → 1 onda corporal. Pratica 4x.", durationSec: 240, repeat: 4 },
      { name: "Improvisação com música", description: "Coloca uma música que você gosta. Combina tudo livremente. 3 min.", durationSec: 180 },
      { name: "Cooldown + respiração", description: "Reduz intensidade gradualmente, respira fundo.", durationSec: 60 },
    ],
  },
];
```

- [ ] **Step 3: Test**

`tests/lib/movement-seed.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { seedMovement } from "../../src/lib/movement-seed";
import { db } from "../../src/lib/db";

describe("seedMovement", () => {
  it("popula sequences", async () => {
    await seedMovement();
    const seqs = await db.danceSequences.toArray();
    expect(seqs.length).toBeGreaterThanOrEqual(8);
  });

  it("é idempotente", async () => {
    await seedMovement();
    const a = (await db.danceSequences.toArray()).length;
    await seedMovement();
    expect((await db.danceSequences.toArray()).length).toBe(a);
  });

  it("toda sequência tem moves não-vazios", async () => {
    await seedMovement();
    for (const s of await db.danceSequences.toArray()) {
      expect(s.moves.length).toBeGreaterThan(0);
      expect(s.durationMin).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 4: movement-seed**

`src/lib/movement-seed.ts`:

```typescript
import { db } from "./db";
import { SEQUENCES } from "../data/sequences-seed";

export async function seedMovement(): Promise<void> {
  const seeded = await db.settings.get("movementSeeded");
  if (seeded?.value === true) return;

  await db.transaction("rw", [db.danceSequences, db.settings], async () => {
    for (const s of SEQUENCES) {
      await db.danceSequences.put(s);
    }
    await db.settings.put({ key: "movementSeeded", value: true });
  });
}
```

Add `movementSeeded: boolean` to `Settings` AND `DEFAULTS` in both `settings-helpers.ts` and `useSetting.ts`.

- [ ] **Step 5: Wire in main.tsx**

```tsx
import { seedMovement } from "./lib/movement-seed";
// ...
Promise.all([seedDatabase(), seedBeauty(), seedStyle(), seedPath(), seedMovement()]).then(() => { ... });
```

- [ ] **Step 6: Test + build + commit**

```bash
npm run test
npm run build
git add src/lib/db.ts src/data/sequences-seed.ts src/lib/movement-seed.ts src/lib/settings-helpers.ts src/hooks/useSetting.ts src/main.tsx tests/lib/movement-seed.test.ts
git commit -m "feat(movement): schema v2 + seed de 8 sequências (mobilidade + dança progressiva)"
```

---

## Task 2: MovementHome (lista de sequências)

**Files:**
- Create: `src/components/SequenceCard.tsx`
- Create: `src/pages/workout/MovementHome.tsx`
- Modify: `src/pages/workout/WorkoutHome.tsx` (adicionar link)
- Modify: `src/main.tsx`

- [ ] **Step 1: SequenceCard**

`src/components/SequenceCard.tsx`:

```tsx
import { Link } from "react-router-dom";
import type { DanceSequence } from "../lib/db";

const LEVEL_LABEL: Record<DanceSequence["level"], string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

interface Props {
  sequence: DanceSequence;
  lastPracticed?: string;
}

export function SequenceCard({ sequence, lastPracticed }: Props) {
  return (
    <Link to={`/treino/movimento/${sequence.id}`} className="card block hover:border-nude/40 transition">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">{LEVEL_LABEL[sequence.level]}</span>
        <span className="text-muted text-xs">{sequence.durationMin} min · {sequence.moves.length} movimentos</span>
      </div>
      <h3 className="text-nude-warm font-medium">{sequence.name}</h3>
      <p className="text-muted text-sm mt-1">{sequence.focus}</p>
      {lastPracticed && (
        <p className="text-nude text-xs mt-2">última prática: {lastPracticed}</p>
      )}
    </Link>
  );
}
```

- [ ] **Step 2: MovementHome**

`src/pages/workout/MovementHome.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { SequenceCard } from "../../components/SequenceCard";
import { formatDateBR } from "../../lib/format";

export function MovementHome() {
  const sequences = useLiveQuery(() => db.danceSequences.toArray(), []);
  const logs = useLiveQuery(() => db.practiceLogs.orderBy("date").reverse().toArray(), []);

  const lastBySequence = new Map<string, string>();
  for (const log of logs ?? []) {
    if (!lastBySequence.has(log.sequenceId)) {
      lastBySequence.set(log.sequenceId, log.date);
    }
  }

  const mobilidade = sequences?.filter((s) => s.category === "mobilidade") ?? [];
  const danca = sequences?.filter((s) => s.category === "danca") ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino" className="text-muted text-sm">&larr; Treino</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Movimento</h1>
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Mobilidade</h2>
      <div className="space-y-2 mb-4">
        {mobilidade.map((s) => (
          <SequenceCard
            key={s.id}
            sequence={s}
            lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
          />
        ))}
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Dança · 4 semanas progressivas</h2>
      <div className="space-y-2">
        {danca.map((s) => (
          <SequenceCard
            key={s.id}
            sequence={s}
            lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update WorkoutHome**

Add link no `src/pages/workout/WorkoutHome.tsx` (DEPOIS dos 3 cards existentes):

```tsx
<Link to="/treino/movimento" className="card block hover:border-nude/40 transition">
  <h3 className="text-nude-warm font-medium">Movimento (dança + mobilidade)</h3>
  <p className="text-muted text-sm mt-1">Sequências guiadas, dança progressiva 4 semanas</p>
</Link>
```

- [ ] **Step 4: Route + commit**

```tsx
import { MovementHome } from "./pages/workout/MovementHome";
// ...
{ path: "treino/movimento", element: <MovementHome /> },
```

```bash
npm run build
git add src/components/SequenceCard.tsx src/pages/workout/MovementHome.tsx src/pages/workout/WorkoutHome.tsx src/main.tsx
git commit -m "feat(movimento): lista de sequências por categoria"
```

---

## Task 3: SequenceDetail (player de sequência)

**Files:**
- Create: `src/components/MoveStep.tsx`
- Create: `src/pages/workout/SequenceDetail.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: MoveStep**

`src/components/MoveStep.tsx`:

```tsx
import { useState, useEffect, useRef } from "react";
import type { DanceMove } from "../lib/db";

interface Props {
  move: DanceMove;
  active: boolean;
  onComplete?: () => void;
}

function formatSec(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}

export function MoveStep({ move, active, onComplete }: Props) {
  const [remaining, setRemaining] = useState(move.durationSec);
  const [running, setRunning] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setRemaining(move.durationSec);
      setRunning(false);
      completedRef.current = false;
    }
  }, [active, move.durationSec]);

  useEffect(() => {
    if (!running || !active) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, active, onComplete]);

  return (
    <div className={`card ${active ? "border-nude" : "opacity-60"}`}>
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="text-nude-warm font-medium">{move.name}</h3>
        <span className="text-nude text-sm">{formatSec(remaining)}</span>
      </div>
      <p className="text-sm text-muted mb-3">{move.description}</p>
      {move.repeat && (
        <p className="text-muted text-xs mb-3">Repetir {move.repeat}x</p>
      )}
      {active && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRunning((v) => !v)}
            className="flex-1 bg-wine-light text-nude-warm rounded-md py-2 text-sm"
          >
            {running ? "Pausar" : remaining === 0 ? "Pronto" : "Iniciar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setRemaining(move.durationSec);
              completedRef.current = false;
            }}
            className="px-3 bg-bg-deep border border-bg-border text-muted rounded-md text-sm"
          >
            ↻
          </button>
          {onComplete && (
            <button
              type="button"
              onClick={() => {
                if (!completedRef.current) {
                  completedRef.current = true;
                  onComplete();
                }
              }}
              className="px-3 bg-bg-deep border border-bg-border text-muted rounded-md text-sm"
            >
              pular →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: SequenceDetail**

`src/pages/workout/SequenceDetail.tsx`:

```tsx
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db, type PracticeLog } from "../../lib/db";
import { MoveStep } from "../../components/MoveStep";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function SequenceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sequence = useLiveQuery(
    async () => (id ? await db.danceSequences.get(id) : undefined),
    [id],
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [notes, setNotes] = useState("");

  if (!sequence) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  function nextMove() {
    if (!sequence) return;
    if (activeIdx < sequence.moves.length - 1) {
      setActiveIdx((i) => i + 1);
    }
  }

  async function finish() {
    if (!sequence) return;
    await db.practiceLogs.add({
      date: todayISO(),
      sequenceId: sequence.id,
      completed: true,
      durationMin: sequence.durationMin,
      notes: notes.trim() || undefined,
    } as PracticeLog);
    navigate("/treino/movimento", { replace: true });
  }

  const allDone = activeIdx >= sequence.moves.length - 1;

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/treino/movimento" className="text-muted text-sm">&larr; Movimento</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{sequence.name}</h1>
      <p className="text-muted text-sm mb-4">{sequence.focus}</p>

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

      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-muted text-xs uppercase tracking-wider">
            Passo {activeIdx + 1} de {sequence.moves.length}
          </span>
          <span className="text-muted text-xs">
            {Math.round(((activeIdx + 1) / sequence.moves.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-bg-deep rounded-full overflow-hidden">
          <div
            className="h-full bg-nude"
            style={{ width: `${((activeIdx + 1) / sequence.moves.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {sequence.moves.map((move, i) => (
          <MoveStep
            key={i}
            move={move}
            active={i === activeIdx}
            onComplete={i === activeIdx ? nextMove : undefined}
          />
        ))}
      </div>

      {allDone && (
        <div className="card mt-4 space-y-2">
          <h2 className="text-nude-warm font-medium">Como foi?</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Notas (opcional)"
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
          <button
            type="button"
            onClick={() => void finish()}
            className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium"
          >
            Marcar como feito
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Route + commit**

```tsx
import { SequenceDetail } from "./pages/workout/SequenceDetail";
// ...
{ path: "treino/movimento/:id", element: <SequenceDetail /> },
```

```bash
npm run build
git add src/components/MoveStep.tsx src/pages/workout/SequenceDetail.tsx src/main.tsx
git commit -m "feat(movimento): player de sequência com timer + progresso"
```

---

## Task 4: Today integration

**Files:**
- Modify: `src/pages/Today.tsx`

Sugere uma sequência de dança/mobilidade na rotação semanal.

- [ ] **Step 1: Update Today**

Em `src/pages/Today.tsx`, adicione query e card:

```tsx
const sequences = useLiveQuery(() => db.danceSequences.toArray(), []);
const practiceToday = useLiveQuery(
  () => db.practiceLogs.where("date").equals(todayISO).count(),
  [todayISO],
);

// Sugestão simples: roda baseado no dia da semana
// Seg/Qua/Sex: dança; Ter/Qui: mobilidade matinal; Sab: alongamento profundo; Dom: livre
const dayOfWeek = today.getDay();
const suggestedSeq = (() => {
  if (!sequences || sequences.length === 0) return null;
  if (dayOfWeek === 1) return sequences.find((s) => s.id === "danca-semana-1");
  if (dayOfWeek === 3) return sequences.find((s) => s.id === "danca-semana-2");
  if (dayOfWeek === 5) return sequences.find((s) => s.id === "danca-semana-3");
  if (dayOfWeek === 2 || dayOfWeek === 4) return sequences.find((s) => s.id === "mobilidade-pelvica-matinal");
  if (dayOfWeek === 6) return sequences.find((s) => s.id === "alongamento-pelvico-profundo");
  return null; // domingo livre
})();
```

Adicione card "Movimento" depois do card "Diário":

```tsx
{suggestedSeq && (
  <TodayCard
    title="Movimento"
    subtitle={`${suggestedSeq.name} · ${suggestedSeq.durationMin} min · ${(practiceToday ?? 0) > 0 ? "feito ✓" : "pendente"}`}
    to={`/treino/movimento/${suggestedSeq.id}`}
    variant={(practiceToday ?? 0) === 0 ? "highlight" : "default"}
  />
)}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/pages/Today.tsx
git commit -m "feat(hoje): sugestão de movimento do dia (dança ou mobilidade)"
```

---

## Task 5: PracticeHistory

**Files:**
- Create: `src/pages/workout/PracticeHistory.tsx`
- Modify: `src/pages/workout/MovementHome.tsx` (link)
- Modify: `src/main.tsx`

- [ ] **Step 1: PracticeHistory**

`src/pages/workout/PracticeHistory.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { formatDateBR } from "../../lib/format";

export function PracticeHistory() {
  const logs = useLiveQuery(() => db.practiceLogs.orderBy("date").reverse().toArray(), []);
  const sequences = useLiveQuery(() => db.danceSequences.toArray(), []);

  const seqMap = new Map(sequences?.map((s) => [s.id, s]) ?? []);

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino/movimento" className="text-muted text-sm">&larr; Movimento</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Histórico</h1>
      </div>

      <div className="space-y-2">
        {logs?.map((log) => {
          const seq = seqMap.get(log.sequenceId);
          return (
            <div key={log.id} className="card">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-nude-warm">{seq?.name ?? log.sequenceId}</span>
                <span className="text-muted text-xs">{formatDateBR(new Date(log.date))}</span>
              </div>
              <p className="text-muted text-xs">{log.durationMin} min</p>
              {log.notes && <p className="text-muted text-sm mt-1">{log.notes}</p>}
            </div>
          );
        })}
        {logs?.length === 0 && (
          <p className="text-muted text-sm text-center py-4">Sem práticas registradas.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add link in MovementHome**

No `src/pages/workout/MovementHome.tsx`, adicione no header (depois do `<Link to="/treino" ...>`):

```tsx
<Link to="/treino/movimento/historico" className="text-muted text-sm">histórico</Link>
```

Ajuste o flex pra acomodar (talvez `flex-1` no h1 fica como já está).

- [ ] **Step 3: Route + commit**

```tsx
import { PracticeHistory } from "./pages/workout/PracticeHistory";
// ...
{ path: "treino/movimento/historico", element: <PracticeHistory /> },
```

IMPORTANTE: a rota `historico` precisa vir ANTES de `:id` se houver conflito. Como temos `treino/movimento/:id` em Task 3, registre `treino/movimento/historico` antes dela na lista de children.

```bash
npm run build
git add src/pages/workout/PracticeHistory.tsx src/pages/workout/MovementHome.tsx src/main.tsx
git commit -m "feat(movimento): histórico de práticas"
```

---

## Task 6: README + push final

- [ ] **Step 1: Update README**

```markdown
## Status

- **Onda 1:** ✅ Concluída
- **Onda 2:** ✅ Concluída (Pele&Cabelo + Estilo + Trilha)
- **Onda 3:** ✅ Concluída — Movimento (mobilidade + dança progressiva 4 semanas)
- **Onda 4 (futuro):** maquiagem + polimento
```

- [ ] **Step 2: Final tests + build + push**

```bash
npm run test
npm run build
git add README.md docs/superpowers/plans/2026-05-27-onda-3-movimento.md
git commit -m "docs: README — Onda 3 concluída"
git push origin main
```

## Report

Tests, build, commit, push, total commits.
