import type { GuideSection } from "../components/GuideAccordion";

// Guia de foliculite / pelos encravados pra quem depila rosto, axila e íntima com
// lâmina. NÃO substitui dermatologista — vermelhidão com pus, dor, febre ou caroço
// que não some pedem avaliação profissional.
export const FOLICULITE_GUIDE: GuideSection[] = [
  {
    id: "o-ciclo",
    title: "Por que encrava (o ciclo encravado → mancha)",
    intro:
      "Pelo grosso cortado rente cresce de volta com a ponta afiada e re-entra na pele — o corpo inflama (bolinha vermelha), e cada inflamação deixa uma marca escura. É um ciclo: lâmina → encravado → inflamação → mancha.",
    tips: [
      "Quanto mais rente e mais contra o pelo você raspa, mais ele encrava",
      "Cutucar ou espremer encravado é o que vira mancha e cicatriz — não faça",
      "A mancha que fica (hiperpigmentação) é tratável depois, mas o melhor é não inflamar",
      "Quebrar o ciclo vale mais que tratar a mancha: menos lâmina = menos encravado = menos mancha",
    ],
  },
  {
    id: "tecnica-barbear",
    title: "Barbear sem encravar (técnica)",
    intro: "Como raspar de um jeito que reduz muito o encravamento e a irritação.",
    tips: [
      "Amolece o pelo primeiro: água morna 2-3 min (banho) antes de raspar",
      "Sempre com gel/creme de barbear — nunca a seco",
      "Lâmina nova e limpa; troque cedo (lâmina cega puxa e encrava)",
      "Raspe A FAVOR do pelo na 1ª passada; evite passar contra repetidas vezes pra 'ficar liso'",
      "Não estique a pele ao máximo nem aperte a lâmina — passa leve",
      "Enxágue a lâmina a cada passada e, no fim, finalize com água fria",
      "Pós-barba sem álcool: hidratante leve ou niacinamida/aloe pra acalmar",
      "Não raspe/depile com lâmina 12–24h após ácido potente (glicólico ou retinol) — a pele fica sensível e a barreira comprometida; separe os momentos (ex.: raspar de manhã, ácido à noite)",
    ],
  },
  {
    id: "prevencao",
    title: "Esfoliação e prevenção",
    intro: "Manter o folículo desobstruído é o que evita o pelo de encravar.",
    tips: [
      "Esfolie leve 2-3x/semana — químico (ácido salicílico/BHA) desentope melhor que esfregar",
      "Não esfolie logo após raspar nem em pele irritada/ferida",
      "Hidrate a área entre as depilações (pele macia encrava menos)",
      "Não use lâmina todo dia na mesma área — dá tempo de acalmar",
      "Roupa muito justa/sintética na virilha piora o atrito — prefira algodão",
      "Se um pelo já encravou, compressa morna ajuda a soltar; não fure com agulha em casa",
    ],
  },
  {
    id: "por-area",
    title: "Por área: rosto, axila, íntima",
    intro: "Cada região pede um cuidado um pouco diferente.",
    tips: [
      "Rosto: pelo mais grosso = mais encravado e 'sombra'. A favor do pelo + esfoliação; o laser é o que apaga a sombra de verdade",
      "Axila: pele fina e dobra — raspe com cuidado, evite desodorante logo após, e trate a mancha no módulo Clareamento",
      "Íntima: a mais sensível. Considere aparar em vez de raspar rente; nada de ácido forte por conta própria na mucosa",
      "Em qualquer área irritada hoje, espere acalmar antes de depilar de novo",
    ],
  },
  {
    id: "laser",
    title: "O laser quebra o ciclo de vez",
    intro:
      "Depilação a laser é a solução de raiz pro encravado, pra mancha e pra sombra de barba — pelo escuro em pele clara responde muito bem; eletrólise serve pra qualquer cor e é permanente.",
    tips: [
      "Menos pelo → sem encravado → sem nova mancha → sem sombra: resolve os três de uma vez",
      "São ~8-10 sessões espaçadas; rosto, axila e íntima em clínica especializada",
      "Intervalo padrão: ~4–6 semanas entre sessões — não acelere. A pele precisa se recuperar e o pelo precisa estar na fase de crescimento certa pra o laser agir",
      "Entre sessões, siga raspando com a técnica certa (não arranque com cera/pinça no meio do protocolo de laser)",
      "Registre as sessões aqui na Depilação pra acompanhar custo e evolução",
      "É a maior alavanca de pele-feminização sem TRH — vale priorizar com o dermato",
    ],
  },
  {
    id: "dermato",
    title: "Quando procurar o dermatologista",
    intro: "Tem solução rápida com receita — e alguns sinais pedem avaliação.",
    tips: [
      "Bolinhas com pus, dor, calor ou que se espalham (foliculite infectada) — pode precisar de tópico/antibiótico",
      "Caroço que não some, dói ou cresce — mostre ao profissional",
      "Eflornitina (receita) retarda o crescimento do pelo do rosto, ajudando entre os lasers",
      "Pra mancha persistente em axila/íntima, o dermato indica os ativos certos com segurança",
      "Aproveite a consulta pra mapear pintas (qualquer uma nova, que mude, assimétrica, multicor ou >6mm)",
    ],
  },
];
