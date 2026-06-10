import type { GuideSection } from "../components/GuideAccordion";

// Guia de cuidado de unhas — curtas, saudáveis e femininas pelo cuidado, não pelo
// comprimento. Conteúdo estático; boas práticas gerais, não substitui manicure/dermato.
export const NAILS_GUIDE: GuideSection[] = [
  {
    id: "saude",
    title: "Saúde e fortalecimento",
    intro: "Unha bonita é unha saudável — força vem de dentro e de hábito, não de produto milagroso.",
    tips: [
      "Proteína na dieta (já no seu plano) é a base da unha forte; biotina vem da comida do dia a dia",
      "Óleo de cutícula + hidratante na unha todo dia — unha hidratada não descama nem racha",
      "Usa uma base fortalecedora como tratamento (mesmo sem cor por cima)",
      "Evita o que destrói: usar a unha de ferramenta, descascar esmalte, acetona pura demais, roer",
      "Luva pra lavar louça/limpeza pesada — detergente resseca e enfraquece",
      "Mantém as mãos mais secas no dia: umidade constante amolece e descama a unha",
    ],
  },
  {
    id: "cuticula",
    title: "Cutícula e mãos",
    intro: "Mão bem cuidada feminiliza tanto quanto a unha em si.",
    tips: [
      "Não corta a cutícula: amolece no banho e empurra de leve com a toalha ou espátula, depois passa óleo",
      "Creme de mãos sempre que lavar — mão macia e hidratada faz toda diferença",
      "Manutenção semanal rápida: lixa o formato, empurra cutícula, hidrata",
      "Esfolia as mãos de vez em quando pra tirar pele seca e uniformizar",
    ],
  },
  {
    id: "curtas-lisas",
    title: "Curtas, lisas e bonitas",
    intro: "Curtas por escolha (atenção e intimidade) — a beleza vem do formato, do brilho e do acabamento.",
    tips: [
      "Mantém curtas; o capricho no formato e no brilho é o que dá ar cuidado e feminino",
      "Lixa sempre num sentido só (vai-e-vem lasca o fio da unha)",
      "Formato arredondado ou quadrado-suave (squoval) afina e alonga visualmente o dedo",
      "Brilho pelo polimento com bloco buffer, em vez de comprimento — fica natural e elegante",
      "Borda BEM lisa, sem cantos nem farpas — importa pra discrição e pra intimidade (conforto e segurança, ativa ou passiva)",
      "Passa o dedo pra conferir: se engancha em tecido, ainda não está liso o suficiente",
    ],
  },
  {
    id: "esmalte",
    title: "Esmalte: discreto x ousado",
    intro: "Dá pra ser cuidada e passar batido — e ousar quando o ambiente é seguro.",
    tips: [
      "Discreto (trabalho/atenção): base, brilho incolor ou nude/rosado translúcido — 'suas unhas, melhores'",
      "Ousado (em casa/com a amada): cor, vinho, francesinha — quando o ambiente é seguro",
      "Pra durar: camadas FINAS, base + cor + top coat, e 'sela a pontinha' passando o pincel na borda livre",
      "Deixa secar de verdade entre as camadas (fina seca rápido, grossa enruga e descasca)",
      "Pra voltar ao discreto rápido: algodão + acetona cremosa (menos ressecante) tira a cor numa passada",
    ],
  },
];
