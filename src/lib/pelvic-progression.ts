// Qual sequência de assoalho pélvico fazer hoje.
//
// A usuária cumpre o papel masculino na relação e quer vigor, dureza e
// resistência. O assoalho pélvico é o que MANTÉM a rigidez — o isquiocavernoso
// e o bulbocavernoso comprimem as veias pra o sangue não escapar — e é também
// o mecanismo do controle ejaculatório. O app já tinha as 8 sequências; nenhuma
// era alcançável pela rotina diária.
//
// A ORDEM importa mais que a variedade: quem não identificou o pubococcígeo
// primeiro passa meses contraindo glúteo e abdômen achando que treina assoalho
// pélvico. Mas soltar é MAIS difícil que contrair, e treinar só contração
// fortalece um músculo que já vive tenso — um assoalho hipertônico dispara
// ANTES, piorando a precocidade em vez de tratá-la. Por isso a soltura entra
// logo na fase 2, antes até do Kegel clássico: sem saber soltar, "treinar
// mais" só ensina o corpo a travar mais cedo.
//
// Duas rotas, não uma: `pelvicDoDia` é o que o item diário do Hoje serve, e
// ele só pode conter o que cabe na promessa daquele item (curto, discreto,
// executável sentada, às 10h no trabalho). O que exige tempo e privacidade
// — start-stop e preparo pra receber — sai por `ofertasDaVitalidade`, na tela
// que ela abre de propósito. Toda sequência de `PELVIC_ORDEM` tem que estar
// em uma das duas rotas; o teste do módulo cobra essa união.

/** As sequências de assoalho pélvico em ordem didática, não por dificuldade isolada. */
export const PELVIC_ORDEM = [
  "pelvic-identificacao",
  "pelvic-soltura-identificacao",
  "pelvic-kegel-classico",
  "pelvic-alternancia",
  "pelvic-kegel-rapido",
  "pelvic-sustentacao-longa",
  "pelvic-escala-cinco-niveis",
  "pelvic-respiracao-conexao",
  "pelvic-soltura-sustentada",
  "pelvic-start-stop",
  "pelvic-receber-preparo",
  "pelvic-dance-integration",
  "pelvic-pre-prazer",
] as const;

const ATE_SOLTURA = 5;
const ATE_FASE_3 = 10;
export const ATE_ROTACAO = 17;

/** Fase 3 alterna força e coordenação em dias consecutivos. */
const FASE_3 = ["pelvic-kegel-classico", "pelvic-alternancia"] as const;

/** Fase 4 — a rotação servida pelo item diário do Hoje. Exportada pra teste: a
 *  fonte da verdade do alcance da rotação é este array, nunca uma lista
 *  copiada à mão no teste.
 *
 *  Não contém `pelvic-start-stop` nem `pelvic-receber-preparo` de propósito:
 *  ver `OFERTA_VITALIDADE` abaixo. */
export const ROTACAO = [
  "pelvic-kegel-rapido",
  "pelvic-sustentacao-longa",
  "pelvic-escala-cinco-niveis",
  "pelvic-respiracao-conexao",
  "pelvic-soltura-sustentada",
  "pelvic-dance-integration",
  "pelvic-pre-prazer",
] as const;

/** As duas sequências que a página Vitalidade oferece, e que o Hoje NUNCA
 *  serve.
 *
 *  O item diário do Hoje se anuncia como "Assoalho pélvico · 5 min ·
 *  invisível, dá pra fazer sentada", e cai às 10h — no trabalho. Servir
 *  `pelvic-start-stop` (15 min, masturbação, lubrificante) ou
 *  `pelvic-receber-preparo` (10 min, entrada de dedo) por trás desse rótulo é
 *  mentira em cima de exposição: ela toca esperando cinco minutos discretos.
 *  As duas continuam no plano, com cadência própria, na tela que ela abre de
 *  propósito. */
export const OFERTA_VITALIDADE = ["pelvic-start-stop", "pelvic-receber-preparo"] as const;

