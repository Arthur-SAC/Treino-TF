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
    title: "✂ Cabelo na fase de transição — manter forma e saúde crescendo",
    category: "fisico",
    notes: "Com cronograma consistente + retenção (cetim, baixa manipulação, aparar só pontas), o cabelo deve estar visivelmente mais comprido e saudável. Fase do meio-termo: dar forma com camadas longas sem encurtar, disfarçar formatos esquisitos com acessórios. Rumo a um pouco abaixo dos ombros.",
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

// Roadmap do objetivo físico (corpo dos objetivos: bunda grande, curvas femininas,
// cintura fina). Marcos de acompanhamento por foto + transições de fase.
export const BODY_GOAL_MILESTONES: Omit<Milestone, "id">[] = [
  {
    datePlanned: isoFromMonthsFromNow(0),
    title: "◆Fase 1 — Secar barriga + base de glúteo (início)",
    category: "fisico",
    notes: "Déficit 2.200 kcal + proteína alta + treino glúteo-prioritário. Tira a barriga (que masculiniza a silhueta) e começa a construir a base muscular enquanto a testosterona ainda está alta — a melhor janela de ganho.",
  },
  {
    datePlanned: isoFromMonthsFromNow(0),
    title: "▣Foto de partida (frente / lado / costas)",
    category: "fisico",
    notes: "Mesma luz, mesma roupa justa, mesmo horário. É a base de comparação. Repetir a cada 8-12 semanas.",
  },
  {
    datePlanned: isoFromMonthsFromNow(3),
    title: "▣Check-in 3 meses + medir cintura/quadril",
    category: "fisico",
    notes: "Meta da Fase 1: cintura -2 a -4cm e barriga visivelmente menor. Glúteo já mais firme (ganhos de iniciante). WHR de 0,87 rumo a 0,80.",
  },
  {
    datePlanned: isoFromMonthsFromNow(4),
    title: "◆Fase 2/3 — Entrar em hipertrofia de glúteo",
    category: "fisico",
    notes: "Quando a barriga estiver controlada, sai do déficit (manutenção/leve superávit) e foca em CRESCER o glúteo. Volume alto no hip thrust + leg press com carga progressiva.",
  },
  {
    datePlanned: isoFromMonthsFromNow(6),
    title: "▣Check-in 6 meses — quadril/bunda crescendo",
    category: "fisico",
    notes: "Meta: quadril +2 a +4cm, glúteo visivelmente mais cheio e redondo de costas. Foco no glúteo médio pra arredondar (não ficar quadrada).",
  },
  {
    datePlanned: isoFromMonthsFromNow(9),
    title: "▱WHR rumo a 0,75 (cintura fina + quadril cheio)",
    category: "fisico",
    notes: "Combinação de cintura mantida fina (core transverso, sem oblíquo pesado) + quadril/glúteo maiores. Aqui a silhueta ampulheta começa a aparecer de verdade.",
  },
  {
    datePlanned: isoFromMonthsFromNow(12),
    title: "◆Fase 5 — Manutenção + alinhar com início da TRH",
    category: "fisico",
    notes: "Com a base muscular pronta, o estrogênio (após resolver a fertilidade) faz a redistribuição de gordura pro quadril/bunda e a textura macia — o 'durinha mas gostosa de apertar'. É a fase que entrega a forma final por cima do músculo já construído.",
  },
];

// Marco honesto sobre o busto sem TH: expectativa realista + quando faz sentido
// começar a usar bralette. (Migração: versão 3 dos marcos.)
export const BUST_MILESTONES: Omit<Milestone, "id">[] = [
  {
    datePlanned: isoFromMonthsFromNow(4),
    title: "♡ Busto sem TH — avaliar começar a usar bralette",
    category: "fisico",
    notes: "Sem TH não cresce glândula mamária. O que dá: fullness de GORDURA no peito + prateleira do peitoral (supino inclinado + voador/crucifixo na polia) + postura (face pull, retração escapular). Teto realista: peito macio com linha de colo discreta, bem mais levantado que hoje, sobretudo vestida. Pode chegar num ponto de marcar o suficiente pra um bralette leve ficar confortável e evitar marcar o mamilo. E dá pra usar bralette com bojo fino DESDE JÁ por estilo/euforia — cria a sugestão de busto sob roupa justa, e combina com 'começar discreto'. Salto de tamanho e formato de verdade vem com a TH. Sinal pra mostrar ao médico (sem pânico): caroço firme e dolorido sob o mamilo (ginecomastia glandular, comum e tratável).",
  },
];

export const VOICE_MILESTONES: Omit<Milestone, "id">[] = [
  {
    datePlanned: isoFromMonthsFromNow(0),
    title: "Gravação base da voz (ponto de partida)",
    category: "voz",
    notes: "Grave 30-60s hoje pra ter referência e ouvir a evolução daqui meses.",
  },
  {
    datePlanned: isoFromMonthsFromNow(1),
    title: "1 mês de prática de voz quase diária",
    category: "voz",
    notes: "Consistência vale mais que intensidade: ~15 min/dia.",
  },
  {
    datePlanned: isoFromMonthsFromNow(2),
    title: "Atingir a faixa-alvo de pitch com naturalidade",
    category: "voz",
    notes: "Ressonância pra frente + pitch na faixa, sem forçar a garganta.",
  },
  {
    datePlanned: isoFromMonthsFromNow(3),
    title: "Pedir algo com voz feminina (café, atendimento)",
    category: "voz",
    notes: "Primeira interação curta em público — passo de coragem.",
  },
  {
    datePlanned: isoFromMonthsFromNow(6),
    title: "Conversa ao telefone mantendo a voz",
    category: "voz",
    notes: "Telefone tira as pistas visuais — é o teste de passing por voz.",
  },
];
