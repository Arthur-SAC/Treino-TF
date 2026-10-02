import { describe, it, expect } from "vitest";
import { backupVencido, diasSemBackup, INTERVALO_BACKUP_DIAS } from "../../src/lib/backup-lembrete";

describe("lembrete de backup", () => {
  it("nunca feito: vencido, sem contagem de dias", () => {
    expect(backupVencido("", "2026-10-02")).toBe(true);
    expect(diasSemBackup("", "2026-10-02")).toBeNull();
  });
  it("14 dias: em dia; 15: vencido", () => {
    expect(INTERVALO_BACKUP_DIAS).toBe(15);
    expect(backupVencido("2026-09-18", "2026-10-02")).toBe(false);
    expect(backupVencido("2026-09-17", "2026-10-02")).toBe(true);
    expect(diasSemBackup("2026-09-17", "2026-10-02")).toBe(15);
  });
});
