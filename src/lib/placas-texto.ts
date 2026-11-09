// Copy fixa das placas (vitória e queda). Tudo aqui aparece na tela inteira,
// por cima do app — passa pelo EXPOE de tests/lib/discricao-rotulos.test.ts.

export const VITORIA_TITULO = "Treino concluído";
export const ROTULO_SEQUENCIA = "Sequência";
export const ROTULO_PROXIMA_PARTE = "Próxima parte";
export const ULTIMA_PARTE = "Você está na última parte";
export const VITORIA_BOTAO = "Voltar pro Hoje";

export const QUEDA_TITULO = "Sequência perdida";
export const QUEDA_NOTA_PARTE = "isso não volta atrás";
export const QUEDA_BOTAO = "Bora hoje";

/** Linha da próxima parte. `nome` null = já está na última. */
export function linhaFaltam(n: number, nome: string | null): string {
  if (nome === null) return ULTIMA_PARTE;
  return n === 1 ? `falta 1 treino pra ${nome}` : `faltam ${n} treinos pra ${nome}`;
}

export function linhaQueda(diasPerdidos: number): string {
  return diasPerdidos === 1 ? "Ontem não teve treino" : `${diasPerdidos} dias úteis sem treino`;
}
