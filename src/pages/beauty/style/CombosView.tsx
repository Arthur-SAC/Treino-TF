import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type Outfit } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { OutfitCard } from "../../../components/OutfitCard";

const CONTEXTS: Array<{ value: Outfit["context"] | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "discreto", label: "Discreto" },
  { value: "livre", label: "Casa/Livre" },
];

export function CombosView() {
  const [filter, setFilter] = useState<Outfit["context"] | "all">("all");
  const outfits = useLiveQuery(async () => {
    const all = await db.outfits.toArray();
    if (filter === "all") return all;
    return all.filter((o) => o.context === filter);
  }, [filter]);

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
        <Link to="/beleza/estilo/combinacoes/novo" className="text-muted text-sm">+ novo</Link>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <p className="text-muted text-xs mb-3">
        Os princípios (níveis, o que passa, peças-curinga) estão na aba{" "}
        <Link to="/beleza/estilo/discreto" className="text-nude underline">Discreto</Link>.
      </p>

      <div className="overflow-x-auto -mx-4 px-4 mb-4">
        <div className="flex gap-2 w-max">
          {CONTEXTS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setFilter(c.value)}
              className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
                filter === c.value ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {outfits?.map((o) => <OutfitCard key={o.id} outfit={o} />)}
        {outfits?.length === 0 && (
          <p className="text-muted text-sm text-center py-4">Sem combinações ainda.</p>
        )}
      </div>
    </div>
  );
}
