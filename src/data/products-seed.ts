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
  // === HAIRCARE (pixie cacheado) ===
  {
    name: "Shampoo Salon Line Meu Cacho Minha Vida hidratação",
    category: "haircare",
    notes: "Sem sulfato agressivo. Mantém cachos. Use 2-3x/semana, alterna com co-wash.",
  },
  {
    name: "Co-wash Salon Line / Lola",
    category: "haircare",
    notes: "Limpa cachos sem espumar. Use nos dias entre shampoo.",
  },
  {
    name: "Máscara de hidratação Lola My Curls",
    category: "haircare",
    notes: "Hidratação semanal. Deixa 20min antes de enxaguar.",
  },
  {
    name: "Máscara de nutrição (manteiga de karité)",
    category: "haircare",
    notes: "Nutrição quinzenal. Repõe lipídios.",
  },
  {
    name: "Máscara de reconstrução (queratina/hidrolisado)",
    category: "haircare",
    notes: "Reconstrução mensal. Repõe proteína. NÃO USE toda semana — proteína em excesso quebra fios.",
  },
  {
    name: "Creme de pentear leve pra cachos curtos",
    category: "haircare",
    notes: "Aplica em mecha úmida pra definir cachos do pixie. Não usa muito — pixie cacheado fica leve.",
  },
];
