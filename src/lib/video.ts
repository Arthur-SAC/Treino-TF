// src/lib/video.ts
export interface EmbeddedVideo {
  kind: "youtube" | "video" | "link";
  src: string;
}

export function toEmbed(url: string): EmbeddedVideo | null {
  const u = url.trim();
  if (!u) return null;

  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (yt) return { kind: "youtube", src: `https://www.youtube.com/embed/${yt[1]}` };

  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(u)) return { kind: "video", src: u };

  if (/^https?:\/\//i.test(u)) return { kind: "link", src: u };

  return null;
}
