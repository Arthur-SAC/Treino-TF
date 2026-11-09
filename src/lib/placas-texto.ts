// Copy fixa das placas (vitória, queda, desbloqueio e conquista) e da tela
// Conquistas. Tudo aqui aparece na tela inteira,
// por cima do app — passa pelo EXPOE de tests/lib/discricao-rotulos.test.ts.
import { formatHora } from "./routine-times";

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

export const DESBLOQUEIO_BOTAO = "Entendi";
export const CONQUISTA_ROTULO = "Conquista";
export const CONQUISTA_BOTAO = "Continuar";

export function tituloDesbloqueio(titulo: string): string {
  return `Parabéns, ${titulo} desbloqueado`;
}

/** "14/11" de "2026-11-14". */
export function diaMes(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function textoMarcoCintura(data: string): string {
  return `Batido na medida de ${diaMes(data)}. Conquista não se perde.`;
}

/** "faltam N treinos" das listas de próximos (Conquistas). Com o patamar já
 *  batido (n <= 0) o desbloqueio ainda não foi gravado: abre no próximo treino
 *  finalizado ou quando o app voltar pra frente. */
export function faltamTreinos(n: number): string {
  if (n <= 0) return "pronto pra abrir no próximo treino ou ao reabrir o app";
  if (n === 1) return "falta 1 treino";
  return `faltam ${n} treinos`;
}

/** Linha do Hoje: "Próximo desbloqueio: X — faltam N treinos" (ou "pronto pra
 *  abrir", com o patamar já batido). */
export function linhaProximoDesbloqueio(titulo: string, faltam: number): string {
  const resto = faltam <= 0 ? "pronto pra abrir" : faltam === 1 ? "falta 1 treino" : `faltam ${faltam} treinos`;
  return `Próximo desbloqueio: ${titulo} — ${resto}`;
}

/** Conquistas sem nada aberto ainda: o patamar vem da tabela. */
export function nadaDesbloqueado(patamar: number): string {
  return `Nada ainda. O primeiro abre com ${patamar} treinos seguidos.`;
}

/** Etiqueta de horário da placa de desbloqueio: "às 6h", "às 21h20". */
export function etiquetaHorario(hhmm: string): string {
  return `às ${formatHora(hhmm)}`;
}

/** Sábado e domingo não contam nem quebram a sequência: a vitória não festeja
 *  um número que não subiu. */
export const FIM_DE_SEMANA_NAO_CONTA = "Fim de semana não conta pra sequência";

/** "YYYY-MM-DD" cai num sábado ou domingo? */
export function ehFimDeSemana(iso: string): boolean {
  const [a, m, d] = iso.split("-").map(Number);
  const dow = new Date(Date.UTC(a, m - 1, d)).getUTCDay();
  return dow === 0 || dow === 6;
}

const DIAS_UTEIS =["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const;

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
