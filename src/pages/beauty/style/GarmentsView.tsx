import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type Garment } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { GarmentCard } from "../../../components/GarmentCard";

const CATEGORIES: Array<{ value: Garment["category"] | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "top", label: "Tops" },
  { value: "bottom", label: "Calças/Saias" },
  { value: "dress", label: "Vestidos" },
  { value: "outerwear", label: "Casacos" },
];

export function GarmentsView() {
  const [filter, setFilter] = useState<Garment["category"] | "all">("all");
  const garments = useLiveQuery(async () => {
    if (filter === "all") {
      // exclui íntimas (aparecem só na aba Íntimo)
      const all = await db.garments.toArray();
      return all.filter((g) => g.category !== "intimate");
    }
    return db.garments.where("category").equals(filter).toArray();
  }, [filter]);

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <div className="overflow-x-auto -mx-4 px-4 mb-4">
        <div className="flex gap-2 w-max">
          {CATEGORIES.map((c) => (
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
        {garments?.map((g) => <GarmentCard key={g.id} garment={g} />)}
      </div>
    </div>
  );
}
