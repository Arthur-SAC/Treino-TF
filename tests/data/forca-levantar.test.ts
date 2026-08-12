import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";
import type { Exercise } from "../../src/lib/db";

const NOVOS = ["carregamento-frontal", "prancha-antirrotacao"];
const PADRAO_LEVANTAR = ["agachamento-goblet", "carregamento-frontal", "prancha-antirrotacao"];

// Rede da restrição de ombro — uma das mais antigas do programa. `erg\w*` (não
// `ergu\w*`) é de propósito: "erga" é a forma imperativa de erguer, a forma
// mais provável de aparecer numa instrução de execução ("Erga o halter acima
// da cabeça"), e `ergu\w*` não cobre "erga" porque a raiz diverge na vogal.
// Uma rede que falha na forma mais provável de aparecer não é rede.
const PRESCRICAO = /(levant\w*|erg\w*|empurr\w*|press\w*|elev\w*)[^.]{0,40}acima da cabe[çc]a/i;

/** Os campos que descrevem EXECUÇÃO, um por entrada (nunca concatenados: com
 *  tudo numa string só, um verbo no fim de um campo casaria com "acima da
 *  cabeça" no começo do seguinte).
 *
 *  `proTips` e `commonMistakes` entraram na revisão final. A varredura antiga
 *  cobria só description/easier/harder, mas dica e erro comum carregam
 *  instrução de execução de verdade ("Comece com o peso de 8 kg e só suba
 *  quando…", "Deixar o peso descer e afastar do peito") — prescrição escrita
 *  ali chegaria na tela dela sem passar por rede nenhuma. */
function textosDeExecucao(e: Exercise): string[] {
  return [
    e.description,
    e.easierVariation ?? "",
    e.harderVariation ?? "",
    ...(e.proTips ?? []),
    ...(e.commonMistakes ?? []),
  ];
}

const MENCAO_ACIMA = /acima da cabe[çc]a/i;
const EXPLICA = /(n[ãa]o|em vez|oposto|engross\w*|evita)/i;

/** Todos os textos do exercício, um a um — inclusive os que não descrevem
 *  execução. Serve à checagem de contexto, não à de prescrição. */
function todosOsTextos(e: Exercise): string[] {
  return [
    e.name,
    e.description,
    e.easierVariation ?? "",
    e.harderVariation ?? "",
    e.successCue ?? "",
    ...(e.proTips ?? []),
    ...(e.commonMistakes ?? []),
  ];
}

/** As FRASES de um texto que citam o alvo. Frase = trecho entre pontuação
 *  final. É a unidade de proximidade: a negação tem que estar aqui dentro. */
function frasesCom(texto: string, alvo: RegExp): string[] {
  return texto
    .split(/(?<=[.!?])\s+|\n+/)
    .map((f) => f.trim())
    .filter((f) => alvo.test(f));
}

