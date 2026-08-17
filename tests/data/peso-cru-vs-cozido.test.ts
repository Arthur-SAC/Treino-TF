import { describe, it, expect } from "vitest";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";

// Ela pesou o almoço pela primeira vez (2026-08-17) e perguntou se estava certo.
// Estava — mas a pergunta expôs duas coisas erradas no seed.
//
// `foods[].qtyG` é peso PRONTO (o que vai no prato); `ingredients[].qty` é peso
// de COMPRA (cru). Para arroz e feijão a conversão estava feita — 91 g de arroz
// cru rendem 170 g cozidos. Para o frango não estava: o prato pedia 180 g
// grelhados e a lista mandava comprar 180 g, mas carne perde ~25% de água no
// fogo. Ela compraria menos frango do que a receita precisa, toda semana.
const proteinaAnimal = (item: string) => /frango|carne|patinho|tainha|sardinha|peixe|atum/i.test(item);

describe("peso de compra (cru) × peso do prato (pronto)", () => {
  it("carne e peixe: a quantidade a comprar é MAIOR que a porção pronta", () => {
    const erradas: Array<{ opcao: string; item: string; compra: number; pronto: number }> = [];
    for (const slot of INITIAL_PLAN.slots) {
      for (const v of slot.variants) {
        const pronto = v.foods
          .filter((f) => proteinaAnimal(f.name))
          .reduce((s, f) => s + f.qtyG, 0);
        const compra = v.ingredients
          .filter((i) => proteinaAnimal(i.item) && i.unit === "g")
          .reduce((s, i) => s + i.qty, 0);
        if (pronto > 0 && compra > 0 && compra <= pronto) {
          erradas.push({ opcao: v.id, item: v.foods.find((f) => proteinaAnimal(f.name))!.name, compra, pronto });
        }
      }
    }
    expect(erradas).toEqual([]);
  });

  // A segunda: o app dizia que coxa "serve igual" ao peito. Não serve — a mesma
  // porção de coxa dá ~13 g menos de proteína e o dobro de gordura, e proteína é
  // a alavanca que ela menos pode perder na construção de glúteo.
  it("nenhum texto trata coxa e peito como equivalentes nutricionais", () => {
    const textos = INITIAL_PLAN.slots
      .flatMap((s) => s.variants)
      .flatMap((v) => [...v.foods.map((f) => f.preparation ?? ""), ...v.ingredients.map((i) => i.item)])
      .join(" ");
    expect(textos).not.toMatch(/coxa[^.]{0,60}serve igual/i);
  });

  // E o prato precisa dizer que o peso é o de depois de pronto — foi a dúvida
  // exata dela, e 170 g de arroz cru em vez de cozido é o dobro da porção.
  it("os alimentos que mudam de peso no fogo dizem que a grama é depois de pronto", () => {
    const MUDAM = /arroz|feijão|macaxeira|frango|carne|peixe|tainha|sardinha|cuscuz|batata doce/i;
    const mudos = INITIAL_PLAN.slots
      .flatMap((s) => s.variants)
      .flatMap((v) => v.foods.map((f) => ({ opcao: v.id, ...f })))
      .filter((f) => MUDAM.test(f.name))
      .filter((f) => !/cozid|pronto|grelhad|assad|desfiad|refogad|depois de/i.test(`${f.name} ${f.preparation ?? ""}`))
      .map((f) => `${f.opcao} :: ${f.name}`);
    expect(mudos).toEqual([]);
  });
});
