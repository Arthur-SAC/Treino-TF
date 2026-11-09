// Revisão final (2026-11-09): "Finalizar" e visibilitychange podiam aplicar os
// desbloqueios ao mesmo tempo e os dois devolviam os mesmos novos (duas placas
// de Parabéns). E uma leitura que falhasse depois de gravar perdia a placa.
import { describe, it, expect, vi, afterEach } from "vitest";
import { db } from "../../src/lib/db";
import { getSetting } from "../../src/lib/settings-helpers";
import { aplicarDesbloqueios, placasDeDesbloqueio } from "../../src/hooks/usePlacas";
import { DESBLOQUEIOS } from "../../src/lib/desbloqueios";

const HOJE = "2026-11-09"; // segunda

afterEach(() => {
  vi.restoreAllMocks();
});

describe("aplicarDesbloqueios", () => {
  it("duas chamadas ao mesmo tempo: só a primeira devolve os novos", async () => {
    const [a, b] = await Promise.all([aplicarDesbloqueios(5, HOJE), aplicarDesbloqueios(5, HOJE)]);
    const ids = [a, b].map((l) => l.map((d) => d.id));
    expect(ids.filter((l) => l.length > 0)).toEqual([["manha-completa", "assoalho-1"]]);
    expect(ids.filter((l) => l.length === 0)).toHaveLength(1);
    expect(await getSetting("desbloqueios")).toEqual({ "manha-completa": HOJE, "assoalho-1": HOJE });
  });
});

describe("placasDeDesbloqueio", () => {
  const assoalho = DESBLOQUEIOS.find((d) => d.id === "assoalho-1")!;

  it("leitura do modo falhou: a placa sai com o horário e os minutos da tabela", async () => {
    const original = db.settings.get.bind(db.settings);
    vi.spyOn(db.settings, "get").mockImplementation(((k: string) =>
      k === "modoCaminhada" ? Promise.reject(new Error("falhou")) : original(k)) as never);
    const placas = await placasDeDesbloqueio([assoalho], HOJE);
    expect(placas).toEqual([{
      tipo: "desbloqueio", titulo: assoalho.titulo, entra: assoalho.entra, praQue: assoalho.praQue,
      minutos: assoalho.minutos, horario: assoalho.horario,
    }]);
  });

  it("contagem das práticas falhou: a placa sai mesmo assim", async () => {
    vi.spyOn(db.practiceLogs, "toArray").mockRejectedValue(new Error("falhou"));
    const manha = DESBLOQUEIOS.find((d) => d.id === "manha-completa")!;
    const placas = await placasDeDesbloqueio([manha, assoalho], HOJE);
    expect(placas.map((p) => p.tipo === "desbloqueio" && [p.titulo, p.minutos, p.horario])).toEqual([
      [manha.titulo, manha.minutos, manha.horario],
      [assoalho.titulo, assoalho.minutos, assoalho.horario],
    ]);
  });
});
