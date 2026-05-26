import { type ChangeEvent, useState } from "react";
import { compressImage } from "../lib/image-compress";
import type { ProgressPhoto } from "../lib/db";

interface Props {
  onUpload: (photo: Omit<ProgressPhoto, "id">) => void | Promise<void>;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function PhotoUpload({ onUpload }: Props) {
  const [tag, setTag] = useState<ProgressPhoto["tag"]>("front");
  const [category, setCategory] = useState<ProgressPhoto["category"]>("self");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      await onUpload({
        date: todayISO(),
        blob: compressed,
        tag,
        category,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao processar imagem");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["self", "goal"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`flex-1 py-2 rounded-md text-sm ${
              category === c ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
            }`}
          >
            {c === "self" ? "Atual" : "Objetivo"}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {(["front", "side", "back", "custom"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            className={`flex-1 py-2 rounded-md text-sm ${
              tag === t ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
            }`}
          >
            {t === "front" ? "Frente" : t === "side" ? "Lado" : t === "back" ? "Costas" : "Outra"}
          </button>
        ))}
      </div>
      <label className="block w-full bg-wine text-nude-warm text-center rounded-md py-3 font-medium cursor-pointer hover:bg-wine-light transition">
        {busy ? "Processando..." : "Tirar / escolher foto"}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          disabled={busy}
          className="hidden"
        />
      </label>
      {error && <p className="text-red-300 text-sm">{error}</p>}
    </div>
  );
}
