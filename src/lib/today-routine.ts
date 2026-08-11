// src/lib/today-routine.ts
// Define o dia como blocos por horário. Módulo puro — Today.tsx só apresenta.
// Itens com estado próprio (skincare/treino) usam control:"link" + linkKey e
// NÃO são marcados aqui; refletem o estado do módulo correspondente.

export type RoutineBlock = "manha" | "trabalho" | "tarde" | "noite" | "semana";
export type RoutineControl = "check" | "water" | "walk" | "breaks" | "link" | "recipe" | "skincare";
export type RoutineLinkKey = "skincareMorning" | "skincareNight" | "workout" | "pelvic";
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
// Assoalho pélvico como micro-dose diária, no bloco do dia (existe nos 7 dias).
// É invisível — dá pra fazer sentada na mesa — e o que constrói é frequência,
// não duração. O `to` é resolvido em Today.tsx pela progressão (ver
// `pelvic-progression.ts`): identificação -> Kegel clássico -> variações.
const ASSOALHO: RoutineItem = { id: "assoalho-pelvico", block: "trabalho", label: "Assoalho pélvico · 5 min", subtitle: "Invisível, dá pra fazer sentada — firmeza e controle", to: "/treino/movimento", linkKey: "pelvic", defaultTime: "10:00" };
const MICRO_PAUSAS: RoutineItem = { id: "micro-pausas", block: "trabalho", label: "Micro-pausas de postura", subtitle: "Discretas, ao longo do dia", control: "breaks" };

type TipoDeDia = "semana" | "sabado" | "domingo";

/** O lanche das 16h existe nos sete dias, mas o motivo dele muda: em dia de
 *  semana é a janela pré-treino comida ainda no trabalho; no sábado é antes da
 *  dança; no domingo não há nem trabalho nem treino. Mesmo `id` sempre — o
 *  check do dia e o horário ajustado seguem o item, não a copy. */
function lanche(dia: TipoDeDia): RoutineItem {
  const base = {
    id: "lanche-saida",
    block: "tarde",
    control: "recipe",
    mealType: "lanche",
    // Na semana o lanche antecede a caminhada de 5 km das 16h — comido na
    // mesa, meia hora antes, pra não sair de casa 4h em jejum e prestes a
    // andar. Fim de semana não tem essa pressa, então mantém as 16h.
    defaultTime: dia === "semana" ? "15:30" : "16:00",
  } as const;
  if (dia === "sabado") {
    return { ...base, label: "Lanche pré-dança", subtitle: "Toque pra ver a receita · come antes de sair, pra não dançar nem passear em jejum" };
  }
  if (dia === "domingo") {
    return { ...base, label: "Lanche da tarde", subtitle: "Toque pra ver a receita · segura a fome até o jantar, mesmo num dia parado" };
  }
  return { ...base, label: "Lanche pré-treino", subtitle: "Toque pra ver a receita · come ainda no trabalho, meia hora antes da caminhada de 5 km — depois vêm os cães e o treino" };
}

/** Passeio com os cães. Acontece nos sete dias da semana — e no fim de semana
 *  é o movimento do dia inteiro, já que não há treino. `control: "walk"` dá o
 *  botão de +10 min, pra ela creditar movimento avulso que não veio de nenhum
 *  item da lista (ex.: uma volta extra, um mandado a pé). Com a meta em 120
 *  min (ver settings-helpers.ts), o passeio de 60 min sozinho NÃO fecha a
 *  conta — e não fechar é o ponto: no fim de semana o medidor mostrar 60/120
 *  é informação verdadeira sobre um dia mais parado, não falha.
 *
 *  Dia de semana e fim de semana usam IDS DIFERENTES (`caes` × `caes-fds`) de
 *  propósito: o passeio de semana é às 17:15, mas no sábado precisa ser às
 *  18:15 (depois da dança das 17:30, pra não colidir com ela). Com um id só
 *  pros sete dias, a tela /hoje/horarios deduplicava e mostrava uma linha
 *  única — ajustar aquele horário reescrevia o override pros sete dias,
 *  inclusive o sábado, e o passeio de 1h voltava a cair em cima da dança (o
 *  bug que o commit b8c6b30 tinha acabado de corrigir). `caes` continua com o
 *  mesmo id de sempre — preserva o histórico de `routineChecks` de quem já
 *  marcou o passeio de semana; o id novo (`caes-fds`) é só do fim de semana.
 *
 *  Domingo passa a usar `caes-fds` também, no mesmo 18:15 do sábado: como os
 *  dois compartilham id (e portanto o mesmo ajuste em /hoje/horarios), dar a
 *  eles o mesmo horário padrão evita que a tela de ajuste mostre 18:15
 *  enquanto o domingo de verdade ainda usasse 17:15 — não há dança no domingo
 *  pra colidir, então a mudança de horário não tem custo. */
function caes(dia: TipoDeDia): RoutineItem {
  const fimDeSemana = dia === "sabado" || dia === "domingo";
  const base = {
    id: fimDeSemana ? "caes-fds" : "caes",
    block: "tarde",
    label: fimDeSemana ? "Passear com os cães · 1h (fim de semana)" : "Passear com os cães · 1h",
    control: "walk",
    defaultTime: fimDeSemana ? "18:15" : "17:15",
  } as const;
  if (dia === "sabado") {
    return { ...base, subtitle: "NEAT — depois da dança, pra soltar; é ele que fecha o movimento do dia" };
  }
  if (dia === "domingo") {
    return { ...base, subtitle: "NEAT — eles não sabem que é domingo; hoje é daqui que vem quase todo o seu movimento" };
  }
  return { ...base, subtitle: "NEAT — lento, com paradas; é o movimento fácil que soma em cima da caminhada das 16h" };
}

