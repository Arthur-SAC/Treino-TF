import { useState } from "react";
import { toEmbed, capaDoYoutube } from "../lib/video";
import { isNativo } from "../lib/plataforma";

const linkFora = "inline-flex items-center gap-1 text-nude text-sm underline underline-offset-2";

function Play() {
  return (
    <span className="absolute inset-0 flex items-center justify-center">
      <span className="w-14 h-14 rounded-full bg-bg-deep/80 border border-nude/60 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6 ml-0.5 fill-nude-warm" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
      </span>
    </span>
  );
}

// Por que capa em vez de iframe direto: no APK o YouTube recusa o player
// embutido (a página roda num endereço local que ele não aceita como origem) e,
// no navegador, vídeo removido ou com incorporação bloqueada virava uma caixa
// de erro sem saída. A capa carrega leve, e o toque decide: no navegador vira o
// player; no APK abre o app do YouTube. "Abrir no YouTube" fica sempre embaixo.
function Youtube({ id, src, watch }: { id: string; src: string; watch: string }) {
  const [tocando, setTocando] = useState(false);
  const [indisponivel, setIndisponivel] = useState(false);
  const nativo = isNativo();

  if (indisponivel) {
    return (
      <div className="rounded-md border border-bg-border bg-bg-deep p-4 mb-1 text-sm text-muted">
        Esse vídeo saiu do ar ou o dono bloqueou.{" "}
        <a href={watch} target="_blank" rel="noreferrer" className={linkFora}>Conferir no YouTube ↗</a>
      </div>
    );
  }

  return (
    <div className="mb-1">
      <div className="relative w-full rounded-md overflow-hidden bg-bg-deep" style={{ paddingBottom: "56.25%" }}>
        {tocando ? (
          <iframe
            src={`${src}?autoplay=1&rel=0&playsinline=1`}
            title="Vídeo do exercício"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full tela-entra"
          />
        ) : nativo ? (
          <a href={watch} target="_blank" rel="noreferrer" aria-label="Assistir no YouTube" className="absolute inset-0">
            <Capa id={id} onIndisponivel={() => setIndisponivel(true)} />
            <Play />
          </a>
        ) : (
          <button type="button" aria-label="Assistir o vídeo" onClick={() => setTocando(true)} className="absolute inset-0 w-full">
            <Capa id={id} onIndisponivel={() => setIndisponivel(true)} />
            <Play />
          </button>
        )}
      </div>
      <a href={watch} target="_blank" rel="noreferrer" className={`${linkFora} mt-2 text-xs`}>Abrir no YouTube ↗</a>
    </div>
  );
}

function Capa({ id, onIndisponivel }: { id: string; onIndisponivel: () => void }) {
  return (
    <img
      src={capaDoYoutube(id)}
      alt=""
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover opacity-90"
      onLoad={(e) => { if (e.currentTarget.naturalWidth > 0 && e.currentTarget.naturalWidth <= 120) onIndisponivel(); }}
      onError={onIndisponivel}
    />
  );
}

export function VideoEmbed({ url }: { url: string }) {
  const v = toEmbed(url);
  if (!v) return null;

  if (v.kind === "youtube") return <Youtube id={v.id} src={v.src} watch={v.watch} />;

  if (v.kind === "busca") {
    return (
      <a
        href={v.src}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-3 rounded-md border border-bg-border bg-bg-deep px-3 py-3 mb-1"
      >
        <span className="min-w-0">
          <span className="block text-sm text-nude-warm">Ver exemplos no YouTube</span>
          <span className="block text-xs text-muted truncate">busca: {v.termo}</span>
        </span>
        <span className="flex-none text-nude">↗</span>
      </a>
    );
  }

  if (v.kind === "video") {
    return <video controls playsInline preload="metadata" src={v.src} className="w-full rounded-md mb-1" />;
  }

  return (
    <a href={v.src} target="_blank" rel="noreferrer" className={linkFora}>
      Abrir vídeo ↗
    </a>
  );
}
