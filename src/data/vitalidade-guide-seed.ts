import type { GuideSection } from "../components/GuideAccordion";
import { MEDIDAS_PARTIDA, FASES } from "../lib/objetivo";

// Ela pediu explicitamente para aumentar o volume de ejaculação. A resposta
// honesta é que quase toda alavanca real já estava no plano — e a maior
// delas, o intervalo entre ejaculações, é o próprio streak que ela escolheu
// em Vitalidade.tsx. Este arquivo existe pra dizer isso com teto declarado,
// sem prometer o que a fisiologia não entrega e sem empurrar suplemento sem
// evidência.

// A cintura de partida e o alvo da fase 1 vêm de objetivo.ts — fonte única
// dos números do plano. A seção "sono e gordura abdominal" citava "a mesma
// barriga da Fase de Entrada" em prosa solta, sem número: se objetivo.ts
// mudar esses valores um dia, este arquivo tinha como divergir em silêncio,
// que é exatamente a classe de bug que aquele módulo existe pra fechar.
const CINTURA_PARTIDA_CM = MEDIDAS_PARTIDA.cinturaCm;
const CINTURA_ALVO_FASE1_CM = FASES.find((f) => f.id === "fase-1")!.cinturaCm;

export const VITALIDADE_GUIA: GuideSection[] = [
  {
    id: "teto",
    title: "O teto — o que dá pra esperar de verdade",
    intro: "Volume normal é uma faixa larga: ~1,5 a 5 mL por ejaculação.",
    tips: [
      "Otimizar todas as alavancas reais leva de baixo-normal a alto-normal dentro dessa faixa. Não multiplica — não existe protocolo, suplemento ou treino que tire alguém de 2 mL e leve a 10 mL.",
      "Suplemento de \"volume\" vendido em farmácia ou loja de suplemento é, na maioria, sem evidência — o app não recomenda nenhum. O dinheiro rende mais em água, sono e castanha de caju do que em cápsula com nome de fórmula.",
      "Quem promete o contrário está vendendo, não descrevendo fisiologia.",
    ],
  },
  {
    id: "intervalo",
    title: "Intervalo entre ejaculações — a maior alavanca",
    intro: "O volume acumula com o tempo sem ejacular, e sobe até por volta do 5º–7º dia.",
    tips: [
      "É a variável com mais efeito de todas nesta lista. E ela já é o streak que você escolheu em Vitalidade — a mesma tela, o mesmo número.",
      "Ou seja: as duas coisas que você pediu (segurar mais, produzir mais) se pagam sozinhas. Não são dois projetos, é um.",
      "Depois do pico (~dia 5–7) o ganho marginal cai — não é \"quanto mais tempo, sempre mais\". O alvo de 2 a 3 vezes por semana que a tela já declara passa perto dessa janela.",
    ],
  },
  {
    id: "hidratacao",
    title: "Hidratação",
    intro: "Sêmen é majoritariamente fluido — desidratação leve corta volume direto.",
    tips: [
      "Você mora em Aracaju, caminha uns 5 km por dia no calor e treina em cima disso. Desidratação leve é o cenário provável, não a exceção.",
      "A meta de água do dia (a mesma que a tela Hoje cobra) é a alavanca mais barata desta lista inteira.",
    ],
  },
  {
    id: "assoalho-pelvico",
    title: "Assoalho pélvico",
    intro: "O bulbocavernoso é o músculo que expulsa o sêmen, contraindo em série no orgasmo.",
    tips: [
      "Mais forte e mais coordenado não aumenta o que é produzido — aumenta a força e a nitidez da saída do que já foi produzido. É controle e firmeza, não fábrica.",
      "É o mesmo treino de Kegel que a progressão de Vitalidade já está construindo. Nenhum exercício novo entra por causa disto.",
    ],
  },
  {
    id: "sono-abdominal",
    title: "Sono e gordura abdominal",
    intro: "As duas mexem em testosterona, que controla a produção de sêmen.",
    tips: [
      "Sono ruim derruba testosterona em dias, não meses — é a alavanca mais rápida de estragar, e a mais rápida de recuperar.",
      `Gordura abdominal converte testosterona em estrogênio. É a mesma barriga que a Fase de Entrada já está tirando: cintura de ${CINTURA_PARTIDA_CM} cm de partida para ${CINTURA_ALVO_FASE1_CM} cm no fim da fase 1 — aqui ela também é frente de volume, não uma frente nova.`,
    ],
  },
  {
    id: "zinco",
    title: "Zinco",
    intro: "Deficiência de zinco derruba volume. Suplementar só ajuda quem está faltando.",
    tips: [
      "Castanha de caju é a fonte barata e local — Sergipe produz caju, e ela entra fácil no lanche do dia a dia.",
      "Isso é sinal de que vale revisar o cardápio, não de que falta suplemento novo: a reforma do plano alimentar é outra frente que já cobre isso.",
    ],
  },
  {
    id: "edging",
    title: "Edging",
    intro: "Excitação prolongada aumenta a contribuição da próstata e das vesículas seminais no volume final.",
    tips: [
      "Efeito modesto — não é a alavanca que resolve sozinha.",
      "É o mesmo start-stop que a sessão de Vitalidade já prescreve como alvo. De novo, nada novo para adicionar na rotina.",
    ],
  },
  {
    id: "o-que-derruba",
    title: "O que derruba — e o que não vale a pena tentar",
    intro: "Duas informações de calibragem, não dois alertas para agir agora.",
    tips: [
      "Hormonizar — estrogênio e bloqueio de testosterona — derrubaria firmeza, ereção e volume a quase zero. Isso não é um problema a resolver: é o mesmo conflito real entre as duas trilhas que a Fertilidade & TRH já registra. A configuração de hoje, sem hormônio, favorece o corpo na cama — volume incluído.",
      "Suplemento genérico de \"volume\" (as fórmulas de farmácia com nome chamativo) entra na mesma categoria do teto acima: sem evidência boa o bastante para o app recomendar.",
    ],
  },
];
