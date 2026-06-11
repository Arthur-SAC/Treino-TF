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
