import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type Product } from "../../lib/db";
import { BeautyTabs } from "../../components/BeautyTabs";
import { ProductCard } from "../../components/ProductCard";

type Filter = "all" | Product["category"];

export function ProductsHome() {
  const [filter, setFilter] = useState<Filter>("all");
  const products = useLiveQuery(async () => {
    if (filter === "all") return db.products.toArray();
    return db.products.where("category").equals(filter).toArray();
  }, [filter]);

  async function handleDelete(id?: number) {
    if (id === undefined) return;
    if (!confirm("Apagar este produto?")) return;
    await db.products.delete(id);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Produtos</h1>
        <Link to="/beleza/pele-cabelo/produtos/novo" className="text-muted text-sm">+ novo</Link>
      </div>
      <BeautyTabs />

      <div className="flex gap-2 mb-4">
        {(["all", "skincare", "haircare", "supplements"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-pill text-xs ${
              filter === f ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
            }`}
          >
            {f === "all" ? "Todos" : f === "skincare" ? "Pele" : f === "haircare" ? "Cabelo" : "Supl."}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {products?.map((p) => (
          <ProductCard key={p.id} product={p} onDelete={() => void handleDelete(p.id)} />
        ))}
        {products?.length === 0 && (
          <p className="text-muted text-sm py-4 text-center">Nenhum produto.</p>
        )}
      </div>
    </div>
  );
}
