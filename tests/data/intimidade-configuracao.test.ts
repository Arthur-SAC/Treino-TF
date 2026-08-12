import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";

const intimas = SEQUENCES.filter((s) => s.category === "intimidade");
const textoDe = (s: (typeof SEQUENCES)[number]) =>
  `${s.name} ${s.focus} ${s.moves.map((m) => `${m.name} ${m.description}`).join(" ")}`;

describe("o conteúdo íntimo assume a configuração real dela", () => {
  it("existem sequências de intimidade", () => {
    expect(intimas.length).toBeGreaterThanOrEqual(5);
  });

  // Ela fica SEMPRE por cima; a noiva por cima "não rola por enquanto".
  // Metade das dicas antigas pressupunha revezamento.
  it("nenhuma sequência pressupõe a noiva por cima ou revezamento de posição", () => {
    const PRESSUPOSTOS = [
      /ela (por )?em cima de você/i,
      /quando (for )?a vez dela (de )?(ficar )?por cima/i,
      /revez(am|ar|e)/i,
      /troca(m|r) de posição/i,
    ];
    const achados = intimas.flatMap((s) =>
      PRESSUPOSTOS.filter((re) => re.test(textoDe(s))).map((re) => `${s.id} :: ${re}`),
    );
    expect(achados).toEqual([]);
  });

  const grinding = () => SEQUENCES.find((s) => s.id === "intimidade-grinding")!;

  it("o grinding diz que o movimento é frente-e-trás, não estocada", () => {
    const t = textoDe(grinding());
    expect(t).toMatch(/frente[- ]e[- ]tr[áa]s|frente e tr[áa]s/i);
    expect(t).toMatch(/estocada/i); // citada para ser negada — ver teste abaixo
  });

  // A regra que decide o resultado. O erro quase universal é acelerar quando a
  // outra pessoa responde.
  it("o grinding manda congelar as variáveis quando a respiração dela mudar", () => {
    const t = textoDe(grinding());
    expect(t).toMatch(/congel/i);
    expect(t).toMatch(/respira[çc][ãa]o/i);
    expect(t).toMatch(/mesma velocidade|mesmo ritmo/i);
  });

  it("o grinding orienta o pinto para cima, preso contra a barriga, e diz que não é tuck", () => {
    const t = textoDe(grinding());
    expect(t).toMatch(/pra cima|para cima/i);
    expect(t).toMatch(/barriga/i);
    expect(t).toMatch(/não é tuck|nao e tuck/i);
  });

  it("o grinding dá o tempo real — 15 a 25 min contínuos", () => {
    const t = textoDe(grinding());
    expect(t).toMatch(/15\s*(a|-|–)\s*25/);
  });

  it("o grinding nomeia as mãos dela na bunda como canal de comando", () => {
    expect(textoDe(grinding())).toMatch(/m[ãa]os dela/i);
  });

  // "Estocada" e "tuck" aparecem NEGADAS. Se um dia alguém proibir as palavras
  // em vez das afirmações, este teste é o que acusa a perda.
  it("onde 'estocada' e 'tuck' aparecem, elas estão sendo negadas", () => {
    const t = textoDe(grinding());
    for (const frase of t.split(/[.;]/).filter((f) => /estocada|tuck/i.test(f))) {
      expect({ frase: frase.trim(), nega: /não|nao|nunca|em vez de|serve para outra/i.test(frase) })
        .toEqual({ frase: frase.trim(), nega: true });
    }
  });
});
