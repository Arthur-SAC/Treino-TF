import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { hojeISO, ultimosDiasISO } from "../../src/lib/today-date";
import { AvisoBackup } from "../../src/components/AvisoBackup";

const montar = () => render(<MemoryRouter><p>carregado</p><AvisoBackup /></MemoryRouter>);

beforeEach(async () => { await db.settings.clear(); });

describe("AvisoBackup", () => {
  it("nunca fez: avisa e leva a Configurações", async () => {
    montar();
    expect(await screen.findByText(/Nenhum backup registrado neste aparelho/)).toBeTruthy();
    expect(screen.getByText(/seus dados só existem neste celular/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Fazer backup" }).getAttribute("href")).toBe("/configuracoes");
  });

  it("backup de hoje: não aparece", async () => {
    await db.settings.put({ key: "ultimoBackupEm", value: hojeISO() });
    montar();
    await new Promise((r) => setTimeout(r, 100));
    expect(screen.queryByText(/seus dados só existem/i)).toBeNull();
  });

  it("20 dias atrás: diz há quantos dias", async () => {
    await db.settings.put({ key: "ultimoBackupEm", value: ultimosDiasISO(hojeISO(), 21)[20] });
    montar();
    expect(await screen.findByText(/Faz 20 dias sem backup/)).toBeTruthy();
  });
});
