# Trein-Final — Onda 5 Parte 1: Voz (passing + sensual)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Nova sub-área "Voz" dentro de Beleza (4ª sub-tab ao lado de Pele&Cabelo / Estilo / Maquiagem). 12 exercícios vocais (aquecimento + passing + modulação sensual) com player guiado (timer + descrição). Gravações curtas via Web Audio API pra comparar evolução.

**Continua de:** Onda 4 — commit `bbdc848`

---

## Schema v6

Adicionar ao `src/lib/db.ts`:

```typescript
export interface VoiceExercise {
  id: string;
  name: string;
  category: "aquecimento" | "passing" | "sensual" | "articulacao";
  level: "iniciante" | "intermediario" | "avancado";
  durationMin: number;
  focus: string;
  description: string;
  steps: Array<{ instruction: string; durationSec: number; repeat?: number }>;
  videoUrl?: string;
}

export interface VoiceRecording {
  id?: number;
  date: string;
  blob: Blob;
  durationSec: number;
  exerciseId?: string;
  notes?: string;
}

export interface VoicePracticeLog {
  id?: number;
  date: string;
  exerciseId: string;
  completed: boolean;
  durationMin?: number;
}
```

Stores no TreinFinalDB:
```typescript
voiceExercises!: Table<VoiceExercise, string>;
voiceRecordings!: Table<VoiceRecording, number>;
voicePracticeLogs!: Table<VoicePracticeLog, number>;
```

Version bump:
```typescript
this.version(6).stores({
  voiceExercises: "id, category, level",
  voiceRecordings: "++id, date",
  voicePracticeLogs: "++id, date, exerciseId",
});
```

## Seed de 12 exercícios

`src/data/voice-seed.ts`:

