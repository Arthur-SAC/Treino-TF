import type { Execucao } from "../lib/execucao";

// Explicação no formato fixo de cada move do alongamento da manhã, do da noite
// e do assoalho. Ela disse do alongamento da manhã: "tive que pesquisar tudo
// pra entender" — e o mesmo valia pro resto. Chave: id da sequência → nome do
// move, EXATAMENTE como está em `sequences-seed.ts` (o teste cobra que toda
// chave caia num move que existe).
//
// Regras do conteúdo:
// - Tempo e repetição batem com o `durationSec`/`repeat` do move: o timer da
//   tela conta aquele tempo, e o texto não pode mandar fazer outro.
// - "Pra render mais" de alongamento é respiração, tempo, relaxamento e
//   simetria. Nunca forçar alcance: alongamento que dói ativa o reflexo de
//   proteção e o músculo fecha.
// - Nada de pisar na linha nem cruzar os pés andando: a pelve dela é
//   desnivelada (teste de 2026-10-01). Os lados têm o mesmo tempo, exceto
//   nivelar a pelve, que é assimétrico de propósito.
// - Assoalho: técnico e direto (decisão de 2026-08-11) — corpo, pressão,
//   ritmo. Sem narrar cena. Contrair E soltar: a soltura é metade do treino.

// ---------------------------------------------------------------------------
// Peças repetidas. Uma frase só, pra o mesmo erro ter a mesma correção em
// toda tela.

const ERR_PRENDE_AR =
  "Você prende o ar enquanto aperta → conta os segundos em voz baixa; quem fala não consegue prender o ar.";
const ERR_BARRIGA_BUMBUM =
  "A barriga endurece, o bumbum aperta ou as coxas se fecham → aperta mais fraco, só por dentro, e confere com a mão na barriga.";
const ERR_DOR_PELVICA =
  "Dor, ardência ou pontada na região → para por hoje. Se voltar em outro dia, procura fisioterapeuta pélvica em vez de insistir.";
const ERR_SOLTA_EMPURRANDO =
  "Você empurra pra baixo, como quem faz cocô → isso é força, não soltura. Para de empurrar e só deixa descer junto com a inspiração.";
const ERR_SOLTURA_PELA_METADE =
  "A soltura é só parar de apertar → solta de propósito, deixando a região descer e alargar com a inspiração, um pouco além de como ela fica parada.";

const ERR_DOI = "Dói em vez de puxar → volta até onde só puxa; para antes da dor.";

const POS_SENTADA_DISCRETA =
  "Sentada numa cadeira, pés no chão, costas retas, mãos nas coxas — ou deitada de barriga pra cima, joelhos dobrados. De fora ninguém vê.";
const ONDE_APERTO =
  "Por dentro, na base entre as pernas, entre o púbis e o cóccix. Barriga, bumbum e coxas continuam moles.";

const DEITADA_JOELHOS = "Deitada de barriga pra cima, joelhos dobrados, pés no chão na largura do quadril.";
const DE_QUATRO = "De quatro no chão: mãos embaixo dos ombros, joelhos embaixo do quadril, almofada embaixo dos joelhos.";
const SENTADA_PERNAS_DOBRADAS =
  "Sentada no chão com as duas pernas dobradas em ângulo reto: a da frente com a canela atravessada na sua frente, a de trás com a canela apontando pra trás, ao lado do corpo.";

function vacuum(segundos: number, posicao: string): Execucao {
  return {
    posicao,
    movimento: [
      "Solta todo o ar pela boca, até esvaziar.",
      "Sem puxar ar de volta, puxa o umbigo pra dentro e pra cima, como se quisesse colar ele na coluna.",
      `Segura ${segundos} segundos fazendo respirações curtas pelo alto do peito, sem soltar a barriga.`,
      "Solta, respira normal por 10 segundos e repete. São 3 vezes.",
    ],
    ondeSentir: "Bem fundo na barriga, como um cinto apertando por dentro em volta da cintura.",
    erradoSe: [
      "Você prende a respiração e o rosto esquenta → respira curto pelo peito; a barriga continua puxada.",
      "A barriga estufa pra fora ou os músculos dos lados da barriga aparecem → virou abdominal comum. Solta e puxa de novo, pra DENTRO.",
      "Tontura → para, respira normal e segura menos tempo na próxima.",
    ],
    renderMais: [
      "Faz antes de comer: com a barriga vazia o umbigo vai mais pra dentro sem esforço.",
      "A cada respiração curta, puxa o umbigo um pouco mais pra dentro.",
    ],
  };
}

function respiracaoFinal(posicao: string, extra: string): Execucao {
  return {
    posicao,
    movimento: [
      "Inspira pelo nariz enchendo a barriga, em uns 4 segundos.",
      "Solta o ar pela boca bem devagar, em uns 6 segundos, soltando ombros e mandíbula junto.",
      "5 respirações assim.",
    ],
    ondeSentir: "O corpo pesando no chão e a barriga subindo e descendo.",
    erradoSe: ["Você corre pra terminar e a respiração fica curta → conta 4 pra entrar e 6 pra sair."],
    renderMais: [extra],
  };
}

// ---------------------------------------------------------------------------
// MANHÃ

const MANHA_FASE_1: Record<string, Execucao> = {
  "Respiração de quadril (deitada)": {
    posicao: `${DEITADA_JOELHOS} Uma mão na barriga.`,
    movimento: [
      "Inspira pelo nariz em 4 segundos, deixando a barriga subir solta.",
      "Solta o ar pela boca em 6 segundos, puxando o umbigo de leve pra dentro no fim.",
      "5 respirações assim, devagar.",
    ],
    ondeSentir: "A mão sobe e desce com a barriga. O peito quase não mexe.",
    erradoSe: [
      "O peito e os ombros sobem na inspiração → manda o ar pra baixo, pra mão da barriga.",
      "Fica tonta → respira mais devagar e menos fundo.",
    ],
    renderMais: ["Alonga a saída do ar até 8 segundos."],
  },
  "Cat-cow (4 apoios)": {
    posicao: DE_QUATRO,
    movimento: [
      "Inspira e deixa a barriga descer, o peito ir pra frente e o olhar subir (vaca).",
      "Solta o ar e arredonda as costas pra cima, queixo pro peito, empurrando o chão com as mãos (gato).",
      "10 vezes, no ritmo da respiração.",
    ],
    ondeSentir: "A coluna inteira se mexendo, da lombar ao pescoço, com sensação de soltar.",
    erradoSe: [
      "Dor na lombar quando a barriga desce → desce menos, só até onde não incomoda.",
      "Só o pescoço mexe → começa o movimento pelo quadril, não pela cabeça.",
    ],
    renderMais: ["Faz como uma onda que sai do cóccix e sobe até a cabeça, sem pressa."],
  },
  "Círculos de quadril (4 apoios)": {
    posicao: DE_QUATRO,
    movimento: [
      "Leva o quadril pra direita, depois pra trás em direção aos calcanhares, depois pra esquerda e de volta pra frente.",
      "Círculo grande e lento, 5 vezes nesse sentido.",
      "Inverte e faz mais 5 no outro sentido.",
    ],
    ondeSentir: "Quadril e lombar soltando. Na parte de trás do círculo, um leve alongamento no bumbum.",
    erradoSe: [
      "Os braços dobram e o peito afunda → braços esticados; só o quadril mexe.",
      "O círculo sai maior de um lado → diminui até sair igual dos dois lados.",
      ERR_DOI,
    ],
    renderMais: ["Solta o ar na metade de trás do círculo e puxa na metade da frente."],
  },
  "Mobilidade 90/90": {
    posicao: `${SENTADA_PERNAS_DOBRADAS} Tronco reto.`,
    movimento: [
      "Inclina o tronco pra frente sobre a canela da frente, peito indo na direção do joelho. Fica 30 segundos.",
      "Volta e inclina o tronco pra trás, com as mãos apoiadas no chão atrás de você. Fica 30 segundos.",
      "Gira as pernas pro outro lado e repete: 30 segundos pra frente, 30 pra trás.",
    ],
    ondeSentir: "Indo pra frente: bumbum e lateral do quadril da perna da frente. Indo pra trás: frente do quadril e virilha da perna de trás.",
    erradoSe: [
      "Você arredonda as costas pra chegar mais perto → sobe o tronco e inclina dobrando no quadril, peito aberto.",
      "Dor no joelho → afasta um pouco o pé do corpo.",
      "Dói em vez de puxar → volta até onde só puxa.",
    ],
    renderMais: [
      "Tempo igual dos dois lados, mesmo que um seja mais duro.",
      "Parada na posição, solta o ar devagar e deixa o quadril amolecer.",
    ],
  },
  "Ponte de glúteo (suave)": {
    posicao: `${DEITADA_JOELHOS} Braços no chão ao lado do corpo.`,
    movimento: [
      "Aperta o bumbum e sobe o quadril até ombro, quadril e joelho ficarem numa linha.",
      "Segura 2 segundos lá em cima.",
      "Desce devagar, em 3 segundos. 12 vezes.",
    ],
    ondeSentir: "Bumbum, apertando no topo. A lombar não trabalha.",
    erradoSe: [
      "Você sente a lombar → sobe menos e deixa a barriga firme, como quem segura uma tosse.",
      "A parte de trás da coxa puxa ou dá cãibra → aproxima os pés do bumbum.",
      "Os joelhos caem pra dentro → empurra os joelhos pra fora, na linha dos pés.",
      "Dor na lombar ou no joelho → sobe menos ou para; nunca segue com dor.",
    ],
    renderMais: ["Segura 3 segundos no topo em toda repetição."],
  },
  "Borboleta (alongamento)": {
    posicao: "Sentada no chão, solas dos pés juntas, joelhos caídos pros lados, mãos segurando os pés.",
    movimento: [
      "Senta reta, com o peso nos dois ossos do bumbum.",
      "Inspira fundo.",
      "Solta o ar e deixa os joelhos descerem pelo próprio peso. Fica 1 minuto respirando assim.",
    ],
    ondeSentir: "Parte de dentro das coxas, perto da virilha.",
    erradoSe: [
      "Você empurra os joelhos com as mãos ou os cotovelos → tira; quem abre é o peso das pernas.",
      "A lombar arredonda → senta na beira de uma almofada dobrada.",
      "Um joelho fica bem mais alto que o outro → deixa como está; forçar o alto só trava. Ele desce com as semanas.",
      ERR_DOI,
    ],
    renderMais: ["A cada saída de ar, solta ombros, mandíbula e coxas."],
  },
  "Vacuum abdominal": vacuum(30, "Sentada no chão ou de quatro, coluna reta."),
  "Respiração final": respiracaoFinal(
    `${DEITADA_JOELHOS} Mão na barriga.`,
    "Cada saída de ar solta uma parte: ombros, mandíbula, quadril.",
  ),
};

