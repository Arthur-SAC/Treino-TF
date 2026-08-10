import type { Milestone } from "../lib/db";
import { hojeISO } from "../lib/today-date";

function isoFromMonthsFromNow(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return hojeISO(d);
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
    notes: "Sem data marcada — é conversa para ter quando você quiser ter, não etapa do plano. Vale saber o caminho (preservação de fertilidade primeiro, depois hormônio) e o que cada escolha custa. Ginecologista/urologista pode entrar antes do endócrino.",
  },
  {
    datePlanned: isoFromMonthsFromNow(12),
    title: "Avaliar congelamento de gametas (criopreservação)",
    category: "fertilidade",
    notes: "Procedimento que preserva fertilidade ANTES de iniciar TRH. Você e namorada planejam ter filhos primeiro — esse marco pode adiantar isso.",
  },
];

// Roadmap do objetivo físico. Os números vêm de src/lib/objetivo.ts — este
// arquivo NARRA, não decide. Se um número mudar lá, muda aqui.
export const BODY_GOAL_MILESTONES: Omit<Milestone, "id">[] = [
  {
    datePlanned: isoFromMonthsFromNow(0),
    title: "◆Fase 1 — Tirar a barriga (início)",
    category: "fisico",
    notes: "2.300 kcal, 150-160 g de proteína e treino glúteo-prioritário. A cintura é o problema inteiro: hoje ela é o ponto mais largo do seu tronco. Destreinada com ~28% de gordura é a configuração que responde mais rápido que existe — dá para perder gordura e ganhar músculo ao mesmo tempo, e essa janela fecha.",
  },
  {
    datePlanned: isoFromMonthsFromNow(0),
    title: "▣Foto de partida (frente / lado / costas)",
    category: "fisico",
    notes: "Mesma luz, mesma roupa justa, mesmo horário. É a base de comparação, e vale mais que a fita: o quadril vai cair e voltar ao mesmo número feito de outra coisa. Repetir a cada 8-12 semanas.",
  },
  {
    datePlanned: isoFromMonthsFromNow(2),
    title: "▣Check-in 8-10 semanas — a primeira mudança visível",
    category: "fisico",
    notes: "É por volta daqui que a foto começa a mostrar diferença. Se não mostrar, o problema é adesão, não o plano — revise as 16h e o jantar antes de mexer em qualquer outra coisa.",
  },
  {
    datePlanned: isoFromMonthsFromNow(4),
    title: "▱Cintura 88 — destrava o superávit",
    category: "fisico",
    notes: "88 cm é a trava do app (CINTURA_LIBERA_SUPERAVIT_CM). Abaixo dela, comer a mais vira glúteo; acima, vira barriga. Partida: 99 cm.",
  },
  {
    datePlanned: isoFromMonthsFromNow(7),
    title: "▱Cintura 84 — a silhueta vira",
    category: "fisico",
    notes: "Fim da fase 1: peso por volta de 81 kg, cintura 84, razão cintura÷quadril em ~0,79. Não é o fim do caminho — é o ponto em que roupa justa passa a fazer o que você quer.",
  },
  {
    datePlanned: isoFromMonthsFromNow(8),
    title: "◆Fase 2 — Construir glúteo (a balança SOBE)",
    category: "fisico",
    notes: "Daqui em diante o peso sobe de propósito, de ~81 para 85-88 kg. Ver 85 kg nesta fase é o sinal de que deu certo, não de que falhou. O quadril volta aos 114 cm — o mesmo número de hoje, feito de músculo.",
  },
  {
    datePlanned: isoFromMonthsFromNow(18),
    title: "▣Check-in 18 meses — comparar com a foto de partida",
    category: "fisico",
    notes: "Aqui a comparação por foto entrega o que a fita não consegue mostrar. Razão-alvo do fim da fase 2: 0,77 provável, 0,73 com execução muito boa.",
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
