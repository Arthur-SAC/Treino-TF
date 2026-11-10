import { describe, it, expect, beforeEach } from "vitest";
import { MILESTONES } from "../../src/data/milestones-seed";
import { PRODUCTS } from "../../src/data/products-seed";
import { db } from "../../src/lib/db";
import { seedBeauty, NOVOS_V2, PRODUCT_SEED_VERSION, ROUTINE_SEED_VERSION } from "../../src/lib/beauty-seed";

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
    // Só o dela e os que nasceram na v2 — nada do seed antigo volta.
    const outros = produtos.filter((p) => p.category !== "haircare").map((p) => p.name);
    expect(outros.filter((n) => !NOVOS_V2.has(n))).toEqual(["Meu protetor"]);
    expect(outros).not.toContain("Sabonete íntimo Lucretin / Dermacyd");
    expect(produtos.some((p) => /Juba/.test(p.name))).toBe(true);
  });
});

describe("kit de custo-benefício (v2) chega no aparelho dela", () => {
  beforeEach(async () => {
    await db.products.clear();
    await db.skincareRoutines.clear();
    await db.settings.clear();
  });

  it("PRODUCT_SEED_VERSION e ROUTINE_SEED_VERSION são as revisadas nesta rodada", () => {
    expect(PRODUCT_SEED_VERSION).toBe(2);
    expect(ROUTINE_SEED_VERSION).toBe(4);
  });

  it("tira o kit caro que ela não mexeu, mantém o que ela comprou e põe o novo", async () => {
    await db.settings.put({ key: "beautySeeded", value: true });
    await db.settings.put({ key: "routineSeedVersion", value: ROUTINE_SEED_VERSION });
    await db.settings.put({ key: "productSeedVersion", value: PRODUCT_SEED_VERSION - 1 });
    await db.products.bulkAdd([
      { name: "Bepantol Derma Pré + Pós", category: "skincare", notes: "Cicatrizante. Use em cicatrizes recentes nas costas. Acelera reparação." },
      { name: "Retinol 0,3% Skinceuticals", category: "skincare", notes: "1-2x/semana à noite (alternar com glicólico). Estimula renovação. Pode irritar — começa devagar.", boughtAt: "2026-08-01" },
      { name: "Gel de fixação", category: "haircare", notes: "Última camada; forma a casquinha que o óleo quebra depois de seco." },
    ] as never);

    await seedBeauty();

    const produtos = await db.products.toArray();
    const nomes = produtos.map((p) => p.name);
    expect(nomes).not.toContain("Bepantol Derma Pré + Pós");
    expect(nomes).toContain("Retinol 0,3% Skinceuticals");
    expect(nomes.some((n) => /Adapaleno/.test(n))).toBe(true);
    expect(nomes.some((n) => /antirresíduo/.test(n))).toBe(true);
    expect(produtos.find((p) => p.name === "Gel de fixação")?.notes).toMatch(/umidade/);
    // Rodar de novo não duplica.
    await seedBeauty();
    expect(await db.products.count()).toBe(produtos.length);
  });

  it("as rotinas novas chegam em quem estava na versão anterior: sem Bepantol, com adapaleno e 15h30", async () => {
    await db.settings.put({ key: "beautySeeded", value: true });
    await db.settings.put({ key: "productSeedVersion", value: PRODUCT_SEED_VERSION });
    await db.settings.put({ key: "routineSeedVersion", value: ROUTINE_SEED_VERSION - 1 });
    await db.skincareRoutines.add({
      name: "Costas · tratamento de cicatrizes (noturno)", time: "evening", target: "back",
      steps: [{ productName: "Hidratante corporal (ou Bepantol Derma nas marcas mais recentes)", technique: "", waitMin: 0 }],
    } as never);

    await seedBeauty();

    const rotinas = await db.skincareRoutines.toArray();
    const costas = rotinas.filter((r) => r.name.startsWith("Costas"));
    expect(costas).toHaveLength(1);
    const texto = JSON.stringify(costas[0].steps);
    expect(texto).toMatch(/Adapaleno/);
    expect(texto).not.toMatch(/Bepantol Derma nas marcas/);
    expect(JSON.stringify(rotinas.find((r) => r.name === "Rosto · manhã")?.steps)).toMatch(/15h30/);
  });
});
