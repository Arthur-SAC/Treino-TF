import { describe, it, expect } from "vitest";
import { porcoesDoLote } from "../../src/lib/marmita-porcoes";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import type { MealPlan } from "../../src/lib/db";

const plano = { ...INITIAL_PLAN, id: 1 } as MealPlan;

// No domingo ela monta os potes na balança. O roteiro diz "1 kg de frango" e
// "arroz de 5 a 6 refeições" — rendimento do lote, que é a informação certa
// para comprar e para cozinhar, e a errada para porcionar. Quanto vai em CADA
// pote é outro número, e ele já existe no cardápio: é o qtyG de cada alimento.
// Derivar daqui em vez de reescrever no roteiro é o que impede os dois de
// divergirem em silêncio quando uma porção mudar.
describe("porções de cada marmita", () => {
  const porcoes = porcoesDoLote(plano);

  it("cobre almoço e jantar — as duas refeições que viram pote", () => {
    expect(new Set(porcoes.map((p) => p.mealType))).toEqual(new Set(["almoco", "jantar"]));
  });

  it("só traz as opções que saem do lote de domingo", () => {
    expect(porcoes.filter((p) => p.effort !== "lote-domingo")).toEqual([]);
    expect(porcoes.length).toBeGreaterThanOrEqual(3);
  });

  it("cada porção diz o alimento e quantos gramas vão no pote", () => {
    for (const p of porcoes) {
      expect(p.itens.length).toBeGreaterThan(0);
      for (const i of p.itens) {
        expect(i.qtyG).toBeGreaterThan(0);
        expect(i.name.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("os gramas são os do cardápio, não uma segunda cópia deles", () => {
    const almoco1 = plano.slots.find((s) => s.mealType === "almoco")!.variants[0];
    const daTela = porcoes.find((p) => p.opcaoId === almoco1.id)!;
    expect(daTela.itens.map((i) => ({ name: i.name, qtyG: i.qtyG })))
      .toEqual(almoco1.foods.map((f) => ({ name: f.name, qtyG: f.qtyG })));
  });

  it("diz o peso total do pote — é o número que a balança mostra", () => {
    for (const p of porcoes) {
      expect(p.totalG).toBe(p.itens.reduce((s, i) => s + i.qtyG, 0));
    }
  });
});
