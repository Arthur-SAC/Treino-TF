import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { Today } from "../../src/pages/Today";
import { hojeISO } from "../../src/lib/today-date";

beforeEach(async () => {
  await db.routineChecks.clear();
  await db.dailyLog.clear();
  await db.settings.clear();
  await db.mealPlans.clear();
  await db.meals.clear();
  await db.settings.put({ key: "activeCycle", value: "adaptacao" });
  await db.mealPlans.add({ ...INITIAL_PLAN });
});

describe("Today (backbone)", () => {
  it("renderiza os blocos da rotina do dia", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText("Manhã")).toBeInTheDocument();
    expect(screen.getByText("No trabalho")).toBeInTheDocument();
    expect(screen.getByText("Noite")).toBeInTheDocument();
  });

  it("mostra o item Seu tempo (desenho + leitura)", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText(/Seu tempo/i)).toBeInTheDocument();
  });

  // O alvo do sono era a constante "22:30" na tela, enquanto o horário do item
  // é ajustável em /hoje/horarios: mudar pra 23h fazia a linha dizer "23h" e o
  // subtítulo continuar prometendo "alvo 22:30".
  it("o alvo do sono acompanha o horário ajustado do item Dormir", async () => {
    await db.settings.put({ key: "routineTimes", value: { dormir: "23:00" } });
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText(/alvo 23:00/)).toBeInTheDocument();
    expect(screen.queryByText(/alvo 22:30/)).not.toBeInTheDocument();
  });

  it("o contador de micro-pausas mostra o alvo do dia, não só quantas já foram", async () => {
    const hoje = hojeISO();
    const ehFimDeSemana = [0, 6].includes(new Date().getDay());
    await db.dailyLog.put({ date: hoje, waterMl: 0, activeBreakCount: 3 });
    render(<MemoryRouter><Today /></MemoryRouter>);
    await screen.findByText("Manhã");
    // 9h→18h a cada 90 min = 6. O item só existe em dia de expediente.
    if (ehFimDeSemana) {
      expect(screen.queryByText("3 de 6")).not.toBeInTheDocument();
    } else {
      expect(await screen.findByText("3 de 6")).toBeInTheDocument();
    }
  });

  it("abre a receita da refeição direto no Hoje (sem ir pra outra aba)", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    const cafe = await screen.findByRole("button", { name: "Café + whey · montar marmita" });
    fireEvent.click(cafe);
    // a receita do café localizado (cuscuz sem manteiga) abre no próprio card
    expect((await screen.findAllByText(/Cuscuz de milho/i)).length).toBeGreaterThan(0);
  });
});