describe("padrão de força para levantar outra pessoa", () => {
  it("os três exercícios do padrão existem no catálogo", () => {
    const faltando = PADRAO_LEVANTAR.filter((id) => !EXERCISES.some((e) => e.id === id));
    expect(faltando).toEqual([]);
  });

  it("os novos têm descrição, erros comuns e cue de acerto", () => {
    for (const id of NOVOS) {
      const e = EXERCISES.find((x) => x.id === id)!;
      expect({ id, desc: !!e.description, erros: (e.commonMistakes ?? []).length > 0, cue: !!e.successCue })
        .toEqual({ id, desc: true, erros: true, cue: true });
    }
  });

  // Duas checagens em vez de uma: banir a PALAVRA "acima da cabeça" apagaria a
  // explicação de por que o carregamento é frontal (a própria razão de existir
  // do exercício). O que precisa ser banido é a PRESCRIÇÃO — um verbo de
  // execução ("levante", "empurre") mandando erguer peso até lá em cima.
  it("nenhum PRESCREVE carga acima da cabeça — a restrição de ombro vale desde o início", () => {
    for (const id of PADRAO_LEVANTAR) {
      const e = EXERCISES.find((x) => x.id === id)!;
      expect({ id, prescreve: textosDeExecucao(e).some((t) => PRESCRICAO.test(t)) })
        .toEqual({ id, prescreve: false });
    }
  });

  // A regex é a rede; sem prova de que ela morde, "não encontrou nenhuma
  // prescrição" pode significar "a rede tem buraco", não "está tudo limpo".
  // Frases e regex ficam deliberadamente independentes uma da outra: o valor
  // do teste está em nenhuma das duas ser derivada da outra.
  it("o padrão de prescrição pega as formas verbais que apareceriam de verdade", () => {
    const FRASES = [
      "Erga o halter acima da cabeça",
      "Ergue o peso acima da cabeça",
      "Levante o halter acima da cabeça",
      "Empurre o peso acima da cabeça",
      "Eleve os braços acima da cabeça",
    ];
    const escaparam = FRASES.filter((f) => !PRESCRICAO.test(f));
    expect(escaparam).toEqual([]);
  });

  // Sem isto, "estendi a varredura a proTips e commonMistakes" seria uma
  // afirmação sobre uma lista de campos que ninguém exercitou.
  it("a varredura enxerga prescrição escrita em proTips e em commonMistakes", () => {
    const emDica = { description: "Caminha com o peso no peito.", commonMistakes: [], proTips: ["Levante o halter acima da cabeça no fim da série"] } as unknown as Exercise;
    const emErro = { description: "Caminha com o peso no peito.", commonMistakes: ["Empurrar o halter acima da cabeça pra descansar"] } as unknown as Exercise;
    expect({
      dica: textosDeExecucao(emDica).some((t) => PRESCRICAO.test(t)),
      erro: textosDeExecucao(emErro).some((t) => PRESCRICAO.test(t)),
    }).toEqual({ dica: true, erro: true });
  });

  // A rede vale pro catálogo inteiro, não só pros três exercícios do padrão —
  // a restrição de ombro é do programa todo desde o início, não uma regra
  // local desses exercícios.
  it("NENHUM exercício do catálogo inteiro prescreve carga acima da cabeça", () => {
    const prescrevem = EXERCISES.filter((e) => textosDeExecucao(e).some((t) => PRESCRICAO.test(t)))
      .map((e) => e.id);
    expect(prescrevem).toEqual([]);
  });

  // Proximidade, e não "o marcador existe em algum lugar do objeto". A versão
  // anterior fazia JSON.stringify do exercício inteiro: o `successCue` do
  // carregamento frontal termina em "não a lombar" — um "não" de outro
  // assunto, três campos longe — e isso sozinho aprovava a expressão escrita
  // em qualquer lugar. Agora a negação tem que estar na MESMA FRASE.
  it("onde 'acima da cabeça' aparece, a explicação está na mesma frase", () => {
    const soltas = EXERCISES.flatMap((e) =>
      todosOsTextos(e)
        .flatMap((t) => frasesCom(t, MENCAO_ACIMA))
        .filter((f) => !EXPLICA.test(f))
        .map((f) => `${e.id}: ${f}`),
    );
    expect(soltas).toEqual([]);
  });

  it("a checagem de proximidade avalia alguma frase de verdade — e reprova o caso que a antiga aprovava", () => {
    const avaliadas = EXERCISES.flatMap((e) => todosOsTextos(e).flatMap((t) => frasesCom(t, MENCAO_ACIMA)));
    expect(avaliadas.length).toBeGreaterThan(0);

    // Exatamente o buraco da versão antiga: prescrição num campo, "não" de
    // outro assunto em outro campo.
    const FORJADO = {
      id: "forjado",
      name: "Exercício forjado",
      description: "Segura o halter acima da cabeça e caminha 20 m.",
      commonMistakes: [],
      successCue: "Fez certo se sentiu o abdômen segurando — não a lombar.",
    } as unknown as Exercise;

    const frases = todosOsTextos(FORJADO).flatMap((t) => frasesCom(t, MENCAO_ACIMA));
    expect(frases).toHaveLength(1);
    expect(EXPLICA.test(frases[0])).toBe(false);
    // ...e a checagem antiga, por objeto inteiro, aprovaria este mesmo texto.
    expect(EXPLICA.test(JSON.stringify(FORJADO))).toBe(true);
  });

  it("só usam equipamento que existe na academia dela", () => {
    const DISPONIVEL = ["halteres", "halter", "kettlebell", "caneleira", "colchonete", "banco", "barra", "anilhas", "step", "espaldar", "bola-suica", "leg-press", "maquina-abdutor", "maquina-adutora", "multiestacao", "polia-alta", "esteira", "bike-reclinada", "banco-inclinado"];
    for (const id of NOVOS) {
      const e = EXERCISES.find((x) => x.id === id)!;
      const fora = (e.equipment ?? []).filter((eq) => !DISPONIVEL.includes(eq));
      expect({ id, fora }).toEqual({ id, fora: [] });
    }
  });

  it("nenhum usa Smith nem polia baixa — não existem na academia dela", () => {
    for (const id of NOVOS) {
      const e = EXERCISES.find((x) => x.id === id)!;
      expect((e.equipment ?? []).join(" ")).not.toMatch(/smith|polia-baixa/);
    }
  });
});
