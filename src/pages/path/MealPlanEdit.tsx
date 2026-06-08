import { useState, useEffect, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../lib/db";
import { getActiveMealPlan } from "../../lib/meal-plan";

export function MealPlanEdit() {
  const navigate = useNavigate();
  const plan = useLiveQuery(() => getActiveMealPlan(), []);
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carb, setCarb] = useState("");
  const [fat, setFat] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (plan) {
      setKcal(String(plan.kcalDaily));
      setProtein(String(plan.proteinG));
      setCarb(String(plan.carbG));
      setFat(String(plan.fatG));
      setName(plan.name);
    }
  }, [plan]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!plan?.id) return;
    await db.mealPlans.update(plan.id, {
      name: name.trim(),
      kcalDaily: Number(kcal),
      proteinG: Number(protein),
      carbG: Number(carb),
      fatG: Number(fat),
    });
    navigate("/trilha/alimentacao", { replace: true });
  }

  if (!plan) return <div className="p-4 text-muted text-sm">Carregando…</div>;

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/trilha/alimentacao" className="text-muted text-sm">&larr; Alimentação</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Editar plano</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Kcal diárias</label>
            <input
              type="number"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Proteína (g)</label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Carbo (g)</label>
            <input
              type="number"
              value={carb}
              onChange={(e) => setCarb(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Gordura (g)</label>
            <input
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium">
          Salvar
        </button>
      </form>
    </div>
  );
}
