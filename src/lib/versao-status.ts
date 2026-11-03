// O que a linha de versão em Configurações diz. Puro: quem busca o manifesto
// publicado é o componente. Pedido dela em 2026-11-03: "como eu sei que o app
// tá atualizado no meu celular?" — nenhuma tela mostrava a versão.

export type StatusVersao = "dev" | "conferindo" | "atualizada" | "nova" | "sem-internet";

/** `publicada`: undefined = ainda buscando; null = não deu pra buscar. */
export function statusDaVersao(atual: string, publicada: string | null | undefined): StatusVersao {
  if (atual === "dev") return "dev";
  if (publicada === undefined) return "conferindo";
  if (publicada === null) return "sem-internet";
  return publicada === atual ? "atualizada" : "nova";
}

export const TEXTO_STATUS: Record<StatusVersao, string> = {
  dev: "versão de desenvolvimento",
  conferindo: "conferindo se há versão nova…",
  atualizada: "atualizada — é a última publicada",
  // No APK a nova já baixou e só entra quando o app é fechado de verdade
  // (setMultiDelay "kill" em atualizacao.ts); no navegador, ao reabrir.
  nova: "tem versão nova — feche o app de verdade (arraste pra fora dos recentes) e abra de novo",
  "sem-internet": "sem internet pra conferir agora",
};
