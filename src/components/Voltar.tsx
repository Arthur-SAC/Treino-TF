import { useNavigate } from "react-router-dom";

/**
 * Um "voltar" só, igual em toda tela. Antes eram 51 links à mão apontando pro
 * "pai" da rota antiga ("← Beleza", "← Treino") — seções que nem são mais abas;
 * ela entrava pelo Hoje, tocava em "← Beleza" e caía numa tela que nunca tinha
 * visto. Agora volta pra onde ela veio; sem histórico (abriu pelo lembrete ou
 * recarregou a página), cai em `para`.
 */
export function Voltar({ para, rotulo }: { para: string; rotulo?: string }) {
  const navigate = useNavigate();
  const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
  const temDeOndeVeio = idx > 0;
  return (
    <button
      type="button"
      onClick={() => (temDeOndeVeio ? navigate(-1) : navigate(para))}
      className="inline-flex items-center gap-1.5 -ml-2 px-2 py-1.5 rounded-pill text-nude text-sm active:bg-wine/40"
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {temDeOndeVeio || !rotulo ? "Voltar" : rotulo}
    </button>
  );
}