const RA_POSICAO =
  "De quatro no chão, joelhos abertos pros lados até onde não dói, tornozelos na mesma linha dos joelhos, apoio nos antebraços. Almofada embaixo dos joelhos.";

const MANHA_FASE_2: Record<string, Execucao> = {
  "Aquecimento articular": {
    posicao: "Em pé, pés na largura do quadril, mãos na cintura.",
    movimento: [
      "Círculo grande com o quadril, 8 vezes pra um lado e 8 pro outro.",
      "Desce de quatro no chão.",
      "10 gato-vaca: inspira deixando a barriga descer, solta o ar arredondando as costas pra cima.",
    ],
    ondeSentir: "Quadril e lombar esquentando. Nada puxa ainda.",
    erradoSe: [
      "Já sente alongar → diminui; aquecimento é pra esquentar, não pra abrir.",
      "O tronco gira junto com o quadril → peito parado, mexe só da cintura pra baixo.",
    ],
    renderMais: ["Não pula: no frio o músculo resiste e o resto da sessão rende menos."],
  },
  "Rã progressiva": {
    posicao: RA_POSICAO,
    movimento: [
      "Leva o quadril pra trás, na direção dos calcanhares, até a virilha começar a puxar.",
      "Volta devagar pra frente.",
      "10 idas e vindas lentas.",
      "Na última, fica parada atrás 60 segundos, respirando pela barriga.",
    ],
    ondeSentir: "Parte de dentro das coxas e virilha, igual dos dois lados.",
    erradoSe: [
      "Dor no joelho → põe mais almofada e fecha um pouco os joelhos.",
      "Os pés se juntam atrás → separa os pés até ficarem na linha dos joelhos.",
      "A lombar afunda → barriga firme e leva menos o quadril pra trás.",
    ],
    renderMais: [
      "Nos 60 segundos parada, solta o ar devagar e deixa o quadril descer sozinho, sem empurrar.",
    ],
  },
  "90/90 com rotação": {
    posicao: `${SENTADA_PERNAS_DOBRADAS} Mãos no chão atrás de você, só pra equilíbrio.`,
    movimento: [
      "Tronco reto, gira o peito na direção da perna da frente e inclina um pouco sobre ela.",
      "Volta o tronco pro centro.",
      "Pés parados no lugar: levanta os dois joelhos e deita eles pro outro lado, sem empurrar o chão com as mãos. Agora a outra perna está na frente.",
      "Gira o peito pra nova perna da frente. Cada passagem dos joelhos de um lado pro outro é uma troca: são 8.",
    ],
    ondeSentir: "Dentro da articulação do quadril, dos dois lados, e no bumbum da perna da frente.",
    erradoSe: [
      "Você precisa jogar o corpo pra trás pra trocar os joelhos → troca mais devagar, com as mãos de apoio; tirar as mãos vem com as semanas.",
      "Pontada no joelho na troca → afasta mais os pés um do outro.",
      "Dói em vez de puxar → para no ponto em que só puxa.",
    ],
    renderMais: [
      "Troca os joelhos soltando o ar.",
      "Quando a troca sair fácil, faz com as mãos nos joelhos, fora do chão.",
    ],
  },
  "Abertura em V": {
    posicao: "Sentada no chão, pernas esticadas e abertas em V até onde for confortável, dedos dos pés pra cima.",
    movimento: [
      "Senta reta, crescendo o topo da cabeça pro teto.",
      "Caminha as mãos pelo chão pra frente, sem arredondar as costas.",
      "Para onde a parte de dentro das coxas puxa sem doer. Fica 90 segundos respirando.",
    ],
    ondeSentir: "Parte de dentro e de trás das coxas, igual dos dois lados.",
    erradoSe: [
      "As costas arredondam → volta as mãos até a coluna ficar longa; coluna reta vale mais que chegar perto do chão.",
      "Os joelhos giram pra dentro → aponta os dedões dos pés pro teto.",
      "Choque ou formigamento atrás do joelho → dobra um pouco os joelhos.",
      ERR_DOI,
    ],
    renderMais: [
      "Senta na beira de uma almofada dobrada: o quadril inclina pra frente sem esforço.",
      "Avança as mãos só na hora de soltar o ar.",
    ],
  },
  "Agachamento profundo com apoio": {
    posicao:
      "Em pé, de frente pra um apoio firme (batente da porta, grade, móvel pesado), pés um pouco mais abertos que o quadril, pontas levemente pra fora.",
    movimento: [
      "Segura no apoio com as duas mãos.",
      "Desce o bumbum o mais baixo que der com os calcanhares no chão.",
      "Fica 60 segundos, deixando o peso do corpo abrir o quadril.",
      "Sobe devagar, descansa um pouco e faz a segunda vez.",
    ],
    ondeSentir: "Virilha, parte de dentro das coxas e tornozelos.",
    erradoSe: [
      "O calcanhar sobe → desce menos, ou põe um livro fino embaixo dos calcanhares.",
      "Os joelhos caem pra dentro → empurra os joelhos pra fora, na direção dos pés.",
      "Dor no joelho → para na altura em que não dói.",
    ],
    renderMais: [
      "Usa o apoio só pra equilíbrio, sem pendurar o peso nas mãos.",
      "Lá embaixo, solta o ar devagar e relaxa o bumbum.",
    ],
  },
  "Vacuum abdominal · 45s": vacuum(45, "Sentada no chão ou de quatro, coluna reta."),
  "Respiração final": respiracaoFinal(
    `${DEITADA_JOELHOS} Mão na barriga.`,
    "Repara no que solta na saída do ar: é na expiração que o músculo cede.",
  ),
};

const MANHA_FASE_3: Record<string, Execucao> = {
  "Aquecimento articular": {
    posicao: "Em pé, pés na largura do quadril, mãos na cintura.",
    movimento: [
      "Círculo grande com o quadril, 8 vezes pra um lado e 8 pro outro.",
      "Desce de quatro no chão.",
      "Gato-vaca no ritmo da respiração até completar os 2 minutos.",
    ],
    ondeSentir: "Quadril e lombar esquentando. Nada puxa ainda.",
    erradoSe: ["Já sente alongar → diminui; aquecimento é pra esquentar, não pra abrir."],
    renderMais: ["Nunca abre no frio: mesmo com pressa, os 2 minutos ficam."],
  },
  "Rã sustentada": {
    posicao: RA_POSICAO,
    movimento: [
      "Leva o quadril pra trás até o ponto em que a virilha puxa, sem dor.",
      "Fica parada 2 minutos, respirando pela barriga.",
      "A cada saída de ar, procura um músculo tenso (bumbum, coxa, mandíbula) e solta.",
    ],
    ondeSentir: "Parte de dentro das coxas e virilha, igual dos dois lados, cada vez com menos tensão.",
    erradoSe: [
      "Você vai avançando o quadril a cada respiração → fica onde já chega; o ganho desta fase é ficar sem tensão.",
      "Dor no joelho → mais almofada e joelhos um pouco mais fechados.",
    ],
    renderMais: ["Confere a mandíbula e os ombros a cada 30 segundos: soltos, o quadril solta junto."],
  },
  "90/90 sustentado": {
    posicao: `${SENTADA_PERNAS_DOBRADAS} Tronco reto.`,
    movimento: [
      "Inclina o tronco de leve sobre a perna da frente, coluna longa.",
      "Fica 90 segundos, sem apoiar as mãos se der.",
      "Troca as pernas de lado e fica mais 90 segundos.",
    ],
    ondeSentir: "Bumbum e lateral do quadril da perna da frente.",
    erradoSe: [
      "O tronco cai pra trás sem as mãos → apoia as pontas dos dedos no chão; tirar vem com as semanas.",
      "As costas arredondam → sobe o tronco e inclina menos.",
      ERR_DOI,
    ],
    renderMais: ["Mesmo tempo dos dois lados, mesmo que um seja mais duro."],
  },
  "Abertura em V com respiração": {
    posicao: "Sentada no chão, pernas esticadas e abertas em V até onde for confortável, dedos dos pés pra cima.",
    movimento: [
      "Senta reta e apoia as mãos no chão à sua frente.",
      "Inspira parada.",
      "Solta o ar e avança as mãos um pouco. Repete isso pelos 2 minutos.",
    ],
    ondeSentir: "Parte de dentro e de trás das coxas, igual dos dois lados.",
    erradoSe: [
      "A lombar arredonda → sobe um pouco; coluna longa vale mais que centímetro.",
      "Você avança também na inspiração → para enquanto entra o ar; só desce soltando.",
      ERR_DOI,
    ],
    renderMais: ["Senta na beira de uma almofada dobrada: o quadril inclina pra frente sem esforço."],
  },
  "Agachamento profundo livre": {
    posicao: "Em pé, pés um pouco mais abertos que o quadril, pontas levemente pra fora.",
    movimento: [
      "Desce o bumbum o mais baixo que der com os calcanhares no chão.",
      "Mãos juntas na frente do peito, cotovelos encostando de leve na parte de dentro dos joelhos.",
      "Fica 90 segundos e sobe devagar.",
    ],
    ondeSentir: "Virilha, parte de dentro das coxas e tornozelos.",
    erradoSe: [
      "Cai pra trás ou o calcanhar sobe → segura num apoio; continua na versão da fase 2 desse movimento até soltar.",
      "Os joelhos caem pra dentro → empurra os joelhos pra fora com os cotovelos.",
      ERR_DOI,
    ],
    renderMais: ["Lá embaixo, solta o ar devagar e deixa o peso do corpo trabalhar."],
  },
  "Vacuum abdominal · 60s em pé": vacuum(60, "Em pé, joelhos levemente dobrados, mãos nas coxas no começo. É a versão mais difícil."),
  "Respiração final": respiracaoFinal(
    `${DEITADA_JOELHOS} Mão na barriga.`,
    "Cada saída de ar solta uma parte: ombros, mandíbula, quadril.",
  ),
};

