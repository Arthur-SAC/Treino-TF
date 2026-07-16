import { useLiveQuery } from "dexie-react-hooks";
import { db, type Meal } from "../lib/db";
import { getActiveMealPlan } from "../lib/meal-plan";

export const MEAL_TYPE_LABEL: Record<Meal["mealType"], string> = {
  cafe: "Café da manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
};

const MEAL_INDEX: Record<Meal["mealType"], number> = { cafe: 0, almoco: 1, lanche: 2, jantar: 3 };

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Card que abre por cima com os itens da refeição + o modo de preparo.
 *  Carrega o plano ativo e a refeição do dia sozinho — usado na tela Hoje e
 *  na tela Refeições, pra receita ficar a um toque de distância. */
export function RecipeModal({ mealType, onClose }: { mealType: Meal["mealType"]; onClose: () => void }) {
  const plan = useLiveQuery(() => getActiveMealPlan(), []);
  const meals = useLiveQuery(() => db.meals.where("date").equals(todayISO()).toArray(), []);
  const meal = meals?.find((m) => m.mealType === mealType);
  const foods = meal?.foods ?? plan?.defaultMeals[MEAL_INDEX[mealType]] ?? [];
  const recipeFoods = foods.filter((f) => f.preparation);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-serif text-xl text-nude">{MEAL_TYPE_LABEL[mealType]}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-muted text-lg px-2">✕</button>
        </div>

        <ul className="space-y-1 text-sm text-nude-warm mb-4">
          {foods.map((f, j) => (
            <li key={j}>• {f.name}</li>
          ))}
        </ul>

        {recipeFoods.length > 0 && (
          <>
            <h3 className="text-muted text-xs uppercase tracking-wider mb-2">Modo de preparo</h3>
            <ul className="space-y-3">
              {recipeFoods.map((f, j) => (
                <li key={j}>
                  <p className="text-nude-warm text-sm font-medium">{f.name}</p>
                  <p className="text-muted text-xs mt-1 leading-relaxed">{f.preparation}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
