import { describe, it, expect } from "vitest";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";
import { CONSUMO } from "../../src/lib/objetivo";

const somaDaVariante0 = (plan: (typeof ALL_MEAL_PLANS)[number]) =>
  plan.slots.reduce(
    (acc, slot) => {
      const foods = slot.variants[0]?.foods ?? [];
      return {
        kcal: acc.kcal + foods.reduce((s, f) => s + (f.kcal ?? 0), 0),
        proteinG: acc.proteinG + foods.reduce((s, f) => s + (f.proteinG ?? 0), 0),
      };
    },
    { kcal: 0, proteinG: 0 },
  );

describe("plano de déficit bate com a meta declarada em objetivo.ts", () => {
  const deficit = ALL_MEAL_PLANS.find((p) => p.goal === "deficit")!;

  it("a meta declarada do plano é a meta do módulo de objetivo", () => {
    expect(deficit.kcalDaily).toBe(CONSUMO.metaKcal);
  });

  it("a proteína entregue respeita o piso — exceder é bom, ficar abaixo não", () => {
    const { proteinG } = somaDaVariante0(deficit);
    expect(proteinG).toBeGreaterThanOrEqual(CONSUMO.proteinaGMin);
  });

  it("o nome do plano não contradiz o número", () => {
    expect(deficit.name).not.toContain("2200");
    expect(deficit.name).toContain(String(CONSUMO.metaKcal));
  });
});

// Fix round 2: as duas invariantes abaixo eram testadas só pro plano de
// déficit (fix round 1). Foi exatamente essa lacuna que deixou passar batido
// um vazamento: MAINTENANCE_SLOTS/SURPLUS_SLOTS nascem de SLOTS via
// boostSlots (meal-plan-seed.ts), então subir o targetKcal da base pro
// déficit também sobe o alvo de manutenção e superávit — mas o kcalDaily
// desses dois planos é um literal fixo que não acompanha sozinho. Cobrindo
// os 3 planos aqui, o próximo vazamento desse tipo quebra o teste em vez de
// só quebrar a tela.
describe("todo plano de ALL_MEAL_PLANS bate consigo mesmo (kcal do dia, alvo por refeição, comida real)", () => {
  // MealPlanView mostra plan.kcalDaily no topo do cartão e a soma dos
  // slot.targetKcal (um por refeição) logo abaixo, na mesma tela — pra
  // QUALQUER plano ativo, não só o déficit (src/pages/path/MealPlanView.tsx
  // :115 e :158; getActiveMealPlan troca de plano conforme o ciclo). Se as
  // duas somas não baterem, a usuária lê duas metas diferentes rolando a
  // mesma tela, seja qual for o plano do momento.
  it("a soma dos alvos por refeição é o kcalDaily do plano, em todo plano", () => {
    const violacoes = ALL_MEAL_PLANS.map((plano) => {
      const somaDosSlots = plano.slots.reduce((s, slot) => s + slot.targetKcal, 0);
      return {
        plano: plano.name,
        somaDosSlots,
        kcalDaily: plano.kcalDaily,
        diferencaKcal: somaDosSlots - plano.kcalDaily,
      };
    }).filter((r) => r.diferencaKcal !== 0);
    expect(violacoes).toEqual([]);
  });

  // Era 5% de tolerância (fix round 1) — 115 kcal de folga em cima de 2300,
  // folga grande o bastante pra um alimento inteiro mal contado passar
  // batido sem o teste notar. O desvio real do déficit é 1,3%; manutenção e
  // superávit, depois do fix round 2 (que cortou o boost pra fechar a
  // invariante acima), ficam em 1,2% e 1,1% — 3% (a nova tolerância) ainda
  // sobra margem confortável pra comida de verdade nunca bater no grama, sem
  // abrir mão de detectar erro grosseiro.
  it("a comida de verdade soma o kcalDaily do plano, com 3% de tolerância, em todo plano", () => {
    const violacoes = ALL_MEAL_PLANS.map((plano) => {
      const { kcal } = somaDaVariante0(plano);
      const desvio = Math.abs(kcal - plano.kcalDaily) / plano.kcalDaily;
      return {
        plano: plano.name,
        kcal,
        kcalDaily: plano.kcalDaily,
        desvioPct: `${(desvio * 100).toFixed(2)}%`,
        dentroDe3pct: desvio <= 0.03,
      };
    }).filter((r) => !r.dentroDe3pct);
    expect(violacoes).toEqual([]);
  });
});

// A dívida que a frente 1 registrou e esta frente paga: manutenção (2450) e
// superávit (2700) foram calculados contra um gasto estimado de ~2700 kcal,
// antes de CONSUMO.gastoEstimadoKcalMin/Max contar a caminhada de 5 km. Com ela
// contada, o gasto real é 2900-3100 — e o plano chamado "manutenção" era um
// déficit de ~550 kcal. Ela troca pra ele quando a cintura chegar a 88 (mês
// 3-4), e construiria glúteo em déficit sem saber.
describe("manutenção e superávit são calibrados contra o gasto real", () => {
  const gastoMedio = (CONSUMO.gastoEstimadoKcalMin + CONSUMO.gastoEstimadoKcalMax) / 2;

  it("manutenção fica dentro de 5% do gasto real — é isso que a palavra significa", () => {
    const m = ALL_MEAL_PLANS.find((p) => p.goal === "manutencao")!;
    const desvio = Math.abs(m.kcalDaily - gastoMedio) / gastoMedio;
    expect({ kcalDaily: m.kcalDaily, dentroDe5pct: desvio <= 0.05 })
      .toEqual({ kcalDaily: m.kcalDaily, dentroDe5pct: true });
  });

  it("superávit fica acima do gasto real — senão não é superávit", () => {
    const s = ALL_MEAL_PLANS.find((p) => p.goal === "superavit")!;
    expect(s.kcalDaily).toBeGreaterThan(CONSUMO.gastoEstimadoKcalMax);
  });

  it("o nome de cada plano diz o mesmo número que o plano carrega", () => {
    const mentem = ALL_MEAL_PLANS.filter((p) => !p.name.includes(String(p.kcalDaily)))
      .map((p) => ({ nome: p.name, kcalDaily: p.kcalDaily }));
    expect(mentem).toEqual([]);
  });
});
