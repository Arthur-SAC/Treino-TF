// Qual aba de baixo fica acesa em cada tela. Puro.
//
// Decisão dela (2026-10-02): 4 abas no lugar de 6, sem mudar nenhuma rota — os
// links do Hoje, dos lembretes e os "← voltar" continuam valendo. Como as
// rotas antigas não seguem as abas novas (/trilha tem Marcos, que é progresso,
// e Alimentação, que é guia), o prefixo do NavLink não serve: esta regra decide.

export type Aba = "hoje" | "progresso" | "guia" | "vitalidade";

const PROGRESSO = [/^\/progresso/, /^\/corpo(\/|$)/, /^\/trilha$/, /^\/trilha\/marcos/, /^\/trilha\/evolucao/, /^\/trilha\/diario/, /^\/treino\/horizontes/, /^\/treino\/progressao/];
const GUIA = [/^\/guia/, /^\/treino(\/|$)/, /^\/beleza(\/|$)/, /^\/trilha\/(alimentacao|apoio|fertilidade|direitos)/, /^\/refeicoes-hoje/];

export function abaDaRota(pathname: string): Aba {
  if (/^\/(trilha\/)?vitalidade/.test(pathname)) return "vitalidade";
  if (PROGRESSO.some((r) => r.test(pathname))) return "progresso";
  if (GUIA.some((r) => r.test(pathname))) return "guia";
  return "hoje";
}
