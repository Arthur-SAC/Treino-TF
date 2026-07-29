import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type Meal } from "../../lib/db";
import { getActiveMealPlan } from "../../lib/meal-plan";
import { RecipeModal, MEAL_TYPE_LABEL } from "../../components/RecipeModal";
import { hojeISO } from "../../lib/today-date";

export function MealsToday() {
  const today = hojeISO();
  const plan = useLiveQuery(() => getActiveMealPlan(), []);
  const meals = useLiveQuery(() => db.meals.where("date").equals(today).toArray(), [today]);
  const [recipeOf, setRecipeOf] = useState<Meal["mealType"] | null>(null);

  async function toggleMeal(type: Meal["mealType"], mealIndex: number) {
    if (!plan) return;
    const existing = meals?.find((m) => m.mealType === type);
    if (existing && existing.id !== undefined) {
      await db.meals.update(existing.id, { checked: !existing.checked });
    } else {
      const foods = plan.defaultMeals[mealIndex] ?? [];
      await db.meals.add({
        date: today,
        mealType: type,
        foods,
        checked: true,
      } as Meal);
    }
  }

  if (!plan) return <div className="p-4 text-muted text-sm">Carregando…</div>;

  const MEAL_ORDER: Array<{ type: Meal["mealType"]; index: number }> = [
    { type: "cafe", index: 0 },
    { type: "almoco", index: 1 },
    { type: "lanche", index: 2 },
    { type: "jantar", index: 3 },
  ];

  const totalKcal = meals
    ?.filter((m) => m.checked)
    .reduce((s, m) => s + m.foods.reduce((sf, f) => sf + f.kcal, 0), 0) ?? 0;

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/" className="text-muted text-sm">&larr; Hoje</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Refeições hoje</h1>
      </div>

      <div className="card mb-3">
        <div className="flex justify-between items-baseline">
          <span className="text-muted text-sm">Consumido hoje</span>
          <span className="text-nude-warm text-lg">
            {totalKcal} / {plan.kcalDaily} kcal
          </span>
        </div>
        <div className="h-1.5 bg-bg-deep rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-nude"
            style={{ width: `${Math.min(100, (totalKcal / plan.kcalDaily) * 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {MEAL_ORDER.map(({ type, index }) => {
          const meal = meals?.find((m) => m.mealType === type);
          const foods = meal?.foods ?? plan.defaultMeals[index] ?? [];
          const checked = Boolean(meal?.checked);
          const kcal = foods.reduce((s, f) => s + f.kcal, 0);
          return (
            <div key={type} className="card">
              <div className="flex items-center gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => void toggleMeal(type, index)}
                  className={`w-6 h-6 rounded-md flex-shrink-0 border ${
                    checked ? "bg-nude border-nude" : "bg-bg-deep border-bg-border"
                  }`}
                  aria-label={checked ? "Feito" : "Não feito"}
                >
                  {checked && <span className="text-bg-base text-xs">✓</span>}
                </button>
                <div className="flex-1 min-w-0 flex justify-between items-baseline">
                  <h3 className={`font-medium ${checked ? "text-muted line-through" : "text-nude-warm"}`}>
                    {MEAL_TYPE_LABEL[type]}
                  </h3>
                  <span className="text-muted text-xs">{kcal} kcal</span>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-muted ml-9">
                {foods.map((f, j) => (
                  <li key={j}>{f.name}</li>
                ))}
              </ul>
              {foods.some((f) => f.preparation) && (
                <button
                  type="button"
                  onClick={() => setRecipeOf(type)}
                  className="ml-9 mt-2 text-nude text-xs underline"
                >
                  Ver modo de preparo
                </button>
              )}
            </div>
          );
        })}
      </div>

      {recipeOf && <RecipeModal mealType={recipeOf} onClose={() => setRecipeOf(null)} />}
    </div>
  );
}
