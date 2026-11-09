// src/lib/desbloqueios.ts
// Progressão por desbloqueio (spec 2026-11-09, seção 8). Módulo puro — sem
// db, sem Date. Quem grava `ja` (setting `desbloqueios`) e quem desenha é a tela.
//
// Cada mecânica aparece cedo numa versão mínima e cresce a cada patamar de
// sequência. A tabela é uma lista de QUEM TRANCA: item fora dela nunca muda.
// Save point: o desbloqueado nunca volta a trancar; depois de zerar, o próximo
// exige o patamar dele de novo, contando do zero.
import type { DayRoutine, RoutineItem } from "./today-routine";
import { resolveRoutineTime, type RoutineTimeOverrides } from "./routine-times";
import { flexDoDia } from "./flex-progression";
import { SEQUENCES } from "../data/sequences-seed";

export type DesbloqueioId = "manha-completa" | "assoalho-1" | "skincare-2" | "sentar" | "danca"
  | "alongamento-noite" | "assoalho-2" | "voz-1" | "skincare-3" | "postura" | "voz-2";

export interface Desbloqueio {
  id: DesbloqueioId;
  patamar: number;
  titulo: string;
  entra: string;
  praQue: string;
  minutos: number;
  horario: string | null;
}

/** id -> ISO da data em que abriu. */
export type Desbloqueados = Readonly<Record<string, string>>;

export const SEQ_MANHA_CURTA = "manha-curta-vacuum";
const SEQ_ASSOALHO_1 = "pelvic-identificacao";
const VOZ_1 = "voz-aquecimento-labial-lingua";
const VOZ_1_MIN = 2; // durationMin de VOZ_1 em voice-seed.ts

function duracao(id: string): number {
  const s = SEQUENCES.find((x) => x.id === id);
  if (!s) throw new Error(`sequência ${id} não existe no seed`);
  return s.durationMin;
}

// Horários = `defaultTime` do modo caminhada em today-routine.ts. Minutos =
// durações do seed; skincare completo e assoalho nível 2 variam com o dia, e o
// número é o típico.
export const DESBLOQUEIOS: readonly Desbloqueio[] = [
  {
    id: "manha-completa", patamar: 5, titulo: "Alongamento da manhã completo",
    entra: "O alongamento das 6h volta inteiro: quadril, coluna e o vacuum, seguindo a trilha de fases.",
    praQue: "Tecido só cede com tempo na posição; os 2 minutos pegaram o hábito, agora é o alongamento que abre o quadril.",
    minutos: duracao("mobilidade-pelvica-matinal"), horario: "06:00",
  },
  {
    id: "assoalho-1", patamar: 5, titulo: "Assoalho pélvico nível 1",
    entra: "À noite, às 21h20, entra a identificação: achar o músculo do assoalho, deitada.",
    praQue: "Sem achar o músculo certo, todo exercício seguinte aperta barriga, bumbum ou coxa no lugar dele.",
    minutos: duracao(SEQ_ASSOALHO_1), horario: "21:20",
  },
  {
    id: "skincare-2", patamar: 10, titulo: "Skincare nível 2",
    entra: "À noite entra gel de limpeza no rosto e depois hidratante.",
    praQue: "Tira o protetor e o suor do dia; rosto limpo à noite é o que segura espinha e mancha.",
    minutos: 3, horario: "20:30",
  },
  {
    id: "sentar", patamar: 10, titulo: "Dica de sentar",
    entra: "Cada micro-pausa do trabalho passa a trazer uma dica de como sentar na cadeira.",
    praQue: "Sentar se treina onde você passa 9 horas por dia; uma dica curta repetida vira jeito de sentar sem esforço.",
    minutos: 1, horario: null,
  },
  {
    id: "danca", patamar: 10, titulo: "Dança de sábado",
    entra: "No sábado à tarde entra a sessão de dança e rebolado, antes do passeio com os cães.",
    praQue: "É a sessão divertida da semana, e constrói o fôlego de lombar, quadril e glúteo que o rebolado pede.",
    minutos: duracao("rebolado-resistencia-1"), horario: "17:30",
  },
  {
    id: "alongamento-noite", patamar: 15, titulo: "Alongamento da noite",
    entra: "Fecha a noite um alongamento de quadril profundo, com o nivelamento da pelve.",
    praQue: "À noite o corpo está morno e o flexor passou o dia sentado: é quando o quadril mais abre.",
    minutos: duracao("flexibilidade-intima"), horario: "21:30",
  },
  {
    id: "assoalho-2", patamar: 15, titulo: "Assoalho pélvico nível 2",
    entra: "O assoalho deixa de ser só identificação e segue a progressão: soltura, contração e variações.",
    praQue: "Contrair e soltar com controle é o que o treino constrói; a soltura é metade dele.",
    minutos: 5, horario: "21:20",
  },
  {
    id: "voz-1", patamar: 15, titulo: "Voz nível 1",
    entra: "À noite entra o aquecimento de lábios e língua.",
    praQue: "Voz só melhora com frequência, e o aquecimento solta a articulação sem cansar a garganta.",
    minutos: VOZ_1_MIN, horario: "21:00",
  },
  {
    id: "skincare-3", patamar: 20, titulo: "Skincare completo",
    entra: "Manhã e noite viram o roteiro completo: limpeza, hidratante, protetor e os clareamentos de manchas e cicatrizes.",
    praQue: "Mancha e cicatriz só clareiam com meses de constância, e o protetor de manhã é o que impede de voltarem.",
    minutos: 15, horario: "20:30",
  },
  {
    id: "postura", patamar: 20, titulo: "Postura",
    entra: "À noite entra a postura: andar e 8 com o quadril, um por dia; o gingado vem depois.",
    praQue: "Tira o andar travado: passo curto e quadril solto viram o jeito normal de andar.",
    minutos: duracao("corporal-caminhada"), horario: "20:45",
  },
  {
    id: "voz-2", patamar: 25, titulo: "Voz completa",
    entra: "A voz passa do aquecimento pra sessão completa do dia.",
    praQue: "Com a articulação aquecida virando hábito, dá pra treinar tom e ressonância todo dia.",
    minutos: 5, horario: "21:00",
  },
];

