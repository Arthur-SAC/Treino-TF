import { describe, it, expect } from "vitest";
import { db, type Outfit } from "../../src/lib/db";

describe("db.outfits", () => {
  it("adiciona e lê uma combinação", async () => {
    const outfit: Omit<Outfit, "id"> = {
      name: "Teste",
      context: "discreto",
      occasion: "casual",
      pieces: ["calça cintura alta", "camiseta encorpada"],
      whyItWorks: "estrutura unissex marca a cintura",
      silhouetteNote: "linha vertical disfarça a barriga",
      status: "ideia",
    };
    const id = await db.outfits.add(outfit as Outfit);
    const read = await db.outfits.get(id);
    expect(read?.name).toBe("Teste");
    expect(read?.pieces).toHaveLength(2);
  });

  it("consulta por context", async () => {
    await db.outfits.add({
      name: "Livre teste", context: "livre", occasion: "casa",
      pieces: ["vestido"], whyItWorks: "x", silhouetteNote: "y", status: "ideia",
    } as Outfit);
    const livres = await db.outfits.where("context").equals("livre").toArray();
    expect(livres.length).toBeGreaterThanOrEqual(1);
  });
});
