// src/lib/lembretes/acao.ts
// O que fazer quando ela toca num botão da notificação. Puro: devolve o efeito;
// quem escreve no banco é useLembretes.
// Os rótulos aparecem na tela de bloqueio: nada que exponha a transição.

export const TIPOS_DE_ACAO = [
  { id: "feito", acoes: [{ id: "feito", title: "Feito" }] },
  { id: "bebi", acoes: [{ id: "bebi", title: "Bebi 200 ml" }] },
  { id: "deitei", acoes: [{ id: "deitei", title: "Deitei" }] },
] as const;

export type Efeito =
  | { tipo: "marcar"; dia: string; itemId: string }
  | { tipo: "agua"; dia: string; ml: number }
  | { tipo: "sono"; dia: string }
  | { tipo: "abrir"; rota: string };

// O dia vem do lembrete (extra.dia), não do relógio: se ela toca em "Feito" na
// notificação de ontem, marca ontem. Notificação antiga, sem extra, devolve null.
export function efeitoDaAcao(actionId: string, extra: unknown): Efeito | null {
  const e = (extra ?? {}) as { dia?: string; itemId?: string; rota?: string };
  if (actionId === "feito") return e.dia && e.itemId ? { tipo: "marcar", dia: e.dia, itemId: e.itemId } : null;
  if (actionId === "bebi") return e.dia ? { tipo: "agua", dia: e.dia, ml: 200 } : null;
  if (actionId === "deitei") return e.dia ? { tipo: "sono", dia: e.dia } : null;
  return e.rota ? { tipo: "abrir", rota: e.rota } : null;
}
