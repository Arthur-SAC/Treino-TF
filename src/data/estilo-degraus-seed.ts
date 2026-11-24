// Estilo em degraus: guarda-roupa gradual, uma compra por mês, até R$ 100.
// Seed mudou → sobe a versão do seed (regra do projeto).

export type Degrau = 1 | 2 | 3;
export type Lavagem = "maquina" | "mao";
export type MedidaBase = "quadril" | "cintura" | null;

export interface ItemEstilo {
  id: string;
  degrau: Degrau;
  ordem: number;
  nome: string;
  praQue: string;
  cores: string[];
  precoMin: number;
  precoMax: number;
  onde: string;
  lavagem: Lavagem;
  medida: MedidaBase;
  dica?: string;
}

export const ITENS_ESTILO: ItemEstilo[] = [
  {
    id: "casa-short-camiseta",
    degrau: 1,
    ordem: 1,
    nome: "Short de tecido mole e camiseta de modelagem menos quadrada",
    praQue:
      "Roupa de ficar em casa que cai no corpo em vez de ficar dura. É a peça que você mais vai usar, então começa por ela.",
    cores: ["terracota", "vinho", "oliva"],
    precoMin: 40,
    precoMax: 80,
    onde: "Brechó, bazar, Enjoei ou promoção de Renner, C&A e Riachuelo.",
    lavagem: "maquina",
    medida: "quadril",
  },
  {
    id: "calcinhas-algodao",
    degrau: 1,
    ordem: 2,
    nome: "2 a 3 calcinhas de algodão, cintura alta ou boyshort",
    praQue:
      "Base do dia a dia, confortável e discreta por baixo de qualquer roupa.",
    cores: ["preto", "vinho", "bege"],
    precoMin: 30,
    precoMax: 70,
    onde: "Promoção de Renner, C&A e Riachuelo, em kit.",
    lavagem: "mao",
    medida: "quadril",
    dica: "O cós fica acima da barriga, sem apertar nem marcar. O tamanho é pela sua medida de quadril, não pela letra que você usa em outras roupas.",
  },
  {
    id: "hidratante-doce",
    degrau: 1,
    ordem: 3,
    nome: "Hidratante corporal doce ou floral leve",
    praQue:
      "Pele macia e um cheiro que fica em você o dia todo. Almíscar branco, baunilha leve, flor de laranjeira ou pêssego.",
    cores: [],
    precoMin: 20,
    precoMax: 50,
    onde: "Natura ou O Boticário; cheire na loja antes de levar.",
    lavagem: "maquina",
    medida: null,
  },
  {
    id: "calca-cintura-alta",
    degrau: 1,
    ordem: 4,
    nome: "Calça de cintura alta reta ou pantalona fluida",
    praQue:
      "Pras saídas. A cintura alta marca onde você é mais estreita e o caimento solto valoriza o quadril.",
    cores: ["preto", "caramelo", "oliva", "vinho"],
    precoMin: 50,
    precoMax: 100,
    onde: "Brechó, bazar, Enjoei ou promoção de Renner, C&A e Riachuelo.",
    lavagem: "maquina",
    medida: "quadril",
  },
  {
    id: "body-splash",
    degrau: 1,
    ordem: 5,
    nome: "Body splash ou colônia doce e floral leve",
    praQue: "O cheiro de sair de casa. Leve, que não pesa no calor de Aracaju.",
    cores: [],
    precoMin: 30,
    precoMax: 70,
    onde: "Tododia ou Cuide-se Bem (Natura, O Boticário) ou equivalente; sinta na loja.",
    lavagem: "maquina",
    medida: null,
  },
  {
    id: "blusa-que-cai",
    degrau: 1,
    ordem: 6,
    nome: "Blusa ou camisa de tecido que cai",
    praQue:
      "Usada por fora ou com um nó leve na frente. O tecido solto não gruda na barriga e o nó desenha a cintura.",
    cores: ["vermelho-tijolo", "cereja escuro"],
    precoMin: 40,
    precoMax: 80,
    onde: "Brechó, bazar, Enjoei ou promoção de Renner, C&A e Riachuelo.",
    lavagem: "maquina",
    medida: "cintura",
  },
  {
    id: "acessorios-pequenos",
    degrau: 1,
    ordem: 7,
    nome: "Acessórios pequenos: anel fino, pulseira fina, relógio de pulseira fina",
    praQue:
      "Detalhes discretos que mudam o conjunto sem chamar atenção. De preferência dourado.",
    cores: ["dourado"],
    precoMin: 20,
    precoMax: 60,
    onde: "Bazar, Enjoei ou bijuteria de promoção.",
    lavagem: "mao",
    medida: null,
  },

  // Degrau 2
  {
    id: "malha-cintura-marcada",
    degrau: 2,
    ordem: 1,
    nome: "Peça com cintura marcada, em malha macia",
    praQue:
      "Vestido ou blusa de malha que acompanha o corpo e marca a cintura sem apertar.",
    cores: ["vinho", "oliva", "terracota"],
    precoMin: 50,
    precoMax: 100,
    onde: "Brechó, bazar, Enjoei ou promoção de Renner, C&A e Riachuelo.",
    lavagem: "maquina",
    medida: "cintura",
  },
  {
    id: "top-sem-bojo",
    degrau: 2,
    ordem: 2,
    nome: "Top sem bojo",
    praQue:
      "Sustentação leve e macia por baixo da roupa, sem armação nem enchimento.",
    cores: ["preto", "bege", "vinho"],
    precoMin: 30,
    precoMax: 70,
    onde: "Promoção de Renner, C&A e Riachuelo.",
    lavagem: "mao",
    medida: null,
  },
  {
    id: "acessorios-mais",
    degrau: 2,
    ordem: 3,
    nome: "Mais acessórios: brinco pequeno, colar fino, lenço de cabelo",
    praQue: "Camadas pequenas que completam o visual de saída.",
    cores: ["dourado", "vinho"],
    precoMin: 20,
    precoMax: 60,
    onde: "Bazar, Enjoei ou bijuteria de promoção.",
    lavagem: "mao",
    medida: null,
  },

  // Degrau 3
  {
    id: "peca-mais-justa",
    degrau: 3,
    ordem: 1,
    nome: "Peça mais justa ao corpo",
    praQue:
      "Calça, saia ou vestido que acompanha a curva do quadril, agora que o resto já está em uso.",
    cores: ["preto", "vinho", "caramelo"],
    precoMin: 50,
    precoMax: 100,
    onde: "Brechó, bazar, Enjoei ou promoção de Renner, C&A e Riachuelo.",
    lavagem: "maquina",
    medida: "quadril",
  },
  {
    id: "calcinha-que-achata",
    degrau: 3,
    ordem: 2,
    nome: "Calcinha que achata a frente",
    praQue: "Linha da frente lisa por baixo de roupa mais justa.",
    cores: ["preto", "bege"],
    precoMin: 40,
    precoMax: 90,
    onde: "Promoção de Renner, C&A e Riachuelo.",
    lavagem: "mao",
    medida: "quadril",
    dica: "Escolha pela medida da época em que for comprar, não pela que você tinha antes.",
  },
  {
    id: "item-de-saida",
    degrau: 3,
    ordem: 3,
    nome: "Um item de saída",
    praQue:
      "Uma peça pra ocasiões em que você quer se sentir arrumada: vestido, conjunto ou blusa de tecido nobre.",
    cores: ["vinho", "cereja escuro", "preto"],
    precoMin: 60,
    precoMax: 100,
    onde: "Brechó, bazar, Enjoei ou promoção de Renner, C&A e Riachuelo.",
    lavagem: "mao",
    medida: "cintura",
  },
];
