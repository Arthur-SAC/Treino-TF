import type { Product } from "../lib/db";

// 20 produtos comuns no Brasil (com explicação do PORQUÊ no notes)
export const PRODUCTS: Omit<Product, "id">[] = [
  // === SKINCARE ROSTO ===
  {
    name: "Sabonete líquido facial CeraVe (pele oleosa)",
    category: "skincare",
    notes: "Limpa sem agredir barreira. Use 2x/dia. Pra começar.",
  },
  {
    name: "Sabonete La Roche Effaclar Concentrado",
    category: "skincare",
    notes: "Pra pele com tendência a oleosidade ou acne. Use noite.",
  },
  {
    name: "Tônico hidratante Bioderma Sensibio",
    category: "skincare",
    notes: "Equilibra pH depois da limpeza. Aplica antes do hidratante.",
  },
  {
    name: "Vitamina C 10% Adcos",
    category: "skincare",
    notes: "Antioxidante de manhã, antes do protetor solar. Clareia manchas com o tempo.",
  },
  {
    name: "Hidratante Cetaphil PRO Oil Control",
    category: "skincare",
    notes: "Hidrata sem deixar oleoso. Use manhã + noite.",
  },
  {
    name: "Protetor solar La Roche Anthelios FPS 60",
    category: "skincare",
    notes: "OBRIGATÓRIO de manhã, sempre. Sem ele, vitamina C, ácidos e tudo se anula.",
  },
  {
    name: "Ácido glicólico 8% noturno (Neostrata)",
    category: "skincare",
    notes: "1-2x/semana à noite. Renova pele, ajuda cicatrizes. NÃO usar mesmo dia que retinol.",
  },
  {
    name: "Retinol 0,3% Skinceuticals",
    category: "skincare",
    notes: "1-2x/semana à noite (alternar com glicólico). Estimula renovação. Pode irritar — começa devagar.",
  },
  // === CICATRIZES/CORPO ===
  {
    name: "Bepantol Derma Pré + Pós",
    category: "skincare",
    notes: "Cicatrizante. Use em cicatrizes recentes nas costas. Acelera reparação.",
  },
  {
    name: "Kelo-Cote silicone para cicatrizes",
    category: "skincare",
    notes: "Gel de silicone pra cicatrizes velhas. Aplica fina camada, 2x/dia, por 3-6 meses.",
  },
  {
    name: "Esfoliante químico corporal (ácido salicílico 2%)",
    category: "skincare",
    notes: "Pra costas com acne. 1-2x/semana. Não usar junto com glicólico forte.",
  },
  // === AXILA E ÍNTIMA (CLAREAMENTO) ===
  {
    name: "Sabonete íntimo Lucretin / Dermacyd",
    category: "skincare",
    notes: "pH neutro. Não agride mucosa. Use diariamente.",
  },
  {
    name: "Clareador axila/íntima Adcos (com niacinamida)",
    category: "skincare",
    notes: "Niacinamida + alfa-arbutin. Clareamento gradual em 2-3 meses. Aplica à noite.",
  },
  {
    name: "Hidratante íntimo de glicerina",
    category: "skincare",
    notes: "Mantém maciez da região. Aplica após banho.",
  },
  // === HAIRCARE (corte cacheado + rotina Juba — ver hair-guide-seed.ts) ===
  {
    name: "Shampoo Juba (Widi Care)",
    category: "haircare",
    notes: "Só no couro cabeludo, 2-3x por semana. O comprimento se limpa na espuma que escorre.",
  },
  {
    name: "Condicionador Juba",
    category: "haircare",
    notes: "Do meio às pontas; desembaraça no chuveiro com os dedos. Alterna com a máscara.",
  },
  {
    name: "Máscara Juba (hidratação/nutrição)",
    category: "haircare",
    notes: "1-2x por semana, 5-15 min com touca ou toalha morna.",
  },
  {
    name: "Leave-in Juba",
    category: "haircare",
    notes: "Primeira camada da finalização, com o cabelo encharcado.",
  },
  {
    name: "Geleia/finalizador Juba",
    category: "haircare",
    notes: "Segunda camada: define o cacho sem pesar. Amassa de baixo pra cima.",
  },
  {
    name: "Gel de fixação",
    category: "haircare",
    notes: "Última camada; forma a casquinha que o óleo quebra depois de seco.",
  },
  {
    name: "Óleo (blend Juba)",
    category: "haircare",
    notes: "1 gota com o cabelo 100% seco, pra quebrar a casquinha do gel (SOTC).",
  },
  {
    name: "Máscara de reconstrução leve (queratina)",
    category: "haircare",
    notes: "1x a cada 15-30 dias — a Juba é fraca em reconstrução. Em excesso, endurece e quebra o fio.",
  },
];
