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
// Duas rotas, não uma: `pelvicDoDia` é o que o item diário do Hoje serve, e o
// critério de corte é O QUE PODE ABRIR NUMA TELA ÀS 10H NO TRABALHO. O que é
// sexual explícito ou pré-íntimo — start-stop, preparo pra receber e a
// sequência pré-prazer — sai por `ofertasDaVitalidade`, na tela que ela abre
// de propósito. Duração e postura NÃO são critério de corte: a integração com
// o quadril é longa e em pé, mas não expõe nada — o problema dela era o
// rótulo fixo, resolvido por `rotuloPelvicoDoDia`.
//
// Toda sequência de `PELVIC_ORDEM` tem que estar em uma das duas rotas; o
// teste do módulo cobra essa união.
import { SEQUENCES } from "../data/sequences-seed";

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
 *  Não contém nenhuma das três de `OFERTA_VITALIDADE`, de propósito. Contém a
 *  integração com o quadril, que é longa e em pé: ela não expõe nada, e o que
 *  precisava mudar era o rótulo do item, não o lugar da sequência. */
export const ROTACAO = [
  "pelvic-kegel-rapido",
  "pelvic-sustentacao-longa",
  "pelvic-escala-cinco-niveis",
  "pelvic-respiracao-conexao",
  "pelvic-soltura-sustentada",
  "pelvic-dance-integration",
] as const;

/** As três sequências que a página Vitalidade oferece, e que o Hoje NUNCA
 *  serve.
 *
 *  O critério é exposição, não duração: o item diário cai às 10h, no
 *  trabalho, e abrir ali `pelvic-start-stop` (masturbação, lubrificante),
 *  `pelvic-receber-preparo` (entrada de dedo) ou `pelvic-pre-prazer`
 *  (massagem inguinal, explicitamente pré-íntima) é expor na tela o que ela
 *  não escolheu abrir naquele lugar. As três continuam no plano, com cadência
 *  própria, na tela que ela abre de propósito. */
export const OFERTA_VITALIDADE = [
  "pelvic-start-stop",
  "pelvic-receber-preparo",
  "pelvic-pre-prazer",
] as const;

/** Onde cada sequência dá pra ser feita, em uma frase. Existe porque o item
 *  do Hoje trazia "Invisível, dá pra fazer sentada" FIXO no código, e isso é
 *  falso para a identificação (deitada), para a soltura sustentada (chão) e
 *  para a integração com o quadril (em pé). Frase por sequência é a única
 *  forma de a linha continuar verdadeira quando a rotação vira.
 *
 *  Toda sequência de `PELVIC_ORDEM` precisa de uma entrada aqui — o teste do
 *  módulo cobra, pelo mesmo motivo que cobra a união das rotas: conteúdo novo
 *  não pode entrar mudo. */
const ONDE: Record<string, string> = {
  "pelvic-identificacao": "Deitada, precisa de chão",
  "pelvic-soltura-identificacao": "Deitada, precisa de chão",
  "pelvic-kegel-classico": "Discreta, dá pra fazer sentada",
  "pelvic-alternancia": "Discreta, dá pra fazer sentada",
  "pelvic-kegel-rapido": "Discreta, dá pra fazer sentada",
  "pelvic-sustentacao-longa": "Discreta, dá pra fazer sentada",
  "pelvic-escala-cinco-niveis": "Discreta, dá pra fazer sentada",
  "pelvic-respiracao-conexao": "Sentada, com a mão na barriga",
  "pelvic-soltura-sustentada": "Termina no chão, em borboleta ou happy baby",
  "pelvic-dance-integration": "Em pé, precisa de espaço",
  "pelvic-start-stop": "Sozinha, sem tela, com privacidade",
  "pelvic-receber-preparo": "Com privacidade e sem pressa",
  "pelvic-pre-prazer": "Com privacidade, antes de um momento íntimo",
};

function doCatalogo(sequenceId: string) {
  return SEQUENCES.find((s) => s.id === sequenceId);
}

/** Onde a sequência dá pra ser feita. Exportada porque a página Vitalidade
 *  mostra a mesma informação nas ofertas dela. */
export function ondeFazer(sequenceId: string): string | undefined {
  return ONDE[sequenceId];
}

export interface RotuloPelvico {
  label: string;
  subtitle: string;
}

/** Rótulo e subtítulo do item diário do Hoje, derivados da SEQUÊNCIA do dia.
 *
 *  Os dois eram fixos em `today-routine.ts` ("Assoalho pélvico · 5 min" e
 *  "Invisível, dá pra fazer sentada") e falsos na maioria dos dias: a rotina
 *  tem sequências de 3, 5, 6 e 7 minutos, e nem todas dão pra fazer sentada.
 *  É a mesma classe de defeito que o alvo de sono fixo em "22:30" — texto
 *  cravado afirmando o que o dado ao lado contradiz.
 *
 *  Mora aqui, e não em `today-routine.ts`, porque aquele módulo é puro e não
 *  conhece o catálogo. Quem aplica é Today.tsx, na mesma camada em que já
 *  reescreve o `to` deste item. */
export function rotuloPelvicoDoDia(doDia: PelvicDoDia): RotuloPelvico {
  const seq = doCatalogo(doDia.sequenceId);
  return {
    label: seq ? `Assoalho pélvico · ${seq.durationMin} min` : "Assoalho pélvico",
    subtitle: [ondeFazer(doDia.sequenceId), doDia.etapa].filter(Boolean).join(" · "),
  };
}

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
 *
 * `pelvic-pre-prazer` não tem cadência nenhuma — é preparo pra usar na hora
 * que serve, não treino a cumprir.
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
      titulo: tituloDaOferta("pelvic-start-stop"),
      disponivel: true,
      nota: feitas > 0
        ? `${feitas} ${feitas === 1 ? "sessão" : "sessões"} nos últimos 7 dias — o alvo pede pelo menos uma. Não quebra o streak: é o tratamento.`
        : "Nenhuma nos últimos 7 dias. O alvo pede pelo menos uma por semana — e ela não quebra o streak.",
    },
    {
      sequenceId: "pelvic-receber-preparo",
      titulo: tituloDaOferta("pelvic-receber-preparo"),
      disponivel: solturaAprendida,
      nota: solturaAprendida
        ? "No seu ritmo, não numa frequência fixa. A progressão é de meses: só sobe de estágio depois de duas sessões confortáveis."
        : `Abre quando a fase 2 estiver construída (${n}/${ATE_FASE_3} práticas). Sem saber soltar, o corpo fecha — e aí dói em vez de treinar.`,
    },
    {
      sequenceId: "pelvic-pre-prazer",
      titulo: tituloDaOferta("pelvic-pre-prazer"),
      disponivel: true,
      nota: "Sem cadência: é preparo pra fazer pouco antes, quando serve. Saiu da rotina do Hoje porque é massagem pré-íntima e não abre no meio do expediente.",
    },
  ];
}

/** Nome, duração e lugar SEMPRE do catálogo — mesma regra do rótulo do Hoje.
 *  Escrever "· 15 min" à mão aqui era repetir o defeito do outro lado. */
function tituloDaOferta(sequenceId: string): string {
  const seq = doCatalogo(sequenceId);
  const partes = [seq?.name ?? sequenceId];
  if (seq) partes.push(`${seq.durationMin} min`);
  const onde = ondeFazer(sequenceId);
  if (onde) partes.push(onde.toLowerCase());
  return partes.join(" · ");
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
