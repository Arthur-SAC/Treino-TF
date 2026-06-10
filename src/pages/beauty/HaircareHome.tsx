import { useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type HaircareEntry } from "../../lib/db";
import { BeautyTabs } from "../../components/BeautyTabs";
import { formatDateBR } from "../../lib/format";
import { HAIR_GUIDE } from "../../data/hair-guide-seed";

const TYPE_LABEL: Record<HaircareEntry["type"], string> = {
  hidratacao: "Hidratação",
  nutricao: "Nutrição",
  reconstrucao: "Reconstrução",
};

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function HaircareHome() {
  const entries = useLiveQuery(() => db.haircare.orderBy("date").reverse().limit(30).toArray(), []);
  const [type, setType] = useState<HaircareEntry["type"]>("hidratacao");
  const [products, setProducts] = useState("");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    await db.haircare.add({
      date: todayISO(),
      type,
      products: products.split(",").map((p) => p.trim()).filter(Boolean),
      completed: true,
    });
    setProducts("");
  }

  const lastByType: Record<HaircareEntry["type"], string | undefined> = {
    hidratacao: entries?.find((e) => e.type === "hidratacao")?.date,
    nutricao: entries?.find((e) => e.type === "nutricao")?.date,
    reconstrucao: entries?.find((e) => e.type === "reconstrucao")?.date,
  };

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Cabelo · jornada de crescimento</h1>
      </div>
      <BeautyTabs />

      <p className="text-muted text-sm mb-4">
        Objetivo: crescer os cachos saudáveis até um pouco abaixo dos ombros. Constância no
        cronograma + retenção de comprimento é o que entrega.
      </p>

      <div className="space-y-2 mb-4">
        {HAIR_GUIDE.map((section) => (
          <details key={section.id} className="card !py-3">
            <summary className="text-nude-warm font-medium cursor-pointer list-none flex justify-between items-center">
              <span>{section.title}</span>
              <span className="text-muted text-xs">ver</span>
            </summary>
            {section.intro && <p className="text-muted text-sm mt-2">{section.intro}</p>}
            <ul className="space-y-1 text-sm list-disc pl-5 mt-2">
              {section.tips.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </details>
        ))}
      </div>

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-2">Cronograma capilar — crescimento saudável</h2>
        <p className="text-muted text-sm mb-3">
          Hidratação semanal · Nutrição quinzenal · Reconstrução mensal.
          Não passa proteína (reconstrução) toda semana — em excesso quebra fios.
        </p>
        <ul className="space-y-1 text-sm">
          {(["hidratacao", "nutricao", "reconstrucao"] as const).map((t) => (
            <li key={t} className="flex justify-between">
              <span className="text-nude-warm">{TYPE_LABEL[t]}</span>
              <span className="text-muted text-xs">
                {lastByType[t] ? `última: ${formatDateBR(new Date(lastByType[t]!))}` : "ainda não registrou"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Registrar tratamento de hoje</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as HaircareEntry["type"])}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          >
            <option value="hidratacao">Hidratação</option>
            <option value="nutricao">Nutrição</option>
            <option value="reconstrucao">Reconstrução</option>
          </select>
          <input
            type="text"
            value={products}
            onChange={(e) => setProducts(e.target.value)}
            placeholder="Produtos usados (separados por vírgula)"
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
          />
          <button type="submit" className="w-full bg-wine-light text-nude-warm rounded-md py-2 text-sm">
            Registrar
          </button>
        </form>
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Histórico</h2>
      <div className="space-y-2">
        {entries?.map((e) => (
          <div key={e.id} className="card !p-3">
            <div className="flex justify-between items-baseline">
              <span className="text-nude-warm text-sm">{TYPE_LABEL[e.type]}</span>
              <span className="text-muted text-xs">{formatDateBR(new Date(e.date))}</span>
            </div>
            {e.products.length > 0 && (
              <p className="text-muted text-xs mt-1">{e.products.join(" + ")}</p>
            )}
          </div>
        ))}
        {(!entries || entries.length === 0) && (
          <p className="text-muted text-sm py-2">Sem registros ainda.</p>
        )}
      </div>
    </div>
  );
}
