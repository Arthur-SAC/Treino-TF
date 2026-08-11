import { describe, it, expect } from "vitest";
import { MEDIDAS_PARTIDA } from "../../src/lib/objetivo";

// Os valores da medição de 13/05 estavam redigitados em três lugares (o módulo,
// o seed e o preset do onboarding) — e o módulo criado justamente para acabar
// com a dispersão não era lido por nenhum código de produção. Este teste trava
// a fonte única pelo lado que dói: fora de objetivo.ts, nenhum arquivo de
// produção pode conter os literais decimais da medição.
//
// Só os decimais entram na lista de propósito. Inteiros como 99 e 114 aparecem
// legitimamente em prosa ("o quadril volta aos 114 cm") e em contextos sem
// relação nenhuma; "120.5" com ponto é notação de código, não de texto pt-BR.
const FONTES = import.meta.glob("../../src/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const LITERAIS = ["120.5", "106.5", "82.5"];

describe("as medidas de partida vivem só em objetivo.ts", () => {
  it("a varredura realmente leu os arquivos", () => {
    expect(Object.keys(FONTES).length).toBeGreaterThan(150);
  });

  for (const literal of LITERAIS) {
    it(`nenhum outro arquivo de produção redigita ${literal}`, () => {
      const culpados = Object.entries(FONTES)
        .filter(([caminho]) => !caminho.endsWith("src/lib/objetivo.ts"))
        .filter(([, texto]) => texto.includes(literal))
        .map(([caminho]) => caminho.replace("../../", ""));
      expect(culpados).toEqual([]);
    });
  }
});

describe("o preset do Onboarding cobre a medição inteira", () => {
  const FONTE = Object.entries(FONTES).find(([c]) => c.endsWith("src/pages/body/Onboarding.tsx"))![1];

  it("pré-preenche o peso, que é a mesma medição do resto do formulário", () => {
    // O peso ficava de fora e ela digitava um número que o app já tinha. Ele é
    // derivado do módulo como os demais — se mudou, ela edita, igual aos outros.
    expect(FONTE).toContain("weightKg: MEDIDAS_PARTIDA.pesoKg");
    expect(MEDIDAS_PARTIDA.pesoKg).toBeGreaterThan(0);
  });
});
