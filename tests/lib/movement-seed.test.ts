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
});
