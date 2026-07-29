// src/lib/today-routine.ts
// Define o dia como blocos por horário. Módulo puro — Today.tsx só apresenta.
// Itens com estado próprio (skincare/treino) usam control:"link" + linkKey e
// NÃO são marcados aqui; refletem o estado do módulo correspondente.

export type RoutineBlock = "manha" | "trabalho" | "tarde" | "noite" | "semana";
export type RoutineControl = "check" | "water" | "walk" | "breaks" | "invert" | "link" | "recipe" | "skincare";
export type RoutineLinkKey = "skincareMorning" | "skincareNight" | "workout";
export type RoutineMealType = "cafe" | "almoco" | "lanche" | "jantar";

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
  mealType?: RoutineMealType; // itens control:"recipe" abrem a receita dessa refeição
  skincareTime?: "morning" | "evening"; // itens control:"skincare" abrem o roteiro do período
  /** Horário padrão "HH:MM". A usuária ajusta em /hoje/horarios; o ajuste fica
   *  no setting `routineTimes` e vence este valor (ver `routine-times.ts`).
   *  Itens sem horário (água, micro-pausas) são de dia inteiro, de propósito. */
  defaultTime?: string;
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

const BARBA: RoutineItem = {
  id: "barba", block: "manha", label: "Barba", subtitle: "Rente, no sentido do pelo · depois o corretivo alaranjado se precisar", to: "/beleza/depilacao", defaultTime: "06:15",
};

/** Barba é dia sim, dia não. `dayOfYear` decide a alternância — vem de quem
 *  chama `buildDayRoutine`, então a função continua pura (nada de `new Date()` aqui). */
function isBarbaDay(dayOfYear: number): boolean {
  return dayOfYear % 2 === 0;
}

function manhaItems(dayOfYear: number): RoutineItem[] {
  const items: RoutineItem[] = [
    { id: "alongamento-manha", block: "manha", label: "Alongamento manhã · 15 min", subtitle: "Desperta quadril e coluna", to: "/treino/movimento/mobilidade-pelvica-matinal", defaultTime: "06:00" },
  ];
  if (isBarbaDay(dayOfYear)) items.push(BARBA);
  items.push(
    { id: "skincare-manha", block: "manha", label: "Skincare manhã", subtitle: "Toque pro roteiro guiado", control: "skincare", linkKey: "skincareMorning", skincareTime: "morning", defaultTime: "06:25" },
    { id: "cafe-marmita", block: "manha", label: "Café + whey · montar marmita", subtitle: "Toque pra ver a receita · não esquece a marmita", control: "recipe", mealType: "cafe", defaultTime: "06:35" },
    { id: "sol-manha", block: "manha", label: "Sol · 10–15 min", subtitle: "Braços e pernas — ataca o cansaço/vitamina D", note: "Rosto com protetor. No fim de semana ou no almoço, sem pressa.", optional: true },
  );
  return items;
}

const ALMOCO: RoutineItem = { id: "almoco", block: "trabalho", label: "Almoço", subtitle: "Toque pra ver a receita", control: "recipe", mealType: "almoco", defaultTime: "12:00" };
const AGUA: RoutineItem = { id: "agua", block: "trabalho", label: "Água", control: "water" };
const MICRO_PAUSAS: RoutineItem = { id: "micro-pausas", block: "trabalho", label: "Micro-pausas de postura", subtitle: "Discretas, ao longo do dia", control: "breaks" };

const LANCHE: RoutineItem = { id: "lanche-saida", block: "tarde", label: "Lanche pré-treino", subtitle: "Toque pra ver a receita · come ainda no trabalho, pra aguentar os cães e o treino", control: "recipe", mealType: "lanche", defaultTime: "16:00" };

function tardeSemana(): RoutineItem[] {
  return [
    { id: "caes", block: "tarde", label: "Passear com os cães · 1h", subtitle: "Conta pros seus passos do dia", control: "invert", defaultTime: "16:40" },
    { id: "treino", block: "tarde", label: "Treino do dia", subtitle: "+ cardio zona 2 no fim", to: "/treino", control: "link", linkKey: "workout", defaultTime: "17:45" },
  ];
}

