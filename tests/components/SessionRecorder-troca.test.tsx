import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SessionRecorder } from "../../src/components/SessionRecorder";
import { db, type Exercise } from "../../src/lib/db";

const ex: Exercise = {
  id: "abdutor-maquina", name: "Abdutora", category: "gluteo",
  equipment: ["maquina"], difficulty: "iniciante", description: "x", commonMistakes: [], exposureLevel: 2,
};
const base = { exercise: ex, setsTarget: 1, repsTarget: "15", restSec: 0 };

describe("SessionRecorder — Ocupado e Não tem aqui", () => {
  beforeEach(async () => {
    await db.workoutSessions.clear();
    await db.settings.clear();
  });

  it("mostra Ocupado e Não tem aqui quando recebe as props", () => {
    render(<SessionRecorder {...base} onSave={() => {}} onOcupado={() => {}} onNaoTemAqui={() => {}} />);
    expect(screen.getByRole("button", { name: "Ocupado" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Não tem aqui" })).toBeInTheDocument();
  });

  it("sem props, nenhum botão", () => {
    render(<SessionRecorder {...base} onSave={() => {}} />);
    expect(screen.queryByRole("button", { name: "Ocupado" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Não tem aqui" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Voltar pro/ })).toBeNull();
  });

  it("os botões chamam as props", () => {
    let o = 0, n = 0;
    render(<SessionRecorder {...base} onSave={() => {}} onOcupado={() => o++} onNaoTemAqui={() => n++} />);
    fireEvent.click(screen.getByRole("button", { name: "Ocupado" }));
    fireEvent.click(screen.getByRole("button", { name: "Não tem aqui" }));
    expect([o, n]).toEqual([1, 1]);
  });

  it("some depois de salvar uma série", async () => {
    render(<SessionRecorder {...base} onSave={() => {}} onOcupado={() => {}} onNaoTemAqui={() => {}} />);
    expect(screen.getByRole("button", { name: "Ocupado" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Não tem aqui" })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("reps"), { target: { value: "15" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar exercício" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Ocupado" })).toBeNull());
    expect(screen.queryByRole("button", { name: "Não tem aqui" })).toBeNull();
  });

  it("com 1 série ✓, Ocupado/Não tem aqui/Voltar não aparecem", () => {
    render(<SessionRecorder {...base} onSave={() => {}} onOcupado={() => {}} onNaoTemAqui={() => {}} onVoltarAoOriginal={() => {}} nomeOriginal="Abdutora" />);
    expect(screen.getByRole("button", { name: "Ocupado" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voltar pro Abdutora" })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("reps"), { target: { value: "15" } });
    fireEvent.click(screen.getByRole("button", { name: "Marcar feita" }));
    expect(screen.queryByRole("button", { name: "Ocupado" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Não tem aqui" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Voltar pro/ })).toBeNull();
  });

  it("mostra Voltar pro {nome} quando recebe a prop", () => {
    let v = 0;
    render(<SessionRecorder {...base} onSave={() => {}} onVoltarAoOriginal={() => v++} nomeOriginal="Abdutora" />);
    fireEvent.click(screen.getByRole("button", { name: "Voltar pro Abdutora" }));
    expect(v).toBe(1);
  });

  it("exercício por tempo também mostra os botões", () => {
    render(<SessionRecorder {...base} repsTarget="20 min" onSave={() => {}} onOcupado={() => {}} />);
    expect(screen.getByRole("button", { name: "Ocupado" })).toBeInTheDocument();
  });
});
