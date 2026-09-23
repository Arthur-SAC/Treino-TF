import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { buildDayRoutine } from "../../src/lib/today-routine";
import { WorkoutHome } from "../../src/pages/workout/WorkoutHome";
import { seedDatabase } from "../../src/lib/seed";

// Miúdos da auditoria de 2026-09-23.
const jantar = (dow: number) => buildDayRoutine(dow, 1).blocks.flatMap((b) => b.items).find((i) => i.id === "jantar")!;

describe("miúdos", () => {
  it("jantar de sexta e sábado lembra do plano de comer fora; dia útil não", () => {
    expect(jantar(5).note ?? "").toMatch(/fora/i);
    expect(jantar(6).note ?? "").toMatch(/fora/i);
    expect(jantar(2).note ?? "").not.toMatch(/fora/i);
  });

  it("a aba Treino abre pelo treino de hoje (ou diz que é descanso)", async () => {
    await seedDatabase();
    render(<MemoryRouter><WorkoutHome /></MemoryRouter>);
    const card = await screen.findByText(/treino de hoje|descanso/i);
    expect(card).toBeInTheDocument();
  });

  it("o ícone da notificação respeita o caminho do app publicado (/Treino-TF/)", () => {
    const fonte = Object.values(import.meta.glob("../../src/lib/notifications.ts", { query: "?raw", import: "default", eager: true }))[0] as string;
    expect(fonte).toMatch(/BASE_URL/);
  });
});
