import { Voltar } from "../../components/Voltar";
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

type Nivel = "iniciante" | "intermediario" | "avancado";

// Três seções por nível da sequência; dentro de cada uma, os grupos de sempre
// (mesma ordem, mesmos subtítulos). Grupo vazio não aparece.
const NIVEIS: { nivel: Nivel; titulo: string }[] = [
  { nivel: "iniciante", titulo: "Básico" },
  { nivel: "intermediario", titulo: "Intermediário" },
  { nivel: "avancado", titulo: "Avançado" },
];

const GRUPOS: { category: string; titulo: string }[] = [
  { category: "mobilidade", titulo: "Mobilidade" },
  { category: "apresentacao", titulo: "Apresentação · gestual e postura feminina no dia a dia" },
  { category: "flexibilidade", titulo: "Flexibilidade · 4 semanas progressivas" },
  { category: "pelvic", titulo: "Pelvic floor · sensibilidade + controle" },
  { category: "danca", titulo: "Dança · 4 semanas progressivas" },
  { category: "twerk", titulo: "Rebolado · progressão de 3 semanas" },
  { category: "sensual", titulo: "Sensual · linguagem corporal + dança avançada" },
  { category: "intimidade", titulo: "Intimidade · flexibilidade e sensualidade a dois" },
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

  // O guia da intimidade aparece uma vez só: na primeira seção que tem sequência de intimidade.
  const nivelDoGuia = NIVEIS.find((n) => (sequences ?? []).some((s) => s.level === n.nivel && s.category === "intimidade"))?.nivel;

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Voltar para="/treino" rotulo="Treino" />
        <Link to="/treino/movimento/historico" className="text-muted text-sm">histórico</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Movimento</h1>
      </div>

      {NIVEIS.map(({ nivel, titulo }) => {
        const doNivel = (sequences ?? []).filter((s) => s.level === nivel);
        if (doNivel.length === 0) return null;
        return (
          <section key={nivel} aria-label={titulo} className="mb-6">
            <h2 className="font-serif text-xl text-nude mb-3">{titulo}</h2>
            {GRUPOS.map(({ category, titulo: subtitulo }) => {
              const grupo = doNivel.filter((s) => s.category === category);
              if (grupo.length === 0) return null;
              return (
                <div key={category}>
                  <h3 className="text-muted text-xs uppercase tracking-wider mb-2">{subtitulo}</h3>
                  {category === "intimidade" && nivel === nivelDoGuia && (
                    <GuideAccordion sections={GUIA_INTIMIDADE} className="mb-3" />
                  )}
                  <div className="space-y-2 mb-4">
                    {grupo.map((s) => (
                      <SequenceCard
                        key={s.id}
                        sequence={s}
                        lastPracticed={lastBySequence.has(s.id) ? formatDateBR(new Date(lastBySequence.get(s.id)!)) : undefined}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
