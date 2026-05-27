import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { PathTabs } from "../../components/PathTabs";

const MEAL_NAMES = ["Café", "Almoço", "Lanche", "Jantar"];

export function MealPlanView() {
  const plan = useLiveQuery(async () => (await db.mealPlans.toArray())[0], []);

  if (!plan) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
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
          <div>
            <p className="text-muted text-xs">kcal</p>
            <p className="text-nude-warm text-lg">{plan.kcalDaily}</p>
          </div>
          <div>
            <p className="text-muted text-xs">proteína</p>
            <p className="text-nude-warm text-lg">{plan.proteinG}g</p>
          </div>
          <div>
            <p className="text-muted text-xs">carbo</p>
            <p className="text-nude-warm text-lg">{plan.carbG}g</p>
          </div>
          <div>
            <p className="text-muted text-xs">gordura</p>
            <p className="text-nude-warm text-lg">{plan.fatG}g</p>
          </div>
        </div>
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Refeições padrão</h2>
      <div className="space-y-3">
        {plan.defaultMeals.map((meal, i) => (
          <div key={i} className="card">
            <h3 className="text-nude-warm font-medium mb-2">{MEAL_NAMES[i] ?? `Refeição ${i + 1}`}</h3>
            <ul className="space-y-2 text-sm">
              {meal.map((food, j) => (
                <li key={j}>
                  <details className="group">
                    <summary className="flex justify-between cursor-pointer list-none">
                      <span className="text-nude-warm">
                        {food.name} {food.preparation && <span className="text-nude text-xs">▸</span>}
                      </span>
                      <span className="text-muted text-xs">{food.kcal} kcal</span>
                    </summary>
                    {food.preparation && (
                      <p className="text-muted text-xs mt-1.5 ml-3 leading-relaxed">{food.preparation}</p>
                    )}
                  </details>
                </li>
              ))}
            </ul>
            <p className="text-muted text-xs mt-2 pt-2 border-t border-bg-border">
              Total: {meal.reduce((s, f) => s + f.kcal, 0)} kcal · {meal.reduce((s, f) => s + (f.proteinG ?? 0), 0)}g proteína
            </p>
          </div>
        ))}
      </div>

      <Link to="/trilha/alimentacao/lista-compras" className="block text-center text-nude text-sm mt-4 underline">
        Ver lista de compras
      </Link>
    </div>
  );
}