const aberto = (ja: Desbloqueados, id: DesbloqueioId) => Object.prototype.hasOwnProperty.call(ja, id);

/** O que abre agora: patamar alcançado e ainda não desbloqueado. */
export function novosDesbloqueios(sequencia: number, ja: Desbloqueados): Desbloqueio[] {
  return DESBLOQUEIOS.filter((d) => d.patamar <= sequencia && !aberto(ja, d.id));
}

/** O primeiro ainda trancado, e quantos treinos faltam pro patamar dele. */
export function proximoDesbloqueio(sequencia: number, ja: Desbloqueados): { d: Desbloqueio; faltam: number } | null {
  const d = DESBLOQUEIOS.find((x) => !aberto(ja, x.id));
  return d ? { d, faltam: Math.max(0, d.patamar - sequencia) } : null;
}

function semChaves(i: RoutineItem, ...chaves: (keyof RoutineItem)[]): RoutineItem {
  const copia = { ...i };
  for (const k of chaves) delete copia[k];
  return copia;
}

/** O que cada id ausente esconde. Os presentes não tocam no item. */
function escondidos(ja: Desbloqueados): Set<string> {
  const s = new Set<string>();
  if (!aberto(ja, "assoalho-1")) s.add("assoalho-pelvico");
  if (!aberto(ja, "skincare-2")) s.add("skincare-noite");
  if (!aberto(ja, "danca")) { s.add("danca-sabado"); s.add("lembrete-sabado-danca"); }
  if (!aberto(ja, "alongamento-noite")) s.add("alongamento-noite");
  if (!aberto(ja, "voz-1")) s.add("voz");
  if (!aberto(ja, "postura")) s.add("postura");
  return s;
}

/** Ids de item do Hoje escondidos com estes desbloqueios. */
export function idsTrancados(ja: Desbloqueados): ReadonlySet<string> {
  return escondidos(ja);
}

