export interface FocusState {
  cycleAdvice: { recommend: boolean; reason: string } | null;
  waistGuardTriggered: boolean;
  workoutToday: { done: boolean; name: string; to: string } | null;
  daysSinceMeasurement: number | null;
  daysSincePhoto: number | null;
}

export interface Focus {
  title: string;
  subtitle: string;
  to: string;
}

const MEASUREMENT_OVERDUE_DAYS = 28;
const PHOTO_OVERDUE_DAYS = 14;

export function computeFocus(s: FocusState): Focus | null {
  if (s.waistGuardTriggered) {
    return {
      title: "Segure a cintura",
      subtitle: "Sua cintura subiu no superávit — veja a estratégia de silhueta",
      to: "/corpo/silhueta",
    };
  }
  if (s.cycleAdvice?.recommend) {
    return { title: "Hora de avançar o ciclo", subtitle: s.cycleAdvice.reason, to: "/treino/ciclos" };
  }
  if (s.workoutToday && !s.workoutToday.done) {
    return { title: `Foco: ${s.workoutToday.name}`, subtitle: "Seu treino prioritário de hoje", to: s.workoutToday.to };
  }
  if (s.daysSinceMeasurement !== null && s.daysSinceMeasurement > MEASUREMENT_OVERDUE_DAYS) {
    return {
      title: "Hora de medir",
      subtitle: `Última medida há ${s.daysSinceMeasurement} dias — o app precisa de dados pra te orientar`,
      to: "/corpo/medidas",
    };
  }
  if (s.daysSincePhoto !== null && s.daysSincePhoto > PHOTO_OVERDUE_DAYS) {
    return { title: "Hora de tirar fotos", subtitle: `Última foto há ${s.daysSincePhoto} dias`, to: "/corpo/fotos" };
  }
  return null;
}

export function currentBlock(hour: number): "manha" | "trabalho" | "tarde" | "noite" {
  if (hour < 11) return "manha";
  if (hour < 16) return "trabalho";
  if (hour < 19) return "tarde";
  return "noite";
}

export function timeBlockFocus(hour: number, dayOfWeek: number): { title: string; subtitle: string; to: string } {
  const block = currentBlock(hour);
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (block === "manha") {
    return { title: "Comece leve", subtitle: "Alongamento, skincare e café — desperta o corpo", to: "/treino/movimento" };
  }
  if (block === "trabalho") {
    if (dayOfWeek === 6) return { title: "Durante o dia", subtitle: "Almoço e água — guarda energia pra dança mais tarde", to: "/refeicoes-hoje" };
    if (dayOfWeek === 0) return { title: "Durante o dia", subtitle: "Almoço, água e a marmita da semana quando bater vontade", to: "/refeicoes-hoje" };
    return { title: "No trabalho", subtitle: "Bebe água e faz as micro-pausas de postura", to: "/refeicoes-hoje" };
  }
  if (block === "tarde") {
    if (dayOfWeek === 6) return { title: "Hora da dança", subtitle: "A sessão divertida da semana", to: "/treino/movimento" };
    if (dayOfWeek === 0) return { title: "Descanso", subtitle: "Dia livre — só o passeio com os cães, no seu ritmo", to: "/treino/movimento" };
    return { title: "Agora: lanche da saída → treino", subtitle: "Come o pré-treino, passeia com os cães e cai no treino", to: "/treino" };
  }
  return { title: "Antes de dormir", subtitle: isWeekend ? "Skincare, alongamento e seu tempo" : "Skincare, alongamento noite e seu tempo (desenho/leitura)", to: "/beleza/pele-cabelo/skincare" };
}
