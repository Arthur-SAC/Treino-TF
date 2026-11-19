import type { GuideSection } from "../components/GuideAccordion";
import { mesAno, type Projecao } from "./partida";
import { FASES, VERSAO_VISIVEL } from "./objetivo";
import type { DayRoutine, RoutineItem } from "./today-routine";
import { resolveRoutineTime, type RoutineTimeOverrides } from "./routine-times";
import { TETO_NOITE_MIN } from "./noite";

const FASE_2 = FASES.find((f) => f.id === "fase-2")!;
const CINTURA_FIM_FASE1 = FASES.find((f) => f.id === "fase-1")!.cinturaCm;
const entre = ([a, b]: [string, string]) => (a === b ? mesAno(a) : `${mesAno(a)} e ${mesAno(b)}`);
const kg = (n: number) => n.toLocaleString("pt-BR");
const faixa = ([a, b]: readonly [number, number]) => `${kg(a)}–${kg(b)}`;

// Os prazos saem da medição de partida dela, nunca de maio (ela recomeçou do
// zero em 23/09/2026). Sem partida, a seção diz isso em vez de inventar data.
// (Era `linhaDoTempo`; o nome passou pra linha do tempo do Hoje, abaixo.)
export function linhaDosPrazos(pr: Projecao | null): GuideSection {
  const intro = "O que define o ritmo é adesão, não idade.";
  if (!pr) {
    return {
      id: "linha-do-tempo",
      title: "Linha do tempo",
      intro: `Os prazos aparecem depois da sua primeira medição — peso, cintura no umbigo e pescoço. ${intro}`,
      tips: ["Mede em Progresso → Medidas e volta aqui: cada data sai da sua medição, não de uma conta genérica."],
    };
  }
  const tips = [
    `Partida: ${kg(pr.partida.pesoKg)} kg, cintura ${kg(pr.partida.cinturaCm)}. Ritmo esperado: ${kg(pr.ritmoKgSemana[0])}–${kg(pr.ritmoKgSemana[1])} kg por semana.`,
    pr.cintura88 === "ja"
      ? "Cintura 88: você já começou abaixo dela — a trava do superávit não te segura."
      : `Cintura 88 entre ${entre(pr.cintura88)}: é a trava que destrava o superávit.`,
    `Fim da fase 1 entre ${entre(pr.fimFase1)}: cintura 84 e peso por volta de ${pr.pesoAlvoFase1[0]}–${pr.pesoAlvoFase1[1]} kg.`,
    `Versão visível entre ${entre(pr.versaoVisivel)}: cintura ${kg(CINTURA_FIM_FASE1)}, quadril em ${faixa(VERSAO_VISIVEL.quadrilCm)} e razão cintura÷quadril em ${faixa(VERSAO_VISIVEL.whr)}, com o glúteo já destacado da coxa. Não é o fim: faltam os últimos centímetros de glúteo, que só o resto da fase 2 constrói — e só chega aqui sem faltar.`,
    `Fase 2 termina entre ${entre(pr.fimFase2)}: a balança SOBE de propósito, até ${FASE_2.pesoKgMin}-${FASE_2.pesoKgMax} kg, e o quadril volta a ${FASE_2.quadrilCm} feito de músculo.`,
    "Se a medição do mês ficar atrás da data, a pergunta é adesão (16h e jantar), não o plano.",
  ];
  return { id: "linha-do-tempo", title: "Linha do tempo", intro, tips };
}

// --- O Hoje em linha do tempo -------------------------------------------------
// O Hoje como uma linha do tempo só (spec 2026-11-19, seção 2): os itens do
// dia na ordem das horas, como uma agenda, sem agrupar por tipo. Puro.

export interface LinhaDoTempo {
  /** Sem horário (água, sol): valem o dia todo, vão no topo. */
  diaInteiro: RoutineItem[];
  /** Com horário, ordenados pela hora resolvida (o ajuste dela vence o padrão). */
  horas: RoutineItem[];
  /** O bloco "Esta semana": lembretes que não são de hoje. */
  semana: RoutineItem[];
}

function minutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function linhaDoTempo(r: DayRoutine, horarios: RoutineTimeOverrides): LinhaDoTempo {
  const diaInteiro: RoutineItem[] = [];
  const comHora: { item: RoutineItem; min: number; ordem: number }[] = [];
  const semana: RoutineItem[] = [];
  let ordem = 0;
  for (const bloco of r.blocks) {
    for (const item of bloco.items) {
      ordem += 1;
      if (bloco.id === "semana") { semana.push(item); continue; }
      const hhmm = resolveRoutineTime(item, horarios);
      if (hhmm) comHora.push({ item, min: minutos(hhmm), ordem });
      else diaInteiro.push(item);
    }
  }
  comHora.sort((a, b) => a.min - b.min || a.ordem - b.ordem);
  return { diaInteiro, horas: comHora.map((x) => x.item), semana };
}

const NOME_DIA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
/** Ordem em que a semana da noite é lida: segunda primeiro, domingo no fim. */
const ORDEM_SEMANA = [1, 2, 3, 4, 5, 6, 0];

const NOME_NO_RODIZIO: Record<string, string> = {
  postura: "a postura",
  voz: "a voz",
  "assoalho-pelvico": "o assoalho",
};

function lista(dias: number[]): string {
  const nomes = ORDEM_SEMANA.filter((d) => dias.includes(d)).map((d) => NOME_DIA[d]);
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}`;
}

function diasDe(sem: Record<number, string[]>, id: string): number[] {
  return Object.entries(sem).filter(([, ids]) => ids.includes(id)).map(([d]) => Number(d));
}

/** O que o card "Pronta pra próxima" diz sobre a noite: em que noites a parte
 *  nova entra e, se outra cedeu lugar pra caber no teto, pra onde ela foi.
 *  `antes` e `depois` vêm de `rodizioDaSemana`. Sem mudança nenhuma: undefined. */
export function textoDoRodizio(
  antes: Record<number, string[]>,
  depois: Record<number, string[]>,
  novoId: string,
): string | undefined {
  const frases: string[] = [];
  const ehDoRodizio = novoId in NOME_NO_RODIZIO;
  if (ehDoRodizio) {
    const entra = diasDe(depois, novoId);
    if (entra.length === 0) return `Com o que já está aberto, não cabe nos ${TETO_NOITE_MIN} min da noite.`;
    frases.push(`Entra ${lista(entra)}.`);
  }
  const cederam: string[] = [];
  for (const id of Object.keys(NOME_NO_RODIZIO)) {
    if (id === novoId) continue;
    const a = diasDe(antes, id);
    const d = diasDe(depois, id);
    if (a.length === 0 || a.every((x) => d.includes(x))) continue;
    cederam.push(d.length === 0 ? `${NOME_NO_RODIZIO[id]} sai da noite` : `${NOME_NO_RODIZIO[id]} fica pra ${lista(d)}`);
  }
  if (cederam.length > 0) frases.push(`Pra caber nos ${TETO_NOITE_MIN} min da noite, ${cederam.join("; ")}.`);
  return frases.length > 0 ? frases.join(" ") : undefined;
}
