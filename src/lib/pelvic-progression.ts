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
// pélvico. Por isso as primeiras práticas insistem na identificação, depois
// consolidam o Kegel clássico, e só então abrem para as variações.

// As cinco de soltura (Task 3) entraram aqui só pra restaurar a invariante de
// cobertura — toda sequência 'pelvic' do catálogo precisa estar nesta lista,
// senão a rotina diária nunca alcança ela. A ordenação por fase (onde essas
// cinco encaixam didaticamente) é da Task 4, que reescreve pelvicDoDia.

/** As sequências de assoalho pélvico em ordem didática, não por dificuldade isolada. */
export const PELVIC_ORDEM = [
  "pelvic-identificacao",
  "pelvic-kegel-classico",
  "pelvic-kegel-rapido",
  "pelvic-sustentacao-longa",
  "pelvic-escala-cinco-niveis",
  "pelvic-respiracao-conexao",
  "pelvic-dance-integration",
  "pelvic-pre-prazer",
  "pelvic-soltura-identificacao",
  "pelvic-soltura-sustentada",
  "pelvic-alternancia",
  "pelvic-start-stop",
  "pelvic-receber-preparo",
] as const;

/** Quantas práticas cada fase de base exige antes de liberar a próxima. */
const PRATICAS_ATE_KEGEL = 5;
const PRATICAS_ATE_VARIAR = 12;

export interface PelvicDoDia {
  sequenceId: string;
  /** Frase curta dizendo em que fase ela está, pra não virar exercício cego. */
  etapa: string;
}

export function pelvicDoDia(praticasFeitas: number): PelvicDoDia {
  const n = Number.isFinite(praticasFeitas) && praticasFeitas > 0 ? Math.floor(praticasFeitas) : 0;

  if (n < PRATICAS_ATE_KEGEL) {
    return {
      sequenceId: "pelvic-identificacao",
      etapa: `Fase 1 · achar o músculo (${n}/${PRATICAS_ATE_KEGEL}) — sem isso o resto é glúteo disfarçado`,
    };
  }

  if (n < PRATICAS_ATE_VARIAR) {
    return {
      sequenceId: "pelvic-kegel-classico",
      etapa: `Fase 2 · firmar a contração (${n - PRATICAS_ATE_KEGEL + 1}/${PRATICAS_ATE_VARIAR - PRATICAS_ATE_KEGEL})`,
    };
  }

  // Base pronta: roda as 6 variações, sem voltar pra identificação.
  const variacoes = PELVIC_ORDEM.slice(2);
  const i = (n - PRATICAS_ATE_VARIAR) % variacoes.length;
  return { sequenceId: variacoes[i], etapa: "Fase 3 · controle fino e integração" };
}