```typescript
import type { VoiceExercise } from "../lib/db";

export const VOICE_EXERCISES: VoiceExercise[] = [
  // === AQUECIMENTO (3) ===
  {
    id: "voz-respiracao-diafragma",
    name: "Respiração diafragmática",
    category: "aquecimento",
    level: "iniciante",
    durationMin: 3,
    focus: "Base de tudo. Voz boa começa em respiração baixa, não no peito.",
    description: "Mão na barriga. Inspira pelo nariz expandindo a barriga (não o peito). Expira pela boca contraindo abdome. Sente a vibração baixa.",
    steps: [
      { instruction: "Sentada ereta, mão direita na barriga, mão esquerda no peito. Inspira 4s sentindo SÓ a barriga subir (peito parado). Expira 6s contraindo o abdome.", durationSec: 60, repeat: 8 },
      { instruction: "Mesma respiração, mas com som 'sssss' (como pneu vazando) na expiração. Mantém o som contínuo, controlado.", durationSec: 60, repeat: 8 },
      { instruction: "Agora 'zzzz' (sonoro, vibração). Sente vibração na barriga, não na garganta.", durationSec: 60, repeat: 8 },
    ],
  },
  {
    id: "voz-aquecimento-labial-lingua",
    name: "Aquecimento de lábios e língua",
    category: "aquecimento",
    level: "iniciante",
    durationMin: 2,
    focus: "Solta articuladores. Voz feminina precisa de articulação clara, não preguiçosa.",
    description: "Trilling (vibração de lábios e língua) + estiramento.",
    steps: [
      { instruction: "Trilling de lábios (brrrr, como criança imitando cavalo). Mantém som por 5s, descansa, repete.", durationSec: 30, repeat: 5 },
      { instruction: "Trilling de língua (rrrr enrolado). Se não conseguir, faz lábios mesmo.", durationSec: 30, repeat: 5 },
      { instruction: "Estiramento facial: abre boca grande como bocejo + estira língua pra fora. Sustenta 5s.", durationSec: 30, repeat: 4 },
    ],
  },
  {
    id: "voz-glissando",
    name: "Glissando (sirene)",
    category: "aquecimento",
    level: "iniciante",
    durationMin: 3,
    focus: "Conecta registros graves e agudos. Treina extensão sem quebra.",
    description: "Som contínuo 'uuu' ou 'aaa' subindo da nota mais grave que você consegue até a mais aguda confortável. Sem quebra, suave.",
    steps: [
      { instruction: "Som 'uuu' grave → vai subindo gradualmente até o máximo confortável (sem forçar) → volta descendo. Como sirene de ambulância.", durationSec: 30, repeat: 6 },
      { instruction: "Mesma coisa com 'iii'. Sente a vibração mudar de lugar (peito grave → rosto agudo).", durationSec: 30, repeat: 6 },
      { instruction: "Mesma coisa com 'mmm' (boca fechada). Sente vibração no nariz/lábios — isso é ressonância forward.", durationSec: 30, repeat: 6 },
    ],
  },
  // === PASSING (5) ===
  {
    id: "voz-pitch-target",
    name: "Pitch alvo (achar tom feminino)",
    category: "passing",
    level: "iniciante",
    durationMin: 5,
    focus: "Encontrar tom de fala feminino sem forçar. Faixa feminina típica: 165-220 Hz. Faixa masculina: 85-180 Hz. Você quer ficar consistentemente acima de 165 Hz quando falar.",
    description: "Use um app de afinador (tipo 'Vocal Pitch Monitor' grátis no Android) ou só ouvido + comparação. Pratica em frases curtas mantendo o pitch.",
    steps: [
      { instruction: "Diz 'mmm' confortável e sustenta 5s. Marca esse tom como sua base. Isso provavelmente é seu pitch ATUAL.", durationSec: 30, repeat: 3 },
      { instruction: "Sobe um pouco — não muito (sem forçar). Mira algo entre Lá3 (220Hz) e Mi3 (165Hz). Sustenta 'mmm' no novo tom 5s.", durationSec: 30, repeat: 5 },
      { instruction: "Fala uma frase nesse novo tom: 'Oi, tudo bem?' Mantém o pitch do início ao fim, sem cair na última sílaba.", durationSec: 60, repeat: 8 },
      { instruction: "Faz uma pergunta: 'Você viu isso?' (entonação sobe no final) e uma afirmação: 'Vi sim.' (entonação cai mas não tanto). Mulheres tem entonação MAIS variada que homens.", durationSec: 60, repeat: 6 },
      { instruction: "Conta de 1 a 10 mantendo o pitch alvo. Se quebrar, recomeça.", durationSec: 60, repeat: 3 },
    ],
  },
  {
    id: "voz-ressonancia-forward",
    name: "Ressonância forward (rosto, não peito)",
    category: "passing",
    level: "iniciante",
    durationMin: 5,
    focus: "Voz feminina ressoa no rosto/cabeça (acima do céu da boca), não no peito. Isso é MAIS importante que pitch.",
    description: "Aprende a colocar a vibração da voz na máscara facial (nariz, lábios, ponta do crânio) em vez do peito.",
    steps: [
      { instruction: "Som 'mmm' boca fechada — concentra atenção em onde sente vibração. Tente trazer a vibração pro nariz/lábios (pressiona dedo no nariz pra sentir).", durationSec: 60, repeat: 6 },
      { instruction: "Som 'nnng' (final de 'parking') — vibração no véu palatino. Sustenta.", durationSec: 60, repeat: 6 },
      { instruction: "Combina: 'mmm-nnn-mmm-nnn'. Mantém vibração SEMPRE no rosto. Se sentir no peito, traz pra frente.", durationSec: 60, repeat: 6 },
      { instruction: "Fala uma palavra como 'mãe' sustentando o 'm' inicial: 'mmmmãe'. Vibração no nariz.", durationSec: 60, repeat: 8 },
      { instruction: "Frase: 'Minha mãe mora numa montanha de mel.' Toda 'M' sustentada e nasalada.", durationSec: 60, repeat: 5 },
    ],
  },
  {
    id: "voz-leitura-pitch",
    name: "Leitura mantendo pitch + ressonância",
    category: "passing",
    level: "intermediario",
    durationMin: 7,
    focus: "Aplicar técnica em fala contínua — não basta sustentar 'mmm', tem que falar frases inteiras assim.",
    description: "Lê em voz alta mantendo pitch feminino + ressonância forward. Difícil mas é onde a transferência acontece.",
    steps: [
      { instruction: "Pega um texto curto (notícia, livro, post). Lê 1 minuto SEM pensar em técnica. Só pra base de referência.", durationSec: 60 },
      { instruction: "Mesmo texto, agora aplicando pitch alvo + ressonância forward em cada frase. Devagar.", durationSec: 120 },
      { instruction: "Se sentir voz caindo pro peito, faz uma pausa, vibra 'mmm' pro nariz, retoma.", durationSec: 60 },
      { instruction: "Lê outro texto agora mais rápido, mantendo. Se quebrar, devagar de novo.", durationSec: 120 },
    ],
  },
  {
    id: "voz-conversa-praticada",
    name: "Conversa praticada (frases do dia a dia)",
    category: "passing",
    level: "intermediario",
    durationMin: 6,
    focus: "Treino com frases que você USA no dia a dia. Pedido no restaurante, conversa com motorista, atendente.",
    description: "Praticar frases reais com pitch + ressonância. Quando chegar a hora de usar, sai natural.",
    steps: [
      { instruction: "'Oi, tudo bem? Pode me ajudar?' Repete 5x focando em manter pitch alto e ressonância no rosto.", durationSec: 60, repeat: 5 },
      { instruction: "'Eu gostaria de um café com leite, por favor.' Frase de pedido. Repete 5x.", durationSec: 60, repeat: 5 },
      { instruction: "'Quanto custa?' Pergunta — entonação sobe no final.", durationSec: 60, repeat: 5 },
      { instruction: "'Obrigada, fica bem.' Tchau — entonação suave, pitch mantido.", durationSec: 60, repeat: 5 },
      { instruction: "Pratica uma frase SUA — algo que você precisa falar amanhã. Pensa numa situação e diz como diria.", durationSec: 120 },
    ],
  },
  {
    id: "voz-risada-feminina",
    name: "Risada feminina",
    category: "passing",
    level: "intermediario",
    durationMin: 4,
    focus: "Risada é assinatura vocal. Risada masculina é mais grave/peitoral, feminina é mais alta/clara, vem do rosto.",
    description: "Pratica diferentes tipos de risada feminina natural.",
    steps: [
      { instruction: "Risada 'ih-ih-ih' alta (pitch agudo), curta. 5 risadas leves.", durationSec: 30, repeat: 3 },
      { instruction: "Risada 'ah-ah-ah' aberta — sem cair pro grave. Como se algo fosse engraçado de leve.", durationSec: 30, repeat: 3 },
      { instruction: "Risada gostosa longa: cresce, sustenta, decresce. Mantém pitch alto o tempo todo.", durationSec: 30, repeat: 3 },
      { instruction: "Risada pequena de surpresa: 'ah!' (curta). Útil em conversas.", durationSec: 30, repeat: 3 },
      { instruction: "Combina com fala: 'Que coisa engraçada!' + risada. Praticar transição fala→risada.", durationSec: 60, repeat: 5 },
    ],
  },
  // === SENSUAL (3) ===
  {
    id: "voz-sussurro-sedutor",
    name: "Sussurro sedutor (ar e ressonância baixa)",
    category: "sensual",
    level: "intermediario",
    durationMin: 4,
    focus: "Voz sussurrada — quase sem corda vocal, muito ar. NÃO confundir com voz grave masculina. Sussurro é AGUDO e arejado, vem do céu da boca.",
    description: "Voz íntima pra pé do ouvido. Diferente do treino de passing (que busca clareza/pitch alto sustentado), aqui é arejada, perto, baixa em VOLUME (não em pitch).",
    steps: [
      { instruction: "Diz 'oiiiiii' bem baixo, quase só ar. Pitch alto (não desce pra grave). Lábios próximos como se fosse no ouvido.", durationSec: 30, repeat: 5 },
      { instruction: "'Vem aqui...' sussurrado, alongando 'aqui'. Sem pressa.", durationSec: 30, repeat: 5 },
      { instruction: "Frase: 'Você é minha.' Sussurrada, lenta, possessiva. Pitch alto + muito ar.", durationSec: 30, repeat: 5 },
      { instruction: "Sons sem palavra: 'mmm', 'aah' suspiro suave. Pratica como respostas íntimas.", durationSec: 60, repeat: 6 },
    ],
  },
  {
    id: "voz-modulacao-emocional",
    name: "Modulação emocional (carinho, desejo, controle)",
    category: "sensual",
    level: "avancado",
    durationMin: 5,
    focus: "Mesma frase dita com 3 intenções diferentes. Treina expressividade — sensualidade não é só técnica, é INTENÇÃO carregada na voz.",
    description: "Pratica 'colorir' a voz com emoção. Mulheres tendem a ter mais variação emocional na fala.",
    steps: [
      { instruction: "Frase: 'Vem cá.' Diz 3x: 1) carinho (suave, suspirado), 2) desejo (mais grave de tom, lenta), 3) controle (firme, comandante).", durationSec: 60, repeat: 4 },
      { instruction: "Frase: 'Eu quero você.' Mesma variação: carinho → desejo → controle.", durationSec: 60, repeat: 4 },
      { instruction: "Frase: 'Faz isso agora.' Comandante mas feminino. Pitch mantido, intenção firme.", durationSec: 60, repeat: 4 },
      { instruction: "Improvisa: pega um diálogo de filme/série favorito e dramatiza tentando 3 intenções pra cada fala.", durationSec: 90 },
    ],
  },
  {
    id: "voz-suspiros-sons-intimos",
    name: "Suspiros e sons íntimos",
    category: "sensual",
    level: "avancado",
    durationMin: 3,
    focus: "Sons não-verbais são metade da expressão sexual. Pratica respirações marcadas, suspiros, 'mmm', 'aah' suaves de prazer.",
    description: "Treino de sons que comunicam estado sem palavra. Importante porque homens tendem a ser menos vocais — você quer transitar pro padrão feminino mais expressivo.",
    steps: [
      { instruction: "Inspira marcada (audível), expira em suspiro suave. Como aliviada/saudosa. Repete.", durationSec: 30, repeat: 6 },
      { instruction: "'Mmm' baixinho, vibração suave, fechando os olhos. Como aprovação.", durationSec: 30, repeat: 6 },
      { instruction: "'Aah' curto, leve abrir os lábios — surpresa boa.", durationSec: 30, repeat: 6 },
      { instruction: "Combinação livre: sons sem palavra por 1 min, tentando ser expressiva.", durationSec: 60 },
    ],
  },
  // === ARTICULAÇÃO (1) ===
  {
    id: "voz-articulacao-claridade",
    name: "Articulação clara (precisão de consoante)",
    category: "articulacao",
    level: "intermediario",
    durationMin: 4,
    focus: "Mulheres tendem a articular CONSOANTES mais nitidamente. Homens tendem a 'comer' palavras. Articular bem feminiliza a fala mais do que se imagina.",
    description: "Trava-línguas e exercícios de articulação.",
    steps: [
      { instruction: "'Pa-ta-ka-pa-ta-ka' rápido, marcando cada consoante. Lábios e língua trabalham. 30s seguidos.", durationSec: 30, repeat: 3 },
      { instruction: "'Três pratos de trigo para três tigres tristes.' Devagar, articulando bem. Depois mais rápido.", durationSec: 60, repeat: 4 },
      { instruction: "'O sabiá não sabia que o sábio sabia assobiar.' Articulação especialmente do S.", durationSec: 60, repeat: 4 },
      { instruction: "Lê uma frase qualquer EXAGERANDO a articulação (vai parecer estranho). Depois lê normal. A 'normal' agora vai ficar mais clara.", durationSec: 60 },
    ],
  },
];
```

