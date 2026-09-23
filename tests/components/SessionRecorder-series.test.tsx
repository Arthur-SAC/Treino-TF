import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SessionRecorder } from "../../src/components/SessionRecorder";
import type { Exercise } from "../../src/lib/db";

// Auditoria de 2026-09-23: o botão salvava toda série com reps preenchidas —
// e elas vêm pré-preenchidas da última vez. Série não feita entrava no
// histórico e empurrava a sugestão de carga.
const ex: Exercise = {
  id: "supino-inclinado-halteres", name: "Supino inclinado", category: "peitoral",
  equipment: ["halteres"], difficulty: "iniciante", description: "x", commonMistakes: [], exposureLevel: 2,
};

const preencher = () => {
  const reps = screen.getAllByPlaceholderText("reps");
  const kg = screen.getAllByPlaceholderText("kg");
  reps.forEach((r) => fireEvent.change(r, { target: { value: "12" } }));
  kg.forEach((k) => fireEvent.change(k, { target: { value: "8" } }));
};

describe("SessionRecorder — séries salvas", () => {
  it("salva só as séries marcadas como feitas", () => {
    const onSave = vi.fn();
    render(<SessionRecorder exercise={ex} setsTarget={3} repsTarget="10-12" restSec={0} onSave={onSave} />);
    preencher();
    const checks = screen.getAllByRole("button", { name: "Marcar feita" });
    fireEvent.click(checks[0]);
    fireEvent.click(checks[1]);
    fireEvent.click(screen.getByRole("button", { name: /salvar exercício/i }));
    expect(onSave.mock.calls[0][0].sets).toHaveLength(2);
  });

  it("sem nenhuma marcada, salva as preenchidas — não perde o treino de quem não usa o check", () => {
    const onSave = vi.fn();
    render(<SessionRecorder exercise={ex} setsTarget={3} repsTarget="10-12" restSec={0} onSave={onSave} />);
    preencher();
    fireEvent.click(screen.getByRole("button", { name: /salvar exercício/i }));
    expect(onSave.mock.calls[0][0].sets).toHaveLength(3);
  });

  it("peito não mostra mais 'manter leve'; postura mostra que é controle", () => {
    const { unmount } = render(<SessionRecorder exercise={ex} setsTarget={3} repsTarget="10-12" restSec={0} onSave={() => {}} />);
    expect(screen.queryByText(/manter leve/i)).toBeNull();
    unmount();
    render(<SessionRecorder exercise={{ ...ex, id: "face-pull-polia", category: "postura" }} setsTarget={3} repsTarget="15" restSec={0} onSave={() => {}} />);
    expect(screen.getByText(/postura/i)).toBeInTheDocument();
  });

  it("carregamento em metros vira 'Marcar feito', com a distância", () => {
    render(<SessionRecorder exercise={{ ...ex, id: "farmer-walk", category: "cintura" }} setsTarget={3} repsTarget="30m" restSec={60} onSave={() => {}} />);
    expect(screen.getByRole("button", { name: /marcar feito/i })).toBeInTheDocument();
    expect(screen.getByText(/por distância/i)).toBeInTheDocument();
  });
});
