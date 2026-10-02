import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SessionRecorder } from "../../src/components/SessionRecorder";
import { db, type Exercise } from "../../src/lib/db";
import { getSetting, setSetting } from "../../src/lib/settings-helpers";

const ex: Exercise = {
  id: "agachamento-bulgaro", name: "Búlgaro", category: "gluteo",
  equipment: ["halteres"], difficulty: "iniciante", description: "x", commonMistakes: [], exposureLevel: 2,
};
const montar = (repsTarget: string) =>
  render(<SessionRecorder exercise={ex} setsTarget={3} repsTarget={repsTarget} restSec={0} onSave={() => {}} />);

describe("SessionRecorder — lado fraco", () => {
  beforeEach(async () => {
    await db.workoutSessions.clear();
    await db.settings.clear();
  });

  it("sem lado definido pergunta, e o toque grava", async () => {
    montar("12 cada");
    expect(await screen.findByText("Qual lado é o mais fraco?", { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Esquerdo" }));
    await waitFor(async () => expect(await getSetting("ladoFraco")).toBe("esquerdo"));
  });

  it("com lado definido manda começar por ele e não pergunta", async () => {
    await setSetting("ladoFraco", "direito");
    montar("12 cada");
    expect(await screen.findByText(/Comece pelo lado direito/)).toBeInTheDocument();
    expect(screen.getByText(/nem uma a mais/)).toBeInTheDocument();
    expect(screen.queryByText(/Qual lado é o mais fraco/)).toBeNull();
  });

  it("bilateral não mostra nada de lado", async () => {
    const { unmount } = montar("6 trocas cada lado");
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText(/Qual lado/)).toBeNull();
    expect(screen.queryByText(/Comece pelo lado/)).toBeNull();
    unmount();
    montar("10-12");
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText(/Qual lado/)).toBeNull();
  });
});
