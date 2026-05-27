import type { Milestone } from "../lib/db";

function isoFromMonthsFromNow(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export const MILESTONES: Omit<Milestone, "id">[] = [
  {
    datePlanned: isoFromMonthsFromNow(0),
    title: "Buscar dermatologista pra acompanhar tratamentos de pele",
    category: "medico",
    notes: "Especialmente importante antes de usar ácidos potentes (glicólico, retinol) e clareadores na axila/íntima.",
  },
  {
    datePlanned: isoFromMonthsFromNow(0),
    title: "Buscar nutricionista pra calibrar plano alimentar",
    category: "medico",
    notes: "Plano atual é boas práticas gerais. Profissional ajusta pra você: composição corporal, ganho de glúteo direcionado.",
  },
  {
    datePlanned: isoFromMonthsFromNow(1),
    title: "Primeira foto de progresso pós-início do plano",
    category: "fisico",
    notes: "Frente / lado / costas em luz natural, mesma roupa próxima, mesmo horário. Pra comparar daqui 30 dias.",
  },
  {
    datePlanned: isoFromMonthsFromNow(3),
    title: "Re-avaliar relação cintura/quadril (WHR)",
    category: "fisico",
    notes: "Meta: cintura reduzir 1-2cm + quadril aumentar 1-2cm com treino de glúteo.",
  },
  {
    datePlanned: isoFromMonthsFromNow(6),
    title: "Marco visual: pixie cacheado formato definido",
    category: "fisico",
    notes: "Com cronograma capilar consistente (hidratação semanal + nutrição quinzenal + reconstrução mensal), o cabelo deve estar mais saudável e definido.",
  },
  {
    datePlanned: isoFromMonthsFromNow(9),
    title: "Conversa com endocrinologista sobre planejamento de TRH",
    category: "fertilidade",
    notes: "Pra entender o caminho: preservação de fertilidade primeiro (vitrificação de gametas), depois TRH. Ginecologista/urologista pode entrar antes do endo.",
  },
  {
    datePlanned: isoFromMonthsFromNow(12),
    title: "Avaliar congelamento de gametas (criopreservação)",
    category: "fertilidade",
    notes: "Procedimento que preserva fertilidade ANTES de iniciar TRH. Você e namorada planejam ter filhos primeiro — esse marco pode adiantar isso.",
  },
];
