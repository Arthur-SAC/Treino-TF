import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Outfit } from "../../../lib/db";

export function ComboNew() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [context, setContext] = useState<Outfit["context"]>("discreto");
  const [occasion, setOccasion] = useState("casual");
  const [piecesText, setPiecesText] = useState("");
  const [whyItWorks, setWhyItWorks] = useState("");
  const [silhouetteNote, setSilhouetteNote] = useState("");
  const [status, setStatus] = useState<Outfit["status"]>("ideia");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const pieces = piecesText.split("\n").map((p) => p.trim()).filter(Boolean);
    await db.outfits.add({
      name: name.trim(),
      context,
      occasion: occasion.trim() || "casual",
      pieces,
      whyItWorks: whyItWorks.trim(),
      silhouetteNote: silhouetteNote.trim(),
      status,
    } as Outfit);
    navigate("/beleza/estilo/combinacoes", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/estilo/combinacoes" className="text-muted text-sm">&larr; Combinações</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Nova combinação</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome (ex.: Trabalho neutro)"
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
        />

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Contexto</label>
          <div className="flex gap-2">
            {(["discreto", "livre"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setContext(c)}
                className={`flex-1 py-2 rounded-md text-sm ${
                  context === c ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                }`}
              >
                {c === "discreto" ? "Discreto" : "Casa/Livre"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Ocasião</label>
          <input
            type="text"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="trabalho, casual, sair, casa…"
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Peças (uma por linha)</label>
          <textarea
            value={piecesText}
            onChange={(e) => setPiecesText(e.target.value)}
            rows={4}
            placeholder={"Calça cintura alta\nCamiseta encorpada\nBlazer"}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Por que funciona</label>
          <textarea
            value={whyItWorks}
            onChange={(e) => setWhyItWorks(e.target.value)}
            rows={2}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Efeito na silhueta</label>
          <textarea
            value={silhouetteNote}
            onChange={(e) => setSilhouetteNote(e.target.value)}
            rows={2}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>

        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Status</label>
          <div className="flex gap-2 flex-wrap">
            {(["ideia", "comprando", "tenho", "testei"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-pill text-xs ${
                  status === s ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                }`}
              >
                {s === "ideia" ? "Ideia" : s === "comprando" ? "Comprando" : s === "tenho" ? "Tenho" : "Testei"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium disabled:opacity-50"
        >
          Salvar combinação
        </button>
      </form>
    </div>
  );
}
