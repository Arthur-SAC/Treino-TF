import type { GuideSection } from "../components/GuideAccordion";

// Guia de clareamento de pele (manchas de sol, axila, virilha, perianal). Conteúdo
// estático — boas práticas gerais, NÃO substitui dermatologista, sobretudo na área anal
// e pra ativos potentes.
export const CLAREAMENTO_GUIDE: GuideSection[] = [
  {
    id: "como-funciona",
    title: "Como o clareamento funciona",
    intro: "Pele escurece por atrito, sol, inflamação e depilação agressiva — clarear é tratar a causa + usar ativos certos, com paciência.",
    tips: [
      "Ativos seguros pra começar: niacinamida, alfa-arbutina, vitamina C, ácido tranexâmico, ácido azelaico/kójico",
      "Eles reduzem a produção de melanina e uniformizam — efeito gradual, não imediato",
      "NÃO use sem dermatologista: hidroquinona e ácidos fortes em mucosa/área íntima",
      "Sempre faça teste de mancha (patch test) num cantinho antes de espalhar num lugar novo",
      "Constância vale mais que potência: ativo suave todo dia > ativo forte de vez em quando",
    ],
  },
  {
    id: "regra-de-ouro",
    title: "Regra de ouro",
    intro: "Sem isso, nada clareia de verdade — e o que clareou volta.",
    tips: [
      "Protetor solar diário é inegociável onde pega sol: sem FPS a mancha sempre volta",
      "Reduza atrito e calor: roupa apertada, tecido sintético e suor constante escurecem axila/virilha",
      "Depilação menos agressiva: gilete irrita e escurece — elétrico/laser é melhor (veja Depilação)",
      "Roupa de algodão e secar bem a pele depois do banho ajudam virilha e axila",
      "Não esfrega com força nem usa bucha dura nas áreas que quer clarear",
    ],
  },
  {
    id: "por-area",
    title: "Por área",
    intro: "Cada região tem um cuidado próprio.",
    tips: [
      "Manchas de sol (rosto/corpo): vitamina C + FPS de manhã; ativo clareador ou ácido suave à noite",
      "Axila: rotina pronta no Skincare; clareador à noite, sem desodorante na hora da aplicação",
      "Virilha: clareador só na pele externa, NUNCA na mucosa; algodão e menos atrito",
      "Perianal/ânus: pele muito delicada — só ativos suaves (niacinamida/alfa-arbutina), com teste de mancha, e NADA de ácido forte/hidroquinona por conta própria",
      "A região anal pede acompanhamento dermatológico — não improvise ativos potentes ali",
      "Axila e virilha: o clareador funciona muito melhor junto com depilação menos agressiva — lâmina irrita, inflama e encrava, o que escurece a pele de novo. Laser é a solução de raiz: ataca o pelo, elimina o encravado e previne a mancha futura de uma vez (veja o módulo Depilação)",
    ],
  },
  {
    id: "prazo",
    title: "Prazo e expectativas",
    intro: "Clareamento é maratona — saber o tempo evita frustração e exagero.",
    tips: [
      "8-12 semanas pra começar a ver diferença; meses pro resultado pleno",
      "Clareia alguns tons e uniformiza — não 'embranquece' a pele",
      "Se você parar a proteção solar, a mancha regride pro estado anterior",
      "Se irritar, vermelhão ou arder: pausa o ativo e deixa a pele se recuperar antes de voltar",
    ],
  },
  {
    id: "dermato",
    title: "Quando procurar dermatologista",
    intro: "Tem hora que o profissional acelera e protege o resultado.",
    tips: [
      "Mancha nova, que cresce, muda de cor ou de forma — avalia sempre",
      "Pra área anal/perianal, antes de usar qualquer ativo",
      "Quando quiser ativos mais fortes (peeling, fórmula manipulada, hidroquinona)",
      "Qualquer irritação persistente. Você já tem o marco 'buscar dermato' na Trilha",
    ],
  },
];
