import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Look } from "../../../lib/db";
import { compressImage } from "../../../lib/image-compress";

const OCCASIONS = ["trabalho", "casual", "sair", "noite", "namorada", "festa"];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function LookNew() {
  const navigate = useNavigate();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [occasion, setOccasion] = useState("casual");
  const [rating, setRating] = useState<Look["rating"]>("ok");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      setBlob(await compressImage(file));
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!blob) return;
    await db.looks.add({ date: todayISO(), blob, occasion, rating, notes: notes.trim() || undefined } as Look);
    navigate("/beleza/estilo/looks", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/estilo/looks" className="text-muted text-sm">&larr; Looks</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Novo look</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block w-full bg-wine text-nude-warm text-center rounded-md py-3 font-medium cursor-pointer">
          {busy ? "Processando..." : blob ? "Foto adicionada — trocar?" : "Tirar / escolher foto"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            disabled={busy}
            className="hidden"
          />
        </label>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Ocasião</label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          >
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Avaliação</label>
          <div className="flex gap-2">
            {(["love", "ok", "no"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                className={`flex-1 py-2 rounded-md text-sm ${
                  rating === r ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                }`}
              >
                {r === "love" ? "Amei" : r === "ok" ? "Ok" : "Não rolou"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!blob}
          className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium disabled:opacity-50"
        >
          Salvar look
        </button>
      </form>
    </div>
  );
}
