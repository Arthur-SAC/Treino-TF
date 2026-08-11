// tests/pages/vitalidade.smoke.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Vitalidade } from "../../src/pages/path/Vitalidade";
import { ShortcutsGrid } from "../../src/components/ShortcutsGrid";
import { db } from "../../src/lib/db";
import { hojeISO } from "../../src/lib/today-date";

beforeEach(async () => {
  await db.dailyLog.clear();
  await db.practiceLogs.clear();
  await db.settings.clear();
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/trilha/vitalidade"]}>
      <Routes>
        <Route path="/trilha/vitalidade" element={<Vitalidade />} />
      </Routes>
    </MemoryRouter>,
  );
}

/** `n` dias antes de agora, no fuso LOCAL — mesma régua que `hojeISO` usa
 *  dentro da página, pra não descolar da data real de quando o teste roda. */
function diasAtras(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return hojeISO(d);
}

describe("Vitalidade smoke", () => {
  it("mostra o streak atual e o recorde", async () => {
    const hoje = hojeISO(new Date());
    const inicio = diasAtras(15);
    const gasto = diasAtras(3);
    await db.dailyLog.put({ date: inicio, waterMl: 0, activeBreakCount: 0 });
    await db.dailyLog.put({ date: gasto, waterMl: 0, activeBreakCount: 0, gastoAutomatico: true });

    renderPage();

    // corrida inicial de `inicio` até o dia anterior ao gasto = 12 (recorde);
    // do gasto até hoje = 3 (atual). Números diferentes de propósito, pra
    // não bater os dois no mesmo getByText.
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
    });
    void hoje;
  });

  it("marcar o dia zera o atual sem apagar o recorde", async () => {
    const inicio = diasAtras(15);
    const gasto = diasAtras(3);
    await db.dailyLog.put({ date: inicio, waterMl: 0, activeBreakCount: 0 });
    await db.dailyLog.put({ date: gasto, waterMl: 0, activeBreakCount: 0, gastoAutomatico: true });

    renderPage();
    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox", { name: /marcar hoje/i }));

    await waitFor(() => {
      expect(screen.getByText("0")).toBeInTheDocument();
      // recorde continua 12 — o esforço anterior não some junto com a sequência.
      expect(screen.getByText("12")).toBeInTheDocument();
    });
  });

  it("com o banco totalmente vazio, mostra atual 1 e recorde 1 — hoje já é um dia limpo", async () => {
    // Sem nenhum dailyLog, `inicioDoAcompanhamento()` resolve `null`. Se a
    // página não tratasse isso, o streak quebraria com NaN ou undefined na
    // tela — este teste é o que acusaria.
    renderPage();
    await waitFor(() => {
      const uns = screen.getAllByText("1");
      expect(uns.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("desmarcar o dia volta a contar como limpo, e o controle reflete o estado", async () => {
    renderPage();
    const user = userEvent.setup();
    const checkbox = await screen.findByRole("checkbox", { name: /marcar hoje/i });

    await user.click(checkbox); // marca: toque errado ou de verdade, tanto faz
    await waitFor(() => expect(checkbox).toHaveAttribute("aria-checked", "true"));

    await user.click(checkbox); // desmarca: corrige o toque
    await waitFor(() => {
      expect(checkbox).toHaveAttribute("aria-checked", "false");
      // hoje volta a contar como dia limpo — atual e recorde voltam a 1.
      const uns = screen.getAllByText("1");
      expect(uns.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("mostra a fase atual do assoalho pélvico", async () => {
    renderPage();
    // Não usa /fase 1/i sozinho: o painel de firmeza/controle/volume também
    // cita "fase 1" (a fase de objetivo.ts, na frase sobre cintura), então a
    // regex genérica passou a bater em dois elementos. "achar o músculo" é o
    // texto específico da etapa da progressão pélvica, sem essa colisão.
    await waitFor(() => {
      expect(screen.getByText(/fase 1.*achar o m[úu]sculo/i)).toBeInTheDocument();
    });
  });

  // O painel de firmeza/controle/volume já teve o alvo de sono FIXO em
  // "22:30" no código — o mesmo bug que Today.tsx corrigiu antes (ver
  // Today.test.tsx). Este teste trava que a Vitalidade acompanha o horário
  // real do item "dormir", igual a Hoje: se alguém reintroduzir um valor
  // fixo aqui, este teste quebra.
  it("o alvo de sono do painel acompanha o horário ajustado do item Dormir, igual à tela Hoje", async () => {
    await db.settings.put({ key: "routineTimes", value: { dormir: "23:15" } });
    renderPage();
    expect(await screen.findByText(/Sono no alvo \(23:15\)/)).toBeInTheDocument();
    expect(screen.queryByText(/Sono no alvo \(22:30\)/)).not.toBeInTheDocument();
  });

  it("não usa a palavra pornografia no rótulo do atalho nem no título da página", async () => {
    render(
      <MemoryRouter>
        <ShortcutsGrid />
      </MemoryRouter>,
    );
    const atalho = screen.getByRole("link", { name: /vitalidade/i });
    expect(atalho.textContent?.toLowerCase()).not.toContain("pornografia");

    renderPage();
    await waitFor(() => {
      const titulo = screen.getByRole("heading", { level: 1 });
      expect(titulo.textContent?.toLowerCase()).not.toContain("pornografia");
      expect(titulo.textContent).toBe("Vitalidade");
    });
  });
});
