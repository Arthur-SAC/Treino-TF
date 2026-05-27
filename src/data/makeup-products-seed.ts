import type { Product } from "../lib/db";

export const MAKEUP_PRODUCTS: Omit<Product, "id">[] = [
  // === PREPARAÇÃO ===
  {
    name: "Primer Ruby Rose 5 em 1",
    category: "makeup",
    notes: "Preparação base. Aplica fina camada após skincare, antes da base. Hidrata + segura maquiagem.",
  },
  {
    name: "Base líquida Vult Soft Matte",
    category: "makeup",
    notes: "Acabamento natural-matte. Cobertura média construível. Aplica com esponja úmida pra ficar leve.",
  },
  {
    name: "Corretivo Vult Camuflagem",
    category: "makeup",
    notes: "Pra olheiras + cobrir marquinhas. Aplica em 'V' invertido sob os olhos, dá leve tapinhas pra espalhar.",
  },
  {
    name: "Pó compacto Vult",
    category: "makeup",
    notes: "Fixa a base. Use só na zona T (testa, nariz, queixo) se quiser look com brilho na bochecha. Pincel grande.",
  },
  // === ESCULPIDO ===
  {
    name: "Paleta de contorno Ruby Rose",
    category: "makeup",
    notes: "Marrom acinzentado pra sombra (não laranja). Aplica embaixo da maçã, lateral do nariz, mandíbula. Esfuma SEMPRE.",
  },
  {
    name: "Blush Mariana Saad rosado",
    category: "makeup",
    notes: "Aplica no topo da maçã do rosto, sentido pra têmpora. Cor rosada favorece subtom quente.",
  },
  {
    name: "Iluminador Mariana Saad champagne",
    category: "makeup",
    notes: "Topo da maçã (acima do blush), arco do cupido, ponta do nariz, lacrimal. Pincel pequeno.",
  },
  {
    name: "Bronzer Ruby Rose",
    category: "makeup",
    notes: "Cor quente pra dar 'sol' no rosto. Aplica em '3' (testa, maçã, mandíbula). Sutil.",
  },
  // === OLHOS ===
  {
    name: "Paleta sombras Vult Nude",
    category: "makeup",
    notes: "Tons quentes (bege, marrom, bronze). Combina com paleta amazona. Esfuma sempre da cor mais clara pra mais escura.",
  },
  {
    name: "Delineador caneta Vult",
    category: "makeup",
    notes: "Linha rente aos cílios. Pra começar, faz só uma linha fina. Gato (winged) é evolução.",
  },
  {
    name: "Máscara cílios Maybelline The Falsies",
    category: "makeup",
    notes: "Aplica zigue-zague da raiz à ponta. 2 camadas pra volume. Não passa em cima de máscara seca.",
  },
  {
    name: "Lápis de sobrancelha Vult",
    category: "makeup",
    notes: "Preenche falhas com tracinhos no sentido do pelo. Pincel goupil pra esfumar. Sobrancelha define muito o rosto.",
  },
  // === LÁBIOS ===
  {
    name: "Batom líquido matte Ruby Rose vinho",
    category: "makeup",
    notes: "Cor vinho favorece sua paleta amazona. Aplica do centro pra fora. Espera 1 min secar.",
  },
  {
    name: "Batom hidratante Bruna Tavares BT Tint nude",
    category: "makeup",
    notes: "Pra dia a dia. Hidrata + cor sutil. Aplica direto sem contorno.",
  },
  {
    name: "Gloss Mariana Saad transparente",
    category: "makeup",
    notes: "Por cima de batom matte pra dar brilho 'glass'. Vibe sensual.",
  },
  // === FIXAÇÃO ===
  {
    name: "Fixador Ruby Rose Fix It",
    category: "makeup",
    notes: "Borrifa após terminar maquiagem. Aumenta duração + une os produtos.",
  },
];
