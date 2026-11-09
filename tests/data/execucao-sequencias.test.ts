import { describe, it, expect } from "vitest";
import { SEQUENCES } from "../../src/data/sequences-seed";
import { EXECUCAO_DAS_SEQUENCIAS } from "../../src/data/execucao-sequencias";
import { SEQUENCIAS_FLEX } from "../../src/lib/flex-progression";
import { PELVIC_ORDEM } from "../../src/lib/pelvic-progression";
import { problemasDaExecucao, type Execucao } from "../../src/lib/execucao";

// Ela disse do alongamento da manhã: "tive que pesquisar tudo pra entender".
// O mesmo valia pro da noite e pro assoalho. Todo move de toda sequência que o
// Hoje e a Vitalidade servem tem o formato fixo, validado. A lista vem do
// código (as trilhas de flex-progression e a ordem de pelvic-progression),
// nunca copiada à mão: sequência nova na trilha entra na cobrança sozinha.
const FLEX = [...SEQUENCIAS_FLEX.manha, ...SEQUENCIAS_FLEX.noite];
const COBERTAS = [...FLEX, ...PELVIC_ORDEM];

const porId = new Map(SEQUENCES.map((s) => [s.id, s]));

const textos = (x: Execucao) => [x.posicao, ...x.movimento, x.ondeSentir, ...x.erradoSe, ...x.renderMais];

describe("execução dos alongamentos e do assoalho", () => {
  it("toda sequência coberta existe no seed", () => {
    expect(COBERTAS.filter((id) => !porId.has(id))).toEqual([]);
  });

  it("todo move de toda sequência coberta tem execução (inclusive os de nivelar a pelve)", () => {
    const faltando = COBERTAS.flatMap((id) =>
      (porId.get(id)?.moves ?? []).filter((m) => !m.execucao).map((m) => `${id}: ${m.name}`),
    );
    expect(faltando).toEqual([]);
  });

  it("toda execução passa no validador do formato", () => {
    const ruins = COBERTAS.flatMap((id) =>
      (porId.get(id)?.moves ?? []).flatMap((m) =>
        m.execucao ? problemasDaExecucao(m.execucao).map((p) => `${id} · ${m.name}: ${p}`) : [],
      ),
    );
    expect(ruins).toEqual([]);
  });

  // A explicação casa com o move pelo NOME: dois moves com o mesmo nome na
  // mesma sequência receberiam a mesma explicação sem ninguém perceber.
  it("nome de move é único dentro de cada sequência coberta", () => {
    const repetidos = COBERTAS.flatMap((id) => {
      const nomes = (porId.get(id)?.moves ?? []).map((m) => m.name);
      return nomes.filter((n, i) => nomes.indexOf(n) !== i).map((n) => `${id}: ${n}`);
    });
    expect(repetidos).toEqual([]);
  });

  // A tela mostra a execução NO LUGAR da descrição. "Para antes da dor" morava
  // na descrição dos alongamentos e sumia junto — todo alongamento tem que
  // dizer o que fazer quando dói. Respiração, vacuum e aquecimento não alongam.
  it("todo alongamento diz o que fazer quando dói", () => {
    const NAO_ALONGA = /^respira|vacuum|aquecimento/i;
    const semDor = FLEX.flatMap((id) =>
      (porId.get(id)?.moves ?? [])
        .filter((m) => !NAO_ALONGA.test(m.name))
        .filter((m) => ![...(m.execucao?.movimento ?? []), ...(m.execucao?.erradoSe ?? [])].some((t) => /\bd[óo]i\b|\bdor\b|\bdoer\b/i.test(t)))
        .map((m) => `${id}: ${m.name}`),
    );
    expect(semDor).toEqual([]);
  });

  // Uma chave com erro de digitação não pendura a explicação em lugar nenhum —
  // e o move fica mudo sem ninguém perceber.
  it("toda explicação escrita cai num move que existe", () => {
    const orfas = Object.entries(EXECUCAO_DAS_SEQUENCIAS).flatMap(([id, moves]) =>
      Object.keys(moves)
        .filter((nome) => !porId.get(id)?.moves.some((m) => m.name === nome))
        .map((nome) => `${id}: ${nome}`),
    );
    expect(orfas).toEqual([]);
  });

  // Alongamento rende por respiração, tempo e relaxamento. Forçar alcance
  // dispara o reflexo de proteção e o músculo fecha.
  it("'Pra render mais' do alongamento nunca pede forçar alcance", () => {
    const FORCA_ALCANCE = /mais fundo|mais longe|mais baixo|empurr\w* mais|for[çc]\w* mais|at[ée] doer|al[ée]m da dor|com mais for[çc]a/i;
    const ruins = FLEX.flatMap((id) =>
      (porId.get(id)?.moves ?? []).flatMap((m) =>
        (m.execucao?.renderMais ?? []).filter((r) => FORCA_ALCANCE.test(r)).map((r) => `${id} · ${m.name}: ${r}`),
      ),
    );
    expect(ruins).toEqual([]);
  });

  it("nenhuma explicação propõe strap-on", () => {
    const todas = SEQUENCES.flatMap((s) => s.moves.flatMap((m) => (m.execucao ? textos(m.execucao) : []))).join("\n");
    expect(todas).not.toMatch(/strap-?on|cinta[- ]?p[êe]nis|pr[óo]tese peniana|consolo de cinta/i);
  });

  // Decisão de 2026-08-11: técnico e direto — corpo, pressão, ritmo — sem
  // narrar cena. A parceira não entra no texto do assoalho.
  it("o assoalho não narra cena", () => {
    const ruins = PELVIC_ORDEM.flatMap((id) =>
      (porId.get(id)?.moves ?? []).flatMap((m) =>
        (m.execucao ? textos(m.execucao) : [])
          .filter((t) => /noiva|parceir|namorad|ela te |gemid/i.test(t))
          .map((t) => `${id} · ${m.name}: ${t}`),
      ),
    );
    expect(ruins).toEqual([]);
  });

  // A pelve dela é desnivelada (teste de 2026-10-01): nada de pisar na linha.
  it("nenhuma explicação manda cruzar os pés", () => {
    const ruins = COBERTAS.flatMap((id) =>
      (porId.get(id)?.moves ?? []).flatMap((m) =>
        (m.execucao ? textos(m.execucao) : [])
          .filter((t) => /cruz\w* (os |um )?p[ée]s?\b|pisa\w* na linha/i.test(t))
          .map((t) => `${id} · ${m.name}: ${t}`),
      ),
    );
    expect(ruins).toEqual([]);
  });
});
