import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { coletarBackup, restaurarBackup, blobParaBase64, base64ParaBlob } from "../../src/lib/backup-io";

// Auditoria de 2026-09-23: o backup deixava de fora as configurações (ciclo
// atual, contagem de sessões do ciclo, horários, altura, início da
// vitalidade), as marcações do Hoje e as tabelas de estilo, produtos e
// depilação. É o único lugar onde os dados dela existem fora do celular:
// restaurar num aparelho novo voltava pra Entrada 1.
async function limpar() {
  await Promise.all(db.tables.map((t) => t.clear()));
}

beforeEach(limpar);

describe("backup completo — ida e volta", () => {
  it("leva e traz configurações, marcações do Hoje, looks, depilação e produtos", async () => {
    await db.settings.bulkPut([
      { key: "activeCycle", value: "variacao" },
      { key: "cycleStartSessionCount", value: 23 },
      { key: "heightCm", value: 173 },
    ]);
    await db.routineChecks.put({ date: "2026-09-24", itemId: "creatina", done: true });
    await db.looks.add({ date: "2026-09-24", blob: new Blob(["foto"], { type: "image/jpeg" }), occasion: "casa", rating: "love" });
    await db.hairRemovalSessions.add({ date: "2026-09-20", area: "rosto", method: "lamina" } as never);
    await db.products.add({ name: "Protetor", category: "skincare" } as never);
    await db.measurements.add({ date: "2026-09-24", weightKg: 96 } as never);

    const payload = await coletarBackup();
    await limpar();
    await restaurarBackup(payload);

    expect((await db.settings.get("activeCycle"))?.value).toBe("variacao");
    expect((await db.settings.get("cycleStartSessionCount"))?.value).toBe(23);
    expect(await db.routineChecks.get(["2026-09-24", "creatina"])).toBeDefined();
    const looks = await db.looks.toArray();
    expect(looks).toHaveLength(1);
    expect(looks[0].occasion).toBe("casa");
    expect(await db.hairRemovalSessions.count()).toBe(1);
    expect(await db.products.count()).toBe(1);
    expect(await db.measurements.count()).toBe(1);
  });

  it("restaurar por cima de um app recém-instalado substitui as configurações do seed", async () => {
    await db.settings.put({ key: "activeCycle", value: "adaptacao" });
    const payload = await coletarBackup();
    await db.settings.put({ key: "activeCycle", value: "entrada-1" }); // o seed de um aparelho novo
    await restaurarBackup(payload);
    expect((await db.settings.get("activeCycle"))?.value).toBe("adaptacao");
  });

  // O banco falso dos testes não guarda Blob; a conversão é testada à parte,
  // com um Blob de verdade.
  it("a foto vai e volta byte a byte, com o tipo", async () => {
    const original = new Blob([new Uint8Array([0, 1, 2, 250, 255])], { type: "image/jpeg" });
    const volta = base64ParaBlob(await blobParaBase64(original), "image/jpeg");
    expect(volta.type).toBe("image/jpeg");
    expect([...new Uint8Array(await volta.arrayBuffer())]).toEqual([0, 1, 2, 250, 255]);
  });

  it("restaurar no mesmo aparelho, com os mesmos ids, não aborta", async () => {
    await db.measurements.add({ date: "2026-09-24", weightKg: 96 } as never);
    const payload = await coletarBackup();
    await restaurarBackup(payload);
    expect(await db.measurements.count()).toBe(1);
  });
});
