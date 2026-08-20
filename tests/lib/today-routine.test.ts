// tests/lib/today-routine.test.ts
import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

// Dia do ano ímpar (1) em todas as chamadas: mantém o dia sem barba, já que
// estes testes não tratam da alternância (isso vive em rotina-barba-voz.test.ts).
describe("buildDayRoutine", () => {
  it("dia de semana tem os 5 blocos na ordem manhã→semana", () => {
    const r = buildDayRoutine(3, 1); // quarta
    expect(r.blocks.map((b) => b.id)).toEqual(["manha", "trabalho", "tarde", "noite", "semana"]);
  });

  it("dia de semana inclui os itens-âncora da rotina", () => {
    const ids = buildDayRoutine(3, 1, ["07:00", "10:00"]).blocks.flatMap((b) => b.items.map((i) => i.id));
    expect(ids).toEqual(
      expect.arrayContaining([
        "alongamento-manha", "skincare-manha", "sol-manha",
        "agua", "micro-pausa-0700",
        "lanche-saida", "caes", "treino",
        "skincare-noite", "alongamento-noite", "seu-tempo", "diario",
      ]),
    );
  });

  it("itens com estado externo usam control:link e linkKey", () => {
    const items = buildDayRoutine(3, 1).blocks.flatMap((b) => b.items);
    const treino = items.find((i) => i.id === "treino")!;
    expect(treino.control).toBe("link");
    expect(treino.linkKey).toBe("workout");
  });

  it("sábado troca a tarde por dança + caminhada", () => {
    const ids = buildDayRoutine(6, 1).blocks.flatMap((b) => b.items.map((i) => i.id));
    expect(ids).toContain("danca-sabado");
    expect(ids).not.toContain("treino");
  });

  it("domingo destaca a marmita da semana e não tem treino", () => {
    const ids = buildDayRoutine(0, 1).blocks.flatMap((b) => b.items.map((i) => i.id));
    expect(ids).toContain("marmita-domingo");
    expect(ids).not.toContain("treino");
  });

  it("água usa control:water e o passeio dos cães soma movimento (control:walk)", () => {
    const items = buildDayRoutine(2, 1).blocks.flatMap((b) => b.items);
    expect(items.find((i) => i.id === "agua")!.control).toBe("water");
    // Era "invert", que na tela virava um chip "⇄ trocar" sem ação nenhuma.
    expect(items.find((i) => i.id === "caes")!.control).toBe("walk");
  });
});
