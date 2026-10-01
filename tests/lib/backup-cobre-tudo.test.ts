import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { coletarBackup, restaurarBackup, TABELAS_SO_SEED } from "../../src/lib/backup-io";
import { seedDatabase } from "../../src/lib/seed";

// APK (2026-09-24): a migração do app do Chrome pro APK é por backup. Tabela
// que a interface edita e o backup não leva é dado dela perdido na troca.
const NOME_NO_PAYLOAD: Record<string, string> = { workoutSessions: "sessions" };

describe("o backup cobre todas as tabelas", () => {
  it("toda tabela do banco está no backup ou é só do seed (nenhuma tela grava nela)", async () => {
    const payload = (await coletarBackup()) as unknown as Record<string, unknown>;
    const faltando = db.tables
      .map((t) => t.name)
      .filter((n) => !(TABELAS_SO_SEED ?? []).includes(n))
      .filter((n) => !((NOME_NO_PAYLOAD[n] ?? n) in payload));
    expect(faltando).toEqual([]);
  });

  it("as tabelas só do seed não são gravadas por nenhuma tela", () => {
    const fontes = Object.values(
      import.meta.glob("../../src/{pages,components,hooks}/**/*.tsx", { query: "?raw", import: "default", eager: true }),
    ) as string[];
    expect(fontes.length).toBeGreaterThan(10);
    for (const t of TABELAS_SO_SEED) {
      const grava = new RegExp(`db\\.${t}\\.(put|add|update|delete|bulk)`);
      expect({ t, grava: fontes.some((f) => grava.test(f)) }).toEqual({ t, grava: false });
    }
  });
});

describe("restaurar num aparelho novo", () => {
  beforeEach(async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
    await seedDatabase();
  });

  it("o link de vídeo que ela colou no exercício volta", async () => {
    const ex = (await db.exercises.toArray())[0];
    await db.exercises.update(ex.id, { videoUrl: "https://youtu.be/dela" });
    const payload = await coletarBackup();
    await db.exercises.update(ex.id, { videoUrl: undefined });
    await restaurarBackup(payload);
    expect((await db.exercises.get(ex.id))?.videoUrl).toBe("https://youtu.be/dela");
  });

  it("rotina de skincare com id automático não duplica ao restaurar sobre o seed", async () => {
    const { seedBeauty } = await import("../../src/lib/beauty-seed");
    await seedBeauty();
    await db.skincareRoutines.add({ name: "Minha rotina", steps: [] } as never);
    const payload = await coletarBackup();
    const antes = await db.skincareRoutines.count();
    await Promise.all(db.tables.map((t) => t.clear()));
    await seedDatabase();
    await seedBeauty();
    await restaurarBackup(payload);
    expect(await db.skincareRoutines.count()).toBe(antes);
  });
});
