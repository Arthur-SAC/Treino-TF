import type { GuideSection } from "../components/GuideAccordion";
import { mesAno, type Projecao } from "./partida";
import { FASES } from "./objetivo";

const FASE_2 = FASES.find((f) => f.id === "fase-2")!;
const entre = ([a, b]: [string, string]) => (a === b ? mesAno(a) : `${mesAno(a)} e ${mesAno(b)}`);
const kg = (n: number) => n.toLocaleString("pt-BR");

// Os prazos saem da medição de partida dela, nunca de maio (ela recomeçou do
// zero em 23/09/2026). Sem partida, a seção diz isso em vez de inventar data.
export function linhaDoTempo(pr: Projecao | null): GuideSection {
  const intro = "O que define o ritmo é adesão, não idade.";
  if (!pr) {
    return {
      id: "linha-do-tempo",
      title: "Linha do tempo",
      intro: `Os prazos aparecem depois da sua primeira medição — peso, cintura no umbigo e pescoço. ${intro}`,
      tips: ["Mede na aba Corpo e volta aqui: cada data sai da sua medição, não de uma conta genérica."],
    };
  }
  const tips = [
    `Partida: ${kg(pr.partida.pesoKg)} kg, cintura ${kg(pr.partida.cinturaCm)}. Ritmo esperado: ${kg(pr.ritmoKgSemana[0])}–${kg(pr.ritmoKgSemana[1])} kg por semana.`,
    pr.cintura88 === "ja"
      ? "Cintura 88: você já começou abaixo dela — a trava do superávit não te segura."
      : `Cintura 88 entre ${entre(pr.cintura88)}: é a trava que destrava o superávit.`,
    `Fim da fase 1 entre ${entre(pr.fimFase1)}: cintura 84 e peso por volta de ${pr.pesoAlvoFase1[0]}–${pr.pesoAlvoFase1[1]} kg.`,
    `Fase 2 termina entre ${entre(pr.fimFase2)}: a balança SOBE de propósito, até ${FASE_2.pesoKgMin}-${FASE_2.pesoKgMax} kg, e o quadril volta a ${FASE_2.quadrilCm} feito de músculo.`,
    "Se a medição do mês ficar atrás da data, a pergunta é adesão (16h e jantar), não o plano.",
  ];
  return { id: "linha-do-tempo", title: "Linha do tempo", intro, tips };
}
