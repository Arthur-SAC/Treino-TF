import { useLiveQuery } from "dexie-react-hooks";
import { db, type Meal, type MealVariant } from "../lib/db";
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

/** Compara os foods gravados hoje com os de uma variante, pra saber qual
 *  opção está escolhida (a refeição não guarda o id da variante — só o
 *  conteúdo). */
function foodsEqual(a: Meal["foods"], b: Meal["foods"]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Card que abre por cima com as três opções da refeição, cada uma com sua
 *  lista de alimentos e o modo de preparo. Carrega o plano ativo e a refeição
 *  do dia sozinho — usado na tela Hoje e na tela Refeições, pra receita ficar
 *  a um toque de distância. Tocar numa opção grava a escolha do dia. */
export function RecipeModal({ mealType, onClose }: { mealType: Meal["mealType"]; onClose: () => void }) {
  const plan = useLiveQuery(() => getActiveMealPlan(), []);
  const meals = useLiveQuery(() => db.meals.where("date").equals(todayISO()).toArray(), []);
  const meal = meals?.find((m) => m.mealType === mealType);
  const slot = plan?.slots.find((s) => s.mealType === mealType);
  const variants = slot?.variants ?? [];

  async function escolher(variant: MealVariant) {
    await db.meals.put({
      ...(meal?.id !== undefined ? { id: meal.id } : {}),
      date: todayISO(),
      mealType,
      foods: variant.foods,
      checked: false,
    });
  }

  // Instalação antiga cujo plano ainda não recebeu o re-seed com `slots`:
  // mantém o comportamento anterior (uma única lista, a da variante 0) em
  // vez de renderizar vazio.
  if (variants.length === 0) {
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

  const chosenVariant = meal ? variants.find((v) => foodsEqual(v.foods, meal.foods)) : undefined;
  const activeVariant = chosenVariant ?? variants[0];
  const recipeFoods = activeVariant.foods.filter((f) => f.preparation);

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

        <div className="space-y-2 mb-4">
          {variants.map((v) => {
            const isChosen = chosenVariant?.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => void escolher(v)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${
                  isChosen ? "border-nude bg-nude/10 text-nude-warm" : "border-bg-border text-muted"
                }`}
              >
                {v.label}
                {isChosen && <span className="ml-2 text-nude">✓ escolhida hoje</span>}
              </button>
            );
          })}
        </div>

        <h3 className="text-muted text-xs uppercase tracking-wider mb-2">
          {chosenVariant ? "Escolhida hoje" : "Sugestão do dia"}
        </h3>
        <ul className="space-y-1 text-sm text-nude-warm mb-4">
          {activeVariant.foods.map((f, j) => (
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
