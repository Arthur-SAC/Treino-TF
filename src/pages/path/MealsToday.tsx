import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type Meal } from "../../lib/db";
import { getActiveMealPlan, variantEscolhida, EFFORT_LABEL } from "../../lib/meal-plan";
import { RecipeModal, MEAL_TYPE_LABEL } from "../../components/RecipeModal";
import { hojeISO } from "../../lib/today-date";

/** O item da rotina do Hoje que corresponde a cada refeição. */
const ITEM_DO_HOJE: Record<Meal["mealType"], string> = {
  cafe: "cafe-marmita",
  almoco: "almoco",
  lanche: "lanche-saida",
  jantar: "jantar",
};

export function MealsToday() {
  const today = hojeISO();
  const plan = useLiveQuery(() => getActiveMealPlan(), []);
  const meals = useLiveQuery(() => db.meals.where("date").equals(today).toArray(), [today]);
  // O Hoje marca refeição em routineChecks; esta tela contava só db.meals, e o
  // "Consumido hoje" nunca andava (auditoria 2026-09-23). Agora as duas leem e
  // gravam os dois lados.
  const checksHoje = useLiveQuery(() => db.routineChecks.where("date").equals(today).toArray(), [today]);
  const [recipeOf, setRecipeOf] = useState<Meal["mealType"] | null>(null);

  // Marcar a refeição grava exatamente os `foods` que o card está mostrando.
  // Antes gravava `plan.defaultMeals[i]` — a opção 1, em silêncio: o card não
  // dizia qual das três opções estava ali, e o registro do dia saía com uma
  // escolha que ela nunca fez.
  const feitaNoHoje = (type: Meal["mealType"]) =>
    Boolean(checksHoje?.find((c) => c.itemId === ITEM_DO_HOJE[type])?.done);
  const feita = (type: Meal["mealType"]) =>
    Boolean(meals?.find((m) => m.mealType === type)?.checked) || feitaNoHoje(type);

  async function toggleMeal(type: Meal["mealType"], foods: Meal["foods"]) {
    const novo = !feita(type);
    const existing = meals?.find((m) => m.mealType === type);
    if (existing && existing.id !== undefined) {
      await db.meals.update(existing.id, { checked: novo });
    } else {
      await db.meals.add({ date: today, mealType: type, foods, checked: novo } as Meal);
    }
    await db.routineChecks.put({ date: today, itemId: ITEM_DO_HOJE[type], done: novo });
  }

  if (!plan) return <div className="p-4 text-muted text-sm">Carregando…</div>;

  const MEAL_ORDER: Array<{ type: Meal["mealType"]; index: number }> = [
    { type: "cafe", index: 0 },
    { type: "almoco", index: 1 },
    { type: "lanche", index: 2 },
    { type: "jantar", index: 3 },
  ];

  // Refeição feita no Hoje sem registro aqui conta pela opção mostrada no card.
  const kcalDe = (type: Meal["mealType"], index: number) => {
    const meal = meals?.find((m) => m.mealType === type);
    const variants = plan.slots.find((s) => s.mealType === type)?.variants ?? [];
    const foods = meal?.foods ?? (variantEscolhida(variants, meal) ?? variants[0])?.foods ?? plan.defaultMeals[index] ?? [];
    return foods.reduce((s, f) => s + f.kcal, 0);
  };
  const totalKcal = MEAL_ORDER.filter(({ type }) => feita(type)).reduce((s, { type, index }) => s + kcalDe(type, index), 0);

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
          const variants = plan.slots.find((s) => s.mealType === type)?.variants ?? [];
          const escolhida = variantEscolhida(variants, meal);
          // Sem escolha do dia, o card mostra a opção 1 — mas mostra QUE é ela,
          // com o mesmo selo de esforço das outras duas telas de refeição.
          const exibida = escolhida ?? variants[0];
          const foods = meal?.foods ?? exibida?.foods ?? plan.defaultMeals[index] ?? [];
          const checked = feita(type);
          const kcal = foods.reduce((s, f) => s + f.kcal, 0);
          return (
            <div key={type} className="card">
              <div className="flex items-center gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => void toggleMeal(type, foods)}
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
              {exibida && (
                <p className="ml-9 mb-2 text-xs text-muted flex items-center gap-2 flex-wrap">
                  <span>{escolhida ? exibida.label : `${exibida.label} · sugestão`}</span>
                  {exibida.effort && (
                    <span className="text-[10px] uppercase tracking-wider text-muted border border-bg-border rounded px-1.5 py-0.5">
                      {EFFORT_LABEL[exibida.effort]}
                    </span>
                  )}
                </p>
              )}
              <ul className="space-y-1 text-sm text-muted ml-9">
                {foods.map((f, j) => (
                  <li key={j} className="flex justify-between gap-2">
                    <span>{f.name}</span>
                    {f.qtyG ? <span className="text-nude-warm tabular-nums whitespace-nowrap">{f.qtyG} g</span> : null}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setRecipeOf(type)}
                className="ml-9 mt-2 text-nude text-xs underline"
              >
                {escolhida ? "Ver modo de preparo" : "Ver as opções e o modo de preparo"}
              </button>
            </div>
          );
        })}
      </div>

      {recipeOf && <RecipeModal mealType={recipeOf} onClose={() => setRecipeOf(null)} />}
    </div>
  );
}