// ---------------------------------------------------------------------------
// NOITE

// Nivelar a pelve mora nas três fases da noite com o mesmo texto. Assimétrico
// de propósito: o lado puxado fica o dobro do tempo.
const NIVELAR_INCLINACAO: Execucao = {
  posicao: "Em pé, de lado pra uma parede, a um passo dela. Lado puxado: o da perna que pareceu mais curta no teste deitada.",
  movimento: [
    "Leva a perna do lado que vai alongar pra trás da outra, passando por trás.",
    "Sobe o braço desse mesmo lado pro alto. A outra mão na parede ou na cintura.",
    "Inclina o tronco pro lado contrário, sem girar e sem jogar o quadril pra frente.",
    "30 segundos alongando o lado bom, depois 60 alongando o lado puxado.",
  ],
  ondeSentir: "Lateral da cintura e do quadril do lado que alonga, da costela até o osso do quadril.",
  erradoSe: [
    "O tronco gira pra frente → imagina que está entre duas paredes de vidro; inclina só de lado.",
    "Puxa na lombar em vez da lateral → inclina menos e cresce pra cima antes de inclinar.",
    "Perde o equilíbrio → apoia a mão livre na parede.",
    "Dói em vez de puxar → inclina menos; para antes da dor.",
  ],
  renderMais: [
    "Respira fundo pra dentro da costela do lado que alonga: ela abre por dentro.",
    "Lado bom primeiro e lado puxado por último, sempre: termina pelo que precisa.",
  ],
};

const NIVELAR_FLEXOR: Execucao = {
  posicao:
    "Ajoelhada, um joelho no chão em cima de uma almofada, o outro pé à frente com o joelho dobrado em ângulo reto. Tronco reto, mãos na cintura.",
  movimento: [
    "Aperta o bumbum do lado do joelho que está no chão.",
    "Com o bumbum apertado, leva a pelve um pouco pra frente, sem arquear a lombar.",
    "Fica respirando: 30 segundos com o joelho do lado bom no chão, 60 com o joelho do lado puxado no chão.",
  ],
  ondeSentir: "Frente do quadril e alto da coxa da perna de trás, perto da virilha.",
  erradoSe: [
    "A lombar arqueia e a barriga vai pra frente → recua a pelve e aperta mais o bumbum.",
    "Sente só o joelho de baixo → mais almofada.",
    "Não sente nada → aperta o bumbum antes de levar a pelve; o movimento é pequeno.",
    "Dói em vez de puxar → leva menos a pelve pra frente; para antes da dor.",
  ],
  renderMais: [
    "Sobe o braço do lado do joelho no chão pro alto: o alongamento segue até a costela.",
    "A cada saída de ar, aperta o bumbum de novo.",
  ],
};

const NIVELAR: Record<string, Execucao> = {
  "Inclinação lateral (nivelar a pelve)": NIVELAR_INCLINACAO,
  "Flexor do quadril ajoelhada": NIVELAR_FLEXOR,
};

const AQUECIMENTO_NOITE: Execucao = {
  posicao: "Em pé, ao lado de uma parede ou de um móvel firme.",
  movimento: [
    "Mãos na cintura: círculo grande com o quadril, 8 vezes pra um lado e 8 pro outro.",
    "Uma mão na parede: balança a perna de fora esticada pra frente e pra trás, 10 vezes, solta, sem chutar.",
    "Vira de lado e faz 10 com a outra perna.",
  ],
  ondeSentir: "Quadril esquentando e a perna balançando cada vez mais solta.",
  erradoSe: [
    "Você chuta pra subir a perna → balanço pequeno; ele cresce sozinho conforme esquenta.",
    "O tronco balança junto → fica reta e mexe só a perna.",
  ],
  renderMais: ["Mesmo com o corpo morno do dia, não pula: são 90 segundos."],
};

const BORBOLETA_SEM_EMPURRAR = (minutos: string, extra: string): Execucao => ({
  posicao: "Sentada no chão, solas dos pés juntas, joelhos caídos pros lados, mãos nos pés ou no chão.",
  movimento: [
    "Senta reta, com o peso nos dois ossos do bumbum.",
    "Deixa os joelhos descerem pelo próprio peso, sem empurrar com as mãos.",
    `Fica ${minutos}, soltando o ar devagar.`,
  ],
  ondeSentir: "Parte de dentro das coxas, perto da virilha.",
  erradoSe: [
    "Você empurra os joelhos → tira as mãos; empurrar aqui faz o músculo fechar.",
    "A virilha fica tensa → afasta os pés um palmo do corpo e fica ali.",
    ERR_DOI,
  ],
  renderMais: [extra],
});

const PERNAS_NA_PAREDE = (minutos: string): Execucao => ({
  posicao: "Deitada de barriga pra cima com o bumbum encostado na parede e as pernas esticadas pra cima, apoiadas nela.",
  movimento: [
    "Abre as pernas em V, deslizando os calcanhares pela parede.",
    "Para onde a parte de dentro das coxas puxa de leve.",
    `Fica ${minutos} sem segurar nada: o peso das pernas faz o trabalho.`,
  ],
  ondeSentir: "Parte de dentro das coxas, de leve, igual dos dois lados.",
  erradoSe: [
    "Formigamento nos pés ou nas pernas → fecha um pouco as pernas ou dobra os joelhos.",
    "Você segura as pernas no ar com força → deixa elas cair até onde a parede segura.",
    ERR_DOI,
  ],
  renderMais: ["Respira pela barriga e solta as coxas a cada saída de ar."],
});

const JOELHO_POR_FORA_DO_OMBRO = (tempo: string): Execucao => ({
  posicao: `${DEITADA_JOELHOS}`,
  movimento: [
    "Puxa um joelho até o peito com as duas mãos.",
    "Leva esse joelho pro lado de fora do ombro do mesmo lado, mantendo o bumbum no chão.",
    `Fica ${tempo} desse lado, respirando, e troca de perna.`,
  ],
  ondeSentir: "Fundo do quadril e bumbum da perna dobrada, perto da virilha.",
  erradoSe: [
    "O bumbum sai do chão → traz o joelho menos pra perto.",
    "Beliscão na frente do quadril → afasta o joelho um pouco pra fora, até o beliscão sumir.",
    ERR_DOI,
  ],
  renderMais: ["A outra perna pode ficar esticada no chão, solta.", "O tempo do segundo lado é igual ao do primeiro."],
});

const GIRO_SOBRE_A_PERNA_DE_TRAS = (tempo: string): Execucao => ({
  posicao: `${SENTADA_PERNAS_DOBRADAS} Mãos no chão.`,
  movimento: [
    "Vira o peito pra perna de TRÁS.",
    "Inclina o tronco de leve sobre ela, com as mãos no chão dos dois lados do joelho.",
    `Fica ${tempo}, troca as pernas de lado e repete.`,
  ],
  ondeSentir:
    "Lateral e fundo do quadril da perna de trás. É o giro da coxa pra dentro, o movimento que quase ninguém treina e o que trava primeiro.",
  erradoSe: [
    "Pontada no joelho de trás → afasta mais esse pé do corpo.",
    "O bumbum da perna de trás sobe do chão → inclina menos.",
    ERR_DOI,
  ],
  renderMais: ["Mesmo tempo dos dois lados, mesmo que um seja mais duro.", "Solta o ar devagar e deixa o quadril amolecer."],
});

