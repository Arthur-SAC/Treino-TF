import type { GuideSection } from "../components/GuideAccordion";

// Estratégia de depilação (não só o registro): como atacar a barba sem TRH,
// camuflar a sombra, e prioridade/custo por área. Pelo + voz são o que mais
// feminizam. Conteúdo estático — laser/eletrólise/íntimo exigem profissional.
export const DEPILACAO_STRATEGY: GuideSection[] = [
  {
    id: "barba-plano",
    title: "Plano de ataque à barba (sem TRH)",
    intro: "Sem TRH a barba não some sozinha — mas dá pra resolver, e é o que mais feminiza junto da voz.",
    tips: [
      "Definitivo: laser (8–10 sessões) ou eletrólise. Laser funciona melhor em pelo escuro/pele clara; eletrólise pega QUALQUER cor (inclusive claro/grisalho), fio a fio — mais lenta, mas definitiva.",
      "Enquanto não faz/termina: barbeia bem rente (a favor do pelo pra não irritar) + dermaplaning ocasional, que ainda tira a penugem e alisa a pele.",
      "Prioridade de área: rosto/barba primeiro — é o que mais aparece e mais feminiza. Corpo depois.",
      "Rosto e íntimo com laser/luz pulsada: SEMPRE em clínica especializada — feito errado mancha ou queima.",
    ],
  },
  {
    id: "camuflar-sombra",
    title: "Camuflar a sombra da barba (maquiagem)",
    intro: "A sombra azulada do pelo raspado tem truque de cor.",
    tips: [
      "Corretivo ALARANJADO/pêssego (color corrector) ANTES da base: o laranja neutraliza o azul da barba. Camada fina só na área.",
      "Depois passa a base por cima e sela com pó — a sombra some.",
      "Barbeia bem rente antes: quanto mais lisa a pele, melhor o corretivo pega.",
      "Pele mais escura pede corretivo mais alaranjado/avermelhado; pele clara, mais pêssego.",
    ],
  },
  {
    id: "corpo-custo",
    title: "Corpo — prioridade e custo-benefício",
    intro: "Do mais barato ao definitivo, escolha por área e bolso.",
    tips: [
      "Barato/caseiro: lâmina (rápido, dura pouco), creme depilatório (sem corte, cuidado com irritação) ou cera (dura mais que lâmina).",
      "Definitivo (investimento que resolve de vez): laser ou luz pulsada — pernas, axila e virilha compensam muito a longo prazo.",
      "Áreas íntimas/sensíveis: profissional especializado, nunca laser caseiro sem orientação.",
      "Registra as sessões e o custo aqui embaixo — dá pra ver o quanto já investiu por área.",
    ],
  },
];
