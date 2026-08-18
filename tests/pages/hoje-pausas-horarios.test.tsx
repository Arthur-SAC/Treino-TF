import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { Today } from "../../src/pages/Today";

// A tela mostrava "0 de 6" no item de micro-pausas: quantas faltam, nunca
// quando, e nada dizendo que havia conteúdo atrás do toque. Ela pediu os
// horários "pra não esquecer" (2026-08-18) e, dois dias antes, tinha apontado
// que o app manda fazer as pausas sem dizer o que são.
describe("micro-pausas no Hoje", () => {
  beforeEach(async () => {
    await db.mealPlans.clear();
    await db.settings.clear();
    await db.dailyLog.clear();
    await db.mealPlans.add({ ...INITIAL_PLAN } as never);
  });

  it("mostra os horários de cada pausa e convida a tocar", async () => {
    render(
      <MemoryRouter>
        <Today />
      </MemoryRouter>,
    );

    // Espera o useLiveQuery liquidar por um texto que só existe com o dado
    // carregado — ler antes disso observaria o primeiro estado.
    await waitFor(() =>
      expect(screen.getByText(/Toque pra ver o que fazer/)).toBeInTheDocument(),
    );

    const linha = screen.getByText(/Toque pra ver o que fazer/).textContent ?? "";
    // Expediente dela: 7h-16h, a cada 90 min.
    for (const hora of ["07:00", "08:30", "10:00", "11:30", "13:00", "14:30"]) {
      expect(linha).toContain(hora);
    }
  });
});
