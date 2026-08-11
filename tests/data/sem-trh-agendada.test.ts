import { describe, it, expect } from "vitest";

// Varre o código-fonte como TEXTO — pega comentário, copy de seed e JSX igual.
// A regra vale para o repositório inteiro, não para um arquivo específico.
const FONTES = import.meta.glob("../../src/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const PROIBIDOS: { re: RegExp; porque: string }[] = [
  { re: /in[íi]cio da TRH/i, porque: "a TRH não tem data — não existe 'início' a que se referir" },
  { re: /alinhar com [^.]{0,25}TRH/i, porque: "nenhuma fase existe para alinhar com a TRH" },
  { re: /enquanto a TRH n[ãa]o/i, porque: "linguagem de sala de espera" },
  { re: /quando a TRH (come[çc]ar|entrar)/i, porque: "trata a TRH como evento futuro certo" },
  { re: /a TRH vai /i, porque: "promessa sobre o que a TRH fará" },
  {
    // A raiz de "passar" é "pass-" (remove o -ar): passei/passou/passaram,
    // passava/passavam, passando, passasse... nenhuma dessas formas contém
    // "passar" nem "passa" sozinho como prefixo fechado. \w* depois de "pass"
    // cobre a conjugação inteira, então "passa despercebido" (3ª pessoa) não
    // escapa mais da rede como escapava quando o padrão exigia o infinitivo.
    re: /pass\w* despercebid/i,
    porque: "estilo público é escolha declarada, não camuflagem forçada — em qualquer conjugação",
  },
];

describe("nenhum lugar do app trata a TRH como etapa agendada", () => {
  for (const { re, porque } of PROIBIDOS) {
    it(`não usa /${re.source}/ — ${porque}`, () => {
      const culpados = Object.entries(FONTES)
        .filter(([, texto]) => re.test(texto))
        .map(([caminho]) => caminho.replace("../../", ""));
      expect(culpados).toEqual([]);
    });
  }
});

describe("a varredura realmente lê os arquivos", () => {
  it("carregou um número plausível de fontes", () => {
    // src/ tem ~170 arquivos .ts/.tsx neste projeto (conferido via find na raiz).
    // 150 dá margem para variação normal do projeto sem deixar passar um glob
    // que retornou objeto vazio por falha silenciosa (o pior resultado possível
    // aqui: um teste verde que não testou nada).
    expect(Object.keys(FONTES).length).toBeGreaterThan(150);
  });
});