/** A caminhada de 5 km do trabalho para casa, todos os dias úteis. São ~370
 *  kcal/dia que o app não contava, e é ela que empurra todo o resto da tarde.
 *  `to` aponta para o exercício de zona 2 porque a prescrição (tempo, ritmo,
 *  teste da conversa) saiu do fim do treino e passou a valer aqui — ver o
 *  comentário no topo de cycles-seed.ts. */
const CAMINHADA_TRABALHO: RoutineItem = {
  id: "caminhada-trabalho",
  block: "tarde",
  label: "Caminhada do trabalho para casa · 5 km",
  subtitle: "~1h em ritmo de zona 2 — ofegante, mas ainda dá pra conversar em frases curtas",
  control: "walk",
  to: "/treino/exercicio/cardio-zona2",
  defaultTime: "16:00",
};

function tardeSemana(): RoutineItem[] {
  return [
    CAMINHADA_TRABALHO,
    caes("semana"),
    { id: "treino", block: "tarde", label: "Treino do dia", subtitle: "Sem cardio no fim — a caminhada das 16h já cobriu", to: "/treino", control: "link", linkKey: "workout", defaultTime: "18:15" },
  ];
}

const NOITE: RoutineItem[] = [
  { id: "jantar", block: "noite", label: "Jantar (pós-treino)", subtitle: "Toque para ver a receita — deixe pronto de manhã, decidir com fome às 20h nunca dá certo", control: "recipe", mealType: "jantar", defaultTime: "19:30" },
  { id: "skincare-noite", block: "noite", label: "Skincare noite", subtitle: "Rosto + clareamentos num roteiro só", control: "skincare", linkKey: "skincareNight", skincareTime: "evening", defaultTime: "20:00" },
  { id: "voz", block: "noite", label: "Voz · 5 min", subtitle: "Só melhora com frequência — igual à mobilidade", to: "/beleza/voz", defaultTime: "21:00" },
  { id: "alongamento-noite", block: "noite", label: "Alongamento noite · 10 min", subtitle: "Flexibilidade profunda de quadril (+ intimidade)", to: "/treino/movimento/flexibilidade-intima", defaultTime: "21:30" },
  { id: "seu-tempo", block: "noite", label: "Seu tempo: desenho + leitura", subtitle: "Descanso protegido — vale pro humor e pro sono", optional: true },
  { id: "diario", block: "noite", label: "Diário · como foi o dia?", to: "/trilha/diario" },
  // O alvo NÃO fica escrito aqui: quem monta o subtítulo é a tela Hoje, a
  // partir do horário do próprio item (que a usuária ajusta em /hoje/horarios).
  { id: "dormir", block: "noite", label: "Dormir", subtitle: "Marcar registra a hora real que você deitou — sono curto sobe o cortisol e guarda gordura na barriga", defaultTime: "22:30" },
];

function buildBlocks(dayOfWeek: number, dayOfYear: number): RoutineBlockGroup[] {
  const isSaturday = dayOfWeek === 6;
  const isSunday = dayOfWeek === 0;

  const tarde: RoutineBlockGroup = isSaturday
    ? {
        // O passeio (id `caes-fds`, 18:15) já nasce depois da dança das
        // 17h30 — sem precisar de override na hora de montar o bloco, e sem
        // colocar dois itens de movimento somando na mesma meta.
        id: "tarde", label: "Fim de tarde", items: [
          lanche("sabado"),
          { id: "danca-sabado", block: "tarde", label: "Dança / rebolado", subtitle: "A sessão divertida da semana", to: "/treino/movimento", defaultTime: "17:30" },
          caes("sabado"),
        ],
      }
    : isSunday
      ? { id: "tarde", label: "Fim de tarde", items: [
          lanche("domingo"),
          caes("domingo"),
          // Sem control:"walk" de propósito: o passeio logo acima já mostra o
          // contador de movimento do dia, e dois itens repetindo "X / 120 min"
          // fariam parecer que o domingo pede duas caminhadas — não pede, só
          // há o passeio.
          //
          // Em dia de semana é o INVERSO: `tardeSemana()` dá control:"walk" a
          // DOIS itens de propósito (`caminhada-trabalho` e `caes`), porque
          // ali são duas caminhadas reais e distintas (5 km do trabalho +
          // passeio com os cães) e as duas devem creditar — daí a meta padrão
          // de `walkGoalMin` ter subido para 120 (ver settings-helpers.ts).
          { id: "descanso-domingo", block: "tarde", label: "Descanso", subtitle: "Dia livre — o passeio já conta; o resto do dia é seu" },
        ] }
      : { id: "tarde", label: "Saída", timeHint: "a partir das 15h30", items: [lanche("semana"), ...tardeSemana()] };

  const trabalho: RoutineBlockGroup = isSaturday || isSunday
    ? { id: "trabalho", label: "Durante o dia", items: [ASSOALHO, ALMOCO, AGUA] }
    : { id: "trabalho", label: "No trabalho", timeHint: "7h–16h", items: [ASSOALHO, ALMOCO, MICRO_PAUSAS, AGUA] };

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
