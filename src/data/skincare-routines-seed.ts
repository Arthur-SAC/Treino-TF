import type { SkincareRoutine } from "../lib/db";

// Kit barato (spec 2026-07): gel salicílico Neutrogena Acne Proofing (~R$44),
// Principia AD-01 axila (~R$49) e Emulsão EC-01 virilha/corpo (~R$43), Ada Tina
// Gliventi Bio Sensitive íntima (~R$165), Nivea Sun toque seco rosto (~R$45) e
// corpo (~R$40-55), hidratante corporal barato (com ureia se houver foliculite).
// Introduzir ácido devagar; não empilhar ácidos na mesma área no mesmo dia.
export const ROUTINES: Omit<SkincareRoutine, "id">[] = [
  {
    name: "Rosto · manhã",
    time: "morning",
    target: "face",
    steps: [
      { productName: "Gel de limpeza com ácido salicílico (Neutrogena Acne Proofing)", technique: "Massagem suave por 30s, enxágua. Começa 1x/dia; se repuxar, espaça.", waitMin: 0 },
      { productName: "Hidratante gel-creme oil-free", technique: "Bolinha do tamanho de ervilha, espalha no rosto.", waitMin: 1 },
      { productName: "Protetor solar facial toque seco (Nivea Sun Facial FPS 60)", technique: "2 dedos de produto (rosto + pescoço). Todo dia, mesmo sem sair — inegociável em Aracaju. Reaplica se ficar exposta ao sol.", waitMin: 0 },
    ],
  },
  {
    name: "Rosto · noite",
    time: "evening",
    target: "face",
    steps: [
      { productName: "Gel de limpeza salicílico (Neutrogena Acne Proofing) — se tiver maquiagem, demaquila antes", technique: "Massagem ~1 min, enxágua.", waitMin: 0 },
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
    ],
  },
  {
    name: "Costas · tratamento de cicatrizes (noturno)",
    time: "evening",
    target: "back",
    steps: [
      { productName: "Gel salicílico (Neutrogena Acne Proofing) nas costas — 1-2x/semana", technique: "Aplica após o banho, espera secar. Desobstrui e ajuda nas marcas.", waitMin: 5 },
      { productName: "Hidratante corporal (ou Bepantol Derma nas marcas mais recentes)", technique: "Espalha nas costas / sobre as marcas.", waitMin: 0 },
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
      { productName: "Protetor solar corporal (Nivea Sun Protect & Hidrata) nas áreas expostas", technique: "Braço, pescoço, colo antes de sair — evita novas manchas no sol de Aracaju.", waitMin: 0 },
    ],
  },
];
