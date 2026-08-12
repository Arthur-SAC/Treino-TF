// src/lib/flex-progression.ts
// Qual alongamento fazer hoje, de manhã e à noite. Módulo puro — sem I/O, sem Date.
//
// A rotina já tinha os dois momentos, mas com sequência FIXA: ela fazia a mesma
// coisa no dia 1 e no dia 200. Alongamento sem progressão para de render depois
// das primeiras semanas — o tecido adapta e o estímulo vira rotina.
//
// As trilhas são separadas de propósito. Manhã abre o quadril para o dia;
// noite trabalha flexão profunda e rotação, que é o que as posições que ela quer
// pedem. Misturar as duas faria uma anular a outra.

export type MomentoFlex = "manha" | "noite";

export interface FlexDoDia {
  sequenceId: string;
  /** Em que fase ela está, para o item do Hoje não virar exercício cego. */
  etapa: string;
}

/** Ordem didática de cada trilha. A fase 1 é a sequência que ela JÁ faz — o id
 *  é preservado para não quebrar o histórico de `practiceLogs` dela. */
export const SEQUENCIAS_FLEX: Record<MomentoFlex, readonly string[]> = {
  manha: ["mobilidade-pelvica-matinal", "flex-manha-amplitude", "flex-manha-sustentacao"],
  noite: ["flexibilidade-intima", "flex-noite-amplitude", "flex-noite-sustentacao"],
};

/** ~4 semanas de prática diária. */
export const ATE_FASE_2 = 28;
/** ~12 semanas de prática diária. */
export const ATE_FASE_3 = 84;

const ETAPA: Record<MomentoFlex, [string, string, string]> = {
  manha: [
    "Fase 1 · tolerância — o corpo aprende a posição antes de ganhar amplitude",
    "Fase 2 · amplitude — agora o alcance cresce",
    "Fase 3 · sustentação — ficar na posição sem tensão é o que serve na hora",
  ],
  noite: [
    "Fase 1 · tolerância — flexão profunda e rotação, sem forçar",
    "Fase 2 · amplitude — abre o que as posições pedem",
    "Fase 3 · sustentação — conforto e duração, não espacate",
  ],
};

/** Horizonte honesto. Números redondos e o que NÃO é necessário — sem isso ela
 *  mede o progresso contra uma meta que nunca fez parte do objetivo. */
export const HORIZONTE_FLEX = {
  primeiraMudancaSemanas: [4, 6] as const,
  posicoesQueElaQuerMeses: [3, 6] as const,
  espacateFrontalMeses: [12, 24] as const,
  espacateLateral:
    "Depende do formato do acetábulo. Parte das pessoas nunca chega — por anatomia, não por esforço.",
  espacateNecessario: false,
} as const;

export function flexDoDia(momento: MomentoFlex, praticasFeitas: number): FlexDoDia {
  const n = Number.isFinite(praticasFeitas) && praticasFeitas > 0 ? Math.floor(praticasFeitas) : 0;
  const trilha = SEQUENCIAS_FLEX[momento];
  const fase = n < ATE_FASE_2 ? 0 : n < ATE_FASE_3 ? 1 : 2;
  return { sequenceId: trilha[fase], etapa: ETAPA[momento][fase] };
}
