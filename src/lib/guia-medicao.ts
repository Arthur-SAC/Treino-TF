import type { GuideSection } from "../components/GuideAccordion";

// A régua do app: cintura no umbigo e ombro em circunferência são os pontos da
// partida e da conta de gordura (Navy). Mora aqui, e não na tela de Medidas,
// porque o formulário aparece também na boas-vindas — e lá ela mediu o ombro
// só pelas costas por não ter instrução nenhuma (2026-11-04).
export const GUIDE_MEDICAO: GuideSection[] = [
  {
    id: "como-medir",
    title: "Como medir certo",
    intro:
      "Medir sempre do mesmo jeito é o que torna os dados comparáveis ao longo do tempo. Use uma fita métrica flexível e não elástica.",
    tips: [
      "Cintura: na altura do umbigo — é onde a barriga está e é o ponto que a conta de gordura usa. Fique em pé, barriga solta, expire normalmente e passe a fita justa, sem apertar nem folgar. Medir mais acima dá um número menor que não se compara com o da partida.",
      "Quadril: meça na parte mais larga do bumbum, com os pés unidos. A fita deve ficar paralela ao chão.",
      "Ombros: a fita dá a volta no corpo passando pela parte mais larga dos ombros, por cima dos músculos do ombro e das costas. Fique ereta, braços relaxados ao lado do corpo. É circunferência, não a distância de uma ponta à outra.",
      "Busto: na linha dos mamilos, fita paralela ao chão, braços relaxados, depois de expirar.",
      "Pescoço: logo abaixo do pomo de adão, no ponto mais estreito. Fita paralela ao chão, sem comprimir.",
      "Coxa: na parte mais grossa da coxa, geralmente no terço superior, logo abaixo da dobra glútea. Perna levemente afastada para a fita não comprimir.",
      "Braço: no bíceps relaxado, no ponto mais largo entre o ombro e o cotovelo.",
      "Antebraço: braço solto, no ponto mais grosso logo abaixo do cotovelo.",
      "Panturrilha: em pé, peso nas duas pernas, no ponto mais grosso da batata da perna.",
      "Quando medir: de preferência ao acordar, depois de ir ao banheiro e antes de comer, beber muito ou treinar. Se não der, tudo bem — só meça sempre no mesmo horário, porque ao longo do dia a barriga e a retenção mudam a cintura em 1 a 3 cm. A cada 2 a 4 semanas basta.",
    ],
  },
];

/** Uma linha por campo, mostrada quando ela toca no campo. */
export const DICA_CURTA: Record<string, string> = {
  weightKg: "Ao acordar, depois do banheiro, antes de comer. Sem roupa ou sempre com a mesma.",
  neckCm: "Logo abaixo do pomo de adão, no ponto mais fino. Fita reta, sem apertar.",
  shouldersCm: "Dê a volta no corpo inteiro pela parte mais larga dos ombros. Não é a largura das costas.",
  chestCm: "Na linha dos mamilos, fita reta, braços soltos, depois de soltar o ar.",
  waistCm: "Na altura do umbigo, barriga solta, soltando o ar normal. Não na parte mais fina.",
  hipCm: "Na parte mais larga do bumbum, pés juntos, fita reta.",
  thighLeftCm: "Na parte mais grossa, logo abaixo da dobra do bumbum.",
  thighRightCm: "Na parte mais grossa, logo abaixo da dobra do bumbum.",
  armCm: "Bíceps relaxado, no ponto mais largo entre ombro e cotovelo.",
  forearmCm: "Braço solto, no ponto mais grosso logo abaixo do cotovelo.",
  calfCm: "Em pé, peso nas duas pernas, no ponto mais grosso da batata da perna.",
};

/** Abaixo disso não é volta no corpo de nenhuma pessoa adulta: é a largura medida pelas costas. */
export const OMBRO_MINIMO_CIRCUNFERENCIA = 80;
