import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type Milestone } from "../../lib/db";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function MilestoneNew() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [datePlanned, setDatePlanned] = useState(todayISO());
  const [category, setCategory] = useState<Milestone["category"]>("medico");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await db.milestones.add({
      title: title.trim(),
      datePlanned,
      category,
      notes: notes.trim() || undefined,
    } as Milestone);
    navigate("/trilha", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/trilha" className="text-muted text-sm">&larr; Trilha</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Novo marco</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Consulta endocrinologista"
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Data prevista</label>
            <input
              type="date"
              value={datePlanned}
              onChange={(e) => setDatePlanned(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Milestone["category"])}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            >
              <option value="medico">Médico</option>
              <option value="fisico">Físico</option>
              <option value="social">Social</option>
              <option value="fertilidade">Fertilidade</option>
              <option value="voz">Voz</option>
            </select>
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
          Salvar marco
        </button>
      </form>
    </div>
  );
}
