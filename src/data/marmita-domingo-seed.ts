// Roteiro do domingo — módulo puro, sem db e sem Date.
//
// O app já tinha um item "Marmita da semana" no domingo com um subtítulo vago
// ("Frango + ovos + feijão + macaxeira + legumes"). Item vago em dia de folga
// perde para o sofá: não diz por onde começar, e começar é a parte cara.
//
// A ordem aqui não é sugestão, é o que faz 1h30 render: o que demora mais e
// cozinha sozinho vai ao fogo primeiro, o que precisa dela fica para as janelas
// em que as panelas estão trabalhando. `maoNaMassaMin` é o tempo dela de pé;
// `sozinhoMin` é o tempo de panela, que não custa domingo.

export interface EtapaMarmita {
  id: string;
  /** 0 é a véspera. Os testes cobram sequência sem buraco. */
  ordem: number;
  titulo: string;
  /** Minutos com ela de pé na cozinha. A soma é o que respeita MARMITA_TETO_MIN. */
  maoNaMassaMin: number;
  /** Minutos cozinhando sem ela olhar — é o que faz o roteiro caber. */
  sozinhoMin: number;
  comoFazer: string;
  rende: string;
}

/** Decisão dela (2026-08-11): ~1h30 de domingo. Teto do tempo DELA, não da panela. */
export const MARMITA_TETO_MIN = 90;

export const ROTEIRO_DOMINGO: readonly EtapaMarmita[] = [
  {
    id: "vespera-feijao",
    ordem: 0,
    titulo: "Sábado à noite · feijão de corda de molho",
    maoNaMassaMin: 3,
    sozinhoMin: 480,
    comoFazer:
      "Cobre 300g de feijão de corda com água numa vasilha grande e deixa na pia até de manhã. São 3 minutos que economizam meia hora de domingo — feijão sem molho cozinha o dobro do tempo.",
    rende: "Feijão de corda pronto pra ir à pressão logo cedo — 6 a 7 conchas na semana.",
  },
  {
    id: "pressao-feijao",
    ordem: 1,
    titulo: "Feijão de corda na pressão",
    maoNaMassaMin: 5,
    sozinhoMin: 25,
    comoFazer:
      "Escorre o feijão, joga na pressão com alho, cebola, louro e água dois dedos acima. Fecha e liga em fogo alto. Quando pegar pressão, baixa e conta 18 minutos. Sal só no fim. Esta é a primeira panela porque é a que mais demora sozinha.",
    rende: "6 a 7 conchas — cobre o almoço e o jantar da semana toda.",
  },
  {
    id: "frango-lote",
    ordem: 2,
    titulo: "Frango na segunda panela",
    maoNaMassaMin: 6,
    sozinhoMin: 25,
    comoFazer:
      "Enquanto o feijão trabalha: 1 kg de frango (coxa desossada sai mais barata que o peito e serve igual) em água com sal, alho e louro. Pressão por 20 minutos, ou fervendo por 30. Não precisa olhar.",
    rende: "1 kg — desfia depois e vira o almoço e o jantar de 4 a 5 dias.",
  },
  {
    id: "ovos-lote",
    ordem: 3,
    titulo: "Ovos cozidos da semana",
    maoNaMassaMin: 4,
    sozinhoMin: 10,
    comoFazer:
      "Terceira boca do fogão: água fervendo, 12 ovos, 10 minutos cronometrados pra gema dura. Esfria em água fria e guarda com casca na geladeira — descasca só na hora.",
    rende: "12 ovos — o café da manhã de quase a semana inteira.",
  },
  {
    id: "arroz-lote",
    ordem: 4,
    titulo: "Arroz do lote",
    maoNaMassaMin: 6,
    sozinhoMin: 18,
    comoFazer:
      "Quando o feijão sair da pressão, entra o arroz: alho refogado no azeite, 3 xícaras de arroz, água na proporção 2:1, tampado em fogo baixo por 18 minutos. Não mexe.",
    rende: "Arroz de 5 a 6 refeições.",
  },
  {
    id: "macaxeira-jerimum",
    ordem: 5,
    titulo: "Macaxeira e jerimum",
    maoNaMassaMin: 12,
    sozinhoMin: 25,
    comoFazer:
      "Descasca 1 kg de macaxeira e corta em pedaços grandes — é a etapa mais braçal do dia, e é por isso que ela vem depois, quando as outras panelas já estão trabalhando sozinhas. Cozinha em água com sal por 20-25 minutos. Na panela do lado, jerimum em cubos, 10 minutos no vapor.",
    rende: "Carboidrato e legume de 4 a 5 refeições — inclusive a macaxeira fria que vai no lanche do trabalho.",
  },
  {
    id: "pate-atum",
    ordem: 6,
    titulo: "Patê de atum (sem fogo)",
    maoNaMassaMin: 6,
    sozinhoMin: 0,
    comoFazer:
      "Enquanto a macaxeira cozinha: escorre 2 latas de atum em água, amassa com garfo junto de 4 colheres de sopa de iogurte natural, suco de 1 limão, cebolinha picada, sal e pimenta. Pote fechado na geladeira.",
    rende: "6 porções — o lanche do trabalho dos 3 primeiros dias (depois disso, atum não guarda bem).",
  },
  {
    id: "desfiar-porcionar",
    ordem: 7,
    titulo: "Desfiar, esfriar e porcionar",
    maoNaMassaMin: 20,
    sozinhoMin: 0,
    comoFazer:
      "Desfia o frango com dois garfos e refoga rápido com cebola, alho e tomate. Deixa tudo esfriar destampado antes de fechar os potes — pote fechado quente vira água no fundo e estraga em dois dias. Monta as marmitas do almoço já prontas: proteína, arroz, feijão, legume.",
    rende: "As marmitas da semana montadas — dia útil vira esquentar, não cozinhar.",
  },
];
