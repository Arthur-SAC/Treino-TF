export interface DiscreetSection {
  id: string;
  title: string;
  intro?: string;
  tips: string[];
}

// Trilho "começar discreto" — experimentar feminilidade em ambiente hostil, subindo do
// imperceptível ao ousado em espaço seguro. Conteúdo estático.
export const ESTILO_DISCRETO: DiscreetSection[] = [
  {
    id: "escada",
    title: "Escada de níveis",
    intro: "Sobe um degrau quando você se sentir segura — não é corrida, e dá pra ficar num nível o tempo que quiser.",
    tips: [
      "Nível 1 (ninguém percebe): pele cuidada, sobrancelha alinhada, unhas limpas e lisas, cabelo cuidado, postura e voz, perfume neutro, roupa que veste bem o corpo",
      "Nível 2 (lê como 'cuidada/alternativa'): corte mais comprido, base ou brilho incolor na unha, peças unissex mais ajustadas, bálsamo labial com leve cor, um acessório discreto",
      "Nível 3 (andrógino/fluido, em espaços mais abertos): calça de corte feminino neutro, blusa com caimento, rímel discreto, esmalte nude, brinco pequeno",
      "Nível 4 (ousado, só em espaço seguro — casa, com a amada, ambientes queer): maquiagem completa, cor nas unhas, silhueta feminina marcada, vestido/saia, lingerie",
    ],
  },
  {
    id: "por-categoria",
    title: "Por categoria (o que passa → como puxar pro feminino)",
    intro: "O que já passa batido hoje, e o empurrãozinho sutil em cada frente.",
    tips: [
      "Roupa: neutros (preto/areia/marrom), corte unissex que veste bem, gola V sutil, cintura levemente marcada, camadas — feminiliza sem gritar",
      "Maquiagem: começa pela pele (base leve/corretivo) + sobrancelha + bálsamo; depois um rímel discreto; cor só em espaço seguro (veja Maquiagem)",
      "Unhas: base ou brilho incolor agora; cor fica pra casa/com a amada (veja o módulo Unhas)",
      "Cabelo: crescer e cuidar dos cachos já feminiliza muito (veja o módulo Cabelo); acessórios neutros ajudam na fase chata",
      "Acessórios: anéis, pulseiras finas, óculos de armação leve, bolsa/lenço neutros — feminilizam sem levantar bandeira",
      "Perfume: notas mais doces/florais leves entram fácil e mudam a percepção sem ninguém 'ver'",
    ],
  },
  {
    id: "curingas",
    title: "Peças-curinga andróginas",
    intro: "O que comprar primeiro: passa batido, mas já trabalha a favor da silhueta-alvo.",
    tips: [
      "Calça de corte reto ou leve flare, cintura alta: afina a cintura e alonga — neutra, mas feminiliza",
      "Blusa/camiseta de caimento (malha que abraça sem marcar demais): sugere curvas sem exposição",
      "Cardigã ou peça oversized: suaviza e disfarça a largura dos ombros, cria camadas",
      "Blazer ou jaqueta jeans neutra: estrutura unissex que combina com tudo e marca a cintura quando fechada",
      "Bralette leve por baixo: conforto, e a sugestão de busto sob roupa justa (sobe um nível quando quiser)",
      "Lenço/echarpe + acessórios pequenos: o jeito mais barato e discreto de feminilizar um look básico",
    ],
  },
];
