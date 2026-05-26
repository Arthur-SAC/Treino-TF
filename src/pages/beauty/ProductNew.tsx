import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Product } from "../../lib/db";

export function ProductNew() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Product["category"]>("skincare");
  const [boughtAt, setBoughtAt] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await db.products.add({
      name: name.trim(),
      category,
      boughtAt: boughtAt || undefined,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
    } as Product);
    navigate("/beleza/pele-cabelo/produtos", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/pele-cabelo/produtos" className="text-muted text-sm">&larr; Produtos</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Novo produto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          />
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Product["category"])}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          >
            <option value="skincare">Skincare</option>
            <option value="haircare">Cabelo</option>
            <option value="supplements">Suplemento</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Comprado em</label>
            <input
              type="date"
              value={boughtAt}
              onChange={(e) => setBoughtAt(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Vence em</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
          </div>
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>
        <button type="submit" className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium">
          Salvar
        </button>
      </form>
    </div>
  );
}
