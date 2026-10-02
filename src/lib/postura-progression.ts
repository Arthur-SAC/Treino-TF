// Qual prática de postura fazer hoje às 20:15. Módulo puro — sem I/O, sem Date.
//
// Pedido dela (2026-09-30/10-01): sair do andar "travado", aprender o 8 com o
// quadril e o gingado. Decisão dela (2026-10-02): o gingado só entra depois que
// o andar e o 8 assentaram — começar o molejo ainda travada sai forçado.
//
// Rodízio por DIA DO ANO, nunca dia da semana: com lista de 2 ou 3 itens o
// dia da semana repetiria a mesma prática na mesma noite toda semana.

/** Ordem didática: a base (andar), o mecanismo (8) e o resultado (gingado). */
export const SEQUENCIAS_POSTURA = ["corporal-caminhada", "corporal-oito-quadril", "sensual-andar-gingado"] as const;

/** Dia em que a trilha nova entrou no ar. As versões antigas de andar e gingado
 *  mandavam pisar NA linha; práticas daquelas versões não ensinaram o que a
 *  trilha de agora ensina, então não contam pra liberar o gingado. */
export const DESDE_ENTREGA_B = "2026-10-02";

/** ~2 semanas de prática diária alternando andar e 8. */
export const ATE_GINGADO = 14;

export interface PosturaDoDia {
  sequenceId: string;
  /** O que o item do Hoje diz embaixo do rótulo. Neutro: o Hoje fica aberto
   *  em ambiente não receptivo. */
  etapa: string;
}

const ETAPA: Record<(typeof SEQUENCIAS_POSTURA)[number], string> = {
  "corporal-caminhada": "Andar — passo curto, joelho macio",
  "corporal-oito-quadril": "8 com o quadril — pequeno e devagar",
  "sensual-andar-gingado": "Gingado — o andar com molejo",
};

export function posturaDoDia(diaDoAno: number, praticasFeitas: number): PosturaDoDia {
  const p = Number.isFinite(praticasFeitas) && praticasFeitas > 0 ? Math.floor(praticasFeitas) : 0;
  const d = Number.isFinite(diaDoAno) && diaDoAno > 0 ? Math.floor(diaDoAno) : 0;
  const trilha = p < ATE_GINGADO ? SEQUENCIAS_POSTURA.slice(0, 2) : SEQUENCIAS_POSTURA;
  const sequenceId = trilha[d % trilha.length];
  return { sequenceId, etapa: ETAPA[sequenceId] };
}
