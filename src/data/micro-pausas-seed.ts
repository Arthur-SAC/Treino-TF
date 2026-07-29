// src/data/micro-pausas-seed.ts
// Catálogo de micro-pausas de postura: o que fazer nas pausas do trabalho.
// Ela sabe que precisa parar, só não sabia o quê — este é o conteúdo.
//
// O ambiente de trabalho dela não é receptivo, então discrição não é
// conforto, é requisito: a maioria dos movimentos tem que ser invisível,
// feita na própria mesa, sem chamar atenção.

export interface MicroPausa {
  id: string;
  nome: string;
  duracao: string;
  /** "invisivel" = dá pra fazer na mesa sem ninguém notar. "precisa-de-canto"
   *  = precisa de um cantinho ou ficar em pé sozinha um instante.
   *  "normal" = envolve se levantar e andar, sem disfarce nenhum. */
  discricao: "invisivel" | "precisa-de-canto" | "normal";
  como: string;
  porque: string;
}

export const MICRO_PAUSAS: MicroPausa[] = [
  {
    id: "levantar",
    nome: "Levantar e ficar em pé",
    duracao: "1 min",
    discricao: "invisivel",
    como: "Levanta da cadeira e fica em pé por um minuto — aproveita pra pegar algo, atender uma call em pé, o que for. Não precisa anunciar nada.",
    porque: "Cada hora sentada desliga um pouco mais o glúteo, que passa a trabalho nenhum enquanto o quadril carrega o peso sozinho. Ficar em pé é o oposto direto de 7h sentada — é reativar o músculo que o treino de glúteo-prioritário está tentando construir.",
  },
  {
    id: "apertar-gluteo",
    nome: "Apertar o glúteo, sentada",
    duracao: "10x de 3s",
    discricao: "invisivel",
    como: "Sentada, contrai as duas bandas do glúteo com força por 3 segundos, solta, repete 10 vezes. Ninguém vê nada — dá pra fazer numa call com câmera ligada.",
    porque: "É ativação, não é sobre queimar calorias: sem isso, o glúteo passa o dia inteiro \"desligado\" de tanto sentar, e o treino rema contra a maré de 9h de inibição por dia.",
  },
  {
    id: "queixo-pra-tras",
    nome: "Queixo pra trás (retração cervical)",
    duracao: "10x",
    discricao: "invisivel",
    como: "Puxa o queixo pra trás, como um \"papo duplo\" de propósito, sem inclinar a cabeça pra baixo. Solta. Repete 10 vezes.",
    porque: "Corrige aos poucos a cabeça anteriorizada de ficar debruçada na tela — é o que define a linha do pescoço de perfil, um dos pontos que mais muda a leitura do rosto nas fotos.",
  },
  {
    id: "juntar-escapulas",
    nome: "Juntar as escápulas",
    duracao: "10x de 2s",
    discricao: "invisivel",
    como: "Junta as omoplatas por trás, como se fosse prender um lápis entre elas, segura 2 segundos, solta. 10 vezes.",
    porque: "Compensa o ombro projetado pra frente de ficar no teclado — abre a leitura do tronco hoje, sem depender de perder peso ou esperar a TRH.",
  },
  {
    id: "alongar-flexor-quadril",
    nome: "Alongamento do flexor de quadril",
    duracao: "30s cada lado",
    discricao: "precisa-de-canto",
    como: "Em pé, num cantinho ou perto do bebedouro, dá um passo à frente e afunda o quadril levemente, sentindo o alongamento na frente da coxa/virilha da perna de trás. 30 segundos de cada lado.",
    porque: "O flexor de quadril encurta de ficar sentada e puxa a pelve pra frente — isso empurra a postura e esconde justamente o glúteo que o treino está construindo. Alongar é o contrapeso direto do treino.",
  },
  {
    id: "ir-ao-bebedouro",
    nome: "Ida ao bebedouro",
    duracao: "2 min",
    discricao: "normal",
    como: "Levanta, anda até o bebedouro ou a cozinha, enche a garrafa, volta andando devagar.",
    porque: "Junta duas coisas que você já precisa: tirar o quadril da cadeira e bater a meta de água — e caminhar ativa o glúteo de um jeito que sentar nunca vai fazer.",
  },
];
