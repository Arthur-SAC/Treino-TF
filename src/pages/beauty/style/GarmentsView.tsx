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

// Íntimo não entra neste filtro de propósito: peça íntima tem tela própria, com
// a divisão de ver × usar que não faz sentido nas outras.
const MODES: Array<{ value: Garment["mode"] | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "publico", label: "Público" },
  { value: "casa", label: "Casa" },
];

export function GarmentsView() {
  const [filter, setFilter] = useState<Garment["category"] | "all">("all");
  const [mode, setMode] = useState<Garment["mode"] | "all">("all");
  const garments = useLiveQuery(async () => {
    const all = await db.garments.toArray();
    return all
      .filter((g) => g.category !== "intimate") // íntimas só na tela Íntimo
      .filter((g) => filter === "all" || g.category === filter)
      .filter((g) => mode === "all" || g.mode === mode);
  }, [filter, mode]);

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <div className="overflow-x-auto -mx-4 px-4 mb-2">
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

      <div className="overflow-x-auto -mx-4 px-4 mb-4">
        <div className="flex gap-2 w-max">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
                mode === m.value ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
              }`}
            >
              {m.label}
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