`src/lib/voice-seed.ts`:

```typescript
import { db } from "./db";
import { VOICE_EXERCISES } from "../data/voice-seed";

export async function seedVoice(): Promise<void> {
  const seeded = await db.settings.get("voiceSeeded");
  if (seeded?.value === true) return;
  await db.transaction("rw", [db.voiceExercises, db.settings], async () => {
    for (const ex of VOICE_EXERCISES) {
      await db.voiceExercises.put(ex);
    }
    await db.settings.put({ key: "voiceSeeded", value: true });
  });
}
```

Add `voiceSeeded: boolean` em Settings + DEFAULTS (settings-helpers + useSetting).

Wire em main.tsx:
```tsx
Promise.all([seedDatabase(), seedBeauty(), seedStyle(), seedPath(), seedMovement(), seedMakeup(), seedVoice()])
```

## UI

### BeautyTabs com 4 tabs

`src/components/BeautyTabs.tsx` — adicionar 4ª tab "Voz":

```typescript
const ITEMS = [
  { to: "/beleza/pele-cabelo", label: "Pele" },
  { to: "/beleza/estilo", label: "Estilo" },
  { to: "/beleza/maquiagem", label: "Maquiagem" },
  { to: "/beleza/voz", label: "Voz" },
];
```

(Tab text já tá `text-xs` pra caber.)