const NOITE: RoutineItem[] = [
  { id: "jantar", block: "noite", label: "Jantar (pós-treino)", subtitle: "Toque pra ver a receita", control: "recipe", mealType: "jantar", defaultTime: "19:00" },
  { id: "skincare-noite", block: "noite", label: "Skincare noite", subtitle: "Rosto + clareamentos num roteiro só", control: "skincare", linkKey: "skincareNight", skincareTime: "evening", defaultTime: "20:00" },
  { id: "voz", block: "noite", label: "Voz · 5 min", subtitle: "Só melhora com frequência — igual à mobilidade", to: "/beleza/voz", defaultTime: "21:00" },
  { id: "alongamento-noite", block: "noite", label: "Alongamento noite · 10 min", subtitle: "Flexibilidade profunda de quadril (+ intimidade)", to: "/treino/movimento/flexibilidade-intima", defaultTime: "21:30" },
  { id: "seu-tempo", block: "noite", label: "Seu tempo: desenho + leitura", subtitle: "Descanso protegido — vale pro humor e pro sono", optional: true },
  { id: "diario", block: "noite", label: "Diário · como foi o dia?", to: "/trilha/diario" },
  { id: "dormir", block: "noite", label: "Dormir", subtitle: "Alvo pra fechar 7h30 — sono curto sobe o cortisol e guarda gordura na barriga", defaultTime: "22:30" },
];

function buildBlocks(dayOfWeek: number, dayOfYear: number): RoutineBlockGroup[] {
  const isSaturday = dayOfWeek === 6;
  const isSunday = dayOfWeek === 0;

  const tarde: RoutineBlockGroup = isSaturday
    ? {
        id: "tarde", label: "Fim de tarde", items: [
          LANCHE,
          { id: "danca-sabado", block: "tarde", label: "Dança / rebolado", subtitle: "A sessão divertida da semana", to: "/treino/movimento" },
          { id: "caminhada-sabado", block: "tarde", label: "Caminhada leve", control: "walk" },
        ],
      }
    : isSunday
      ? { id: "tarde", label: "Fim de tarde", items: [
          LANCHE,
          { id: "descanso-domingo", block: "tarde", label: "Descanso", subtitle: "Dia livre — se quiser, só uma caminhada" },
        ] }
      : { id: "tarde", label: "Saída", timeHint: "a partir das 16h", items: [LANCHE, ...tardeSemana()] };

  const trabalho: RoutineBlockGroup = isSaturday || isSunday
    ? { id: "trabalho", label: "Durante o dia", items: [ALMOCO, AGUA] }
    : { id: "trabalho", label: "No trabalho", timeHint: "7h–16h", items: [ALMOCO, MICRO_PAUSAS, AGUA] };

  const semanaItems: RoutineItem[] = [];
  if (!isSaturday && !isSunday) semanaItems.push({ id: "lembrete-sabado-danca", block: "semana", label: "Sábado · dança / rebolado", to: "/treino/movimento" });
  if (!isSunday) semanaItems.push({ id: "lembrete-domingo-marmita", block: "semana", label: "Domingo · marmita da semana", to: "/trilha/alimentacao" });
  if (isSunday) {
    semanaItems.unshift({ id: "marmita-domingo", block: "semana", label: "Marmita da semana", subtitle: "Frango + ovos + feijão + macaxeira + legumes", to: "/trilha/alimentacao" });
    // Vitamina D semanal: tomada no domingo junto da marmita (refeição com gordura).
    semanaItems.push({ id: "vitamina-d", block: "semana", label: "Vitamina D · 10.000 UI (semanal)", subtitle: "Toma junto de uma refeição com gordura — resolve o cansaço" });
  }

  return [
    { id: "manha", label: "Manhã", timeHint: "a partir das 6h", items: manhaItems(dayOfYear) },
    trabalho,
    tarde,
    { id: "noite", label: "Noite", timeHint: "a partir das 19h", items: NOITE },
    { id: "semana", label: "Esta semana", items: semanaItems },
  ];
}

/** `dayOfYear` decide itens em dias alternados (ex.: barba). Quem chama calcula
 *  o dia do ano — a função em si continua pura e determinística. */
export function buildDayRoutine(dayOfWeek: number, dayOfYear: number): DayRoutine {
  return { dayOfWeek, blocks: buildBlocks(dayOfWeek, dayOfYear) };
}
