import type { SkincareRoutine } from "../lib/db";

export const ROUTINES: Omit<SkincareRoutine, "id">[] = [
  {
    name: "Rosto · manhã",
    time: "morning",
    target: "face",
    steps: [
      { productName: "Sabonete líquido facial (CeraVe ou similar)", technique: "Massagem suave por 30s, enxágua com água fria", waitMin: 0 },
      { productName: "Tônico hidratante Bioderma Sensibio", technique: "Algodão ou mãos, espalha por todo rosto", waitMin: 1 },
      { productName: "Vitamina C 10% Adcos", technique: "4-5 gotas, rosto e pescoço, aguarda absorver", waitMin: 2 },
      { productName: "Hidratante Cetaphil PRO", technique: "Bolinha do tamanho de ervilha, espalha", waitMin: 1 },
      { productName: "Protetor solar La Roche Anthelios FPS 60", technique: "2 dedos de produto (rosto + pescoço). Todo dia, mesmo sem sol ou sem sair de casa — é inegociável. Reaplica a cada ~3h se estiver exposta.", waitMin: 0 },
    ],
  },
  {
    name: "Rosto · noite",
    time: "evening",
    target: "face",
    steps: [
      { productName: "Sabonete La Roche Effaclar (se houver maquiagem, demaquilar primeiro com Bioderma Sensibio H2O)", technique: "Massagem 1min, enxágua", waitMin: 0 },
      { productName: "Tônico hidratante Bioderma Sensibio", technique: "Espalha por todo rosto", waitMin: 1 },
      { productName: "Ácido glicólico 8% (2x/semana) OU Retinol 0,3% (1-2x/semana, dias diferentes do glicólico)", technique: "Fina camada. NÃO use se a pele está irritada", waitMin: 10 },
      { productName: "Hidratante Cetaphil PRO", technique: "Bolinha pequena, espalha bem", waitMin: 0 },
    ],
  },
  {
    name: "Axila · clareamento (noturno)",
    time: "evening",
    target: "armpit",
    steps: [
      { productName: "Sabonete neutro no banho (não usa desodorante na hora desse tratamento)", technique: "Limpa bem", waitMin: 0 },
      { productName: "Clareador axila/íntima Adcos (niacinamida + alfa-arbutin)", technique: "Camada fina nas duas axilas. Não sai por cima. Não usa desodorante de noite.", waitMin: 10 },
      { productName: "Hidratante leve (opcional)", technique: "Se ficar ressecado", waitMin: 0 },
      { productName: "LEMBRETE: desodorante de dia é normal", technique: "De dia, desodorante normal pode — só não aplique por cima do clareador ainda úmido. Espere ~2–3h após o clareador secar antes de usar desodorante.", waitMin: 0 },
    ],
  },
  {
    name: "Região íntima · clareamento (noturno)",
    time: "evening",
    target: "intimate",
    steps: [
      { productName: "Sabonete íntimo Lucretin/Dermacyd no banho", technique: "Limpa bem, seca completamente", waitMin: 0 },
      { productName: "Clareador axila/íntima Adcos", technique: "Camada fina na pele externa. NUNCA dentro da mucosa.", waitMin: 10 },
      { productName: "Hidratante íntimo de glicerina", technique: "Mantém maciez", waitMin: 0 },
    ],
  },
  {
    name: "Costas · tratamento de cicatrizes (noturno)",
    time: "evening",
    target: "back",
    steps: [
      { productName: "Esfoliante químico (ácido salicílico 2%) — 1-2x/semana", technique: "Aplica nas costas após banho. Espera secar.", waitMin: 5 },
      { productName: "Kelo-Cote silicone (nas cicatrizes velhas, todo dia)", technique: "Camada fina sobre cicatrizes", waitMin: 5 },
      { productName: "Bepantol Derma (nas cicatrizes recentes)", technique: "Espalha sobre lesão", waitMin: 0 },
    ],
  },
  {
    name: "Manchas de sol · rosto e corpo (noturno)",
    time: "evening",
    target: "general",
    steps: [
      { productName: "Limpeza suave da área (sabonete neutro)", technique: "Limpa sem esfregar com força, seca", waitMin: 0 },
      { productName: "Ativo clareador noturno (vitamina C, niacinamida ou ácido tranexâmico)", technique: "Fina camada nas manchas. Teste de mancha antes. NÃO usa se a pele está irritada.", waitMin: 5 },
      { productName: "Hidratante", technique: "Sela o tratamento", waitMin: 0 },
      { productName: "LEMBRETE: protetor solar pela manhã", technique: "Sem FPS de dia a mancha volta — o FPS é parte do tratamento", waitMin: 0 },
    ],
  },
  {
    name: "Região perianal · clareamento (noturno)",
    time: "evening",
    target: "intimate",
    steps: [
      { productName: "Higiene suave e secar MUITO bem", technique: "Pele seca, sem atrito forte", waitMin: 0 },
      { productName: "Clareador suave (niacinamida + alfa-arbutina) — teste de mancha antes", technique: "Camada fina só na pele EXTERNA. NUNCA na mucosa. Pare se arder/irritar.", waitMin: 5 },
      { productName: "Hidratante leve", technique: "Mantém a barreira da pele", waitMin: 0 },
      { productName: "LEMBRETE: dermatologista pra essa área", technique: "Área delicada — acompanhamento profissional antes de ativos mais fortes", waitMin: 0 },
    ],
  },
  {
    name: "Geral · após o banho",
    time: "morning",
    target: "general",
    steps: [
      { productName: "Hidratante corporal", technique: "Pele ainda úmida, ajuda absorver. Foco em coxas, braços, cintura.", waitMin: 0 },
    ],
  },
];
