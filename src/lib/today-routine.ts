// src/lib/today-routine.ts
// Define o dia como blocos por horário. Módulo puro — Today.tsx só apresenta.
// Itens com estado próprio (skincare/treino) usam control:"link" + linkKey e
// NÃO são marcados aqui; refletem o estado do módulo correspondente.

export type RoutineBlock = "manha" | "trabalho" | "tarde" | "noite" | "semana";
export type RoutineControl = "check" | "water" | "walk" | "breaks" | "invert" | "link";
export type RoutineLinkKey = "skincareMorning" | "skincareNight" | "workout";

export interface RoutineItem {
  id: string;
  block: RoutineBlock;
  label: string;
  subtitle?: string;
  note?: string;
  to?: string;
  control?: RoutineControl;
  optional?: boolean;
  linkKey?: RoutineLinkKey;
}

export interface RoutineBlockGroup {
  id: RoutineBlock;
  label: string;
  timeHint?: string;
  items: RoutineItem[];
}

export interface DayRoutine {
  dayOfWeek: number;
  blocks: RoutineBlockGroup[];
}

const MANHA: RoutineItem[] = [
  { id: "sol-manha", block: "manha", label: "Sol · 10–15 min", subtitle: "Braços e pernas — ataca o cansaço/vitamina D", note: "Rosto com protetor. No fim de semana ou no almoço, sem pressa.", optional: true },
  { id: "alongamento-manha", block: "manha", label: "Alongamento manhã · 15 min", subtitle: "Desperta quadril e coluna", to: "/treino/movimento" },
  { id: "skincare-manha", block: "manha", label: "Skincare manhã", to: "/beleza/pele-cabelo/skincare", control: "link", linkKey: "skincareMorning" },
  { id: "cafe-marmita", block: "manha", label: "Café + whey · montar marmita", subtitle: "Tapioca/cuscuz + ovo · não esquece a marmita" },
];

const TRABALHO: RoutineItem[] = [
  { id: "almoco", block: "trabalho", label: "Almoço", subtitle: "Proteína + feijão/macaxeira + legume", to: "/refeicoes-hoje" },
  { id: "micro-pausas", block: "trabalho", label: "Micro-pausas de postura", subtitle: "Discretas, ao longo do dia", control: "breaks" },
  { id: "agua", block: "trabalho", label: "Água", control: "water" },
];

function tardeSemana(): RoutineItem[] {
  return [
    { id: "lanche-saida", block: "tarde", label: "Lanche da saída (pré-treino)", subtitle: "Banana + ovos ou tapioca+ovo — pra chegar no treino com energia", to: "/refeicoes-hoje" },
    { id: "caes", block: "tarde", label: "Passear com os cães · 1h", subtitle: "Dá pra fazer antes ou depois do treino", control: "invert" },
    { id: "treino", block: "tarde", label: "Treino do dia", subtitle: "+ cardio zona 2 no fim", to: "/treino", control: "link", linkKey: "workout" },
  ];
}

const NOITE: RoutineItem[] = [
  { id: "skincare-noite", block: "noite", label: "Skincare noite", subtitle: "Rosto + clareamento axila/virilha + hidratante corpo", to: "/beleza/pele-cabelo/skincare", control: "link", linkKey: "skincareNight" },
  { id: "alongamento-noite", block: "noite", label: "Alongamento noite · 10 min", subtitle: "Flexibilidade profunda + quadril e assoalho pélvico", to: "/treino/movimento" },
  { id: "seu-tempo", block: "noite", label: "Seu tempo: desenho + leitura", subtitle: "Descanso protegido — vale pro humor e pro sono", optional: true },
  { id: "diario", block: "noite", label: "Diário · como foi o dia?", to: "/trilha/diario" },
];

function buildBlocks(dayOfWeek: number): RoutineBlockGroup[] {
  const isSaturday = dayOfWeek === 6;
  const isSunday = dayOfWeek === 0;

  const tarde: RoutineBlockGroup = isSaturday
    ? {
        id: "tarde", label: "Fim de tarde", items: [
          { id: "danca-sabado", block: "tarde", label: "Dança / rebolado", subtitle: "A sessão divertida da semana", to: "/treino/movimento" },
          { id: "caminhada-sabado", block: "tarde", label: "Caminhada leve", control: "walk" },
        ],
      }
    : isSunday
      ? { id: "tarde", label: "Fim de tarde", items: [
          { id: "descanso-domingo", block: "tarde", label: "Descanso", subtitle: "Dia livre — se quiser, só uma caminhada" },
        ] }
      : { id: "tarde", label: "Fim de tarde", timeHint: "16h30", items: tardeSemana() };

  const semanaItems: RoutineItem[] = [
    { id: "exame-vitd", block: "semana", label: "Marcar exame: vitamina D · ferro · B12", subtitle: "Tem no SUS · resolve o cansaço na raiz", to: "/trilha" },
  ];
  if (!isSaturday && !isSunday) semanaItems.push({ id: "lembrete-sabado-danca", block: "semana", label: "Sábado · dança / rebolado", to: "/treino/movimento" });
  if (!isSunday) semanaItems.push({ id: "lembrete-domingo-marmita", block: "semana", label: "Domingo · marmita da semana", to: "/trilha/alimentacao" });
  if (isSunday) semanaItems.unshift({ id: "marmita-domingo", block: "semana", label: "Marmita da semana", subtitle: "Frango + ovos + feijão + macaxeira + legumes", to: "/trilha/alimentacao" });

  return [
    { id: "manha", label: "Manhã", timeHint: "~6h", items: MANHA },
    { id: "trabalho", label: "No trabalho", timeHint: "7h–16h", items: TRABALHO },
    tarde,
    { id: "noite", label: "Noite", timeHint: "~20h", items: NOITE },
    { id: "semana", label: "Esta semana", items: semanaItems },
  ];
}

export function buildDayRoutine(dayOfWeek: number): DayRoutine {
  return { dayOfWeek, blocks: buildBlocks(dayOfWeek) };
}
