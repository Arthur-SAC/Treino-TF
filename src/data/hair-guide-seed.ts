export interface HairGuideSection {
  id: string;
  title: string;
  intro?: string;
  tips: string[];
}

// Guia da jornada de crescimento do cabelo (cacheado natural, sem química/calor).
// Conteúdo estático — boas práticas gerais, não substitui terapeuta capilar.
export const HAIR_GUIDE: HairGuideSection[] = [
  {
    id: "crescimento",
    title: "Crescimento & cronograma",
    intro: "Crescer cacho é maratona — o segredo é constância, não intensidade.",
    tips: [
      "O cabelo cresce ~1cm por mês em média; abaixo dos ombros a partir de curto leva tempo — paciência é parte do plano",
      "Cacho 'encolhe' (shrinkage): ele parece bem mais curto seco do que é molhado/esticado — não se engane com o espelho",
      "Cronograma: hidratação semanal · nutrição quinzenal · reconstrução mensal",
      "Não exagera na reconstrução (proteína): em excesso resseca e quebra o fio — mensal basta",
      "Couro cabeludo saudável faz crescer melhor: massageia com as pontas dos dedos e limpa bem sem agredir",
      "Proteína e nutrientes vêm da dieta (já no seu plano alimentar) — cabelo é construído de dentro pra fora",
    ],
  },
  {
    id: "retencao",
    title: "Retenção de comprimento",
    intro: "Crescer é fácil; o desafio é a ponta não quebrar na mesma velocidade.",
    tips: [
      "Dorme em fronha ou touca de cetim/seda — algodão resseca e quebra o fio durante a noite",
      "Prende num coque ou trança frouxa pra dormir, pra não enroscar e arrebentar",
      "Baixa manipulação: quanto menos você mexe/penteia seco, menos quebra",
      "Desembaraça só com o cabelo úmido e com condicionador, usando os dedos ou pente de dente largo, da ponta pra raiz",
      "Apara SÓ as pontas a cada 3-4 meses: tira a ponta dupla sem perder comprimento (ponta dupla sobe e quebra mais)",
      "Seca com camiseta de algodão ou toalha de microfibra, amassando — nunca esfregando",
      "Continua longe de calor e química, como você já faz — é o maior favor pro comprimento",
    ],
  },
  {
    id: "fase-chata",
    title: "Fase chata + cortes de transição",
    intro: "Todo crescimento passa por um meio-termo esquisito. Dá pra atravessar com elegância.",
    tips: [
      "O cacho tende a virar 'triângulo' (fino em cima, volumoso embaixo) e as laterais 'abrem' — é normal da transição",
      "Apara pra dar FORMA, não pra encurtar: camadas longas tiram o triângulo e mantêm o comprimento",
      "No salão, pede assim: 'quero deixar crescer — só dar forma e tirar as pontas, camadas longas, sem diminuir o comprimento'",
      "Disfarça os dias difíceis com presilha, bandana, headband ou meio-coque — viram estilo, não esconderijo",
      "Não corta por impulso na fase chata: o arrependimento custa meses de crescimento",
    ],
  },
  {
    id: "definicao",
    title: "Definição de cachos",
    intro: "Cabelo crescendo bonito e definido motiva a seguir na jornada.",
    tips: [
      "Lava com shampoo suave (ou co-wash) e capricha no condicionador",
      "Aplica leave-in + gel/gelatina com o cabelo ENCHARCADO — água é o que ativa o cacho",
      "Faz 'scrunch' (amassa de baixo pra cima) pra formar o cacho, e plopping com camiseta pra tirar o excesso de água",
      "Seca ao natural ou com difusor em temperatura e velocidade baixas",
      "Não mexe enquanto forma a 'casquinha' (cast); quando secar, amassa pra soltar e o cacho fica macio",
      "Nos dias seguintes, refresca com borrifador de água (+ um pouco de leave-in) em vez de lavar de novo",
      "Produtos acessíveis no Brasil: creme/leave-in pra cachos e um gel ou gelatina de boa fixação — começa simples",
    ],
  },
];
