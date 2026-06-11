import { toEmbed } from "../lib/video";

export function VideoEmbed({ url }: { url: string }) {
  const v = toEmbed(url);
  if (!v) return null;

  if (v.kind === "youtube") {
    return (
      <div className="relative w-full rounded-md overflow-hidden mb-1" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={v.src}
          title="Vídeo do exercício"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  if (v.kind === "video") {
    return <video controls src={v.src} className="w-full rounded-md mb-1" />;
  }

  return (
    <a href={v.src} target="_blank" rel="noreferrer" className="text-nude text-sm underline">
      Abrir vídeo ↗
    </a>
  );
}
