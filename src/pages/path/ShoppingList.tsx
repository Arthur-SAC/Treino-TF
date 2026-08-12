import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import type { IngredientCategory } from "../../lib/db";
import { buildWeeklyShoppingList, PORCOES_POR_SEMANA } from "../../lib/shopping-list";
import { getActiveMealPlan } from "../../lib/meal-plan";

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
  const plan = useLiveQuery(() => getActiveMealPlan(), []);

  if (!plan) return <div className="p-4 text-muted text-sm">Carregando…</div>;

  const items = buildWeeklyShoppingList(plan);

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/trilha/alimentacao" className="text-muted text-sm">&larr; Alimentação</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Lista de compras</h1>
      </div>

      <p className="text-muted text-sm mb-1">
        A semana fechada: {PORCOES_POR_SEMANA} cafés, {PORCOES_POR_SEMANA} almoços,{" "}
        {PORCOES_POR_SEMANA} lanches e {PORCOES_POR_SEMANA} jantares, com as opções distribuídas por
        igual. É o carrinho inteiro — não precisa multiplicar nada no mercado.
      </p>
      <p className="text-muted text-xs mb-4">
        As quantidades sobem pro que se compra de verdade (peso em múltiplos de 50 g). Onde a conta
        exata é bem menor, ela aparece do lado — a diferença é sobra na geladeira, não erro.
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
                  <li key={`${i.item}-${i.unit}`} className="flex justify-between gap-2">
                    <span className="text-nude-warm">{i.item}</span>
                    <span className="text-muted text-xs whitespace-nowrap">
                      {i.qty} {i.unit}
                      {i.qty !== i.qtyExata && (
                        <span className="text-nude ml-1">(usa {i.qtyExata})</span>
                      )}
                    </span>
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
