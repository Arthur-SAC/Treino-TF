import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Meal, type MealVariant } from "../lib/db";
import { getActiveMealPlan, EFFORT_LABEL } from "../lib/meal-plan";
import { hojeISO } from "../lib/today-date";

export const MEAL_TYPE_LABEL: Record<Meal["mealType"], string> = {
  cafe: "Café da manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
};

const MEAL_INDEX: Record<Meal["mealType"], number> = { cafe: 0, almoco: 1, lanche: 2, jantar: 3 };

/** Compara os foods gravados hoje com os de uma variante, pra saber qual
 *  opção está escolhida (a refeição não guarda o id da variante — só o
 *  conteúdo). */
function foodsEqual(a: Meal["foods"], b: Meal["foods"]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Card que abre por cima com as três opções da refeição — um acordeão: tocar
 *  numa opção só expande ela (mostra alimentos + modo de preparo), sem gravar
 *  nada. Só o botão "Comi essa", dentro da opção expandida, grava a escolha
 *  do dia. Carrega o plano ativo e a refeição do dia sozinho — usado na tela
 *  Hoje e na tela Refeições, pra receita ficar a um toque de distância. */
export function RecipeModal({ mealType, onClose }: { mealType: Meal["mealType"]; onClose: () => void }) {
  const plan = useLiveQuery(() => getActiveMealPlan(), []);
  const meals = useLiveQuery(() => db.meals.where("date").equals(hojeISO()).toArray(), []);
  const meal = meals?.find((m) => m.mealType === mealType);
  const slot = plan?.slots.find((s) => s.mealType === mealType);
  const variants = slot?.variants ?? [];
  // undefined = nenhuma interação ainda, usa o padrão (a escolhida hoje, ou a
  // opção 1 como sugestão); depois de um toque, guarda a variante expandida
  // explicitamente — é um acordeão, uma expandida por vez.
  const [expandedId, setExpandedId] = useState<string | undefined>(undefined);

  const chosenVariant = meal ? variants.find((v) => foodsEqual(v.foods, meal.foods)) : undefined;
  const defaultExpandedId = chosenVariant?.id ?? variants[0]?.id;
  const effectiveExpandedId = expandedId ?? defaultExpandedId;

  /** Grava a escolha do dia. Guarda: se a variante já é a escolhida de hoje,
   *  não regrava e não mexe no `checked` — evita que reabrir o modal só pra
   *  conferir o preparo e tocar "Comi essa" de novo derrube o "comido hoje". */
  async function confirmar(variant: MealVariant) {
    if (chosenVariant?.id === variant.id) return;
    await db.meals.put({
      ...(meal?.id !== undefined ? { id: meal.id } : {}),
      date: hojeISO(),
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

        <div className="space-y-2">
          {variants.map((v) => {
            const isChosen = chosenVariant?.id === v.id;
            const isExpanded = effectiveExpandedId === v.id;
            const recipeFoods = v.foods.filter((f) => f.preparation);
            return (
              <div
                key={v.id}
                className={`rounded-lg border ${isChosen ? "border-nude" : "border-bg-border"}`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(v.id)}
                  className={`w-full text-left px-3 py-2 text-sm ${
                    isChosen ? "bg-nude/10 text-nude-warm" : "text-muted"
                  }`}
                >
                  {v.label}
                  {v.effort && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-muted border border-bg-border rounded px-1.5 py-0.5 align-middle">
                      {EFFORT_LABEL[v.effort]}
                    </span>
                  )}
                  {isChosen && <span className="ml-2 text-nude">✓ escolhida hoje</span>}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3">
                    <ul className="space-y-1 text-sm text-nude-warm mb-3">
                      {v.foods.map((f, j) => (
                        <li key={j}>• {f.name}</li>
                      ))}
                    </ul>

                    {recipeFoods.length > 0 && (
                      <>
                        <h3 className="text-muted text-xs uppercase tracking-wider mb-2">Modo de preparo</h3>
                        <ul className="space-y-3 mb-3">
                          {recipeFoods.map((f, j) => (
                            <li key={j}>
                              <p className="text-nude-warm text-sm font-medium">{f.name}</p>
                              <p className="text-muted text-xs mt-1 leading-relaxed">{f.preparation}</p>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => void confirmar(v)}
                      className="text-nude text-xs underline"
                    >
                      {isChosen ? "✓ Comida hoje" : "Comi essa"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