function nivelDoItem(i: RoutineItem, ja: Desbloqueados): RoutineItem {
  switch (i.id) {
    case "alongamento-manha":
      if (aberto(ja, "manha-completa")) return i;
      return {
        ...semChaves(i, "linkKey"),
        label: `Alongamento manhã · ${duracao(SEQ_MANHA_CURTA)} min`,
        subtitle: "Curto pra pegar o hábito · inclui o vacuum",
        to: `/treino/movimento/${SEQ_MANHA_CURTA}`,
      };
    case "assoalho-pelvico":
      if (aberto(ja, "assoalho-2")) return i;
      return {
        ...semChaves(i, "linkKey"),
        label: `Assoalho pélvico · ${duracao(SEQ_ASSOALHO_1)} min`,
        subtitle: "Achar o músculo certo, deitada",
        to: `/treino/movimento/${SEQ_ASSOALHO_1}`,
      };
    case "skincare-noite":
      if (aberto(ja, "skincare-3")) return i;
      return {
        ...semChaves(i, "control", "linkKey", "skincareTime"),
        label: "Skincare noite · 3 min",
        subtitle: "Gel de limpeza no rosto, depois hidratante",
      };
    case "skincare-manha":
      if (aberto(ja, "skincare-3")) return i;
      return {
        ...semChaves(i, "control", "linkKey", "skincareTime"),
        label: "Protetor solar · 1 min",
        subtitle: "Rosto, orelhas e pescoço antes de sair",
      };
    case "voz":
      if (aberto(ja, "voz-2")) return i;
      return { ...i, label: `Voz · aquecimento ${VOZ_1_MIN} min`, to: `/beleza/voz/${VOZ_1}` };
    default:
      return i;
  }
}

/** O item do Hoje que cada desbloqueio põe (ou completa) no dia. `sentar` vive
 *  dentro das micro-pausas: não tem linha nem horário próprio. */
const ITEM_DO_DESBLOQUEIO: Record<DesbloqueioId, string | null> = {
  "manha-completa": "alongamento-manha",
  "assoalho-1": "assoalho-pelvico",
  "skincare-2": "skincare-noite",
  sentar: null,
  danca: "danca-sabado",
  "alongamento-noite": "alongamento-noite",
  "assoalho-2": "assoalho-pelvico",
  "voz-1": "voz",
  "skincare-3": "skincare-noite",
  postura: "postura",
  "voz-2": "voz",
};

/** Minutos e horário que a placa de desbloqueio mostra. Os da tabela valem só
 *  no modo caminhada e na fase 1 do alongamento; aqui vale o dia dela: o
 *  horário do item na rotina de hoje (montada com o modo dela, SEM o filtro de
 *  níveis) com os ajustes de /hoje/horarios, e os minutos da manhã completa
 *  pela fase atual da trilha. Item fora do dia (dança numa terça): o ajuste
 *  dela, senão o horário da tabela. */
export function tempoDoDesbloqueio(
  d: Desbloqueio,
  rotina: DayRoutine,
  horarios: RoutineTimeOverrides,
  praticasFlexManha: number,
): { minutos: number; horario: string | null } {
  const minutos = d.id === "manha-completa" ? duracao(flexDoDia("manha", praticasFlexManha).sequenceId) : d.minutos;
  const itemId = ITEM_DO_DESBLOQUEIO[d.id];
  if (itemId === null) return { minutos, horario: d.horario };
  const item = rotina.blocks.flatMap((b) => b.items).find((i) => i.id === itemId);
  const horario = (item ? resolveRoutineTime(item, horarios) : horarios[itemId]) ?? d.horario;
  return { minutos, horario };
}

/** A rotina do dia com o que está trancado fora e o que está no nível mínimo
 *  trocado pela versão mínima. Não muta a entrada. */
export function filtrarRotina(r: DayRoutine, ja: Desbloqueados): DayRoutine {
  const fora = escondidos(ja);
  return {
    ...r,
    blocks: r.blocks.map((b) => ({
      ...b,
      items: b.items.filter((i) => !fora.has(i.id)).map((i) => nivelDoItem(i, ja)),
    })),
  };
}