const NOITE_FASE_1: Record<string, Execucao> = {
  "Aquecimento de quadril (em pé)": {
    posicao: "Em pé, pés na largura do quadril, mãos na cintura, joelhos soltos.",
    movimento: [
      "Círculo grande com o quadril, 8 vezes pra um lado.",
      "Mais 8 vezes pro outro lado.",
    ],
    ondeSentir: "Quadril e lombar esquentando.",
    erradoSe: ["O tronco gira junto → peito parado, mexe só da cintura pra baixo."],
    renderMais: ["Círculo igual dos dois lados, tamanho e velocidade."],
  },
  ...NIVELAR,
  "Posição do gafanhoto (alongamento adutor)": {
    posicao: "Em pé, pés bem afastados, pontas pra frente, mãos nas coxas.",
    movimento: [
      "Dobra um joelho e leva o peso do corpo pra esse lado. A outra perna fica esticada.",
      "Fica 30 segundos.",
      "Volta pelo centro e faz o outro lado, 30 segundos.",
    ],
    ondeSentir: "Parte de dentro da coxa da perna esticada.",
    erradoSe: [
      "O joelho dobrado passa da ponta do pé ou cai pra dentro → afasta mais os pés.",
      "O tronco despenca pra frente → mãos nas coxas e peito alto.",
      ERR_DOI,
    ],
    renderMais: ["Mesmo tempo dos dois lados.", "Respira pela barriga e solta a coxa esticada na saída do ar."],
  },
  "Borboleta com cotovelo (pressão suave)": {
    posicao: "Sentada no chão, solas dos pés juntas, mãos segurando os pés, cotovelos apoiados na parte de dentro dos joelhos.",
    movimento: [
      "Senta reta.",
      "Solta o ar e apoia o peso dos cotovelos nos joelhos, bem de leve.",
      "Puxa o ar aliviando o peso. Repete por 2 minutos.",
    ],
    ondeSentir: "Parte de dentro das coxas, perto da virilha.",
    erradoSe: [
      "Dor na virilha ou no joelho → tira o peso dos cotovelos; só a perna pesa.",
      "Você empurra com força → pressão do tamanho do peso do braço, não mais.",
    ],
    renderMais: ["Pressiona só na saída do ar e alivia na entrada."],
  },
  "Agachamento profundo com pausa": {
    posicao: "Em pé, pés um pouco mais abertos que o quadril, pontas levemente pra fora, mãos juntas na frente do peito.",
    movimento: [
      "Desce o bumbum o mais baixo que der com os calcanhares no chão.",
      "Cotovelos encostam de leve na parte de dentro dos joelhos. Fica 30 segundos.",
      "Sobe devagar. 3 vezes.",
    ],
    ondeSentir: "Virilha, parte de dentro das coxas e tornozelos.",
    erradoSe: [
      "O calcanhar sobe ou você cai pra trás → segura num apoio firme.",
      "Os joelhos caem pra dentro → empurra os joelhos pra fora com os cotovelos.",
      ERR_DOI,
    ],
    renderMais: ["Lá embaixo, solta o ar devagar e relaxa o bumbum."],
  },
  "Frog stretch": {
    posicao: RA_POSICAO,
    movimento: [
      "Leva o quadril pra trás, na direção dos calcanhares, até a virilha puxar.",
      "Fica os 2 minutos respirando fundo.",
    ],
    ondeSentir: "Parte de dentro das coxas e virilha, igual dos dois lados.",
    erradoSe: [
      "Dor no joelho → mais almofada e joelhos um pouco mais fechados.",
      "A lombar afunda → barriga firme e quadril menos pra trás.",
    ],
    renderMais: ["A cada saída de ar, deixa o quadril descer sozinho, sem empurrar."],
  },
  "Happy baby (5 respirações)": {
    posicao: "Deitada de barriga pra cima, joelhos dobrados na direção do peito.",
    movimento: [
      "Segura as solas dos pés por fora, com os joelhos abertos pros lados, perto das axilas.",
      "Solas dos pés viradas pro teto.",
      "5 respirações lentas pela barriga.",
    ],
    ondeSentir: "Virilha e parte de dentro das coxas. A região entre as pernas solta junto.",
    erradoSe: [
      "O bumbum sobe do chão → segura nos tornozelos ou na parte de trás das coxas.",
      "O pescoço tensiona → apoia a cabeça no chão, queixo pra baixo.",
      ERR_DOI,
    ],
    renderMais: ["Balança de leve de um lado pro outro, massageando a lombar no chão."],
  },
  "Postura da deusa": {
    posicao: "Em pé, pés bem afastados, pontas viradas pra fora, mãos juntas na frente do peito.",
    movimento: [
      "Dobra os joelhos e desce, com os joelhos indo na direção dos pés.",
      "Tronco reto, sem inclinar pra frente.",
      "Fica 1 minuto respirando.",
    ],
    ondeSentir: "Parte de dentro das coxas, bumbum e frente das coxas trabalhando.",
    erradoSe: [
      "Os joelhos caem pra dentro → empurra os joelhos pra fora, na linha dos dedos.",
      "Dor no joelho → desce menos.",
    ],
    renderMais: ["Solta o ar devagar e relaxa os ombros, sem subir a posição."],
  },
  "Liberação final": BORBOLETA_SEM_EMPURRAR(
    "1 minuto",
    "Repara o quadril agora e no começo: essa diferença é o que a sessão fez.",
  ),
};

const NOITE_FASE_2: Record<string, Execucao> = {
  Aquecimento: AQUECIMENTO_NOITE,
  ...NIVELAR,
  "Joelho ao peito profundo": JOELHO_POR_FORA_DO_OMBRO("60 segundos"),
  "Rotação interna 90/90": GIRO_SOBRE_A_PERNA_DE_TRAS("45 segundos"),
  "Borboleta com respiração": BORBOLETA_SEM_EMPURRAR(
    "2 minutos",
    "Respira pela barriga: na saída do ar o joelho desce um pouco sozinho.",
  ),
  "Pernas na parede em V": PERNAS_NA_PAREDE("2 minutos"),
  "Happy baby": {
    posicao: "Deitada de barriga pra cima, joelhos dobrados na direção do peito.",
    movimento: [
      "Segura as solas dos pés por fora, joelhos abertos pros lados, perto das axilas.",
      "Balança de leve de um lado pro outro.",
      "Fica 90 segundos, respirando pela barriga.",
    ],
    ondeSentir: "Virilha e parte de dentro das coxas. A região entre as pernas solta junto.",
    erradoSe: [
      "O bumbum sobe do chão → segura nos tornozelos ou na parte de trás das coxas.",
      "O pescoço tensiona → cabeça no chão, queixo pra baixo.",
      ERR_DOI,
    ],
    renderMais: ["Na entrada do ar, deixa a região entre as pernas descer e alargar, sem empurrar."],
  },
};

const NOITE_FASE_3: Record<string, Execucao> = {
  Aquecimento: AQUECIMENTO_NOITE,
  ...NIVELAR,
  "Flexão profunda sustentada": {
    ...JOELHO_POR_FORA_DO_OMBRO("2 minutos"),
    renderMais: ["O alvo é o minuto 2 ser tão confortável quanto o minuto 1.", "O tempo do segundo lado é igual ao do primeiro."],
  },
  "Rotação interna sustentada": GIRO_SOBRE_A_PERNA_DE_TRAS("90 segundos"),
  "Borboleta longa": BORBOLETA_SEM_EMPURRAR(
    "3 minutos",
    "Se a virilha tensionar, recua um pouco e fica ali: conforto por mais tempo é o ganho desta fase.",
  ),
  "Pernas na parede em V": PERNAS_NA_PAREDE("3 minutos"),
  "Respiração final": respiracaoFinal(
    `${DEITADA_JOELHOS} Mão na barriga.`,
    "Termina solta, não alongada no limite.",
  ),
};

// ---------------------------------------------------------------------------
// ASSOALHO

const CONTRAI = "Contrai: fecha e puxa pra dentro e pra cima a base entre as pernas, como quem segura o xixi e o pum ao mesmo tempo.";

const RESPIRA_E_SOLTA = (tempo: string): Execucao => ({
  posicao: POS_SENTADA_DISCRETA,
  movimento: [
    "Solta tudo: barriga, bumbum, coxas, a base entre as pernas.",
    `Respira pela barriga até acabar ${tempo}.`,
  ],
  ondeSentir: "A base entre as pernas mole, sem aperto nenhum.",
  erradoSe: ["O músculo continua um pouco apertado → puxa o ar fundo e deixa a região descer junto com ele."],
  renderMais: ["Solta também a mandíbula: quando ela trava, a base entre as pernas trava junto."],
});

const PULSOS = (ritmo: string, vezes: number, posicao: string): Execucao => ({
  posicao,
  movimento: [
    `Contrai rápido e firme por ${ritmo}, como quem segura o xixi e o pum.`,
    `Solta por completo por ${ritmo}.`,
    `${vezes} vezes seguidas, num ritmo regular, como um relógio.`,
  ],
  ondeSentir: "Por dentro, na base entre as pernas: pulsos curtos e iguais.",
  erradoSe: [
    "Os pulsos embolam e o músculo não solta entre um e outro → diminui a velocidade até cada soltura ser completa.",
    ERR_BARRIGA_BUMBUM,
  ],
  renderMais: ["Cada soltura tão completa quanto cada aperto."],
});

