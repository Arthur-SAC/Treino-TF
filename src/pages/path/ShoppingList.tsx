import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";

export function ShoppingList() {
  const plan = useLiveQuery(async () => (await db.mealPlans.toArray())[0], []);

  if (!plan) return <div className="p-4 text-muted text-sm">Carregando…</div>;

  // Agrupa todos alimentos das refeições padrão (multiplica por 7 dias)
  const itemMap = new Map<string, number>();
  for (const meal of plan.defaultMeals) {
    for (const food of meal) {
      const current = itemMap.get(food.name) ?? 0;
      itemMap.set(food.name, current + food.qtyG * 7); // 7 dias
    }
  }
  const items = Array.from(itemMap.entries()).sort();

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/trilha/alimentacao" className="text-muted text-sm">&larr; Alimentação</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Lista de compras</h1>
      </div>

      <p className="text-muted text-sm mb-4">
        Quantidades pra 7 dias do plano padrão. Pode arredondar pra cima na hora de comprar.
      </p>

      <div className="card">
        <ul className="space-y-2 text-sm">
          {items.map(([name, qtyG]) => (
            <li key={name} className="flex justify-between">
              <span className="text-nude-warm">{name}</span>
              <span className="text-muted text-xs">{(qtyG / 1000).toFixed(2)} kg</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
