import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { coletarBackup, restaurarBackup } from "../../src/lib/backup-io";
import { DEFAULTS } from "../../src/lib/settings-helpers";

async function limpar() {
  await db.settings.clear();
}
// Payload completo (vazio) com as settings do "backup" trocadas.
const payload = async (settings: Array<{ key: string; value: unknown }>) => {
  const base = await coletarBackup();
  return { ...base, settings } as typeof base;
};

describe("backup: estado do Estilo em degraus", () => {
  beforeEach(limpar);

  it("padrões", () => {
    expect(DEFAULTS.estiloCompras).toEqual({});
    expect(DEFAULTS.estiloMes).toBeNull();
    expect(DEFAULTS.estiloDegrau).toBe(1);
    expect(DEFAULTS.estiloDegrauDesde).toBeNull();
    expect(DEFAULTS.estiloRecusas).toEqual({});
  });

  it("compras: união, mantendo a data mais antiga", async () => {
    await db.settings.put({ key: "estiloCompras", value: { a: { data: "2026-12-01" } } });
    await restaurarBackup(await payload([
      { key: "estiloCompras", value: { a: { data: "2026-11-10" }, b: { data: "2026-11-12" } } },
    ]));
    const v = (await db.settings.get("estiloCompras"))?.value as Record<string, { data: string }>;
    expect(v.a.data).toBe("2026-11-10");
    expect(v.b.data).toBe("2026-11-12");
  });

  it("recusas: vale a mais recente", async () => {
    await db.settings.put({ key: "estiloRecusas", value: { x: "2026-11-20" } });
    await restaurarBackup(await payload([{ key: "estiloRecusas", value: { x: "2026-11-01", y: "2026-11-02" } }]));
    expect((await db.settings.get("estiloRecusas"))?.value).toEqual({ x: "2026-11-20", y: "2026-11-02" });
  });

  it("degrau: o maior vence e o desde acompanha", async () => {
    await db.settings.bulkPut([
      { key: "estiloDegrau", value: 2 },
      { key: "estiloDegrauDesde", value: "2026-11-20" },
    ]);
    await restaurarBackup(await payload([
      { key: "estiloDegrau", value: 1 },
      { key: "estiloDegrauDesde", value: "2026-12-30" },
    ]));
    expect((await db.settings.get("estiloDegrau"))?.value).toBe(2);
    expect((await db.settings.get("estiloDegrauDesde"))?.value).toBe("2026-11-20");
  });

  it("degrau: backup mais alto traz o desde dele", async () => {
    await db.settings.bulkPut([
      { key: "estiloDegrau", value: 1 },
      { key: "estiloDegrauDesde", value: "2026-11-20" },
    ]);
    await restaurarBackup(await payload([
      { key: "estiloDegrau", value: 3 },
      { key: "estiloDegrauDesde", value: "2026-10-01" },
    ]));
    expect((await db.settings.get("estiloDegrau"))?.value).toBe(3);
    expect((await db.settings.get("estiloDegrauDesde"))?.value).toBe("2026-10-01");
  });

  it("backup sem as chaves não apaga o que está aqui", async () => {
    await db.settings.bulkPut([
      { key: "estiloDegrau", value: 2 },
      { key: "estiloDegrauDesde", value: "2026-11-20" },
      { key: "estiloCompras", value: { a: { data: "2026-11-01" } } },
    ]);
    await restaurarBackup(await payload([]));
    expect((await db.settings.get("estiloDegrau"))?.value).toBe(2);
    expect((await db.settings.get("estiloDegrauDesde"))?.value).toBe("2026-11-20");
    expect(((await db.settings.get("estiloCompras"))?.value as object)).toHaveProperty("a");
  });
});
