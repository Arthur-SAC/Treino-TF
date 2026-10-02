// Classificação dos cuidados de beleza por hora do dia (manhã/noite). A lista
// antiga de presença saiu: a trilha de postura (postura-progression.ts) a
// substituiu. Módulo puro — Today.tsx só apresenta.
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
