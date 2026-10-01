import type { GuideSection } from "../components/GuideAccordion";
import {
  deficitSemanalKcal,
  VERBA_SEMANAL_KCAL,
  CUSTO_MARGINAL_REFEICAO_FORA_KCAL,
  NOITES_QUE_A_VERBA_COBRE,
  ritmoComNoitesFora,
  ritmoDaSemana,
} from "../lib/comer-fora";
import { CONSUMO } from "../lib/objetivo";
import type { ModoCaminhada } from "../lib/objetivo";

// Este arquivo NARRA — quem decide os números é src/lib/comer-fora.ts. Nenhum
// valor daqui pode ser digitado à mão: é a regra que impede a tela e a conta de
// divergirem no primeiro dia em que a meta mudar.
//
// Por que existe: o cardápio assume sete dias iguais, comidos em casa. Ela tem
// encontro com a noiva na sexta, se veem no sábado, e domingo de quinze em
// quinze — e perguntou, com todas as letras, se podia comer besteira nesses
// dias e o que pedir pra não atrapalhar. O plano não tinha resposta nenhuma, e
// "siga o plano" ali significa não sair, que não é resposta.
//
// Álcool ficou de fora de propósito: ela não bebe (dito por ela em 2026-09-08).
// Encher a tela de ressalva sobre uma coisa que não acontece é ruído, e ruído
// é o que faz uma tela deixar de ser lida.

/** A tela narra a conta do modo atual. Com a caminhada pausada o déficit fica
 *  menor que a verba, e a frase "você continua emagrecendo em todos os
 *  cenários" viraria mentira — então ela troca pelo número verdadeiro. */
export function comerForaDoModo(modo: ModoCaminhada): GuideSection[] {
  const semNoite = ritmoDaSemana(0, modo);
  const umaNoite = ritmoComNoitesFora(1, modo);
  const duasNoites = ritmoComNoitesFora(2, modo);
  const tresNoites = ritmoComNoitesFora(3, modo);
  const zeraAlguma = tresNoites.kgPorSemana === 0;
  // "0 kg — 100% mais devagar" é jeito torto de dizer que a perda zerou; quando
  // o cenário zera, a linha diz isso com todas as letras.
  const linha = (rotulo: string, r: typeof semNoite, comPct: boolean) =>
    r.kgPorSemana === 0
      ? `${rotulo}: zera a perda da semana.`
      : comPct
        ? `${rotulo}: ${r.kgPorSemana} kg — ${r.perdaDeRitmoPct}% mais devagar.`
        : `${rotulo}: ${r.kgPorSemana} kg.`;
  return [

  {
    id: "a-verba",
    title: "Sim, você tem verba — e ela já estava no plano",
    intro: `${CONSUMO.discricionariaKcal} kcal por dia declaradas como suas, o que dá ${VERBA_SEMANAL_KCAL} na semana.`,
    tips: [
      `Guardadas para uma ocasião só, essas ${VERBA_SEMANAL_KCAL} kcal cobrem ${NOITES_QUE_A_VERBA_COBRE} noites fora por semana. Espalhadas em sete dias não compram nada memorável: ${CONSUMO.discricionariaKcal} kcal por dia é meio pacote de biscoito, e você paga o mesmo preço.`,
      `A verba não é de graça, e chamar de "livre" seria mentira: o cardápio já ocupa as ${CONSUMO.metaKcal} kcal inteiras da meta, então o que entra por cima sai direto do déficit. O preço se paga em TEMPO, não em fracasso.`,
      `Seguindo o plano à risca, o déficit da semana é de ${deficitSemanalKcal(modo)} kcal — cerca de ${semNoite.kgPorSemana} kg por semana.`,
      ritmoDaSemana(VERBA_SEMANAL_KCAL, modo).kgPorSemana === 0
        ? "Com a caminhada pausada, gastar a verba inteira toda semana zera a perda: ela é maior que o déficit da semana inteiro."
        : `Gastar a verba inteira toda semana continua sendo emagrecimento, só que ${ritmoDaSemana(VERBA_SEMANAL_KCAL, modo).perdaDeRitmoPct}% mais devagar. Isso é uma escolha legítima com preço conhecido, não uma recaída.`,
    ],
  },
  {
    id: "o-preco-em-tempo",
    title: "O preço de cada noite, em número",
    intro: `Uma refeição de restaurante custa cerca de ${CUSTO_MARGINAL_REFEICAO_FORA_KCAL} kcal A MAIS que o jantar do plano que ela substitui. Você não come os dois — troca um pelo outro, e é só a diferença que conta.`,
    tips: [
      linha("Nenhuma noite fora na semana", semNoite, false),
      linha("Uma noite", umaNoite, true),
      linha("Duas noites", duasNoites, true),
      linha("Três noites", tresNoites, true),
      zeraAlguma
        ? "Com a caminhada pausada o déficit da semana é tão pequeno que três noites fora zeram a perda. A verba inteira não cabe nele: religar a caminhada (ou a esteira) é o que devolve a folga."
        : "Repare no formato da conta: você continua emagrecendo em todos os cenários. O plano não quebra com uma noite fora — ele anda mais devagar, e você escolhe a velocidade.",
      "O que quebra de verdade não é a pizza de sexta: é decidir que a sexta estragou tudo e soltar o sábado, o domingo e a segunda junto. A unidade é a SEMANA, não o dia.",
    ],
  },
  {
    id: "o-que-pedir",
    title: "O que pedir quando sair",
    intro: "Em ordem de importância. A primeira regra sozinha resolve a maior parte.",
    tips: [
      "Proteína primeiro, sempre: peça a carne, o frango ou o peixe grelhado e coma ela antes do resto. É o macro que protege sua massa magra e o que mais sacia — se sobrar prato, sobrou a parte certa.",
      "Não pule refeição pra compensar. Chegar faminta no restaurante é exatamente como a noite sai do controle, e os seus dois pontos de falha já são 16h e o jantar.",
      "Principalmente não pule o lanche das 15h30. Ele existe pra segurar as sete horas e meia entre o almoço e o jantar, e foi aumentado justamente por isso.",
      "O que custa caro e não devolve prazer é líquido e fritura: refrigerante e suco passam sem saciar nada, e a fritura cobra o dobro pelo mesmo volume de comida.",
      "A comida daqui joga a seu favor: peixe grelhado, carne, feijão, arroz, macaxeira, salada — quase tudo que se come fora em Aracaju já é parecido com o plano. Quem cobra caro é o copo e a frigideira.",
      "Se der pra encaixar, treine no dia da refeição grande. Não é que o treino queime a comida — é que o músculo cheio de trabalho aproveita melhor o que chega.",
    ],
  },
];
}

/** O modo padrão — quem importava a constante continua funcionando. */
export const COMER_FORA: GuideSection[] = comerForaDoModo("caminhada");