const KEGEL_5X5 = (extra: string): Execucao => ({
  posicao: POS_SENTADA_DISCRETA,
  movimento: [
    `${CONTRAI} Firme, não o máximo.`,
    "Segura 5 segundos respirando normal.",
    "Solta por completo e descansa 5 segundos. 10 vezes.",
  ],
  ondeSentir: "Por dentro, na base entre as pernas, firme do primeiro ao quinto segundo.",
  erradoSe: [
    ERR_PRENDE_AR,
    ERR_BARRIGA_BUMBUM,
    "O aperto enfraquece antes dos 5 segundos → aperta menos e segura o tempo todo; qualidade antes de força.",
    ERR_DOR_PELVICA,
  ],
  renderMais: ["Solta devagar e por completo: o descanso também é treino.", extra],
});

const SUSTENTACAO = (s: number, vezes: number, extraErro?: string): Execucao => ({
  posicao: POS_SENTADA_DISCRETA,
  movimento: [
    `${CONTRAI} Uns 70% da força: forte, mas um aperto que dá pra manter.`,
    `Segura ${s} segundos respirando normal.`,
    `Solta por completo e descansa ${s} segundos. ${vezes} vezes.`,
  ],
  ondeSentir: "Por dentro, na base entre as pernas. No fim pode queimar um pouco: é cansaço do músculo.",
  erradoSe: [
    ERR_PRENDE_AR,
    "O aperto vai sumindo antes do fim → aperta menos no começo pra durar até o fim.",
    ...(extraErro ? [extraErro] : [ERR_BARRIGA_BUMBUM]),
    ERR_DOR_PELVICA,
  ],
  renderMais: ["O descanso dura o mesmo que o aperto: soltar tudo é parte do exercício."],
});

