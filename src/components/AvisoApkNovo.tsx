import { useApkNovo, URL_RELEASES } from "../lib/atualizacao";

export function AvisoApkNovo() {
  if (!useApkNovo()) return null;
  return (
    <a href={URL_RELEASES} target="_blank" rel="noreferrer" className="card block border-wine-light mb-3">
      <p className="text-nude-warm text-sm">Tem versão nova do app para instalar.</p>
      <p className="text-muted text-xs mt-1">Baixe o APK e instale por cima — seus dados ficam.</p>
    </a>
  );
}
