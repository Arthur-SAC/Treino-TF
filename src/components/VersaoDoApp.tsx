import { useEffect, useState } from "react";
import { BUNDLE_VERSION } from "../lib/versao-nativa";
import { URL_MANIFESTO } from "../lib/atualizacao";
import { statusDaVersao, TEXTO_STATUS } from "../lib/versao-status";

export function VersaoDoApp() {
  const [publicada, setPublicada] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (BUNDLE_VERSION === "dev") return;
    let vivo = true;
    fetch(`${URL_MANIFESTO}?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json() as Promise<{ version?: string }>)
      .then((m) => { if (vivo) setPublicada(m.version ?? null); })
      .catch(() => { if (vivo) setPublicada(null); });
    return () => { vivo = false; };
  }, []);
  const status = statusDaVersao(BUNDLE_VERSION, publicada);
  return (
    <div className="card space-y-1">
      <h2 className="text-nude-warm font-medium">Versão do app</h2>
      <p className="text-nude text-sm tabular-nums">{BUNDLE_VERSION}</p>
      <p className={`text-xs ${status === "nova" ? "text-nude-warm" : "text-muted"}`}>{TEXTO_STATUS[status]}</p>
    </div>
  );
}
