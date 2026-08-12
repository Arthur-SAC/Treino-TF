// tests/pages/hoje-flex-progressao.test.tsx
//
// Os dois alongamentos do Hoje (manhã e noite) apontavam pra sequência FIXA:
// a mesma coisa no dia 1 e no dia 200. Agora cada um resolve pela progressão
// da própria trilha (`flexDoDia`), igual ao que já existe pro item pélvico
// (`rotuloPelvicoDoDia`/`pelvicDoDia`). Estes testes travam três coisas: a
// fase 1 é o ponto de partida, a fase avança com a prática — e o requisito
// que mais importa, praticar de manhã não pode mexer na trilha da noite,
// porque `contarPraticasFlex` conta só os ids daquela trilha.
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { Today } from "../../src/pages/Today";
import { hojeISO } from "../../src/lib/today-date";
import { flexDoDia, ATE_FLEX_FASE_2 } from "../../src/lib/flex-progression";

beforeEach(async () => {
  await db.routineChecks.clear();
  await db.dailyLog.clear();
  await db.settings.clear();
  await db.mealPlans.clear();
  await db.meals.clear();
  await db.practiceLogs.clear();
  await db.settings.put({ key: "activeCycle", value: "adaptacao" });
  await db.mealPlans.add({ ...INITIAL_PLAN });
});

/** Semeia `n` práticas concluídas de UMA sequência — é o que move a fase de
 *  uma trilha, sem tocar na outra. */
async function comPraticas(n: number, sequenceId: string): Promise<void> {
  for (let i = 0; i < n; i++) {
    await db.practiceLogs.add({ date: hojeISO(), sequenceId, completed: true });
  }
}

describe("Today: os dois alongamentos progridem, cada trilha por si", () => {
  it("com poucas práticas, o alongamento da manhã aponta pra sequência da fase 1", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);

    const esperado = flexDoDia("manha", 0);
    expect(esperado.sequenceId).toBe("mobilidade-pelvica-matinal");
    // Espera um texto que muda com a fase (a etapa) antes de ler o href — o
    // useLiveQuery da contagem ainda não liquidou no primeiro paint, e ler o
    // link ali observaria sempre este mesmo estado mesmo com a progressão
    // quebrada.
    await screen.findByText(esperado.etapa);

    const link = await screen.findByRole("link", { name: /alongamento manh/i });
    expect(link.getAttribute("href")).toBe(`/treino/movimento/${esperado.sequenceId}`);
  });

  it("depois de 28 práticas de manhã, aponta pra fase 2", async () => {
    await comPraticas(ATE_FLEX_FASE_2, "mobilidade-pelvica-matinal");
    render(<MemoryRouter><Today /></MemoryRouter>);

    const esperado = flexDoDia("manha", ATE_FLEX_FASE_2);
    expect(esperado.sequenceId).toBe("flex-manha-amplitude");
    await screen.findByText(esperado.etapa);

    const link = await screen.findByRole("link", { name: /alongamento manh/i });
    expect(link.getAttribute("href")).toBe(`/treino/movimento/${esperado.sequenceId}`);
  });

  it("práticas da manhã não avançam a trilha da noite", async () => {
    await comPraticas(ATE_FLEX_FASE_2, "mobilidade-pelvica-matinal");
    render(<MemoryRouter><Today /></MemoryRouter>);

    // Espera a MANHÃ liquidar em fase 2 primeiro — sinal de que os
    // useLiveQuery das duas trilhas já resolveram, não só o primeiro paint.
    await screen.findByText(flexDoDia("manha", ATE_FLEX_FASE_2).etapa);

    const noiteEsperada = flexDoDia("noite", 0);
    expect(noiteEsperada.sequenceId).toBe("flexibilidade-intima");
    await screen.findByText(noiteEsperada.etapa);

    const linkNoite = await screen.findByRole("link", { name: /alongamento noite/i });
    expect(linkNoite.getAttribute("href")).toBe(`/treino/movimento/${noiteEsperada.sequenceId}`);
  });

  it("o rótulo mostra a duração da sequência do dia, não um número fixo", async () => {
    const primeiraMontagem = render(<MemoryRouter><Today /></MemoryRouter>);
    await screen.findByText(flexDoDia("manha", 0).etapa);
    // Fase 1 da manhã (mobilidade-pelvica-matinal) dura 10 min no catálogo —
    // não o "15 min" que estava cravado em today-routine.ts.
    expect(await screen.findByText("Alongamento manhã · 10 min")).toBeInTheDocument();
    primeiraMontagem.unmount();

    await comPraticas(ATE_FLEX_FASE_2, "mobilidade-pelvica-matinal");
    render(<MemoryRouter><Today /></MemoryRouter>);
    await screen.findByText(flexDoDia("manha", ATE_FLEX_FASE_2).etapa);
    // Fase 2 (flex-manha-amplitude) dura 15 min — outro número, e o rótulo
    // acompanha porque agora vem do catálogo, não de texto fixo no item.
    expect(await screen.findByText("Alongamento manhã · 15 min")).toBeInTheDocument();
    expect(screen.queryByText("Alongamento manhã · 10 min")).not.toBeInTheDocument();
  });
});
