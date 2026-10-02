import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { SessionDetail } from "../../src/pages/workout/SessionDetail";
import { db } from "../../src/lib/db";
import { seedDatabase } from "../../src/lib/seed";

async function abrir(modo?: "caminhada" | "esteira" | "pausada") {
  await db.settings.clear();
  await seedDatabase();
  if (modo) await db.settings.put({ key: "modoCaminhada", value: modo });
  render(
    <MemoryRouter initialEntries={["/treino/sessao/seg-gluteo-mobilidade"]}>
      <Routes>
        <Route path="/treino/sessao/:templateId" element={<SessionDetail />} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByText(/Ao terminar/);
}

beforeEach(async () => {
  await db.settings.clear();
});

describe("SessionDetail · 'Ao terminar' segue o modo da caminhada", () => {
  it("pausada: diz que está pausada e não afirma que a caminhada entrega a zona 2", async () => {
    await abrir("pausada");
    await waitFor(() => expect(document.body.textContent).toMatch(/caminhada está pausada/));
    expect(document.body.textContent).toMatch(/O passeio com os cães continua, mas é movimento leve — não substitui a zona 2\./);
    expect(document.body.textContent).not.toMatch(/Sem pressão/);
    expect(document.body.textContent).not.toMatch(/já entrega/);
  });

  it("esteira: aponta a esteira inclinada do dia", async () => {
    await abrir("esteira");
    await waitFor(() => expect(document.body.textContent).toMatch(/É ela a zona 2 de hoje/));
    expect(document.body.textContent).not.toMatch(/Sem cardio/);
    expect(document.body.textContent).not.toMatch(/caminhada de 5 km do trabalho para casa, às 16h/);
  });

  it("caminhada: mantém a caminhada de 5 km", async () => {
    await abrir("caminhada");
    expect(document.body.textContent).toMatch(/caminhada de 5 km/);
  });
});
