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

/** Linha da próxima parte. `nome` null = já está na última; n = 0 = a parte
 *  seguinte já está liberada. */
export function linhaFaltam(n: number, nome: string | null): string {
  if (nome === null) return ULTIMA_PARTE;
  if (n <= 0) return `Pronta pra ${nome}`;
  return n === 1 ? `falta 1 treino pra ${nome}` : `faltam ${n} treinos pra ${nome}`;
}

const DIAS_UTEIS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const;

function diaAntes(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  const x = new Date(Date.UTC(a, m - 1, d - 1));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${x.getUTCFullYear()}-${p(x.getUTCMonth() + 1)}-${p(x.getUTCDate())}`;
}

/** Linha da queda. Um dia perdido: "Ontem" só se foi ontem mesmo; senão o nome
 *  do dia (perdeu a sexta, abriu na segunda → "Sexta não teve treino"). */
export function linhaDaQueda(quebra: string, diasPerdidos: number, hoje: string): string {
  if (diasPerdidos >= 2) return `${diasPerdidos} dias úteis sem treino`;
  if (quebra === diaAntes(hoje)) return "Ontem não teve treino";
  const [a, m, d] = quebra.split("-").map(Number);
  return `${DIAS_UTEIS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()]} não teve treino`;
}
