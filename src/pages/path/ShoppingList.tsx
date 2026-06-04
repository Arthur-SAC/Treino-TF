import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type IngredientCategory } from "../../lib/db";
import { buildShoppingList } from "../../lib/shopping-list";

const CATEGORY_LABEL: Record<IngredientCategory, string> = {
  proteina: "Proteínas",
  carboidrato: "Carboidratos",
  hortifruti: "Hortifruti",
  laticinio: "Laticínios",
  gordura: "Gorduras",
  mercearia: "Mercearia",
};

const CATEGORY_ORDER: IngredientCategory[] = [
  "proteina", "carboidrato", "hortifruti", "laticinio", "gordura", "mercearia",
];

export function ShoppingList() {
  const plan = useLiveQuery(async () => (await db.mealPlans.toArray())[0], []);

  if (!plan) return <div className="p-4 text-muted text-sm">Carregando…</div>;

  const items = buildShoppingList(plan);

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/trilha/alimentacao" className="text-muted text-sm">&larr; Alimentação</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Lista de compras</h1>
      </div>

      <p className="text-muted text-sm mb-4">
        Cobre uma rodada de todas as opções (~3 dias de variedade). Multiplique conforme a semana.
      </p>

      <div className="space-y-3">
        {CATEGORY_ORDER.map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat} className="card">
              <h2 className="text-nude-warm font-medium mb-2">{CATEGORY_LABEL[cat]}</h2>
              <ul className="space-y-2 text-sm">
                {catItems.map((i) => (
                  <li key={`${i.item}-${i.unit}`} className="flex justify-between">
                    <span className="text-nude-warm">{i.item}</span>
                    <span className="text-muted text-xs">{i.qty} {i.unit}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
