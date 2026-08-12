import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";

// A noiva recusou strap-on ("não acha legal um treco"). Repropor é o app não
// escutar. A rede vale para TODAS as sequências, não só as de intimidade: a
// tentação de sugerir aparece em qualquer conteúdo sobre penetração.
const todas = SEQUENCES.map(
  (s) => `${s.name} ${s.focus} ${s.moves.map((m) => `${m.name} ${m.description}`).join(" ")}`,
).join("\n");

describe("nenhuma sequência propõe strap-on", () => {
  it("o termo não aparece em nenhuma forma", () => {
    expect(todas).not.toMatch(/strap-?on|cinta[- ]?p[êe]nis|pr[óo]tese peniana|consolo de cinta/i);
  });

  // A via que ela aceita é mão e dedos — carne dos dois lados. Sem esta metade,
  // a rede acima passaria por ausência de conteúdo: não achar strap-on é fácil
  // quando não há nada escrito sobre penetração.
  it("e a via que a noiva aceita está escrita", () => {
    expect(todas).toMatch(/dedos?/i);
  });
});
