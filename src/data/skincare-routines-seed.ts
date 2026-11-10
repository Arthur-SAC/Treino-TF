import type { SkincareRoutine } from "../lib/db";

// Kit barato (spec 2026-07): gel salicílico Neutrogena Acne Proofing (~R$44),
// Principia AD-01 axila (~R$49) e Emulsão EC-01 virilha/corpo (~R$43), Ada Tina
// Gliventi Bio Sensitive íntima (~R$165), Nivea Sun toque seco rosto (~R$45) e
// corpo (~R$40-55), hidratante corporal barato (com ureia se houver foliculite).
// v4 (2026-11-10, custo-benefício pro clima): GL-01 como alternativa mais
// barata do salicílico, reaplicação às 15h30, adapaleno nas costas.
// Introduzir ácido devagar; não empilhar ácidos na mesma área no mesmo dia.
export const ROUTINES: Omit<SkincareRoutine, "id">[] = [
  {
    name: "Rosto · manhã",
    time: "morning",
    target: "face",
    steps: [
      { productName: "Gel de limpeza com ácido salicílico 2% (Principia GL-01 ou Neutrogena Acne Proofing)", technique: "Massagem suave por 30–60 s, enxágua. Se repuxar, espaça.", waitMin: 0 },
      { productName: "Hidratante gel-creme oil-free", technique: "Bolinha do tamanho de ervilha, espalha no rosto.", waitMin: 1 },
      { productName: "Protetor solar facial toque seco FPS 50–60 (Nivea Sun Facial ou Anasol)", technique: "2 dedos de produto (rosto, pescoço e orelhas). Todo dia, mesmo sem sair — inegociável em Aracaju.", waitMin: 0 },
      { productName: "LEMBRETE: reaplicar às 15h30", technique: "Antes de sair a pé: protetor de novo no rosto, nuca e braços, e boné. O da manhã já não protege na caminhada das 16h.", waitMin: 0 },
    ],
  },
  {
    name: "Rosto · noite",
    time: "evening",
    target: "face",
    steps: [
      { productName: "Gel de limpeza salicílico 2% (Principia GL-01 ou Neutrogena) — se tiver maquiagem, demaquila antes", technique: "Massagem ~1 min, enxágua.", waitMin: 0 },
      { productName: "Sérum multiativo Principia MIX-01 (niacinamida + glicólico + tranexâmico + salicílico) — começar devagar", technique: "Fina camada. Começa dia sim/dia não e vai aumentando. NÃO use se a pele está irritada, e não empilha com outro ácido no mesmo dia.", waitMin: 5 },
      { productName: "Hidratante gel-creme oil-free", technique: "Bolinha pequena, sela o tratamento.", waitMin: 0 },
    ],
  },
  {
    name: "Axila · clareamento (noturno)",
    time: "evening",
    target: "armpit",
    steps: [
      { productName: "Sabonete neutro no banho", technique: "Limpa bem e seca a axila (sem desodorante na hora do tratamento).", waitMin: 0 },
      { productName: "Principia AD-01 (ác. lático + niacinamida, clareia e controla suor)", technique: "Camada fina nas duas axilas, à noite, na pele limpa e seca.", waitMin: 5 },
      { productName: "LEMBRETE: desodorante de dia é normal", technique: "De dia pode desodorante — só não aplique por cima do AD-01 ainda úmido; espere ~2–3h.", waitMin: 0 },
      { productName: "LEMBRETE: aparador elétrico, não lâmina", technique: "1–2x por semana. A lâmina raspa a pele e o atrito escurece de novo.", waitMin: 0 },
    ],
  },
  {
    name: "Região íntima · clareamento (noturno)",
    time: "evening",
    target: "intimate",
    steps: [
      { productName: "Sabonete íntimo no banho", technique: "Limpa bem e seca completamente.", waitMin: 0 },
      { productName: "Virilha e coxa (pele do corpo): Principia Emulsão EC-01", technique: "Camada fina nas manchas da virilha (frente/atrás) e coxa. Clareia e hidrata. Rende muito.", waitMin: 5 },
      { productName: "Genital/íntima externa: Ada Tina Gliventi Bio Sensitive", technique: "Camada fina SÓ na pele externa. NUNCA na mucosa. Faz teste no antebraço 2 dias antes; se arder, para.", waitMin: 5 },
      { productName: "Hidratante leve (opcional)", technique: "Se ficar ressecado.", waitMin: 0 },
      { productName: "LEMBRETE: aparador e atrito", technique: "Aparador elétrico no lugar da lâmina, 1–2x por semana. Se a coxa roça na caminhada, short de ciclista fino por baixo — atrito escurece a virilha.", waitMin: 0 },
    ],
  },
  {
    name: "Costas · tratamento de cicatrizes (noturno)",
    time: "evening",
    target: "back",
    steps: [
      { productName: "Gel salicílico 2% (GL-01 ou Neutrogena) no banho — 1-2x/semana (seg e qui)", technique: "Espalha nas costas, deixa a espuma 1 min e enxágua. Desobstrui os poros.", waitMin: 0 },
      { productName: "Adapaleno 0,1% gel — ter e sex (nunca na noite do salicílico)", technique: "Pele seca, ervilha por área do tamanho da palma. Depois de 4 semanas sem irritar, dia sim/dia não. Descama no começo; marca melhora em 3 meses+.", waitMin: 5 },
      { productName: "Hidratante corporal", technique: "Espalha nas costas. Se o adapaleno arder, hidrata antes dele.", waitMin: 0 },
      { productName: "LEMBRETE: cicatriz com buraco é dermatologista", technique: "Marca afundada não sai com creme; Bepantol e Kelo-Cote não tratam marca de acne.", waitMin: 0 },
    ],
  },
  {
    name: "Manchas de sol · rosto e corpo (noturno)",
    time: "evening",
    target: "general",
    steps: [
      { productName: "Limpeza suave da área (sabonete neutro)", technique: "Limpa sem esfregar com força, seca.", waitMin: 0 },
      { productName: "Clareador: no rosto o sérum MIX-01; no corpo a Emulsão EC-01 (ou ác. azelaico 10% manipulado ~R$25-40)", technique: "Fina camada nas manchas. Teste de mancha antes. NÃO usa se a pele está irritada.", waitMin: 5 },
      { productName: "Hidratante", technique: "Sela o tratamento.", waitMin: 0 },
      { productName: "LEMBRETE: protetor solar pela manhã (rosto e corpo)", technique: "Sem FPS de dia a mancha volta — o filtro é parte do tratamento.", waitMin: 0 },
    ],
  },
  {
    name: "Região perianal · clareamento (noturno)",
    time: "evening",
    target: "intimate",
    steps: [
      { productName: "Higiene suave e secar MUITO bem", technique: "Pele seca, sem atrito forte.", waitMin: 0 },
      { productName: "Ada Tina Gliventi Bio Sensitive (niacinamida + alfa-arbutina) — teste de mancha antes", technique: "Camada fina só na pele EXTERNA. NUNCA na mucosa. Para se arder/irritar.", waitMin: 5 },
      { productName: "Hidratante leve", technique: "Mantém a barreira da pele.", waitMin: 0 },
      { productName: "LEMBRETE: dermatologista pra essa área", technique: "Área delicada — acompanhamento profissional antes de ativos mais fortes.", waitMin: 0 },
    ],
  },
  {
    name: "Geral · após o banho",
    time: "morning",
    target: "general",
    steps: [
      { productName: "Hidratante corporal (com ureia se houver foliculite/'bolinhas')", technique: "Pele ainda úmida, ajuda a absorver. Foco em coxas, braços, cintura. A ureia alisa a pele com bolinhas.", waitMin: 0 },
      { productName: "Protetor solar corporal FPS 50 (Vagano, Sundown ou Nivea) nas áreas expostas", technique: "Braço, nuca, colo e mãos antes de sair; de novo às 15h30 — evita novas manchas no sol de Aracaju.", waitMin: 0 },
    ],
  },
];