### BeautyHome com link Voz

`src/pages/beauty/BeautyHome.tsx` — adicionar 5o card link:

```tsx
<Link to="/beleza/voz" className="card block hover:border-nude/40 transition">
  <h3 className="text-nude-warm font-medium">Voz</h3>
  <p className="text-muted text-sm mt-1">Treino vocal (passing + sensual) com gravação</p>
</Link>
```

### VoiceHome

`src/pages/beauty/voice/VoiceHome.tsx`:

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type VoiceExercise } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { formatDateBR } from "../../../lib/format";

const CATEGORY_LABEL: Record<VoiceExercise["category"], string> = {
  aquecimento: "Aquecimento",
  passing: "Passing (feminilizar)",
  sensual: "Sensual",
  articulacao: "Articulação",
};

const CATEGORY_DESC: Record<VoiceExercise["category"], string> = {
  aquecimento: "5-10 min antes de qualquer treino vocal. Acorda corpo e respiração.",
  passing: "Pitch + ressonância + entonação. Pra falar como mulher no dia a dia.",
  sensual: "Sussurro, modulação emocional, suspiros. Pra vida íntima.",
  articulacao: "Clareza nas consoantes. Feminiliza fala mais do que parece.",
};

export function VoiceHome() {
  const exercises = useLiveQuery(() => db.voiceExercises.toArray(), []);
  const logs = useLiveQuery(() => db.voicePracticeLogs.orderBy("date").reverse().toArray(), []);
  const recordings = useLiveQuery(() => db.voiceRecordings.count(), []);

  const lastBySeq = new Map<string, string>();
  for (const log of logs ?? []) {
    if (!lastBySeq.has(log.exerciseId)) lastBySeq.set(log.exerciseId, log.date);
  }

  const byCategory = (exercises ?? []).reduce<Record<string, VoiceExercise[]>>((acc, ex) => {
    (acc[ex.category] ||= []).push(ex);
    return acc;
  }, {});

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Voz</h1>
        <Link to="/beleza/voz/gravacoes" className="text-muted text-sm">gravações ({recordings ?? 0})</Link>
      </div>
      <BeautyTabs />

      <div className="card mb-4 !bg-wine/20 !border-wine-light">
        <h2 className="text-nude font-medium mb-1">Como funciona</h2>
        <p className="text-sm text-nude-warm">
          Sem TRH, sua voz só muda com prática. 15 min/dia já transforma em 2-3 meses. Sempre começa com aquecimento (3-5 min) antes de passing/sensual.
          Grave-se a cada 2-4 semanas pra ouvir progresso.
        </p>
      </div>

      {(["aquecimento", "passing", "sensual", "articulacao"] as const).map((cat) => {
        const list = byCategory[cat] ?? [];
        return (
          <div key={cat} className="mb-4">
            <h2 className="text-muted text-xs uppercase tracking-wider">{CATEGORY_LABEL[cat]}</h2>
            <p className="text-muted text-xs mb-2">{CATEGORY_DESC[cat]}</p>
            <div className="space-y-2">
              {list.map((ex) => (
                <Link key={ex.id} to={`/beleza/voz/${ex.id}`} className="card block hover:border-nude/40 transition">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-muted text-xs">{ex.level} · {ex.durationMin} min</span>
                    {lastBySeq.has(ex.id) && (
                      <span className="text-nude text-xs">última: {formatDateBR(new Date(lastBySeq.get(ex.id)!))}</span>
                    )}
                  </div>
                  <h3 className="text-nude-warm font-medium">{ex.name}</h3>
                  <p className="text-muted text-sm mt-1">{ex.focus}</p>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### VoiceDetail (player com timer + gravar)

`src/pages/beauty/voice/VoiceDetail.tsx`:

```tsx
import { useState, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db, type VoicePracticeLog, type VoiceRecording } from "../../../lib/db";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatSec(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}

export function VoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const exercise = useLiveQuery(
    async () => (id ? await db.voiceExercises.get(id) : undefined),
    [id],
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const [stepRemaining, setStepRemaining] = useState(0);
  const [stepRunning, setStepRunning] = useState(false);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [recording, setRecording] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recStartRef = useRef<number>(0);

  useEffect(() => {
    if (exercise) setStepRemaining(exercise.steps[0]?.durationSec ?? 0);
  }, [exercise]);

  useEffect(() => {
    if (!stepRunning || !exercise) return;
    stepTimerRef.current = setInterval(() => {
      setStepRemaining((r) => {
        if (r <= 1) {
          if (stepTimerRef.current) clearInterval(stepTimerRef.current);
          setStepRunning(false);
          if (navigator.vibrate) navigator.vibrate(200);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [stepRunning, exercise]);

  if (!exercise) return <div className="p-4 text-muted text-sm">Carregando…</div>;

  function nextStep() {
    if (!exercise) return;
    if (activeIdx < exercise.steps.length - 1) {
      setActiveIdx((i) => i + 1);
      setStepRemaining(exercise.steps[activeIdx + 1].durationSec);
      setStepRunning(false);
    }
  }
  function prevStep() {
    if (activeIdx > 0 && exercise) {
      setActiveIdx((i) => i - 1);
      setStepRemaining(exercise.steps[activeIdx - 1].durationSec);
      setStepRunning(false);
    }
  }

  async function startRecording() {
    setRecError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
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
      mediaRecorderRef.current = mr;
      mr.start();
      recStartRef.current = Date.now();
      setRecording(true);
    } catch (e) {
      setRecError(e instanceof Error ? e.message : "Erro ao acessar microfone");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function finish() {
    if (!exercise) return;
    await db.voicePracticeLogs.add({
      date: todayISO(),
      exerciseId: exercise.id,
      completed: true,
      durationMin: exercise.durationMin,
    } as VoicePracticeLog);
    navigate("/beleza/voz", { replace: true });
  }

  const allDone = activeIdx >= exercise.steps.length - 1 && stepRemaining === 0;

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza/voz" className="text-muted text-sm">&larr; Voz</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{exercise.name}</h1>
      <p className="text-muted text-sm mb-4">{exercise.focus}</p>

      <div className="card mb-3 !bg-wine/20 !border-wine-light">
        <p className="text-sm text-nude-warm">{exercise.description}</p>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className="text-muted text-xs uppercase tracking-wider">
          Passo {activeIdx + 1} de {exercise.steps.length}
        </span>
        <span className="text-muted text-xs">{Math.round(((activeIdx + 1) / exercise.steps.length) * 100)}%</span>
      </div>
      <div className="h-1.5 bg-bg-deep rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-nude" style={{ width: `${((activeIdx + 1) / exercise.steps.length) * 100}%` }} />
      </div>

      <div className="card mb-3 border-nude">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="text-nude-warm font-medium">Instrução</h3>
          <span className="text-nude text-2xl font-serif tabular-nums">{formatSec(stepRemaining)}</span>
        </div>
        <p className="text-sm mb-3">{exercise.steps[activeIdx]?.instruction}</p>
        {exercise.steps[activeIdx]?.repeat && (
          <p className="text-muted text-xs mb-3">Repetir {exercise.steps[activeIdx].repeat}x</p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStepRunning((v) => !v)}
            className="flex-1 bg-wine-light text-nude-warm rounded-md py-1.5 text-sm"
          >
            {stepRunning ? "Pausar" : stepRemaining === 0 ? "Pronto" : "Iniciar"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (exercise) setStepRemaining(exercise.steps[activeIdx].durationSec);
              setStepRunning(false);
            }}
            className="px-3 bg-bg-deep border border-bg-border text-muted rounded-md text-sm"
          >
            ↻
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={prevStep}
          disabled={activeIdx === 0}
          className="flex-1 bg-bg-deep border border-bg-border text-muted rounded-md py-2 text-sm disabled:opacity-30"
        >
          ← anterior
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={activeIdx >= exercise.steps.length - 1}
          className="flex-1 bg-bg-deep border border-bg-border text-muted rounded-md py-2 text-sm disabled:opacity-30"
        >
          próximo →
        </button>
      </div>

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Gravar pra comparar evolução</h2>
        <p className="text-muted text-xs mb-3">
          30-60s da sua voz neste exercício. Compare gravações ao longo do tempo pra ouvir evolução real.
        </p>
        {recError && <p className="text-red-300 text-sm mb-2">{recError}</p>}
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={`w-full rounded-md py-2 text-sm ${
            recording ? "bg-red-900/40 border border-red-900 text-red-200" : "bg-bg-deep border border-bg-border text-muted"
          }`}
        >
          {recording ? "■ Parar gravação" : "● Gravar voz"}
        </button>
      </div>

      {allDone && (
        <button
          type="button"
          onClick={() => void finish()}
          className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium"
        >
          Marcar como feito
        </button>
      )}
    </div>
  );
}
```

### VoiceRecordings (lista)

`src/pages/beauty/voice/VoiceRecordings.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../../lib/db";
import { formatDateBR } from "../../../lib/format";

function RecordingPlayer({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  if (!url) return null;
  return <audio controls src={url} className="w-full mt-2" />;
}

export function VoiceRecordings() {
  const recordings = useLiveQuery(
    async () => {
      const all = await db.voiceRecordings.orderBy("date").toArray();
      return all.reverse();
    },
    [],
  );
  const exercises = useLiveQuery(() => db.voiceExercises.toArray(), []);
  const exMap = new Map(exercises?.map((e) => [e.id, e]) ?? []);

  async function remove(id?: number) {
    if (id === undefined) return;
    if (!confirm("Apagar essa gravação?")) return;
    await db.voiceRecordings.delete(id);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/voz" className="text-muted text-sm">&larr; Voz</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Gravações</h1>
      </div>

      <div className="card mb-4 !bg-wine/20 !border-wine-light">
        <p className="text-sm text-nude-warm">
          Compare gravações de meses diferentes pra ouvir evolução. Tente fazer 1 gravação por exercício a cada 2-4 semanas.
        </p>
      </div>

      <div className="space-y-3">
        {recordings?.map((r) => (
          <div key={r.id} className="card">
            <div className="flex justify-between items-baseline">
              <span className="text-nude-warm text-sm">{exMap.get(r.exerciseId ?? "")?.name ?? "Sem exercício"}</span>
              <span className="text-muted text-xs">{formatDateBR(new Date(r.date))}</span>
            </div>
            <p className="text-muted text-xs">{r.durationSec}s</p>
            <RecordingPlayer blob={r.blob} />
            <button onClick={() => void remove(r.id)} type="button" className="text-muted text-xs hover:text-red-300 mt-1">
              apagar
            </button>
          </div>
        ))}
        {recordings?.length === 0 && (
          <p className="text-muted text-sm text-center py-6">Sem gravações ainda. Faz a primeira agora!</p>
        )}
      </div>
    </div>
  );
}
```

### Rotas em main.tsx

```tsx
import { VoiceHome } from "./pages/beauty/voice/VoiceHome";
import { VoiceDetail } from "./pages/beauty/voice/VoiceDetail";
import { VoiceRecordings } from "./pages/beauty/voice/VoiceRecordings";
// ...
{ path: "beleza/voz", element: <VoiceHome /> },
{ path: "beleza/voz/gravacoes", element: <VoiceRecordings /> },  // static ANTES de :id
{ path: "beleza/voz/:id", element: <VoiceDetail /> },
```

## Test + build + commit + push

```bash
npm run test
npm run build
git add src/lib/db.ts src/data/voice-seed.ts src/lib/voice-seed.ts src/lib/settings-helpers.ts src/hooks/useSetting.ts src/main.tsx src/components/BeautyTabs.tsx src/pages/beauty/BeautyHome.tsx src/pages/beauty/voice/ 
git commit -m "feat(voz): treinamento vocal passing+sensual com 12 exercícios + gravação Web Audio"
git push origin main
```

Aguarda CI rodar.