export interface OfertaPelvica {
  sequenceId: string;
  titulo: string;
  /** Por que agora — ou, quando ainda não abriu, o que falta. */
  nota: string;
  disponivel: boolean;
}

/**
 * O que a página Vitalidade oferece hoje, além da sequência do dia.
 *
 * `startStopNaSemana` — sessões de start-stop concluídas nos últimos 7 dias.
 * A cadência sai do alvo que a própria tela declara ("2 a 3 vezes por semana,
 * com pelo menos uma sendo start-stop"): o start-stop fica disponível desde o
 * primeiro dia e a tela mostra se a semana já teve a dela. Na rotação da fase
 * 4 ele só aparecia a partir da 18ª prática e depois 1 vez a cada 9 dias — o
 * alvo declarado era inalcançável por uns quatro meses.
 *
 * `pelvic-receber-preparo` é o único com pré-requisito, e é clínico, não
 * disciplinar: ele é relaxamento voluntário sob pressão, e a habilidade que o
 * sustenta é a soltura da fase 2. Antes disso o corpo fecha e dói.
 */
export function ofertasDaVitalidade(
  praticasFeitas: number,
  startStopNaSemana: number,
): OfertaPelvica[] {
  const n = Number.isFinite(praticasFeitas) && praticasFeitas > 0 ? Math.floor(praticasFeitas) : 0;
  const feitas = Number.isFinite(startStopNaSemana) && startStopNaSemana > 0
    ? Math.floor(startStopNaSemana)
    : 0;
  const solturaAprendida = n >= ATE_FASE_3;

  return [
    {
      sequenceId: "pelvic-start-stop",
      titulo: "Start-stop · 15 min, sozinha e sem tela",
      disponivel: true,
      nota: feitas > 0
        ? `${feitas} ${feitas === 1 ? "sessão" : "sessões"} nos últimos 7 dias — o alvo pede pelo menos uma. Não quebra o streak: é o tratamento.`
        : "Nenhuma nos últimos 7 dias. O alvo pede pelo menos uma por semana — e ela não quebra o streak.",
    },
    {
      sequenceId: "pelvic-receber-preparo",
      titulo: "Preparo pra receber · 10 min, com privacidade",
      disponivel: solturaAprendida,
      nota: solturaAprendida
        ? "No seu ritmo, não numa frequência fixa. A progressão é de meses: só sobe de estágio depois de duas sessões confortáveis."
        : `Abre quando a fase 2 estiver construída (${n}/${ATE_FASE_3} práticas). Sem saber soltar, o corpo fecha — e aí dói em vez de treinar.`,
    },
  ];
}

export interface PelvicDoDia {
  sequenceId: string;
  /** Frase curta dizendo em que fase ela está, pra não virar exercício cego. */
  etapa: string;
}

export function pelvicDoDia(praticasFeitas: number): PelvicDoDia {
  const n = Number.isFinite(praticasFeitas) && praticasFeitas > 0 ? Math.floor(praticasFeitas) : 0;

  if (n < ATE_SOLTURA) {
    return {
      sequenceId: "pelvic-identificacao",
      etapa: `Fase 1 · achar o músculo (${n}/${ATE_SOLTURA}) — sem isso o resto é glúteo disfarçado`,
    };
  }

  if (n < ATE_FASE_3) {
    return {
      sequenceId: "pelvic-soltura-identificacao",
      etapa: `Fase 2 · achar a soltura (${n - ATE_SOLTURA + 1}/${ATE_FASE_3 - ATE_SOLTURA}) — é ela que trata a precocidade`,
    };
  }

  if (n < ATE_ROTACAO) {
    return {
      sequenceId: FASE_3[(n - ATE_FASE_3) % FASE_3.length],
      etapa: `Fase 3 · força e coordenação (${n - ATE_FASE_3 + 1}/${ATE_ROTACAO - ATE_FASE_3})`,
    };
  }

  return {
    sequenceId: ROTACAO[(n - ATE_ROTACAO) % ROTACAO.length],
    etapa: "Fase 4 · rotação de controle fino",
  };
}
