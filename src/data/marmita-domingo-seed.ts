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

// Reescrito em 2026-11-11 junto com o cardápio econômico: as quantidades são
// as da semana que o Hoje mostra (4 almoços de frango, 3 de carne moída com
// soja, frango desfiado no café, no lanche e em 5 jantares, 2 jantares de
// sardinha de lata — essa não vai ao fogo no domingo).
export const ROTEIRO_DOMINGO: readonly EtapaMarmita[] = [
  {
    id: "vespera-feijao",
    ordem: 0,
    titulo: "Sábado à noite · feijão de corda de molho",
    maoNaMassaMin: 3,
    sozinhoMin: 480,
    comoFazer:
      "Cobre 450 g de feijão de corda com água numa vasilha grande e deixa na pia até de manhã. São 3 minutos que economizam meia hora de domingo — feijão sem molho cozinha o dobro do tempo.",
    rende: "Feijão de corda pronto pra ir à pressão logo cedo — 9 conchas na semana.",
  },
  {
    id: "pressao-feijao",
    ordem: 1,
    titulo: "Feijão de corda na pressão",
    maoNaMassaMin: 5,
    sozinhoMin: 25,
    comoFazer:
      "Escorre o feijão, joga na pressão com alho, cebola, louro e água dois dedos acima. Fecha e liga em fogo alto. Quando pegar pressão, baixa e conta 15-18 minutos. Sal só no fim. Esta é a primeira panela porque é a que mais demora sozinha.",
    rende: "Potes de 100 g pros 7 almoços e pros 2 jantares de sardinha.",
  },
  {
    id: "frango-lote",
    ordem: 2,
    titulo: "Frango desfiado na segunda panela",
    maoNaMassaMin: 6,
    sozinhoMin: 25,
    comoFazer:
      "Enquanto o feijão trabalha: 1,6 kg de peito de frango em água com sal, alho e louro. Pressão por 20 minutos, ou fervendo por 30. Não precisa olhar. É PEITO: coxa tem bem mais gordura na mesma porção e muda a conta do dia.",
    rende: "1,6 kg cru — desfiado, vira o frango do café (7 × 40 g), do lanche (7 × 50 g) e dos 5 jantares (110 g cada).",
  },
  {
    id: "arroz-lote",
    ordem: 3,
    titulo: "Arroz do lote",
    maoNaMassaMin: 6,
    sozinhoMin: 18,
    comoFazer:
      "Quando o feijão sair da pressão, entra o arroz: alho refogado no óleo, 400 g de arroz, água na proporção 2:1, tampado em fogo baixo por 18 minutos. Não mexe.",
    rende: "Potes de 110 g pros 4 almoços de frango e de 120 g pros 2 jantares de sardinha.",
  },
  {
    id: "macaxeira-beterraba",
    ordem: 4,
    titulo: "Macaxeira e beterraba",
    maoNaMassaMin: 12,
    sozinhoMin: 25,
    comoFazer:
      "Descasca 1,2 kg de macaxeira e corta em pedaços grandes — é a etapa mais braçal do dia, e é por isso que ela vem depois, quando as outras panelas já estão trabalhando sozinhas. Cozinha em água com sal por 20-25 minutos e tira o fio do meio. Na panela do lado, 1 kg de beterraba INTEIRA e com casca, 15 minutos na pressão. Descascar antes é o erro: com casca ela não sangra a cor na água, e depois de morna a casca sai só esfregando com a mão. Guarda em pote separado — beterraba tinge o resto da marmita.",
    rende: "Macaxeira de 100 g pros 3 almoços de carne e de 170 g pros 5 jantares; beterraba pros mesmos dias.",
  },
  {
    id: "carne-soja-lote",
    ordem: 5,
    titulo: "Carne moída com soja",
    maoNaMassaMin: 12,
    sozinhoMin: 0,
    comoFazer:
      "Antes de tudo, põe 330 g de soja texturizada seca de molho em água quente com sal (10 minutos, depois espreme bem com a mão): 90 g vão aqui e 240 g no frango desfiado. Refoga 1 cebola e 4 dentes de alho, junta 315 g de carne moída de acém, sal, pimenta e 3 colheres de sopa de molho de tomate. Fogo alto até a água da carne secar, junta os 90 g de soja e mexe mais 3 minutos pra pegar o tempero.",
    rende: "3 potes de 80 g de carne + 90 g de soja — os almoços de segunda, quarta e sexta.",
  },
  {
    id: "frango-grelhado",
    ordem: 6,
    titulo: "Frango grelhado do almoço",
    maoNaMassaMin: 15,
    sozinhoMin: 0,
    comoFazer:
      "700 g de peito em filés, temperados com sal, alho e limão por 10 minutos. Frigideira em fogo alto com fio de azeite, 4-5 minutos de cada lado, em duas levas pra não cozinhar no vapor. Fio de óleo, não azeite: no fogo alto o azeite queima e custa o triplo.",
    rende: "4 porções de 130 g grelhado — os almoços de terça, quinta, sábado e domingo.",
  },
  {
    id: "desfiar-porcionar",
    ordem: 7,
    titulo: "Desfiar, esfriar e porcionar",
    maoNaMassaMin: 20,
    sozinhoMin: 0,
    comoFazer:
      "Desfia o frango cozido com dois garfos e separa 280 g puros pro café (7 potinhos de 40 g). No resto, refoga rápido cebola, alho e tomate e junta os 240 g de soja hidratada. Deixa tudo esfriar destampado antes de fechar os potes — pote fechado quente vira água no fundo e estraga em dois dias. Geladeira: o que vai até quarta. Congelador: o resto. Toda noite, passa o pote do dia seguinte pra geladeira.",
    rende: "As marmitas da semana montadas — dia útil vira esquentar, não cozinhar.",
  },
];
