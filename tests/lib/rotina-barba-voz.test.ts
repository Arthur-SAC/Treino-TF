import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

const itensDoDia = (dow: number, diaDoAno: number) =>
  buildDayRoutine(dow, diaDoAno).blocks.flatMap((b) => b.items);

describe("barba e voz na rotina diária", () => {
  // Spec 2026-11-19: sexta e sábado à noite são dela, sem voz.
  it("a voz é item de todo dia com bloco do app, à noite", () => {
    for (const dow of [0, 1, 2, 3, 4]) {
      const voz = itensDoDia(dow, 1).find((i) => i.id === "voz");
      expect({ dow, temVoz: Boolean(voz) }).toEqual({ dow, temVoz: true });
      expect(voz!.block).toBe("noite");
    }
  });

  it("a barba aparece em dias alternados, não todo dia", () => {
    const par = itensDoDia(1, 100).some((i) => i.id === "barba");
    const impar = itensDoDia(1, 101).some((i) => i.id === "barba");
    expect(par).not.toBe(impar);
  });

  it("a barba é de manhã e vem antes do skincare", () => {
    const manha = buildDayRoutine(1, 100).blocks.find((b) => b.id === "manha")!;
    const ids = manha.items.map((i) => i.id);
    if (ids.includes("barba")) {
      expect(ids.indexOf("barba")).toBeLessThan(ids.indexOf("skincare-manha"));
    } else {
      // dia sem barba: o teste do dia alternado acima cobre a presença
      expect(buildDayRoutine(1, 101).blocks.find((b) => b.id === "manha")!.items.map((i) => i.id)).toContain("barba");
    }
  });
});

describe("atalhos não duplicam a rotina", () => {
  it("voz e depilação saíram do grid, porque viraram itens diários", async () => {
    const { SHORTCUTS } = await import("../../src/components/ShortcutsGrid");
    const rotas = SHORTCUTS.map((s) => s.to);
    expect(rotas).not.toContain("/beleza/voz");
    expect(rotas).not.toContain("/beleza/depilacao");
  });
});
