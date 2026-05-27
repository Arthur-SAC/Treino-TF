import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { LookCard } from "../../../components/LookCard";

const OCCASIONS = ["all", "trabalho", "casual", "sair", "noite", "namorada", "festa"];

export function LooksView() {
  const [filter, setFilter] = useState<string>("all");
  const looks = useLiveQuery(async () => {
    const all = await db.looks.toArray();
    const sorted = all.sort((a, b) => b.date.localeCompare(a.date));
    if (filter === "all") return sorted;
    return sorted.filter((l) => l.occasion === filter);
  }, [filter]);

  async function handleDelete(id?: number) {
    if (id === undefined) return;
    if (!confirm("Apagar este look?")) return;
    await db.looks.delete(id);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
        <Link to="/beleza/estilo/looks/novo" className="text-muted text-sm">+ novo</Link>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <div className="overflow-x-auto -mx-4 px-4 mb-4">
        <div className="flex gap-2 w-max">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setFilter(o)}
              className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap capitalize ${
                filter === o ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {o === "all" ? "Todos" : o}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {looks?.map((l) => <LookCard key={l.id} look={l} onDelete={() => void handleDelete(l.id)} />)}
        {looks?.length === 0 && (
          <p className="text-muted text-sm col-span-2 text-center py-4">Sem looks ainda.</p>
        )}
      </div>
    </div>
  );
}
