// src/lib/video.ts
export type EmbeddedVideo =
  | { kind: "youtube"; src: string; id: string; watch: string }
  | { kind: "busca"; src: string; termo: string }
  | { kind: "video"; src: string }
  | { kind: "link"; src: string };

export function toEmbed(url: string): EmbeddedVideo | null {
  const u = url.trim();
  if (!u) return null;

  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (yt) {
    return {
      kind: "youtube",
      id: yt[1],
      src: `https://www.youtube.com/embed/${yt[1]}`,
      watch: `https://www.youtube.com/watch?v=${yt[1]}`,
    };
  }

  // Link de busca do YouTube não é vídeo: embutir dá erro. Ela tocava e via
  // "vídeo quebrado"; o certo é dizer que é uma busca e abrir fora.
  const busca = u.match(/youtube\.com\/results\?(?:.*&)?search_query=([^&]+)/);
  if (busca) {
    const termo = decodeURIComponent(busca[1].replace(/\+/g, " "));
    return { kind: "busca", src: u, termo };
  }

  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(u)) return { kind: "video", src: u };

  if (/^https?:\/\//i.test(u)) return { kind: "link", src: u };

  return null;
}

/** Capa do YouTube; a de vídeo removido volta como um cinza de 120 px. */
export const capaDoYoutube = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
