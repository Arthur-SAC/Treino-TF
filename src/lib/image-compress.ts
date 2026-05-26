export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0..1
  type?: "image/jpeg" | "image/webp";
}

const DEFAULTS: Required<CompressOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.82,
  type: "image/webp",
};

export async function compressImage(file: File | Blob, opts: CompressOptions = {}): Promise<Blob> {
  const cfg = { ...DEFAULTS, ...opts };
  const bitmap = await createImageBitmap(file);
  const { width: srcW, height: srcH } = bitmap;
  const ratio = Math.min(cfg.maxWidth / srcW, cfg.maxHeight / srcH, 1);
  const w = Math.round(srcW * ratio);
  const h = Math.round(srcH * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D não disponível");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar blob"))),
      cfg.type,
      cfg.quality,
    );
  });
}

export function blobToObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeObjectUrl(url: string): void {
  URL.revokeObjectURL(url);
}