const PELVIC: Record<string, Record<string, Execucao>> = {
  "pelvic-identificacao": {
    "Respiração base": {
      posicao: `${DEITADA_JOELHOS} Uma mão na barriga.`,
      movimento: [
        "Inspira pelo nariz deixando a barriga subir.",
        "Solta o ar devagar pela boca, deixando o corpo pesar no chão.",
        "5 respirações lentas.",
      ],
      ondeSentir: "Barriga subindo e descendo. Bumbum, coxas e mandíbula moles.",
      erradoSe: ["O peito sobe mais que a barriga → manda o ar pra baixo, pra mão da barriga."],
      renderMais: ["Na última respiração, confere: a base entre as pernas também está mole."],
    },
    "Encontrar o músculo": {
      posicao: `${DEITADA_JOELHOS} Mão na barriga.`,
      movimento: [
        "Imagina que está fazendo xixi e precisa parar o jato no meio. Faz esse aperto, de leve.",
        "Repara onde ele acontece: por dentro, entre o púbis e o cóccix, na base entre as pernas.",
        "Solta. Repete algumas vezes, sem contar, só pra achar o lugar.",
      ],
      ondeSentir: "Por dentro, na base entre as pernas: o ânus fecha e a base do pinto puxa um pouco pra dentro. A barriga quase não mexe.",
      erradoSe: [
        "Você aperta o bumbum ou as coxas → deixa o bumbum mole e procura o aperto mais pra dentro.",
        "Você testa parando o xixi de verdade no banheiro → não faz: parar o xixi como treino atrapalha a bexiga esvaziar. É só imaginação.",
        ERR_PRENDE_AR,
      ],
      renderMais: ["Aperta bem fraco: aperto fraco é mais fácil de localizar que aperto forte."],
    },
    "Testar isolamento": {
      posicao: `${DEITADA_JOELHOS} Uma mão na barriga, a outra embaixo do bumbum.`,
      movimento: [
        `${CONTRAI} Segura 2 segundos.`,
        "Solta por completo e espera uns 5 segundos.",
        "10 vezes, conferindo com as mãos que barriga e bumbum continuam moles.",
      ],
      ondeSentir: "Só por dentro, na base entre as pernas. As mãos não sentem nada mexer.",
      erradoSe: [ERR_BARRIGA_BUMBUM, ERR_PRENDE_AR],
      renderMais: ["Repara se o aperto sai igual na frente (o do xixi) e atrás (o do pum)."],
    },
    "Visualização interna": {
      posicao: `${DEITADA_JOELHOS} Olhos fechados.`,
      movimento: [
        "Contrai devagar e imagina a base entre as pernas subindo, como um elevador saindo do térreo.",
        "Segura 3 segundos lá em cima.",
        "Solta devagar, imaginando o elevador voltar ao térreo e parar.",
        "5 vezes, sem pressa.",
      ],
      ondeSentir: "Por dentro, na base entre as pernas: um aperto que sobe e uma soltura que desce.",
      erradoSe: [
        "A soltura é largar de uma vez → solta em uns 3 segundos, controlando a descida.",
        ERR_BARRIGA_BUMBUM,
      ],
      renderMais: ["Na descida, solta o ar pela boca."],
    },
  },

  "pelvic-kegel-classico": {
    Aquecimento: {
      posicao: POS_SENTADA_DISCRETA,
      movimento: [`${CONTRAI} De leve, 2 segundos.`, "Solta por completo.", "3 vezes, só pra acordar o músculo."],
      ondeSentir: ONDE_APERTO,
      erradoSe: [ERR_BARRIGA_BUMBUM],
      renderMais: ["Começa fraco: o aquecimento é pra achar o músculo, não pra cansar."],
    },
    "Kegel 5x5 (série 1)": KEGEL_5X5("Conta os segundos no relógio, não na cabeça: a cabeça acelera."),
    Respira: RESPIRA_E_SOLTA("os 30 segundos"),
    "Kegel 5x5 (série 2)": KEGEL_5X5("A décima contração tem que sair igual à primeira."),
  },

  "pelvic-kegel-rapido": {
    "Pulsos rápidos (1s on, 1s off)": PULSOS("1 segundo", 20, POS_SENTADA_DISCRETA),
    Pausa: RESPIRA_E_SOLTA("os 30 segundos"),
    "Pulsos rápidos (mais rápido)": PULSOS("meio segundo", 20, POS_SENTADA_DISCRETA),
    Mistura: {
      posicao: POS_SENTADA_DISCRETA,
      movimento: [
        "5 pulsos rápidos: aperta e solta, 1 segundo cada.",
        "Logo em seguida, um aperto firme segurado por 3 segundos. Solta.",
        "Esse bloco 5 vezes.",
      ],
      ondeSentir: ONDE_APERTO,
      erradoSe: [
        "Os pulsos embolam com o aperto longo → pausa de um segundo entre os dois.",
        ERR_PRENDE_AR,
      ],
      renderMais: ["Solta por completo depois do aperto de 3 segundos, antes do próximo bloco."],
    },
  },

  "pelvic-sustentacao-longa": {
    Aquecimento: {
      posicao: POS_SENTADA_DISCRETA,
      movimento: [`${CONTRAI} De leve, 3 segundos.`, "Solta por completo.", "3 vezes."],
      ondeSentir: ONDE_APERTO,
      erradoSe: [ERR_BARRIGA_BUMBUM],
      renderMais: ["Começa fraco: é pra acordar, não pra cansar."],
    },
    "Sustentação 10s": SUSTENTACAO(10, 5),
    "Sustentação 15s": SUSTENTACAO(15, 3),
    "Sustentação 20s": SUSTENTACAO(
      20,
      2,
      "Não aguenta os 20 segundos → fica em 15 por mais umas semanas; 20 bem feitos vêm depois.",
    ),
  },

  "pelvic-escala-cinco-niveis": {
    "Subindo a escala": {
      posicao: `${POS_SENTADA_DISCRETA} Pensa numa escada de 5 degraus: 1 é quase nada, 3 é metade, 5 é o aperto máximo.`,
      movimento: [
        "Contrai bem de leve: degrau 1. Segura 2 segundos.",
        "Aperta um pouco mais a cada 2 segundos: degraus 2, 3 e 4.",
        "Degrau 5, aperto máximo, 2 segundos. Solta tudo.",
        "Faz a subida 5 vezes.",
      ],
      ondeSentir: "Por dentro, na base entre as pernas, cada degrau um pouco mais firme que o anterior.",
      erradoSe: [
        "Você pula do 1 direto pro 5 → aperta menos no começo; a diferença entre os degraus é o treino.",
        ERR_BARRIGA_BUMBUM,
        ERR_PRENDE_AR,
        ERR_DOR_PELVICA,
      ],
      renderMais: ["Prende a atenção nos degraus 1 e 2: os leves são os mais difíceis de acertar."],
    },
    "Descendo a escala": {
      posicao: `${POS_SENTADA_DISCRETA} Mesma escada de 5 degraus.`,
      movimento: [
        "Aperta no máximo: degrau 5. Segura 2 segundos.",
        "Afrouxa um pouco a cada 2 segundos: 4, 3, 2, 1.",
        "Depois do 1, solta tudo.",
        "Faz a descida 5 vezes.",
      ],
      ondeSentir: "Por dentro, na base entre as pernas, afrouxando em degraus, sem despencar.",
      erradoSe: [
        "O aperto despenca de uma vez → afrouxa menos a cada degrau; você está controlando a soltura, não largando.",
        ERR_PRENDE_AR,
        ERR_DOR_PELVICA,
      ],
      renderMais: ["Depois do degrau 1, solta mais um pouco com a inspiração."],
    },
    "Subida e descida": {
      posicao: POS_SENTADA_DISCRETA,
      movimento: [
        "Vai do degrau 1 ao 5 apertando aos poucos, em 10 segundos.",
        "Volta do 5 ao 1 afrouxando aos poucos, em mais 10 segundos.",
        "4 vezes, sem parar entre elas.",
      ],
      ondeSentir: "Por dentro, na base entre as pernas: o aperto sobe e desce como uma onda.",
      erradoSe: [
        "A subida sai em degraus e não em rampa → mais devagar.",
        ERR_PRENDE_AR,
      ],
      renderMais: ["A descida em 10 segundos inteiros, tão lenta quanto a subida."],
    },
    "Parar em nível": {
      posicao: POS_SENTADA_DISCRETA,
      movimento: [
        "Sobe até o degrau 3 e segura 5 segundos.",
        "Sobe pro 4 e segura 5 segundos. Sobe pro 5 e segura 5 segundos.",
        "Desce parando no 4, no 3, no 2 e no 1. Depois solta tudo.",
      ],
      ondeSentir: "Por dentro, na base entre as pernas, parado em cada degrau sem escorregar.",
      erradoSe: [
        "O aperto escorrega pro degrau de baixo enquanto você segura → segura menos tempo em cada degrau até conseguir parar sem escorregar.",
        ERR_PRENDE_AR,
        ERR_DOR_PELVICA,
      ],
      renderMais: ["Confere com a mão na barriga que ela não endurece nos degraus altos."],
    },
  },

  "pelvic-respiracao-conexao": {
    "Diafragma sozinho": {
      posicao: "Sentada, costas retas, pés no chão, uma mão na barriga.",
      movimento: [
        "Inspira pelo nariz em 4 segundos, enchendo a barriga, não o peito.",
        "Solta o ar pela boca em 6 segundos.",
        "5 respirações assim.",
      ],
      ondeSentir: "A mão subindo e descendo com a barriga. O peito quase parado.",
      erradoSe: ["O peito sobe → manda o ar pra mão da barriga."],
      renderMais: ["Repara a base entre as pernas descendo um pouco quando a barriga enche."],
    },
    "PC sozinho": {
      posicao: "Sentada, costas retas, pés no chão, uma mão na barriga.",
      movimento: [`${CONTRAI} Segura 3 segundos.`, "Solta por completo. 5 vezes.", "Respiração normal o tempo todo, sem combinar com o aperto."],
      ondeSentir: ONDE_APERTO,
      erradoSe: [ERR_PRENDE_AR, ERR_BARRIGA_BUMBUM],
      renderMais: ["Separar o aperto da respiração é o objetivo: um não manda no outro."],
    },
    "Coordenação: contrai expirando": {
      posicao: "Sentada, costas retas, pés no chão, uma mão na barriga.",
      movimento: [
        "Inspira enchendo a barriga e soltando a base entre as pernas.",
        "Solta o ar devagar e contrai junto, como quem segura o xixi e o pum.",
        "8 ciclos lentos.",
      ],
      ondeSentir: "Base entre as pernas subindo quando o ar sai e descendo quando o ar entra.",
      erradoSe: [
        "O aperto vem antes ou depois do ar → começa os dois juntos, mais devagar.",
        ERR_BARRIGA_BUMBUM,
      ],
      renderMais: ["Na inspiração, solta de propósito, sem esperar soltar sozinho."],
    },
    "Coordenação inversa: contrai inspirando": {
      posicao: "Sentada, costas retas, pés no chão, uma mão na barriga.",
      movimento: [
        "Inspira e contrai junto.",
        "Solta o ar e solta a base entre as pernas.",
        "8 ciclos lentos.",
      ],
      ondeSentir: "Base entre as pernas apertando quando o ar entra. Fica estranho: é o contrário do natural.",
      erradoSe: [
        "Você volta pro padrão anterior sem perceber → mais devagar, contando em voz baixa.",
        "O peito sobe pra compensar → ar na barriga, mesmo apertando.",
        ERR_PRENDE_AR,
      ],
      renderMais: ["Compara com a anterior: qual das duas é mais natural pra você? Anota."],
    },
    "Liberação final": {
      posicao: "Sentada ou deitada, como estiver mais confortável.",
      movimento: ["Solta tudo: barriga, bumbum, coxas, mandíbula, a base entre as pernas.", "Respira solta até o fim do minuto."],
      ondeSentir: "O corpo inteiro mais pesado. Compara com como ele estava no começo.",
      erradoSe: ["Sobra um aperto entre as pernas → inspira fundo e deixa descer junto com o ar."],
      renderMais: ["Termina sempre soltando, nunca apertando."],
    },
  },

  "pelvic-dance-integration": {
    "Aquecimento PC": {
      posicao: "Em pé, pés na largura do quadril, joelhos soltos.",
      movimento: [`${CONTRAI} Segura 3 segundos.`, "Solta 1 segundo.", "10 vezes."],
      ondeSentir: ONDE_APERTO,
      erradoSe: [ERR_BARRIGA_BUMBUM],
      renderMais: ["Solta por completo no segundo de pausa."],
    },
    "Aquecimento quadril": {
      posicao: "Em pé, pés na largura do quadril, mãos na cintura.",
      movimento: [
        "Círculo grande com o quadril, 8 vezes pra um lado e 8 pro outro.",
        "Sem apertar nada entre as pernas: aqui é só quadril.",
      ],
      ondeSentir: "Quadril e lombar soltando.",
      erradoSe: ["O tronco gira junto → peito parado, só da cintura pra baixo."],
      renderMais: ["Círculo igual dos dois lados."],
    },
    "Tilt pélvico com contração": {
      posicao: "Em pé, pés na largura do quadril, joelhos levemente dobrados, mãos na cintura.",
      movimento: [
        "Empina o bumbum pra trás, arqueando de leve a lombar, com a base entre as pernas solta.",
        "Leva a pelve pra frente, como quem esconde o bumbum embaixo do corpo, e contrai junto.",
        "Alterna 10 vezes, devagar.",
      ],
      ondeSentir: "Quadril balançando pra frente e pra trás; o aperto entre as pernas só na ida pra frente.",
      erradoSe: [
        "Você aperta o bumbum pra levar a pelve pra frente → o movimento sai da barriga baixa; o bumbum fica mole.",
        "O peito vai junto com o quadril → peito parado, só a pelve mexe.",
      ],
      renderMais: ["Na ida pra trás, solta de propósito, não só para de apertar."],
    },
    "Círculo + contração no topo": {
      posicao: "Em pé, pés na largura do quadril, joelhos soltos, mãos na cintura.",
      movimento: [
        "Círculo de quadril devagar, em qualquer sentido.",
        "Na metade de trás do círculo, contrai.",
        "Na metade da frente, solta.",
        "8 círculos pra cada lado.",
      ],
      ondeSentir: "Quadril desenhando o círculo e a base entre as pernas apertando e soltando no ritmo dele.",
      erradoSe: [
        "O aperto fica ligado o círculo inteiro → mais devagar, até conseguir soltar na frente.",
        ERR_PRENDE_AR,
      ],
      renderMais: ["Mesmo número de círculos pros dois lados."],
    },
    "Rebolado + PC pulsante": {
      posicao: "Em pé, pés na largura do quadril, joelhos soltos, mãos na cintura.",
      movimento: [
        "Rebola pra frente e pra trás num ritmo constante.",
        "Junto, pulsa: aperta 1 segundo e solta 1 segundo, sem parar o quadril.",
        "1 minuto seguido.",
      ],
      ondeSentir: "Quadril se mexendo e pulsos curtos entre as pernas, cada um no seu ritmo.",
      erradoSe: [
        "O quadril para quando você aperta → pulsa mais devagar até os dois andarem juntos.",
        ERR_PRENDE_AR,
      ],
      renderMais: ["Cada soltura completa, mesmo com o quadril em movimento."],
    },
    Livre: {
      posicao: "Em pé, com espaço em volta. Música, se quiser.",
      movimento: [
        "Mexe o quadril do jeito que quiser: rebolado, círculo, oito.",
        "Aperta e solta entre as pernas quando der vontade, no ritmo do corpo.",
        "1 minuto.",
      ],
      ondeSentir: "Quadril solto e o aperto aparecendo quando você escolhe.",
      erradoSe: ["O aperto fica ligado o tempo todo → solta de propósito entre um e outro."],
      renderMais: ["Termina soltando, não apertando."],
    },
  },

  "pelvic-pre-prazer": {
    "Respiração funda": {
      posicao: "Sentada ou deitada, num lugar com privacidade.",
      movimento: ["Inspira fundo pela boca, enchendo a barriga.", "Solta o ar pela boca, devagar.", "5 vezes."],
      ondeSentir: "O corpo amolecendo, ombros e mandíbula soltos.",
      erradoSe: ["O peito sobe e os ombros sobem → ar na barriga."],
      renderMais: ["Na saída do ar, solta a base entre as pernas junto."],
    },
    "Bombeio rápido": PULSOS("meio segundo", 20, "Sentada ou deitada, num lugar com privacidade."),
    "Sustentação intensa": {
      posicao: "Sentada ou deitada, num lugar com privacidade.",
      movimento: [
        `${CONTRAI} Aperto máximo, 10 segundos.`,
        "Solta e descansa 5 segundos.",
        "3 vezes.",
      ],
      ondeSentir: "Por dentro, na base entre as pernas: calor subindo pela região.",
      erradoSe: [ERR_PRENDE_AR, ERR_BARRIGA_BUMBUM, ERR_DOR_PELVICA],
      renderMais: ["Solta por completo nos 5 segundos: é a soltura que traz o sangue de volta."],
    },
    "Massagem em volta": {
      posicao: "Sentada ou deitada, roupa no corpo.",
      movimento: [
        "Com a mão por cima da roupa, faz círculos lentos na virilha, a dobra entre a coxa e a barriga.",
        "Sobe pro baixo-ventre, abaixo do umbigo, mesmos círculos.",
        "Pressão leve, sem pressa, 1 minuto.",
      ],
      ondeSentir: "Calor e sangue chegando na região.",
      erradoSe: ["Pressão funda que dói → só o peso da mão."],
      renderMais: ["Respira pela barriga enquanto massageia."],
    },
    Visualização: {
      posicao: "Sentada ou deitada, olhos fechados.",
      movimento: [
        "Leva a atenção pra base entre as pernas.",
        "Imagina calor e abertura na região, respirando fundo.",
        "1 minuto.",
      ],
      ondeSentir: "Calor e peso na região.",
      erradoSe: ["Você aperta sem querer → inspira e deixa descer."],
      renderMais: ["A cada inspiração, solta um pouco mais a região."],
    },
    "Pulsos finais": PULSOS("meio segundo", 10, "Sentada ou deitada, num lugar com privacidade."),
  },

  "pelvic-soltura-identificacao": {
    "Respiração diafragmática": {
      posicao: `${DEITADA_JOELHOS} Uma mão na barriga, a outra no peito.`,
      movimento: [
        "Inspira pelo nariz fazendo SÓ a mão da barriga subir.",
        "Solta o ar devagar pela boca.",
        "A mão do peito fica quieta. 10 respirações.",
      ],
      ondeSentir: "Só a mão da barriga mexe.",
      erradoSe: ["A mão do peito sobe → respira mais devagar e manda o ar pra baixo."],
      renderMais: ["Inspira em 4 segundos e solta em 6."],
    },
    "Sentir o períneo descer": {
      posicao: `${DEITADA_JOELHOS} Uma mão na barriga.`,
      movimento: [
        "Mesma respiração, só a barriga subindo.",
        "Na inspiração, presta atenção no períneo (a região entre o saco e o ânus): ele desce e alarga um pouco.",
        "Não empurra; só deixa acontecer. 8 respirações.",
      ],
      ondeSentir: "Entre o saco e o ânus, descendo de leve quando o ar entra e voltando quando sai.",
      erradoSe: [ERR_SOLTA_EMPURRANDO, "Não sente nada → normal nos primeiros dias; põe a mão por cima da roupa ali e sente pela mão."],
      renderMais: ["Inspira mais devagar: quanto mais lenta, mais dá pra sentir a descida."],
    },
    "Contraste (contrai → solta)": {
      posicao: `${DEITADA_JOELHOS} Uma mão na barriga.`,
      movimento: [
        `${CONTRAI} Segura 3 segundos.`,
        "Inspira e solta de propósito, deixando a região descer além de como ela fica parada.",
        "8 vezes.",
      ],
      ondeSentir: "A diferença entre o aperto e a soltura, na base entre as pernas.",
      erradoSe: [ERR_SOLTURA_PELA_METADE, ERR_SOLTA_EMPURRANDO],
      renderMais: ["Fica um segundo a mais na soltura do que no aperto."],
    },
    "Só soltura": {
      posicao: `${DEITADA_JOELHOS} Uma mão na barriga.`,
      movimento: [
        "Sem apertar antes, inspira e deixa a região entre as pernas descer.",
        "Solta o ar e deixa ela voltar sozinha.",
        "6 vezes.",
      ],
      ondeSentir: "A base entre as pernas descendo de leve só com a respiração.",
      erradoSe: [
        "Não sente nada → volta pro contraste: é normal levar dias pra sentir.",
        ERR_SOLTA_EMPURRANDO,
      ],
      renderMais: ["Solta a mandíbula antes de começar."],
    },
    Checagem: {
      posicao: `${DEITADA_JOELHOS}`,
      movimento: [
        "Passa a atenção por bumbum, coxas e mandíbula.",
        "Solta o que estiver duro.",
      ],
      ondeSentir: "Tudo mole: bumbum, coxas, mandíbula e a base entre as pernas.",
      erradoSe: ["A mandíbula está travada → abre a boca de leve; com ela travada, a base entre as pernas trava junto."],
      renderMais: ["Usa essa checagem também fora do treino, quando perceber que travou."],
    },
  },

  "pelvic-soltura-sustentada": {
    "Aquecimento respiratório": {
      posicao: `${DEITADA_JOELHOS} Uma mão na barriga, a outra no peito.`,
      movimento: ["Inspira pelo nariz enchendo a barriga.", "Solta o ar devagar pela boca. A mão do peito fica quieta.", "5 respirações lentas."],
      ondeSentir: "Só a mão da barriga mexe.",
      erradoSe: ["A mão do peito sobe → mais devagar, ar pra baixo."],
      renderMais: ["Na inspiração, já deixa a base entre as pernas descer."],
    },
    "Soltura de 10s": {
      posicao: `${DEITADA_JOELHOS} Uma mão na barriga.`,
      movimento: [
        "Inspira deixando a região entre as pernas descer e alargar.",
        "Mantém ela solta por 10 segundos, respirando normal por cima.",
        "Volta ao normal e repete. 6 vezes.",
      ],
      ondeSentir: "A base entre as pernas solta e parada, sem fechar sozinha.",
      erradoSe: [
        "Ela fecha de volta sozinha → é o reflexo; resistir a ele é o exercício. Inspira de novo e solta.",
        ERR_SOLTA_EMPURRANDO,
      ],
      renderMais: ["Confere a mandíbula no meio dos 10 segundos."],
    },
    "Soltura de 20s": {
      posicao: `${DEITADA_JOELHOS} Uma mão na barriga.`,
      movimento: [
        "Inspira e solta a região entre as pernas.",
        "Mantém 20 segundos, respirando normal.",
        "4 vezes.",
      ],
      ondeSentir: "A base entre as pernas solta pelos 20 segundos.",
      erradoSe: [
        "Perde a soltura no meio → recomeça sem se cobrar; perder é parte, é músculo aprendendo posição nova.",
        ERR_SOLTA_EMPURRANDO,
      ],
      renderMais: ["Respira mais devagar: respiração curta fecha a região."],
    },
    "Soltura em posição de quadril aberto": {
      posicao: "Sentada em borboleta (solas dos pés juntas, joelhos pros lados) ou deitada em happy baby (segurando as solas dos pés, joelhos perto das axilas).",
      movimento: [
        "Inspira e solta a região entre as pernas.",
        "Mantém 30 segundos, respirando normal.",
        "3 vezes.",
      ],
      ondeSentir: "Quadril aberto e a base entre as pernas solta ao mesmo tempo.",
      erradoSe: [
        "O alongamento da virilha te faz travar → abre menos o quadril; a soltura vem primeiro.",
        ERR_SOLTA_EMPURRANDO,
      ],
      renderMais: ["Alterna as duas posições entre as sessões."],
    },
  },

  "pelvic-alternancia": {
    Aquecimento: {
      posicao: POS_SENTADA_DISCRETA,
      movimento: [
        "5 respirações lentas pela barriga, soltando a base entre as pernas na entrada do ar.",
        `${CONTRAI} De leve, 2 segundos. Solta. 5 vezes.`,
      ],
      ondeSentir: "Base entre as pernas acordando nos dois sentidos: descer e subir.",
      erradoSe: [ERR_BARRIGA_BUMBUM],
      renderMais: ["Começa fraco: é pra acordar, não pra cansar."],
    },
    "Alternância lenta (5s / 5s)": {
      posicao: POS_SENTADA_DISCRETA,
      movimento: [
        `${CONTRAI} Firme, 5 segundos.`,
        "Solta de propósito por 5 segundos, deixando descer além de como fica parada.",
        "10 vezes, sem pressa.",
      ],
      ondeSentir: "Base entre as pernas subindo no aperto e descendo na soltura.",
      erradoSe: [ERR_SOLTURA_PELA_METADE, ERR_PRENDE_AR],
      renderMais: ["Solta junto com a inspiração."],
    },
    "Alternância rápida (2s / 2s)": {
      posicao: POS_SENTADA_DISCRETA,
      movimento: ["Contrai 2 segundos.", "Solta de propósito 2 segundos.", "12 vezes."],
      ondeSentir: "Base entre as pernas subindo e descendo em ritmo.",
      erradoSe: [
        "A soltura virou só parar de apertar → volta pro ritmo lento por uns ciclos.",
        ERR_BARRIGA_BUMBUM,
      ],
      renderMais: ["Mesma qualidade do ciclo lento, só mais rápido."],
    },
    Escada: {
      posicao: POS_SENTADA_DISCRETA,
      movimento: [
        "Contrai em 3 degraus: leve, médio, forte.",
        "Desce pelos mesmos 3: forte, médio, leve.",
        "Depois do leve, vai além e solta de propósito.",
        "6 subidas e descidas.",
      ],
      ondeSentir: "Base entre as pernas em degraus, terminando abaixo de como ela fica parada.",
      erradoSe: [
        "Os degraus embolam → sobe e desce mais devagar.",
        ERR_SOLTURA_PELA_METADE,
      ],
      renderMais: ["Fica um segundo a mais na soltura do fim."],
    },
    Cooldown: {
      posicao: POS_SENTADA_DISCRETA,
      movimento: ["Inspira e solta a base entre as pernas.", "Fica solta, respirando, até o fim."],
      ondeSentir: "Região mole.",
      erradoSe: ["Sobra um aperto → mais uma inspiração funda, deixando descer."],
      renderMais: ["Termina sempre soltando, nunca apertando."],
    },
  },

  "pelvic-start-stop": {
    Preparação: {
      posicao: "Sozinha, porta fechada, deitada ou sentada do jeito que for confortável.",
      movimento: [
        "Celular longe e nenhuma imagem: o estímulo é a sensação no corpo.",
        "Bastante lubrificante na mão.",
        "Define a escala antes de começar: 0 é nada, 10 é o ponto em que o gozo já não dá pra segurar.",
      ],
      ondeSentir: "Atenção no corpo: onde a excitação sobe, a respiração e a base entre as pernas.",
      erradoSe: [
        "Abriu vídeo ou foto → fecha; com imagem o treino é outro.",
        "Mão seca → mais lubrificante; atrito seco e pegada forte tiram sensibilidade com o tempo.",
      ],
      renderMais: ["Respira pela barriga desde o começo: respiração curta acelera a subida."],
    },
    "Subir até 7 de 10": {
      posicao: "Mesma posição, mão com lubrificante, pegada leve.",
      movimento: [
        "Masturba em ritmo constante, pegada leve.",
        "Vai dando nota pra excitação: 3, 5, 6.",
        "No 7, para por completo e tira a mão. Antes do 8, sempre.",
        "Espera a excitação cair até uns 4.",
      ],
      ondeSentir: "No 7, o aviso: respiração curta, calor subindo, a base entre as pernas apertando sozinha.",
      erradoSe: [
        "Passou do 8 sem perceber → no próximo ciclo para no 6; o 7 fica claro com as sessões.",
        "Pegada forte e rápida pra chegar logo → afrouxa a mão e diminui o ritmo; a sessão é lenta de propósito.",
      ],
      renderMais: ["Na pausa, respira fundo pela barriga e solta a base entre as pernas: a excitação cai mais rápido."],
    },
    "Repetir 3 vezes": {
      posicao: "Mesma posição, mão com lubrificante, pegada leve.",
      movimento: ["Sobe de novo até 7.", "Para por completo e tira a mão.", "Espera cair até 4.", "Esse ciclo 3 vezes no total."],
      ondeSentir: "O sinal que vem logo antes do 8, cada vez mais fácil de reconhecer.",
      erradoSe: [
        "A excitação não cai na pausa → abre os olhos, tira a mão e respira fundo pela barriga.",
        "Passou do ponto e gozou → a sessão vale; no próximo dia, para no 6.",
      ],
      renderMais: ["Repara o que muda no corpo entre o 7 e o 8: esse é o sinal que você está aprendendo."],
    },
    "Contrair na descida": {
      posicao: "Durante a pausa, mão parada fora.",
      movimento: [
        `${CONTRAI} Firme, 5 segundos.`,
        "Solta por completo.",
        "Duas ou três vezes em cada pausa.",
      ],
      ondeSentir: "Base entre as pernas apertando com a excitação ainda alta.",
      erradoSe: [
        "O aperto empurra a excitação pra cima → aperta mais fraco ou espera cair mais antes de apertar.",
        ERR_PRENDE_AR,
      ],
      renderMais: ["Solta tão bem quanto aperta: o controle é a dupla, não só o aperto."],
    },
    Encerrar: {
      posicao: "Do jeito que estiver.",
      movimento: [
        "Termina gozando ou não: os dois valem como sessão.",
        "Anota até onde chegou e em qual nota sentiu o aviso.",
      ],
      ondeSentir: "Nada em especial: é o fim.",
      erradoSe: ["Você acha que precisa terminar sem gozar → não precisa; os 3 ciclos de controle já são o treino."],
      renderMais: ["Na próxima, compara: o aviso apareceu antes ou depois?"],
    },
  },

  "pelvic-receber-preparo": {
    "Aquecimento de quadril": {
      posicao: "No chão ou na cama, com privacidade.",
      movimento: [
        "Borboleta sentada (solas dos pés juntas, joelhos pros lados) por 1 minuto, respirando fundo.",
        "Deita e faz happy baby (segurando as solas dos pés, joelhos perto das axilas) por 1 minuto.",
      ],
      ondeSentir: "Virilha e parte de dentro das coxas soltando.",
      erradoSe: ["Você força a abertura → para onde só puxa; quadril tenso fecha a região."],
      renderMais: ["Solta a base entre as pernas a cada inspiração."],
    },
    "Soltura sem pressão": {
      posicao: `${DEITADA_JOELHOS}`,
      movimento: [
        "Inspira e solta a base entre as pernas, como na fase da soltura.",
        "Mantém 30 segundos respirando normal.",
        "4 vezes. Nada encostando na região ainda.",
      ],
      ondeSentir: "A base entre as pernas solta e parada.",
      erradoSe: [ERR_SOLTA_EMPURRANDO, "Não consegue manter 30 segundos → o trabalho ainda é na sequência de soltura; volta pra ela."],
      renderMais: ["Mandíbula solta durante toda a soltura."],
    },
    "Lubrificante, de sobra": {
      posicao: "Unha do dedo curta e lixada, sem ponta.",
      movimento: [
        "Muito lubrificante no dedo e na entrada do ânus, bem mais do que parece necessário.",
        "Reaplica sempre que sentir atrito.",
      ],
      ondeSentir: "Tudo deslizando, sem nenhum puxão de pele.",
      erradoSe: ["Sente atrito ou ardência → mais lubrificante; a região não lubrifica sozinha e atrito causa machucado pequeno."],
      renderMais: ["Deixa o lubrificante ao alcance da mão antes de começar, pra não interromper."],
    },
    "Pressão externa com soltura": {
      posicao: "Deitada de lado ou de barriga pra cima com joelhos dobrados, a que deixar mais solta.",
      movimento: [
        "Dedo com lubrificante parado na entrada do ânus, só por fora.",
        "Na inspiração, solta a base entre as pernas e faz uma pressão leve.",
        "Na expiração, alivia a pressão.",
        "Se a região fechar, para, respira e recomeça.",
      ],
      ondeSentir: "Pressão por fora e a região se abrindo de leve na inspiração.",
      erradoSe: [
        "A região aperta contra o dedo → tira a pressão, respira duas vezes e recomeça. Fechar é informação, não fracasso.",
        ERR_DOR_PELVICA,
      ],
      renderMais: ["Fica mais tempo na pressão parada antes de pensar em entrar."],
    },
    "Entrada de um dedo, com respiração": {
      posicao: "Mesma posição, dedo com lubrificante.",
      movimento: [
        "Inspira e solta a base entre as pernas.",
        "Entra com um dedo, devagar, só durante a inspiração. Na expiração, para.",
        "Quando entrar, fica parada, sem mexer o dedo, respirando, até a pressão virar só presença.",
      ],
      ondeSentir: "Pressão que vai diminuindo até virar só a sensação do dedo ali.",
      erradoSe: [
        "Aperto (sem dor) → para de avançar, respira e espera; se não ceder, sai devagar e volta pra pressão por fora.",
        "Você mexe o dedo → nesta fase o dedo fica parado.",
        ERR_DOR_PELVICA,
      ],
      renderMais: ["Sai tão devagar quanto entrou, na inspiração."],
    },
    "Progressão em semanas": {
      posicao: "Fora do treino: é a regra de quando avançar.",
      movimento: [
        "Só avança quando o degrau de agora estiver confortável em duas sessões seguidas.",
        "Um degrau de cada vez: mais tempo parada, depois movimento pequeno, depois mais um dedo.",
      ],
      ondeSentir: "Cada degrau novo começa com pressão e termina em conforto.",
      erradoSe: [
        "Pula degrau porque o anterior saiu bem uma vez → volta; uma vez não é duas seguidas.",
        "Sangue ou dor que fica depois → para por uns dias e volta um degrau. Se sangrar de novo ou não parar, procura médico antes de voltar.",
      ],
      renderMais: ["Anota em que degrau está, pra não depender da memória."],
    },
  },
};

export const EXECUCAO_DAS_SEQUENCIAS: Record<string, Record<string, Execucao>> = {
  "mobilidade-pelvica-matinal": MANHA_FASE_1,
  "flex-manha-amplitude": MANHA_FASE_2,
  "flex-manha-sustentacao": MANHA_FASE_3,
  "flexibilidade-intima": NOITE_FASE_1,
  "flex-noite-amplitude": NOITE_FASE_2,
  "flex-noite-sustentacao": NOITE_FASE_3,
  ...PELVIC,
};
