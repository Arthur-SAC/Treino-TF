import { describe, it, expect } from "vitest";

const fontes = import.meta.glob("../../src/**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

// Tela de 320 px com gutter de 16: nada de largura fixa maior que 288 px
// sem max-w-full, senão aparece rolagem horizontal.
describe("larguras fixas", () => {
  it("nenhuma string tem w-[NNNpx] > 288 sem max-w-full", () => {
    expect(Object.keys(fontes).length).toBeGreaterThan(50);
    const achados: string[] = [];
    for (const [f, src] of Object.entries(fontes)) {
      for (const m of src.matchAll(/"([^"\n]*)"|`([^`]*)`|'([^'\n]*)'/g)) {
        const cls = m[1] ?? m[2] ?? m[3] ?? "";
        for (const w of cls.matchAll(/(?<![\w:-])(?:min-)?w-\[(\d{3,})px\]/g)) {
          if (Number(w[1]) > 288 && !cls.includes("max-w-full")) achados.push(`${f}: ${w[0]}`);
        }
      }
    }
    expect(achados).toEqual([]);
  });
});
