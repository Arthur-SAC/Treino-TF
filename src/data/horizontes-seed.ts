import type { GuideSection } from "../components/GuideAccordion";

// Horizontes realistas de resultado corporal. Honesto pra não iludir, encorajador
// pra motivar. Os números de WHR (cintura/quadril) são estimativas, não promessas.
export const HORIZONTES: GuideSection[] = [
  {
    id: "sem-trh",
    title: "Etapa 1 — agora, sem TRH",
    intro: "O que dá pra conquistar só com treino e dieta, antes da hormonização.",
    tips: [
      "Corpo mais atlético, cintura mais marcada que hoje e glúteo maior — porém firme (sem estrogênio a gordura não migra pro quadril).",
      "Maior ganho imediato: perder a barriga. Só isso já faz a cintura aparecer.",
      "Estimativa de WHR (cintura÷quadril): de ~0,90 hoje pra ~0,83-0,85.",
      "A seu favor: ombros de largura moderada e 1,73 m ajudam muito na proporção.",
      "Tudo que você construir de glúteo agora vira a base pras próximas etapas — não é trabalho perdido, é investimento.",
    ],
  },
  {
    id: "com-trh",
    title: "Etapa 2 — depois, com TRH",
    intro: "Quando a hormonização entrar, o corpo muda de verdade.",
    tips: [
      "O estrogênio redistribui a gordura: sai do abdômen e vai pro quadril, coxa, glúteo e peito; a pele afina e amacia.",
      "O glúteo treinado agora vira a estrutura — a gordura macia se deposita por cima e o resultado fica natural e bonito.",
      "Estimativa de WHR: ~0,75-0,78, melhor ainda com a massa muscular que você já tiver.",
      "A mama desenvolve tecido glandular (modesto e variável, mas real).",
    ],
  },
  {
    id: "bbl-mama",
    title: "Etapa 3 — com BBL + prótese de mama",
    intro: "O teto estético, se quiser ir por cirurgia.",
    tips: [
      "BBL enxerta gordura no glúteo (volume, projeção, maciez) e costuma vir com lipo de cintura junto.",
      "Sobre glúteo já treinado, o cirurgião tem mais com o que trabalhar — resultado mais natural e durável.",
      "Prótese define o busto no tamanho que você escolher.",
      "Aí sim ampulheta plena: estimativa de WHR ~0,65-0,70.",
    ],
  },
  {
    id: "linha-do-tempo",
    title: "Linha do tempo (você tem 27)",
    intro: "Estimativa de quando cada etapa acontece — o que define o ritmo é a sequência (fertilidade → TRH → cirurgia), não a idade.",
    tips: [
      "Agora (27): treino + perder barriga + construir base de glúteo; organizar o congelamento de gametas.",
      "~28: depois de congelar os gametas, começa a TRH — o treino continua firme.",
      "28-30: a TRH faz a maior parte da mudança (gordura redistribui, mama começa, pele afina).",
      "~30-31: janela ideal das cirurgias — o padrão é esperar ~2 anos de TRH antes de BBL + prótese.",
      "30 e poucos é idade ótima pra essas cirurgias: corpo maduro = resultado mais durável. Não existe tarde demais.",
    ],
  },
];
