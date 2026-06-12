import { useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type HairRemovalSession } from "../../lib/db";
import { BeautyTabs } from "../../components/BeautyTabs";
import { DisclaimerCard } from "../../components/DisclaimerCard";
import { GuideAccordion } from "../../components/GuideAccordion";
import { FOLICULITE_GUIDE } from "../../data/foliculite-guide-seed";
import { formatDateBR } from "../../lib/format";

const AREA_LABEL: Record<HairRemovalSession["area"], string> = {
  rosto: "Rosto", axila: "Axila", pernas: "Pernas", intima: "Íntima",
  bracos: "Braços", costas: "Costas", buco: "Buço", outra: "Outra",
};
const METHOD_LABEL: Record<HairRemovalSession["method"], string> = {
  laser: "Laser", "luz-pulsada": "Luz pulsada", cera: "Cera", fio: "Fio",
  navalha: "Navalha", creme: "Creme", pinca: "Pinça", eletrolise: "Eletrólise",
};

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DepilacaoHome() {
  const sessions = useLiveQuery(async () => {
    const all = await db.hairRemovalSessions.orderBy("date").toArray();
    return all.reverse();
  }, []);

  const [date, setDate] = useState(todayISO());
  const [area, setArea] = useState<HairRemovalSession["area"]>("rosto");
  const [method, setMethod] = useState<HairRemovalSession["method"]>("laser");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    await db.hairRemovalSessions.add({
      date, area, method,
      cost: cost.trim() ? Number(cost.replace(",", ".")) : undefined,
      notes: notes.trim() || undefined,
    } as HairRemovalSession);
    setCost("");
    setNotes("");
  }

  async function remove(id?: number) {
    if (id === undefined) return;
    if (!confirm("Apagar este registro?")) return;
    await db.hairRemovalSessions.delete(id);
  }

  const totalCost = sessions?.reduce((s, x) => s + (x.cost ?? 0), 0) ?? 0;
  const countByArea = (sessions ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.area] = (acc[s.area] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Depilação</h1>
      </div>
      <BeautyTabs />

      <DisclaimerCard text="Laser e luz pulsada precisam de profissional. Pra área íntima e rosto, procura clínica especializada — feito errado mancha ou queima. Laser são 8-10 sessões pra resultado duradouro." />

      <h2 className="text-muted text-xs uppercase tracking-wider mt-4 mb-2">Foliculite e pelos encravados</h2>
      <GuideAccordion sections={FOLICULITE_GUIDE} />

      <form onSubmit={handleAdd} className="card my-4 space-y-2">
        <h2 className="text-nude-warm font-medium">Registrar sessão</h2>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
        <div className="grid grid-cols-2 gap-2">
          <select value={area} onChange={(e) => setArea(e.target.value as HairRemovalSession["area"])}
            className="bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm">
            {Object.entries(AREA_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={method} onChange={(e) => setMethod(e.target.value as HairRemovalSession["method"])}
            className="bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm">
            {Object.entries(METHOD_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <input type="text" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Custo R$ (opcional)"
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (clínica, sensação, etc.)" rows={2}
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm" />
        <button type="submit" className="w-full bg-wine-light text-nude-warm rounded-md py-2 text-sm">Registrar</button>
      </form>

      {(sessions?.length ?? 0) > 0 && (
        <div className="card mb-4">
          <h2 className="text-nude-warm font-medium mb-2">Resumo</h2>
          <p className="text-sm text-muted">Total investido: <span className="text-nude">R$ {totalCost.toFixed(2)}</span></p>
          <div className="text-sm text-muted mt-1">
            {Object.entries(countByArea).map(([a, n]) => (
              <span key={a} className="inline-block mr-3">{AREA_LABEL[a as HairRemovalSession["area"]]}: {n}x</span>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Histórico</h2>
      <div className="space-y-2">
        {sessions?.map((s) => (
          <div key={s.id} className="card">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-nude-warm">{AREA_LABEL[s.area]} · {METHOD_LABEL[s.method]}</span>
              <span className="text-muted text-xs">{formatDateBR(new Date(s.date))}</span>
            </div>
            {s.cost !== undefined && <p className="text-muted text-xs">R$ {s.cost.toFixed(2)}</p>}
            {s.notes && <p className="text-muted text-sm mt-1">{s.notes}</p>}
            <button onClick={() => void remove(s.id)} type="button" className="text-muted text-xs hover:text-red-300 mt-1">apagar</button>
          </div>
        ))}
        {(sessions?.length ?? 0) === 0 && <p className="text-muted text-sm text-center py-4">Sem registros ainda.</p>}
      </div>
    </div>
  );
}
