import { useLiveQuery } from "dexie-react-hooks";
import { Link, useParams, useNavigate } from "react-router-dom";
import { db, type Outfit } from "../../../lib/db";

const STATUS_FLOW: Outfit["status"][] = ["ideia", "comprando", "tenho", "testei"];
const STATUS_LABEL: Record<Outfit["status"], string> = {
  ideia: "Ideia",
  comprando: "Comprando",
  tenho: "Tenho",
  testei: "Testei",
};
const CONTEXT_LABEL: Record<Outfit["context"], string> = {
  discreto: "Discreto",
  livre: "Casa/Livre",
};

export function ComboDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const outfit = useLiveQuery(
    async () => (id ? (await db.outfits.get(Number(id))) ?? null : null),
    [id],
    "loading" as const,
  );

  if (outfit === "loading") {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }
  if (!outfit) {
    return (
      <div className="p-4 pb-24">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/beleza/estilo/combinacoes" className="text-muted text-sm">&larr; Combinações</Link>
        </div>
        <p className="text-muted text-sm">Combinação não encontrada.</p>
      </div>
    );
  }

  const setStatus = async (s: Outfit["status"]) => {
    if (outfit.id == null) return;
    await db.outfits.update(outfit.id, { status: s });
  };

  const remove = async () => {
    if (outfit.id == null) return;
    if (!confirm("Apagar esta combinação?")) return;
    await db.outfits.delete(outfit.id);
    navigate("/beleza/estilo/combinacoes", { replace: true });
  };

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/estilo/combinacoes" className="text-muted text-sm">&larr; Combinações</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{outfit.name}</h1>
      <p className="text-muted text-xs mb-4">{CONTEXT_LABEL[outfit.context]} · {outfit.occasion}</p>

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Peças</h2>
        <ul className="space-y-1 text-sm list-disc pl-5">
          {outfit.pieces.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>

      {outfit.whyItWorks && (
        <div className="card mb-3">
          <h2 className="text-nude-warm font-medium mb-2">Por que funciona</h2>
          <p className="text-sm">{outfit.whyItWorks}</p>
        </div>
      )}

      {outfit.silhouetteNote && (
        <div className="card mb-3">
          <h2 className="text-nude-warm font-medium mb-2">Efeito na silhueta</h2>
          <p className="text-sm">{outfit.silhouetteNote}</p>
        </div>
      )}

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Status</h2>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void setStatus(s)}
              className={`px-3 py-1.5 rounded-pill text-xs ${
                outfit.status === s ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {outfit.notes && <p className="text-muted text-sm mb-3">{outfit.notes}</p>}

      <button onClick={() => void remove()} type="button" className="text-muted text-xs hover:text-red-300">
        apagar combinação
      </button>
    </div>
  );
}
