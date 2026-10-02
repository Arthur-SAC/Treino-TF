import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SessionRecorder } from "../../src/components/SessionRecorder";
import { db, type Exercise } from "../../src/lib/db";
import { getSetting, setSetting } from "../../src/lib/settings-helpers";

const ht: Exercise = {
  id: "hip-thrust-barra", name: "Hip thrust", category: "gluteo",
  equipment: ["barra"], difficulty: "iniciante", description: "x", commonMistakes: [], exposureLevel: 2,
};

async function semearHistorico(id = "hip-thrust-barra") {
  await db.workoutSessions.add({
    date: "2026-09-21", templateId: "", difficultySelf: "easy",
    feedback: "easy",
    exercises: [{ exerciseId: id, sets: [{ reps: 12, weight: 40 }, { reps: 12, weight: 40 }, { reps: 12, weight: 40 }] }],
  } as never);
}

const montar = (exercise: Exercise = ht) =>
  render(<SessionRecorder exercise={exercise} setsTarget={3} repsTarget="10-12" restSec={0} onSave={() => {}} />);

describe("SessionRecorder — teto do prédio", () => {
  beforeEach(async () => {
    await db.workoutSessions.clear();
    await db.workoutTemplates.clear();
    await db.settings.clear();
  });

  it("'Não tem mais peso aqui' grava o teto com a carga anterior", async () => {
    await semearHistorico();
    montar();
    fireEvent.click(await screen.findByText("Não tem mais peso aqui"));
    await waitFor(async () => expect((await getSetting("tetoPredio"))["hip-thrust-barra"]).toBe(40));
  });

  it("com teto gravado mostra o teto e as táticas, sem a sugestão", async () => {
    await semearHistorico();
    await setSetting("tetoPredio", { "hip-thrust-barra": 40 });
    montar();
    expect(await screen.findByText("No teto do prédio (40 kg)")).toBeInTheDocument();
    expect(screen.getByText(/2 s/)).toBeInTheDocument();
    expect(screen.queryByText(/Sugestão: 42 kg/)).toBeNull();
  });

  it("'o aparelho tem mais peso' remove o teto e a sugestão volta", async () => {
    await semearHistorico();
    await setSetting("tetoPredio", { "hip-thrust-barra": 40 });
    montar();
    fireEvent.click(await screen.findByText("o aparelho tem mais peso"));
    expect(await screen.findByText(/Sugestão: 42 kg/)).toBeInTheDocument();
    expect((await getSetting("tetoPredio"))["hip-thrust-barra"]).toBeUndefined();
  });

  it("sem histórico não oferece o botão", async () => {
    montar();
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText("Não tem mais peso aqui")).toBeNull();
  });

  it("peso corporal com histórico não oferece o botão", async () => {
    await semearHistorico("prancha-x");
    montar({ ...ht, id: "prancha-x", equipment: ["peso-corporal"] });
    await screen.findByText(/Última vez/);
    expect(screen.queryByText("Não tem mais peso aqui")).toBeNull();
  });

  it("teto velho (carga anterior acima dele) é apagado e a sugestão volta", async () => {
    await semearHistorico(); // 40 kg
    await setSetting("tetoPredio", { "hip-thrust-barra": 30, "leg-press-pes-medios": 100 });
    montar();
    expect(await screen.findByText(/Sugestão: 42 kg/)).toBeInTheDocument();
    await waitFor(async () => {
      const t = await getSetting("tetoPredio");
      expect(t["hip-thrust-barra"]).toBeUndefined();
      expect(t["leg-press-pes-medios"]).toBe(100);
    });
  });

  it("marcar o teto relê o setting: não apaga o que outro exercício gravou no meio", async () => {
    await semearHistorico();
    montar();
    const botao = await screen.findByText("Não tem mais peso aqui");
    await setSetting("tetoPredio", { "leg-press-pes-medios": 100 });
    fireEvent.click(botao);
    await waitFor(async () => expect((await getSetting("tetoPredio"))["hip-thrust-barra"]).toBe(40));
    expect((await getSetting("tetoPredio"))["leg-press-pes-medios"]).toBe(100);
  });
});
