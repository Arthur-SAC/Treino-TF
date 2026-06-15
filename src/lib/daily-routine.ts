// Classificação dos cuidados de beleza por hora do dia (manhã/noite) e a
// lista de práticas de presença. Módulo puro — Today.tsx só apresenta.
export type TimeOfDay = "morning" | "night";

export interface CareItem {
  id: string;
  label: string;
  to: string; // rota existente em /beleza/...
  time: TimeOfDay;
  cadence?: string; // nota de cadência; ausente = diário/leve
  optional?: boolean;
}

// Skincare manhã/noite NÃO entram aqui (têm estado "feito" próprio em Today).
export const CARE_ITEMS: CareItem[] = [
  { id: "cabelo-finalizacao", label: "Cabelo — finalização do dia", to: "/beleza/pele-cabelo/haircare", time: "morning" },
  { id: "maquiagem", label: "Maquiagem (se for sair)", to: "/beleza/maquiagem", time: "morning", optional: true },
  { id: "estilo-look", label: "Look do dia", to: "/beleza/estilo/looks", time: "morning", optional: true },
  { id: "clareamento", label: "Clareamento", to: "/beleza/pele-cabelo/clareamento", time: "night", cadence: "nos dias da onda" },
  { id: "cabelo-tratamento", label: "Cabelo — tratamento do cronograma", to: "/beleza/pele-cabelo/haircare", time: "night", cadence: "cronograma semanal" },
  { id: "unhas", label: "Unhas — lixar", to: "/beleza/pele-cabelo/unhas", time: "night", cadence: "a cada 3–4 dias" },
  { id: "depilacao", label: "Depilação", to: "/beleza/depilacao", time: "night", cadence: "na cadência" },
];

export function careItemsFor(time: TimeOfDay): CareItem[] {
  return CARE_ITEMS.filter((c) => c.time === time);
}

export interface PresenceItem {
  id: string;
  label: string;
  to: string;
}

export const PRESENCE_ITEMS: PresenceItem[] = [
  { id: "postura-silhueta-diaria", label: "Postura & silhueta", to: "/treino/movimento/postura-silhueta-diaria" },
  { id: "corporal-caminhada", label: "Caminhada feminina", to: "/treino/movimento/corporal-caminhada" },
  { id: "sensual-andar-gingado", label: "Andar com gingado", to: "/treino/movimento/sensual-andar-gingado" },
  { id: "soltura-tronco-quadril", label: "Soltura de tronco e quadril", to: "/treino/movimento/soltura-tronco-quadril" },
  { id: "intimidade-flex-passiva", label: "Flexibilidade passiva a dois", to: "/treino/movimento/intimidade-flex-passiva" },
  { id: "intimidade-grinding", label: "Grinding pélvico", to: "/treino/movimento/intimidade-grinding" },
  { id: "intimidade-cavalgar", label: "Cavalgar com controle", to: "/treino/movimento/intimidade-cavalgar" },
];

export function presenceSuggestionForDay(dayOfWeek: number): PresenceItem {
  return PRESENCE_ITEMS[dayOfWeek % PRESENCE_ITEMS.length];
}
