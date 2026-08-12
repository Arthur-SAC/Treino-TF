import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedStyle } from "../../src/lib/style-seed";

// A migração precisa transformar dois valores em três SEM perder nada. O valor
// "livre" agrupava casa e íntimo indistintamente, então ele é o único que exige
// decisão: peça íntima vira "intimo", o resto vira "casa".
describe("migração de discretion (2 valores) para mode (3 modos)", () => {
  beforeEach(async () => {
    await db.garments.clear();
    await db.outfits.clear();
    await db.stylePalette.clear();
    await db.settings.clear();
  });

  it("discreto vira publico", async () => {
    await db.garments.put({
      id: "calca-cintura-alta",
      name: "Calça de cintura alta",
      category: "bottom",
      occasion: ["casual"],
      whyItWorks: "…",
      discretion: "discreto",
    } as never);
    await db.settings.put({ key: "styleSeeded", value: true });
    await db.settings.put({ key: "styleSeededV2", value: true });
    await db.settings.put({ key: "styleSeedVersion", value: 3 });

    await seedStyle();

    const g = await db.garments.get("calca-cintura-alta");
    expect(g?.mode).toBe("publico");
  });

  it("livre + intimate vira intimo; livre + resto vira casa", async () => {
    await db.settings.put({ key: "styleSeeded", value: true });
    await db.settings.put({ key: "styleSeededV2", value: true });
    await db.settings.put({ key: "styleSeedVersion", value: 3 });

    await seedStyle();

    const body = await db.garments.get("body-de-renda");
    const saia = await db.garments.get("saia-rodada");
    expect({ body: body?.mode, saia: saia?.mode }).toEqual({ body: "intimo", saia: "casa" });
  });

  // Peça que ela criou não tem id do seed e não pode ser tocada além do modo.
  it("a peça que ela criou sobrevive à migração, com o texto dela intacto", async () => {
    await db.garments.put({
      id: "peca-dela-123",
      name: "Aquela blusa que eu amo",
      category: "top",
      occasion: ["casual"],
      whyItWorks: "porque sim",
      discretion: "livre",
    } as never);
    await db.settings.put({ key: "styleSeeded", value: true });
    await db.settings.put({ key: "styleSeededV2", value: true });
    await db.settings.put({ key: "styleSeedVersion", value: 3 });

    await seedStyle();

    const dela = await db.garments.get("peca-dela-123");
    expect(dela).toBeDefined();
    expect(dela?.name).toBe("Aquela blusa que eu amo");
    expect(dela?.whyItWorks).toBe("porque sim");
    expect(dela?.mode).toBe("casa");
  });

  // Este é o caso que de fato prova a regra do "livre". Nos ids que existem no
  // seed, a migração é irrelevante: logo depois dela o seed regrava a peça com
  // o modo já escrito no arquivo, então o teste passaria mesmo com a regra
  // errada. Só numa peça que ela criou — que o seed não conhece e nunca
  // reescreve — a decisão da migração é a única que sobra.
  it("peça ÍNTIMA criada por ela vai pra intimo, não pra casa", async () => {
    await db.garments.put({
      id: "camisola-dela-777",
      name: "A camisola que ela me deu",
      category: "intimate",
      occasion: ["intimo"],
      whyItWorks: "presente dela",
      discretion: "livre",
    } as never);
    await db.settings.put({ key: "styleSeeded", value: true });
    await db.settings.put({ key: "styleSeededV2", value: true });
    await db.settings.put({ key: "styleSeedVersion", value: 3 });

    await seedStyle();

    const dela = await db.garments.get("camisola-dela-777");
    expect({ nome: dela?.name, modo: dela?.mode })
      .toEqual({ nome: "A camisola que ela me deu", modo: "intimo" });
  });

  it("nenhuma peça fica sem modo depois da migração", async () => {
    await seedStyle();
    const sem = (await db.garments.toArray()).filter((g) => !g.mode).map((g) => g.id);
    expect(sem).toEqual([]);
  });

  it("rodar de novo não duplica peça nem combinação", async () => {
    await seedStyle();
    const g1 = await db.garments.count();
    const o1 = await db.outfits.count();
    await seedStyle();
    expect({ g: await db.garments.count(), o: await db.outfits.count() }).toEqual({ g: g1, o: o1 });
  });
});
