import type { GuideSection } from "../components/GuideAccordion";
import { HORIZONTE_FLEX } from "../lib/flex-progression";

// Onde dá pra chegar, dito sem adoçante. A TRH não tem data — então este
// arquivo NÃO é uma escada esperando por ela. São duas trilhas simultâneas,
// uma com teto e outra favorecida pela configuração de hoje.
export const HORIZONTES: GuideSection[] = [
  {
    id: "trilha-vestida",
    title: "Trilha 1 — o corpo vestida",
    intro: "O que treino e dieta constroem, e onde está o teto.",
    tips: [
      "Vem: cintura de 99 para 84, glúteo grande e denso, e a razão cintura÷quadril saindo de 0,87 para 0,75-0,78 — 0,72-0,74 se a execução for muito boa.",
      "Seu ombro nunca foi o problema: ombro÷quadril já está em 1,06, que é faixa feminina (homem cis típico fica entre 1,15 e 1,25). A cintura é o problema inteiro.",
      "NÃO vem sem hormônio: gordura macia no quadril e na coxa, mama, pele mais fina, menos pelo no corpo, mudança na gordura do rosto. Isso é impossível, não difícil — nenhum treino do mundo entrega.",
      "Então o contorno que você constrói é ampulheta ATLÉTICA: cintura seca sobre glúteo grande, em esqueleto estreito. Não é a mesma linha das referências que você guardou — o degrau de quadril delas é gordura estrogênica na lateral do quadril, e glúteo cresce para trás e para cima, não para o lado. É outro material, não outro esforço.",
      "Seu quadril termina nos mesmos 114 cm de hoje, feito de outra coisa. Mesmo número, corpo irreconhecível — por isso a fita sozinha engana e a foto lado a lado não.",
    ],
  },
  {
    id: "trilha-cama",
    title: "Trilha 2 — o corpo na cama",
    intro: "A parte que a configuração de hoje favorece.",
    tips: [
      "Força para levantar sua noiva, ganho de músculo rápido, libido, ereção, firmeza e controle: tudo isso depende de testosterona.",
      "Hormonizar custaria esses. Então não é uma espera — é um conflito real entre dois objetivos seus, e conflito se decide, não se aguarda.",
      // Mesmo prazo que a seção "flexibilidade" declara, derivado da MESMA
      // fonte. Estava escrito à mão aqui ("3 a 6 meses") enquanto a seção nova
      // derivava de HORIZONTE_FLEX — o mesmo número em dois lugares, num
      // arquivo cujo comentário afirma que os números vêm do módulo. Divergiria
      // no primeiro dia em que o módulo mudasse, e ela leria dois prazos
      // diferentes para a mesma coisa na mesma tela.
      `Flexibilidade de quadril para as posições que você quer: ${HORIZONTE_FLEX.posicoesQueElaQuerMeses[0]} a ${HORIZONTE_FLEX.posicoesQueElaQuerMeses[1]} meses de trabalho diário resolvem praticamente tudo. É a coisa mais rápida da sua lista, e espacate não é necessário para nada disso.`,
      "Assoalho pélvico treinado nos DOIS sentidos — contrair e relaxar — é o que sustenta firmeza, controle e conforto ao receber. Frequência importa mais que duração.",
      "A barriga também está aqui: gordura abdominal converte testosterona em estrogênio. Ela é ao mesmo tempo o problema da silhueta e parte do problema da firmeza. Uma frente só, não duas.",
    ],
  },
  {
    id: "cirurgia",
    title: "Se um dia quiser cirurgia",
    intro: "BBL é a única alavanca que dá volume de gordura macia no quadril sem hormônio.",
    tips: [
      "Precisa de gordura corporal para colher — não dá para fazer no auge da secura.",
      "É historicamente a cirurgia estética com maior mortalidade, por embolia gordurosa. A técnica subfascial reduziu muito esse risco, mas ele não é zero. Isso entra na conta.",
      "Feita sobre glúteo já treinado, rende muito mais: o cirurgião tem estrutura para trabalhar e o resultado dura.",
      "A ordem certa é a que você já está seguindo: treino agora, cirurgia depois dos 30 se ainda quiser. Treinar não atrasa — prepara.",
    ],
  },
  {
    id: "linha-do-tempo",
    title: "Linha do tempo",
    intro: "Prazos contados a partir da medição de 13/05/2026. O que define o ritmo é adesão, não idade.",
    tips: [
      "Semana 8-10: a primeira mudança que aparece em foto.",
      "Mês 3-4: cintura em 88. É a trava que destrava o superávit no app.",
      "Mês 6-8: cintura em 84, peso por volta de 81 kg. É aqui que a silhueta vira.",
      "Mês 8-30: fase 2. A balança SOBE de propósito, até 85-88 kg, e o quadril volta aos mesmos 114 cm de hoje, agora feitos de músculo. Ver 85 kg nessa fase é o sinal de que deu certo, não de que falhou.",
      "Destreinada com gordura na faixa de 25-30% é a configuração que responde mais rápido que existe: dá para perder gordura e ganhar músculo ao mesmo tempo. Essa janela fecha.",
    ],
  },
  {
    id: "flexibilidade",
    title: "Horizonte da flexibilidade",
    // Sem prazo declarado ela mede o progresso contra uma meta que nunca foi
    // dela — o caso concreto é espacate: é o que todo mundo assume que
    // "flexibilidade" significa, e não serve para nada do que ela quer.
    // Números vêm de HORIZONTE_FLEX (src/lib/flex-progression.ts), não escritos
    // à mão — a regra que evitou três divergências texto×módulo neste projeto.
    intro: "Prazo declarado, para não medir progresso contra uma meta que nunca foi sua.",
    tips: [
      `A primeira mudança perceptível vem em ${HORIZONTE_FLEX.primeiraMudancaSemanas[0]} a ${HORIZONTE_FLEX.primeiraMudancaSemanas[1]} semanas de prática diária — o horizonte mais curto desta lista inteira.`,
      `O que as posições que você quer pedem — abertura, rotação, sustentação sem tensão — vem em ${HORIZONTE_FLEX.posicoesQueElaQuerMeses[0]} a ${HORIZONTE_FLEX.posicoesQueElaQuerMeses[1]} meses de trabalho diário. Isso resolve praticamente tudo.`,
      "Espacate não é necessário para nada disso. Não é meta deste plano — se aparecer no caminho, é bônus, não objetivo.",
      `Espacate frontal, só se você quiser por querer, leva ${HORIZONTE_FLEX.espacateFrontalMeses[0]} a ${HORIZONTE_FLEX.espacateFrontalMeses[1]} meses de trabalho constante.`,
      `Espacate lateral: ${HORIZONTE_FLEX.espacateLateral}`,
    ],
  },
];
