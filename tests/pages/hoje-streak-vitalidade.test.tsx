// tests/pages/hoje-streak-vitalidade.test.tsx
//
// O quarto StreakCard no Hoje é o streak de Vitalidade. A usuária escolheu
// deixá-lo visível na tela que fica aberta em ambiente não receptivo — a
// mitigação combinada é o rótulo neutro ("Vitalidade", o nome do módulo,
// nunca o que ele conta). Estes testes travam a contagem E a privacidade do
// rótulo, que são o mesmo requisito visto de dois ângulos.
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

/** `n` dias antes de hoje, no fuso LOCAL — mesma régua que `hojeISO` usa
 *  dentro da página, pra não descolar da data real de quando o teste roda. */
function diasAtras(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return hojeISO(d);
}

/** O rótulo "Vitalidade" aparece duas vezes no Hoje: no atalho da
 *  ShortcutsGrid (um `<span>`) e no StreakCard novo (um `<p>`). Os testes
 *  abaixo precisam do card, não do atalho — por isso filtram pela tag. */
function streakLabelVitalidade(): HTMLElement {
  const ocorrencias = screen.getAllByText("Vitalidade");
  const doCard = ocorrencias.find((el) => el.tagName === "P");
  if (!doCard) throw new Error("StreakCard de Vitalidade não encontrado");
  return doCard;
}

describe("Hoje: streak de Vitalidade", () => {
  it("mostra quatro streaks, e o quarto se chama Vitalidade", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText("Treino")).toBeInTheDocument();
    expect(screen.getByText("Skincare")).toBeInTheDocument();
    expect(screen.getByText("Sono")).toBeInTheDocument();
    await screen.findAllByText("Vitalidade");
    expect(streakLabelVitalidade()).toBeInTheDocument();
  });

  it("o rótulo não descreve o que o streak conta — é decisão de privacidade", async () => {
    const { container } = render(<MemoryRouter><Today /></MemoryRouter>);
    await screen.findAllByText("Vitalidade");
    const texto = container.textContent?.toLowerCase() ?? "";
    expect(texto).not.toContain("pornografia");
    expect(texto).not.toContain("masturba");
  });

  it("o número mostrado é o streak atual, não o recorde", async () => {
    // início do acompanhamento há 15 dias, gasto marcado ontem: recorde é a
    // corrida inicial (14), atual é só 1 (de ontem até hoje). Números
    // deliberadamente diferentes — se o card mostrasse o recorde por engano,
    // este teste veria 14 em vez de 1.
    const inicio = diasAtras(15);
    const gasto = diasAtras(1);
    await db.dailyLog.put({ date: inicio, waterMl: 0, activeBreakCount: 0 });
    await db.dailyLog.put({ date: gasto, waterMl: 0, activeBreakCount: 0, gastoAutomatico: true });

    render(<MemoryRouter><Today /></MemoryRouter>);

    await screen.findAllByText("Vitalidade");
    const card = streakLabelVitalidade().closest("div");
    expect(card?.textContent).toContain("1");
    expect(card?.textContent).not.toContain("14");
  });
});
