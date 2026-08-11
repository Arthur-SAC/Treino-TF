// src/lib/vitalidade.ts
// Cálculo do streak de dias sem gasto automático. Módulo puro — sem I/O, sem Date.
//
// A usuária escolheu protocolo com contagem, na forma de streak, com a ressalva
// de risco registrada: contador que zera pode virar vergonha. Por isso o RECORDE
// é parte do contrato, e não enfeite — quando o número cai, ela ainda vê o que já
// conseguiu, e o esforço não desaparece junto com a sequência.
//
// O que quebra: pornografia OU masturbação no automático. O que NÃO quebra:
// sessão de `pelvic-start-stop`, que é o tratamento e exige masturbação — um
// protocolo que pune o próprio remédio faz ela escolher o número em vez da cura.

export interface StreakVitalidade {
  /** Dias limpos consecutivos terminando hoje. Hoje marcado ⇒ 0. */
  atual: number;
  /** A maior sequência limpa já alcançada, incluindo a atual. */
  recorde: number;
}

const MS_POR_DIA = 86_400_000;

/** Dias inteiros de `a` até `b`. Datas ISO "YYYY-MM-DD". */
function diasEntre(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / MS_POR_DIA);
}

/**
 * `diasComGasto` — dias marcados como gasto automático, em qualquer ordem.
 * `inicioISO` — primeiro dia de acompanhamento. Sem ele não dá pra saber se
 * "nenhum gasto" significa sequência longa ou ausência de registro, e inventar
 * um recorde que ela não fez seria a mesma mentira que este app existe pra tirar.
 */
export function calcularStreak(
  diasComGasto: string[],
  hojeISO: string,
  inicioISO: string,
): StreakVitalidade {
  const marcos = [...new Set(diasComGasto)]
    .filter((d) => diasEntre(inicioISO, d) >= 0)
    .sort();

  if (marcos.length === 0) {
    const limpo = diasEntre(inicioISO, hojeISO) + 1;
    return { atual: limpo, recorde: limpo };
  }

  const atual = diasEntre(marcos[marcos.length - 1], hojeISO);

  // Corrida inicial: do começo do acompanhamento até o dia anterior ao 1º gasto.
  const corridas = [diasEntre(inicioISO, marcos[0])];
  for (let i = 1; i < marcos.length; i++) {
    corridas.push(diasEntre(marcos[i - 1], marcos[i]) - 1);
  }

  return { atual, recorde: Math.max(atual, ...corridas) };
}
