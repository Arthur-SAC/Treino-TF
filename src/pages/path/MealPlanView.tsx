import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import type { MealVariant } from "../../lib/db";
import { PathTabs } from "../../components/PathTabs";
import { buildShoppingList } from "../../lib/shopping-list";
import { renderDietMarkdown, renderDietHtml } from "../../lib/diet-export";

const PERIOD_LABEL: Record<"cafe" | "almoco" | "lanche" | "jantar", string> = {
  cafe: "Café", almoco: "Almoço", lanche: "Lanche", jantar: "Jantar",
};

function VariantDetails({ v }: { v: MealVariant }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full cursor-pointer text-nude-warm text-sm flex justify-between"
      >
        <span>{v.label} <span className="text-nude text-xs">{open ? "▾" : "▸"}</span></span>
        <span className="text-muted text-xs">{v.foods.reduce((s, f) => s + f.kcal, 0)} kcal</span>
      </button>
      {open && (
        <ul className="space-y-1.5 text-sm mt-2 ml-3">
          {v.foods.map((f, j) => (
            <li key={j}>
              <span className="text-nude-warm">{f.name}</span>
              {f.preparation && (
                <p className="text-muted text-xs mt-0.5 leading-relaxed">{f.preparation}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MealPlanView() {
  const plan = useLiveQuery(async () => (await db.mealPlans.toArray())[0], []);

  if (!plan) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  function exportPdf() {
    if (!plan) return;
    const html = renderDietHtml(plan, buildShoppingList(plan));
    const w = window.open("", "_blank");
    if (!w) { alert("Permita pop-ups pra gerar o PDF."); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  async function exportDiet() {
    if (!plan) return;
    const text = renderDietMarkdown(plan, buildShoppingList(plan));
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Plano alimentar — emagrecimento", text });
        return;
      }
    } catch {
      // usuário cancelou ou share indisponível — cai no fallback
    }
    try {
      await navigator.clipboard?.writeText(text);
      alert("Dieta copiada — é só colar no WhatsApp.");
    } catch {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plano-alimentar.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <h1 className="font-serif text-2xl text-nude flex-1">Trilha</h1>
        <Link to="/trilha/alimentacao/editar" className="text-muted text-sm">editar</Link>
      </div>
      <PathTabs />

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">{plan.name}</h2>
        <div className="grid grid-cols-4 gap-2">
          <div><p className="text-muted text-xs">kcal</p><p className="text-nude-warm text-lg">{plan.kcalDaily}</p></div>
          <div><p className="text-muted text-xs">proteína</p><p className="text-nude-warm text-lg">{plan.proteinG}g</p></div>
          <div><p className="text-muted text-xs">carbo</p><p className="text-nude-warm text-lg">{plan.carbG}g</p></div>
          <div><p className="text-muted text-xs">gordura</p><p className="text-nude-warm text-lg">{plan.fatG}g</p></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => void exportDiet()}
          className="flex-1 bg-wine-light text-nude-warm rounded-md py-2.5 text-sm font-medium"
        >
          Exportar dieta
        </button>
        <button
          type="button"
          onClick={exportPdf}
          className="flex-1 border border-bg-border text-nude rounded-md py-2.5 text-sm font-medium"
        >
          Salvar PDF
        </button>
        <Link
          to="/trilha/alimentacao/lista-compras"
          className="flex-1 text-center border border-bg-border text-nude rounded-md py-2.5 text-sm"
        >
          Lista de compras
        </Link>
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Refeições e opções</h2>
      <div className="space-y-3">
        {plan.slots.map((slot) => (
          <div key={slot.mealType} className="card">
            <h3 className="text-nude-warm font-medium mb-2">
              {PERIOD_LABEL[slot.mealType] ?? slot.mealType} <span className="text-muted text-xs">· alvo {slot.targetKcal} kcal</span>
            </h3>
            <div className="space-y-2">
              {slot.variants.map((v) => (
                <VariantDetails key={v.id} v={v} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
