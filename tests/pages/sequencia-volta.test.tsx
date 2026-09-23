import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { SequenceDetail } from "../../src/pages/workout/SequenceDetail";
import { db } from "../../src/lib/db";
import { praticadaHoje } from "../../src/lib/practice-log-helpers";
import { buildDayRoutine } from "../../src/lib/today-routine";

// Auditoria de 2026-09-23: concluir a sequência levava pra lista do Movimento,
// e o item do Hoje continuava sem marca — ela concluía e ainda tinha que voltar
// e marcar a caixinha.
beforeEach(async () => {
  await db.danceSequences.clear();
  await db.practiceLogs.clear();
  await db.danceSequences.put({
    id: "seq-teste", name: "Sequência teste", category: "mobilidade", durationMin: 1,
    moves: [{ name: "Único", durationSec: 10, description: "x" }],
  } as never);
});

describe("concluir sequência", () => {
  it("volta pra tela de onde ela veio (o Hoje) e registra a prática", async () => {
    render(
      <MemoryRouter initialEntries={["/", "/treino/movimento/seq-teste"]} initialIndex={1}>
        <Routes>
          <Route path="/" element={<div>hoje home</div>} />
          <Route path="/treino/movimento" element={<div>lista do movimento</div>} />
          <Route path="/treino/movimento/:id" element={<SequenceDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("button", { name: /marcar como feito/i }));
    await waitFor(() => expect(screen.getByText("hoje home")).toBeInTheDocument());
    expect(await db.practiceLogs.count()).toBe(1);
  });

  it("aberta direto (sem histórico), cai na lista do Movimento", async () => {
    render(
      <MemoryRouter initialEntries={["/treino/movimento/seq-teste"]}>
        <Routes>
          <Route path="/treino/movimento" element={<div>lista do movimento</div>} />
          <Route path="/treino/movimento/:id" element={<SequenceDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("button", { name: /marcar como feito/i }));
    await waitFor(() => expect(screen.getByText("lista do movimento")).toBeInTheDocument());
  });
});

describe("o Hoje sabe o que foi praticado", () => {
  it("praticadaHoje olha a sequência do dia, na data de hoje", () => {
    const logs = [
      { date: "2026-09-24", sequenceId: "a", completed: true },
      { date: "2026-09-23", sequenceId: "b", completed: true },
    ];
    expect(praticadaHoje(logs, "a", "2026-09-24")).toBe(true);
    expect(praticadaHoje(logs, "b", "2026-09-24")).toBe(false);
  });

  it("o sábado serve o rebolado com progressão", () => {
    const danca = buildDayRoutine(6, 1).blocks.flatMap((b) => b.items).find((i) => i.id === "danca-sabado")!;
    expect(danca.linkKey).toBe("rebolado");
  });
});
