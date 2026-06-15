import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { SequenceCard } from "../../components/SequenceCard";
import { GuideAccordion, type GuideSection } from "../../components/GuideAccordion";
import { formatDateBR } from "../../lib/format";

const GUIA_INTIMIDADE: GuideSection[] = [
  {
    id: "intimidade-mapa",
    title: "Como usar (e o que já te serve)",
    intro:
      "Esta seção junta flexibilidade e dança com um propósito explícito: estar à vontade e sexy a dois — passiva (ser posicionada) ou ativa (cavalgar, grinding). Boa parte do que ajuda já está espalhada no app.",
    tips: [
      "Flexibilidade · trilha de 4 semanas: ganha amplitude pra posições mais abertas com o tempo.",
      "Pelvic floor: controle e sensibilidade — ajuda na ereção, no prazer e em segurar/soltar.",
      "Twerk e Dança: o rebolado, a figura 8 e a onda corporal viram ferramentas de grinding aqui.",
      "Sempre aquecer antes; parar antes da dor (joelho na montaria, lombar nos rolês). Alongamento puxa, não dói.",
      "Comunicação e consentimento com ela fazem parte da prática: ritmo e pressão se ajustam pelo retorno dela.",
    ],
  },
  {
    id: "intimidade-honestidade",
    title: "Honestidades técnicas",
    intro: "Pra você treinar com expectativa realista, sem frustração.",
    tips: [
      "Cavalgar PENETRANDO ela depende de manter a ereção na compressão da montaria E do alinhamento com a posição dela — nem sempre acontece. O grinding (descer e esfregar) é o plano mais garantido e controlável.",
      "Sentar em W / montaria ajoelhada depende de rotação interna de quadril e flexão de joelho; parte é treinável, parte é formato do osso. Quase sempre dá uma versão sua — o W perfeito não é garantido.",
      "Sem TRH, nada disso muda: é tudo treino de mobilidade, força e controle do seu corpo de hoje.",
    ],
  },
];

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
  const apresentacao = sequences?.filter((s) => s.category === "apresentacao") ?? [];
  const flexibilidade = sequences?.filter((s) => s.category === "flexibilidade") ?? [];
  const pelvic = sequences?.filter((s) => s.category === "pelvic") ?? [];
  const danca = sequences?.filter((s) => s.category === "danca") ?? [];
  const twerk = sequences?.filter((s) => s.category === "twerk") ?? [];
  const sensual = sequences?.filter((s) => s.category === "sensual") ?? [];
  const intimidade = sequences?.filter((s) => s.category === "intimidade") ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino" className="text-muted text-sm">&larr; Treino</Link>
        <Link to="/treino/movimento/historico" className="text-muted text-sm">histórico</Link>
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

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Apresentação · gestual e postura feminina no dia a dia</h2>
      <div className="space-y-2 mb-4">
        {apresentacao.map((s) => (
          <SequenceCard
            key={s.id}
            sequence={s}
            lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
          />
        ))}
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Flexibilidade · 4 semanas progressivas</h2>
      <div className="space-y-2 mb-4">
        {flexibilidade.map((s) => (
          <SequenceCard
            key={s.id}
            sequence={s}
            lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
          />
        ))}
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Pelvic floor · sensibilidade + controle</h2>
      <div className="space-y-2 mb-4">
        {pelvic.map((s) => (
          <SequenceCard
            key={s.id}
            sequence={s}
            lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
          />
        ))}
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Dança · 4 semanas progressivas</h2>
      <div className="space-y-2 mb-4">
        {danca.map((s) => (
          <SequenceCard
            key={s.id}
            sequence={s}
            lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
          />
        ))}
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Twerk · rebolado safado (3 semanas)</h2>
      <div className="space-y-2 mb-4">
        {twerk.map((s) => (
          <SequenceCard
            key={s.id}
            sequence={s}
            lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
          />
        ))}
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Sensual · linguagem corporal + dança avançada</h2>
      <div className="space-y-2 mb-4">
        {sensual.map((s) => (
          <SequenceCard
            key={s.id}
            sequence={s}
            lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
          />
        ))}
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Intimidade · flexibilidade e sensualidade a dois</h2>
      <GuideAccordion sections={GUIA_INTIMIDADE} className="mb-3" />
      <div className="space-y-2">
        {intimidade.map((s) => (
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
