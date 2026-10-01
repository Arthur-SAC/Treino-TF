import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// APK (2026-09-24): no primeiro uso do APK o banco está vazio — ela restaura o
// backup do app do Chrome ali mesmo, sem procurar Configurações.
const h = vi.hoisted(() => ({ restaurar: vi.fn(async () => {}), nativo: false }));
vi.mock("../../src/lib/plataforma", () => ({ isNativo: () => h.nativo }));
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

// Revisão final: no APK, accept=".trein-backup" vira uma lista vazia no
// seletor do Capacitor (a extensão não tem MIME) e o app fecha. No nativo não
// há accept; a extensão é conferida depois de escolher.
describe("RestaurarBackup no APK", () => {
  it("sem accept no seletor", () => {
    h.nativo = true;
    render(<RestaurarBackup rotulo="Restaurar backup" />);
    expect((screen.getByLabelText(/restaurar backup/i) as HTMLInputElement).hasAttribute("accept")).toBe(false);
    h.nativo = false;
  });
  it("arquivo que não é backup: avisa e não restaura", async () => {
    h.restaurar.mockClear();
    vi.stubGlobal("prompt", vi.fn(() => "senha"));
    render(<RestaurarBackup rotulo="Restaurar backup" />);
    fireEvent.change(screen.getByLabelText(/restaurar backup/i), { target: { files: [new File(["x"], "foto.jpg")] } });
    expect(await screen.findByText(/não é um backup/i)).toBeInTheDocument();
    expect(h.restaurar).not.toHaveBeenCalled();
  });
});
