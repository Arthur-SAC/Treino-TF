import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { useState } from "react";
import { db, type ProgressPhoto } from "../../lib/db";
import { PhotoComparator } from "../../components/PhotoComparator";

type Tag = ProgressPhoto["tag"];

export function Comparison() {
  const [tag, setTag] = useState<Tag>("front");
  const goals = useLiveQuery(
    () => db.photos.where("[category+tag]").equals(["goal", tag]).toArray(),
    [tag],
  );
  const selves = useLiveQuery(
    () => db.photos.where("[category+tag]").equals(["self", tag]).sortBy("date"),
    [tag],
  );

  const oldest = selves?.[0];
  const newest = selves?.[selves.length - 1];
  const goal = goals?.[0];

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/corpo" className="text-muted text-sm">&larr; Corpo</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Comparação</h1>
      </div>

      <div className="card mb-4">
        <label className="block text-muted text-xs uppercase tracking-wider mb-2">Vista</label>
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
      </div>

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Atual × Objetivo</h2>
        <PhotoComparator left={newest} leftLabel="Atual" right={goal} rightLabel="Objetivo" />
      </div>

      <div className="card">
        <h2 className="text-nude-warm font-medium mb-3">Atual × Mais antiga</h2>
        <PhotoComparator left={newest} leftLabel="Atual" right={oldest} rightLabel="Antiga" />
      </div>
    </div>
  );
}
