import { useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type WishlistItem } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";

export function WishlistView() {
  const items = useLiveQuery(() => db.wishlist.toArray(), []);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("top");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await db.wishlist.add({
      name: name.trim(),
      category,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
    } as WishlistItem);
    setName("");
    setUrl("");
    setNotes("");
  }

  async function remove(id?: number) {
    if (id === undefined) return;
    await db.wishlist.delete(id);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      <form onSubmit={handleAdd} className="card mb-4 space-y-2">
        <h2 className="text-nude-warm font-medium">Adicionar</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da peça"
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          >
            <option value="top">Top</option>
            <option value="bottom">Calça/Saia</option>
            <option value="dress">Vestido</option>
            <option value="outerwear">Casaco</option>
            <option value="intimate">Íntimo</option>
            <option value="acessorio">Acessório</option>
            <option value="calcado">Calçado</option>
          </select>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="link (opcional)"
            className="bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas (opcional)"
          rows={2}
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
        />
        <button type="submit" className="w-full bg-wine-light text-nude-warm rounded-md py-2 text-sm">
          Salvar
        </button>
      </form>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Minha wishlist</h2>
      <div className="space-y-2">
        {items?.map((it) => (
          <div key={it.id} className="card">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-muted text-xs uppercase tracking-wider">{it.category}</span>
              <button onClick={() => void remove(it.id)} className="text-muted text-xs hover:text-red-300" type="button">
                apagar
              </button>
            </div>
            <h3 className="text-nude-warm font-medium">{it.name}</h3>
            {it.url && (
              <a href={it.url} target="_blank" rel="noreferrer" className="text-nude text-xs underline mt-1 inline-block">
                ver link
              </a>
            )}
            {it.notes && <p className="text-muted text-sm mt-1">{it.notes}</p>}
          </div>
        ))}
        {items?.length === 0 && <p className="text-muted text-sm text-center py-4">Vazio.</p>}
      </div>
    </div>
  );
}
