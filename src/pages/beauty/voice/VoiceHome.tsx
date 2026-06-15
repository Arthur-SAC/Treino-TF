import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type VoiceExercise } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { GuideAccordion, type GuideSection } from "../../../components/GuideAccordion";
import { formatDateBR } from "../../../lib/format";

const VOICE_GUIDE: GuideSection[] = [
  {
    id: "voz-sem-trh",
    title: "Voz sem TRH: o que esperar (contexto honesto)",
    intro: "Sem TRH, a voz não muda por hormônio — e tudo bem. Aqui vai a verdade sem rodeios:",
    tips: [
      "A testosterona não afina nem engrossa retroativamente o que importa pra feminilização vocal. O que moldou sua voz no passado já foi — e o treino não luta contra isso.",
      "A feminilização da voz vem 100% do treino: pitch (tom de fala), ressonância (onde a voz vibra — rosto, não peito) e entonação (variação melódica). Essas três coisas são aprendidas, não hormonais.",
      "Expectativa realista: ~2–3 meses de prática diária de 15 min pra mudança consistente e audível. Não é magia, é músculo vocal — igual academia.",
      "Você não precisa de TRH pra ter uma voz feminina convincente. Há mulheres trans que praticam sem TRH e convencem; há quem esteja em TRH anos sem praticar e não convence. A constância é o fator.",
      "Grave-se a cada 2–4 semanas e ouça. O progresso existe — só é imperceptível no dia a dia porque você se acostuma. A gravação prova.",
    ],
  },
  {
    id: "voz-cronograma-semanal",
    title: "Cronograma semanal sugerido (~15 min/dia)",
    intro: "Estrutura simples: aquecimento todo dia (é obrigatório antes de qualquer coisa), e as categorias se revezam. Adapte ao que você tem tempo.",
    tips: [
      "Todo dia (sempre): Aquecimento 5–8 min — Respiração diafragmática + Aquecimento de lábios/língua + Glissando (sirene). Não pule isso.",
      "Segunda, Quarta, Sexta (passing + pitch): Pitch alvo → Ressonância forward → Leitura mantendo pitch. Foco em feminilizar a fala do cotidiano.",
      "Terça, Quinta (articulação + frases reais): Articulação clara (Pa-ta-ka, trava-línguas) → Conversa praticada (frases do dia a dia). Consolida o que está aprendendo.",
      "Sábado (sensual, se quiser): Sussurro sedutor → Modulação emocional → Suspiros e sons íntimos. Categoria opcional mas divertida.",
      "Domingo: descanso vocal — não forçar. Pode ouvir a si mesma em gravações antigas como revisão.",
      "Se tiver só 10 min num dia: Aquecimento (5 min) + Pitch alvo ou Ressonância (5 min). É suficiente pra manter continuidade.",
    ],
  },
];


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
          Sem TRH, sua voz só muda com prática. 15 min/dia já transforma em 2–3 meses. Sempre começa com aquecimento (3–5 min) antes de passing/sensual.
          Grave-se a cada 2–4 semanas pra ouvir progresso.
        </p>
      </div>

      <GuideAccordion sections={VOICE_GUIDE} className="mb-4" />

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
