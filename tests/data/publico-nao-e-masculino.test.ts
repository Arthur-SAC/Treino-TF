import { describe, it, expect } from "vitest";

// Varre o código-fonte como TEXTO, no mesmo formato de sem-trh-agendada.test.ts
// — pega comentário, copy de seed e JSX igual, e não depende de API de Node
// (que o tsconfig do build não conhece).
const FONTES = import.meta.glob("../../src/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// ATENÇÃO ao formato desta rede. Cinco vezes neste projeto um teste proibiu uma
// PALAVRA e com isso proibiu também NEGÁ-LA — e quase apagou justamente o texto
// que existia pra proteger. Aqui a palavra "masculino" precisa continuar podendo
// aparecer: "cintura baixa empurra silhueta pra estilo masculino" e "pesado
// constrói um peito que lê como masculino" são avisos corretos.
//
// Então a rede tem duas metades:
//   1. proíbe a AFIRMAÇÃO (descrever o modo público como masculino);
//   2. exige que os avisos que usam a palavra pra NEGAR continuem existindo.
const fontes = Object.entries(FONTES).map(([f, texto]) => ({ f, texto }));

describe("o modo público é andrógino com teto de segurança, não masculino", () => {
  // A afirmação proibida, em suas formas concretas. Ela corrigiu em 2026-08-11:
  // "eu queria público meio andrógino mas com uma pegada segura pro ambiente
  // que vivo". Andrógino não é ponto fixo — é faixa, e a escada é o calibrador.
  const AFIRMACOES = [
    /masculin\w*\s+em\s+p[úu]blico/i,
    /p[úu]blico\s*[:·—-]?\s*masculin/i,
    /modo\s+p[úu]blico[^.]{0,40}masculin/i,
  ];

  it("nenhum texto do app descreve o modo público como masculino", () => {
    const achados = fontes.flatMap(({ f, texto }) =>
      AFIRMACOES.filter((re) => re.test(texto)).map((re) => `${f} :: ${re}`),
    );
    expect(achados).toEqual([]);
  });

  it("a escada de níveis nomeia o público como andrógino", () => {
    const escada = fontes.find(({ f }) => f.includes("estilo-discreto-seed"))!.texto;
    expect(escada).toMatch(/andr[óo]gin/i);
  });

  // A outra metade: os avisos legítimos que usam a palavra pra negar continuam
  // de pé. Se um dia alguém "limpar" a palavra do código, isto quebra.
  it("os avisos que usam 'masculino' pra NEGAR continuam existindo", () => {
    const todos = fontes.map(({ texto }) => texto).join("\n");
    expect(todos).toMatch(/empurra silhueta pra estilo masculino|empurra a silhueta pro masculino/i);
    expect(todos).toMatch(/l[êe] como masculino|peit[ãa]o masculino/i);
  });
});
