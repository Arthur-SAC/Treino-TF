import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionRecorder } from "../../src/components/SessionRecorder";
import type { Exercise } from "../../src/lib/db";
import { ENTRADA_TEMPLATES } from "../../src/data/entrada-seed";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES } from "../../src/data/cycles-seed";

// Os templates carregam 75 `notes` com a orientação específica DAQUELA sessão:
// a amplitude curta do stiff pra não machucar a lombar, os pés altos no leg
// press, a graduação do hip thrust em duas etapas na semana 3, a dose de
// cardio por fase. Nada disso era renderizado — `SessionRecorder` não recebia
// o campo. A usuária lia só a descrição genérica do exercício.

const base: Exercise = {
  id: "stiff",
  name: "Stiff",
  category: "gluteo",
  equipment: ["halteres"],
  difficulty: "intermediario",
  description: "Dobradiça de quadril.",
  commonMistakes: [],
  exposureLevel: 3,
  successCue: "Fez certo se sentir o posterior da coxa.",
};

const NOTA = "AMPLITUDE CURTA por enquanto: desce só até onde o posterior deixa";

describe("SessionRecorder — a orientação da sessão aparece", () => {
  it("mostra a nota do template no exercício com carga", () => {
    render(<SessionRecorder exercise={base} setsTarget={3} repsTarget="12" restSec={60} notes={NOTA} onSave={() => {}} />);
    expect(screen.getByText(new RegExp(NOTA.slice(0, 30), "i"))).toBeInTheDocument();
  });

  it("mostra a nota também no exercício por tempo", () => {
    render(
      <SessionRecorder
        exercise={{ ...base, id: "cardio-zona2", name: "Cardio zona 2" }}
        setsTarget={1}
        repsTarget="20min"
        restSec={0}
        notes={NOTA}
        onSave={() => {}}
      />,
    );
    expect(screen.getByText(new RegExp(NOTA.slice(0, 30), "i"))).toBeInTheDocument();
  });

  it("sem nota, não renderiza nada a mais nem quebra", () => {
    render(<SessionRecorder exercise={base} setsTarget={3} repsTarget="12" restSec={60} onSave={() => {}} />);
    expect(screen.getByText("Stiff")).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(NOTA.slice(0, 30), "i"))).not.toBeInTheDocument();
  });

  it("a nota é distinta do successCue — são informações diferentes", () => {
    render(<SessionRecorder exercise={base} setsTarget={3} repsTarget="12" restSec={60} notes={NOTA} onSave={() => {}} />);
    expect(screen.getByText(/Fez certo se sentir o posterior/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(NOTA.slice(0, 30), "i"))).toBeInTheDocument();
  });
});

describe("as notas dos templates existem pra ser mostradas", () => {
  it("há orientação de sessão em quantidade relevante nos três seeds", () => {
    const comNota = [...ENTRADA_TEMPLATES, ...WORKOUT_PLAN, ...CYCLE_TEMPLATES].flatMap((t) =>
      t.exercises.filter((e) => e.notes),
    );
    expect(comNota.length).toBeGreaterThan(50);
  });

  it("a graduação do hip thrust da semana 3 está numa nota — o item mais importante da fase", () => {
    const e3seg = ENTRADA_TEMPLATES.find((t) => t.id === "e3-seg")!;
    const hip = e3seg.exercises.find((e) => e.exerciseId === "hip-thrust-barra")!;
    expect(hip.notes).toBeDefined();
    expect(hip.notes!).toMatch(/ETAPA 1|peso do corpo/i);
  });
});
