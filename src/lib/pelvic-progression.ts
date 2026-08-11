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
const ATE_ROTACAO = 17;

/** Fase 3 alterna força e coordenação em dias consecutivos. */
const FASE_3 = ["pelvic-kegel-classico", "pelvic-alternancia"] as const;

/** Fase 4 — tudo que não é base. Inclui start-stop e preparo pra receber. */
const ROTACAO = [
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
    etapa: "Fase 4 · controle fino, start-stop e preparo",
  };
}
