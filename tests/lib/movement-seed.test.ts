import { describe, it, expect } from "vitest";
import { seedMovement } from "../../src/lib/movement-seed";
import { db } from "../../src/lib/db";

describe("seedMovement", () => {
  it("popula sequences", async () => {
    await seedMovement();
    const seqs = await db.danceSequences.toArray();
    expect(seqs.length).toBeGreaterThanOrEqual(8);
  });

  it("é idempotente", async () => {
    await seedMovement();
    const a = (await db.danceSequences.toArray()).length;
    await seedMovement();
    expect((await db.danceSequences.toArray()).length).toBe(a);
  });

  it("toda sequência tem moves não-vazios", async () => {
    await seedMovement();
    for (const s of await db.danceSequences.toArray()) {
      expect(s.moves.length).toBeGreaterThan(0);
      expect(s.durationMin).toBeGreaterThan(0);
    }
  });

  it("tem as trilhas de flexibilidade (4) e twerk (3)", async () => {
    await seedMovement();
    const seqs = await db.danceSequences.toArray();
    expect(seqs.filter((s) => s.category === "flexibilidade").length).toBe(4);
    expect(seqs.filter((s) => s.category === "twerk").length).toBe(3);
    expect(seqs.filter((s) => s.category === "apresentacao").length).toBe(4);
    for (const s of seqs.filter((x) => x.category === "apresentacao")) {
      expect(s.moves.length).toBeGreaterThan(0);
    }
  });

  it("tem a seção de intimidade (3) com moves não-vazios", async () => {
    await seedMovement();
    const seqs = await db.danceSequences.toArray();
    const intimidade = seqs.filter((s) => s.category === "intimidade");
    expect(intimidade.length).toBe(3);
    for (const s of intimidade) {
      expect(s.moves.length).toBeGreaterThan(0);
      expect(s.durationMin).toBeGreaterThan(0);
    }
  });

  it("tem o andar com gingado dentro de sensual", async () => {
    await seedMovement();
    const seqs = await db.danceSequences.toArray();
    const gingado = seqs.find((s) => s.id === "sensual-andar-gingado");
    expect(gingado).toBeDefined();
    expect(gingado!.category).toBe("sensual");
    expect(gingado!.moves.length).toBeGreaterThan(0);
  });
});
