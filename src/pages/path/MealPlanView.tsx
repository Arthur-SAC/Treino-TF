import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import type { MealSlot, MealVariant } from "../../lib/db";
import { getActiveMealPlan, CINTURA_LIBERA_SUPERAVIT_CM, EFFORT_LABEL } from "../../lib/meal-plan";
import { RecomendadaBadge } from "../../components/RecomendadaBadge";
import { GuideAccordion } from "../../components/GuideAccordion";
import { COMER_FORA } from "../../data/comer-fora-seed";
import { useSetting } from "../../hooks/useSetting";
import { PathTabs } from "../../components/PathTabs";
import { buildWeeklyShoppingList } from "../../lib/shopping-list";
import { renderDietMarkdown, renderDietHtml } from "../../lib/diet-export";

const PERIOD_LABEL: Record<"cafe" | "almoco" | "lanche" | "jantar", string> = {
  cafe: "Café", almoco: "Almoço", lanche: "Lanche", jantar: "Jantar",
};

const GOAL_LABEL: Record<"deficit" | "manutencao" | "superavit", string> = {
  deficit: "Déficit · secar a barriga (fases entrada, adaptação e variação)",
  manutencao: "Manutenção (fase refinamento/manutenção)",
  superavit: "Superávit leve · crescer o glúteo (fase hipertrofia)",
};

/** Soma da combinação recomendada — uma variante por refeição. Calculada aqui,
 *  e não escrita na frase, porque número em prosa é número que diverge do dado
 *  no primeiro dia em que um alimento muda. */
function somaDoDiaRecomendado(slots: MealSlot[]) {
  const foods = slots.flatMap((s) => (s.variants.find((v) => v.recomendada) ?? s.variants[0]).foods);
  const kcal = foods.reduce((s, f) => s + f.kcal, 0);
  const proteinG = foods.reduce((s, f) => s + (f.proteinG ?? 0), 0);
  const fatG = foods.reduce((s, f) => s + (f.fatG ?? 0), 0);
  return { kcal, proteinG, fatG, gorduraPct: Math.round(((fatG * 9) / kcal) * 100) };
}

