import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/** Põe uma janela sobreposta direto no <body>. O `.tela-entra` do App anima
 *  transform, e transform prende o `fixed` dentro da tela: a janela abria lá
 *  no fim da página em vez de na frente (relato dela, 2026-11-19). */
export function NaFrente({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
