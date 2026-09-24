import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// APK (2026-09-24): no primeiro uso do APK o banco está vazio — ela restaura o
// backup do app do Chrome ali mesmo, sem procurar Configurações.
const h = vi.hoisted(() => ({ restaurar: vi.fn(async () => {}) }));
vi.mock("../../src/lib/backup-io", () => ({ restaurarBackup: h.restaurar }));
vi.mock("../../src/lib/backup", () => ({ decryptBackup: vi.fn(async () => ({ measurements: [] })) }));
import { RestaurarBackup } from "../../src/components/RestaurarBackup";

describe("RestaurarBackup", () => {
  it("pede a senha, restaura e avisa quem chamou", async () => {
    vi.stubGlobal("prompt", vi.fn(() => "senha"));
    const onPronto = vi.fn();
    render(<RestaurarBackup rotulo="Veio do app do Chrome? Restaurar backup" onPronto={onPronto} />);
    const input = screen.getByLabelText(/restaurar backup/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(["x"], "b.trein-backup")] } });
    await waitFor(() => expect(onPronto).toHaveBeenCalled());
    expect(h.restaurar).toHaveBeenCalled();
  });

  it("sem senha não restaura", async () => {
    vi.stubGlobal("prompt", vi.fn(() => null));
    h.restaurar.mockClear();
    render(<RestaurarBackup rotulo="Restaurar backup" />);
    fireEvent.change(screen.getByLabelText(/restaurar backup/i), { target: { files: [new File(["x"], "b.trein-backup")] } });
    await new Promise((r) => setTimeout(r, 20));
    expect(h.restaurar).not.toHaveBeenCalled();
  });
});