function VariantDetails({ v }: { v: MealVariant }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full cursor-pointer text-nude-warm text-sm flex justify-between"
      >
        <span>
          {v.label}
          {v.effort && (
            <span className="ml-2 text-[10px] uppercase tracking-wider text-muted border border-bg-border rounded px-1.5 py-0.5 align-middle">
              {EFFORT_LABEL[v.effort]}
            </span>
          )}
          {v.recomendada && <RecomendadaBadge />}
          {" "}
          <span className="text-nude text-xs">{open ? "▾" : "▸"}</span>
        </span>
        <span className="text-muted text-xs">{v.foods.reduce((s, f) => s + f.kcal, 0)} kcal</span>
      </button>
      {open && (
        <ul className="space-y-1.5 text-sm mt-2 ml-3">
          {v.foods.map((f, j) => (
            <li key={j}>
              <span className="flex justify-between gap-2">
                <span className="text-nude-warm">{f.name}</span>
                {/* A porção pesada, sempre — inclusive dos alimentos cujo nome
                    não diz a grama ("Salada de folhas e tomate", "Ovo mexido").
                    O dado sempre existiu; sem ele na tela, montar a marmita na
                    balança no domingo virava adivinhação. */}
                <span className="text-nude text-xs whitespace-nowrap">{f.qtyG} g</span>
              </span>
              {f.preparation && (
                <p className="text-muted text-xs mt-0.5 leading-relaxed">{f.preparation}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MealPlanView() {
  const plan = useLiveQuery(() => getActiveMealPlan(), []);
  const activeCycle = useSetting("activeCycle");

  if (!plan) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  const diaRecomendado = somaDoDiaRecomendado(plan.slots);

  function exportPdf() {
    if (!plan) return;
    const html = renderDietHtml(plan, buildWeeklyShoppingList(plan));
    const w = window.open("", "_blank");
    if (!w) { alert("Permita pop-ups pra gerar o PDF."); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  async function exportDiet() {
    if (!plan) return;
    const text = renderDietMarkdown(plan, buildWeeklyShoppingList(plan));
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: plan.name, text });
        return;
      }
    } catch {
      // usuário cancelou ou share indisponível — cai no fallback
    }
    try {
      await navigator.clipboard?.writeText(text);
      alert("Dieta copiada — é só colar no WhatsApp.");
    } catch {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plano-alimentar.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <h1 className="font-serif text-2xl text-nude flex-1">Trilha</h1>
        <Link to="/trilha/alimentacao/editar" className="text-muted text-sm">editar</Link>
      </div>
      <PathTabs />

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-1">{plan.name}</h2>
        <p className="text-nude text-xs mb-2">◆ {GOAL_LABEL[plan.goal]} · troca sozinho conforme o ciclo de treino ativo</p>
        <div className="grid grid-cols-4 gap-2">
          <div><p className="text-muted text-xs">kcal</p><p className="text-nude-warm text-lg">{plan.kcalDaily}</p></div>
          <div><p className="text-muted text-xs">proteína</p><p className="text-nude-warm text-lg">{plan.proteinG}g</p></div>
          <div><p className="text-muted text-xs">carbo</p><p className="text-nude-warm text-lg">{plan.carbG}g</p></div>
          <div><p className="text-muted text-xs">gordura</p><p className="text-nude-warm text-lg">{plan.fatG}g</p></div>
        </div>
      </div>

      {plan?.goal !== "superavit" && activeCycle === "hipertrofia" && (
        <div className="card mb-4 border-nude">
          <p className="text-sm text-nude-warm">
            Você está no ciclo de crescimento, mas o plano segue em manutenção de propósito: superávit calórico com a cintura acima de {CINTURA_LIBERA_SUPERAVIT_CM} cm deposita gordura na barriga, que é o que mais atrapalha a silhueta agora. O glúteo cresce em manutenção nesta fase. Registre uma medição nova pra liberar o superávit quando chegar lá.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => void exportDiet()}
          className="flex-1 bg-wine-light text-nude-warm rounded-md py-2.5 text-sm font-medium"
        >
          Exportar dieta
        </button>
        <button
          type="button"
          onClick={exportPdf}
          className="flex-1 border border-bg-border text-nude rounded-md py-2.5 text-sm font-medium"
        >
          Salvar PDF
        </button>
        <Link
          to="/trilha/alimentacao/lista-compras"
          className="flex-1 text-center border border-bg-border text-nude rounded-md py-2.5 text-sm"
        >
          Lista de compras
        </Link>
        <Link
          to="/trilha/alimentacao/domingo"
          className="flex-1 text-center border border-bg-border text-nude rounded-md py-2.5 text-sm"
        >
          Roteiro de domingo
        </Link>
      </div>

      {/* O porquê da marca mora aqui, uma vez, e não repetido em cada linha.
          Linguagem neutra de propósito: a tela de comida fica visível a quem
          olhar o celular dela, e o motivo íntimo do nitrato mora na Vitalidade,
          que é a aba de rótulo neutro. */}
      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium text-sm mb-1.5">A combinação recomendada</h2>
        <p className="text-muted text-xs leading-relaxed">
          As opções marcadas <span className="text-nude">recomendada</span> montam o dia mais completo deste
          cardápio: <span className="text-nude-warm">{diaRecomendado.kcal} kcal · {diaRecomendado.proteinG} g
          de proteína · {diaRecomendado.fatG} g de gordura ({diaRecomendado.gorduraPct}% da energia)</span>,
          com beterraba no jantar, e as quatro cabem na semana inteira sem estragar. Nas outras opções você
          não erra o dia — nenhuma cai abaixo do piso de gordura —, mas essa é a que rende mais.
        </p>
        <p className="text-muted text-xs leading-relaxed mt-2">
          <span className="text-nude-warm">Duas exceções que valem a pena:</span> duas vezes por semana
          troque o almoço ou o jantar pela opção de peixe (tainha ou sardinha) — é a gordura que o resto do
          cardápio não tem. E a beterraba rende mais 2 a 3 horas depois de comida, então em dia que importa
          ela vai no almoço ou num jantar cedo, não à noite.
        </p>
      </div>

      {/* Fica ACIMA da lista de opções, e não no fim da página, porque o
          cardápio responde "o que como em casa" e esta seção responde "e nos
          dias em que eu não como em casa" — que é metade dos fins de semana
          dela. Conteúdo que existe no fim de uma página longa é conteúdo que
          ela não encontra (a lição da frente 4). */}
      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Quando você come fora</h2>
      <GuideAccordion sections={COMER_FORA} className="mb-4" />

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Refeições e opções</h2>
      <div className="space-y-3">
        {plan.slots.map((slot) => (
          <div key={slot.mealType} className="card">
            <h3 className="text-nude-warm font-medium mb-2">
              {PERIOD_LABEL[slot.mealType] ?? slot.mealType} <span className="text-muted text-xs">· alvo {slot.targetKcal} kcal</span>
            </h3>
            <div className="space-y-2">
              {slot.variants.map((v) => (
                <VariantDetails key={v.id} v={v} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
