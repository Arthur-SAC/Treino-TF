import { describe, it, expect, beforeEach } from "vitest";
import { MILESTONES } from "../../src/data/milestones-seed";
import { PRODUCTS } from "../../src/data/products-seed";
import { db } from "../../src/lib/db";
import { seedBeauty } from "../../src/lib/beauty-seed";

// A meta de cabelo mudou em 2026-07: corte cacheado andrógino/feminino (wolf
// cut) com a rotina Juba — nada de crescer até abaixo dos ombros, nada de pixie.
// A auditoria de 2026-09-23 achou o marco, a home de Beleza e os produtos ainda
// na meta antiga.
const BELEZA = Object.values(import.meta.glob("../../src/pages/beauty/BeautyHome.tsx", { query: "?raw", import: "default", eager: true }))[0] as string;
const ANTIGA = /pixie|abaixo dos ombros|crescimento dos cachos|mais comprido/i;

describe("cabelo: a meta atual é o corte, não o comprimento", () => {
  it("o marco de cabelo fala do corte", () => {
    const cabelo = MILESTONES.find((m) => m.title.startsWith("✂"))!;
    expect(`${cabelo.title} ${cabelo.notes}`).not.toMatch(ANTIGA);
    expect(`${cabelo.title} ${cabelo.notes}`).toMatch(/corte|wolf/i);
  });

  it("a home de Beleza não promete crescimento", () => {
    expect(BELEZA).not.toMatch(ANTIGA);
  });

  it("os produtos de cabelo são os da rotina Juba, sem pixie", () => {
    const cabelo = PRODUCTS.filter((p) => p.category === "haircare");
    expect(JSON.stringify(cabelo)).not.toMatch(ANTIGA);
    expect(cabelo.some((p) => /Juba/.test(p.name))).toBe(true);
  });
});

describe("os produtos chegam no aparelho dela", () => {
  beforeEach(async () => {
    await db.products.clear();
    await db.settings.clear();
  });

  it("troca os produtos de cabelo antigos que ela não mexeu e mantém os que ela editou", async () => {
    await db.settings.put({ key: "beautySeeded", value: true });
    await db.products.bulkAdd([
      { name: "Creme de pentear leve pra cachos curtos", category: "haircare", notes: "Aplica em mecha úmida pra definir cachos do pixie. Não usa muito — pixie cacheado fica leve." },
      { name: "Co-wash Salon Line / Lola", category: "haircare", notes: "comprei, uso toda semana" },
    ] as never);
    await seedBeauty();
    const nomes = (await db.products.toArray()).map((p) => p.name);
    expect(nomes).not.toContain("Creme de pentear leve pra cachos curtos");
    expect(nomes).toContain("Co-wash Salon Line / Lola");
    expect(nomes.some((n) => /Juba/.test(n))).toBe(true);
  });

  it("não traz de volta produto que ela apagou — só acrescenta os de cabelo novos", async () => {
    await db.settings.put({ key: "beautySeeded", value: true });
    // Ela tem só um produto: apagou todos os outros do seed.
    await db.products.add({ name: "Meu protetor", category: "skincare" } as never);
    await seedBeauty();
    const produtos = await db.products.toArray();
    expect(produtos.filter((p) => p.category !== "haircare").map((p) => p.name)).toEqual(["Meu protetor"]);
    expect(produtos.some((p) => /Juba/.test(p.name))).toBe(true);
  });
});
