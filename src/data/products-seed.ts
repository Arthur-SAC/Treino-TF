import type { Product } from "../lib/db";

// Kit de custo-benefício pro clima de Aracaju (calor, umidade, sol forte,
// maresia) — pesquisa de 2026-11-09/10. É o MESMO kit que as rotinas de
// skincare-routines-seed.ts usam; o kit caro antigo (CeraVe, La Roche,
// SkinCeuticals…) saiu porque contradizia as rotinas. Preços de loja online,
// variam ~30% em Aracaju.
export const PRODUCTS: Omit<Product, "id">[] = [
  // === ROSTO ===
  {
    name: "Gel de limpeza com ácido salicílico 2% (Principia GL-01 ou Neutrogena Acne Proofing)",
    category: "skincare",
    notes: "Manhã e noite, 30–60 s e enxágua. Mesmo ativo nos dois; o GL-01 350 g (~R$ 52) sai mais barato por grama e serve também pras costas no banho.",
  },
  {
    name: "Hidratante gel-creme oil-free",
    category: "skincare",
    notes: "Bolinha do tamanho de ervilha, manhã e noite. Gel-creme porque creme pesado no calor úmido entope.",
  },
  {
    name: "Protetor facial toque seco FPS 50–60 (Nivea Sun Facial ou Anasol FPS 50)",
    category: "skincare",
    notes: "De manhã, 2 dedos no rosto, pescoço e orelhas. Reaplica às 15h30, antes de sair a pé. Anasol (~R$ 34) é a opção mais barata quando acabar.",
  },
  {
    name: "Sérum Principia MIX-01",
    category: "skincare",
    notes: "Noite, dia sim/dia não, camada fina. Não empilha com outro ácido no mesmo dia.",
  },
  // === CORPO ===
  {
    name: "Protetor corporal FPS 50 (Vagano Ricosol 180 g ou Sundown 200 ml)",
    category: "skincare",
    notes: "Braços, colo, nuca e mãos antes de sair; de novo às 15h30. Vagano (~R$ 33) e Sundown (~R$ 44) são os mais baratos por ml.",
  },
  {
    name: "Hidratante corporal com ureia",
    category: "skincare",
    notes: "Depois do banho da manhã, pele ainda úmida. A ureia alisa as 'bolinhas' de foliculite.",
  },
  {
    name: "Adapaleno 0,1% gel 30 g (genérico) — costas",
    category: "skincare",
    notes: "O que tem evidência pra marca de acne. Noite, pele seca, ervilha por área do tamanho da palma. Começa ter e sex; depois de 4 semanas sem irritar, dia sim/dia não. Nunca na mesma noite do salicílico. Descama no começo; resultado em 3 meses+. R$ 28–55.",
  },
  // === AXILA, VIRILHA E ÍNTIMA ===
  {
    name: "Principia AD-01 (axila)",
    category: "skincare",
    notes: "Noite, axila limpa e seca. Clareia e controla suor. R$ 39–50.",
  },
  {
    name: "Principia Emulsão EC-01 (virilha e coxa)",
    category: "skincare",
    notes: "Noite, camada fina nas manchas. Rende muito. ~R$ 43.",
  },
  {
    name: "Ada Tina Gliventi Bio Sensitive (íntima externa)",
    category: "skincare",
    notes: "Só na pele externa, nunca na mucosa. ~R$ 165 os 100 ml — caro, mas os concorrentes com alfa-arbutina saem mais caros por ml, e ele rende meses.",
  },
  {
    name: "Sabonete íntimo Lucretin / Dermacyd",
    category: "skincare",
    notes: "pH neutro. Não agride mucosa. Use diariamente.",
  },
  {
    name: "Aparador elétrico corporal",
    category: "skincare",
    notes: "No lugar da lâmina na axila e na virilha, 1–2x por semana. A lâmina raspa a pele e o atrito escurece de novo.",
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
    name: "Shampoo antirresíduo (Skala Anti Resíduos 325 ml)",
    category: "haircare",
    notes: "A cada 2–4 semanas (ex.: 1º sábado do mês), antes da máscara. Tira o acúmulo de gel, óleo e maresia que pesa o cacho. ~R$ 12.",
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
    notes: "Última camada, nunca pula: é a capa contra a umidade de Aracaju. #todecacho Mix Verde 550 g (~R$ 31) é o custo-benefício; gelatina Juba 500 g (~R$ 52) se preferir a linha. Se arrepiar em dia úmido, troca pela outra.",
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
