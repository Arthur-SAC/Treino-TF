import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";
import { SHORTCUTS } from "../../src/components/ShortcutsGrid";

// Textos que a auditoria de 2026-09-23 achou dizendo o que já não é verdade.
const fonte = (arquivo: string) =>
  Object.entries(
    import.meta.glob("../../src/**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>,
  ).find(([c]) => c.endsWith(arquivo))![1];

describe("textos que não mentem", () => {
  it("a vitamina D não promete resolver o cansaço — ela não fez exame", () => {
    const vitD = buildDayRoutine(0, 1).blocks.flatMap((b) => b.items).find((i) => i.id === "vitamina-d")!;
    expect(vitD.subtitle).not.toMatch(/resolve/i);
  });

  it("o sol da manhã também não promete atacar o cansaço", () => {
    const sol = buildDayRoutine(0, 1).blocks.flatMap((b) => b.items).find((i) => i.id === "sol-manha")!;
    expect(sol.subtitle).not.toMatch(/ataca|cansaço/i);
  });

  it("a Vitalidade não diz mais que o assoalho cai às 10h no trabalho — ele é às 21h20", () => {
    const v = fonte("src/pages/path/Vitalidade.tsx");
    expect(v).not.toMatch(/meio do expediente/);
  });

  it("Fertilidade & TRH não usa fase do treino como momento — e registra a decisão de 23/09", () => {
    const f = fonte("src/pages/path/FertilityTRH.tsx");
    expect(f).not.toMatch(/fase de Manutenção/);
    expect(f).toMatch(/BBL/);
  });

  it("Configurações chama o alvo de WHR pelo que ele é hoje: o alvo da Silhueta", () => {
    expect(fonte("src/pages/Settings.tsx")).toMatch(/Alvo da Silhueta/);
  });

  it("o atalho de Estilo não promete 'discreto' — abre as peças", () => {
    const estilo = SHORTCUTS.find((s) => s.label === "Estilo")!;
    expect(estilo.sub).not.toMatch(/discreto/i);
  });
});
