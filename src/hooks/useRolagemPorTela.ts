import { useLayoutEffect, useRef, type RefObject } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * A rolagem mora no <main>, não na janela, então o navegador não cuida dela:
 * ela rolava o Hoje até a noite, abria um item e a tela nova já abria no meio;
 * voltava e o Hoje estava no topo. Isso é boa parte do "me perco no app".
 * Tela nova abre no topo; voltar (POP) devolve onde ela estava.
 */
export function useRolagemPorTela(ref: RefObject<HTMLElement | null>) {
  const location = useLocation();
  const tipo = useNavigationType();
  const posicoes = useRef(new Map<string, number>());
  const chaveAtual = useRef(location.key);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const anterior = chaveAtual.current;
    chaveAtual.current = location.key;
    const guardar = () => posicoes.current.set(location.key, el.scrollTop);
    el.addEventListener("scroll", guardar, { passive: true });

    if (anterior !== location.key) {
      const alvo = tipo === "POP" ? posicoes.current.get(location.key) ?? 0 : 0;
      el.scrollTop = alvo;
      // O conteúdo chega do banco depois do primeiro desenho; tenta de novo
      // por alguns quadros até a página ter altura pra chegar lá.
      let tentativas = 0;
      const tentar = () => {
        if (!ref.current || alvo === 0) return;
        ref.current.scrollTop = alvo;
        if (Math.abs(ref.current.scrollTop - alvo) > 2 && ++tentativas < 30) requestAnimationFrame(tentar);
      };
      if (alvo > 0) requestAnimationFrame(tentar);
    }
    return () => el.removeEventListener("scroll", guardar);
  }, [location.key, tipo, ref]);
}
