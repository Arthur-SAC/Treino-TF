import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";

const NOVOS = ["carregamento-frontal", "prancha-antirrotacao"];
const PADRAO_LEVANTAR = ["agachamento-goblet", "carregamento-frontal", "prancha-antirrotacao"];

// Rede da restrição de ombro — uma das mais antigas do programa. `erg\w*` (não
// `ergu\w*`) é de propósito: "erga" é a forma imperativa de erguer, a forma
// mais provável de aparecer numa instrução de execução ("Erga o halter acima
// da cabeça"), e `ergu\w*` não cobre "erga" porque a raiz diverge na vogal.
// Uma rede que falha na forma mais provável de aparecer não é rede.
const PRESCRICAO = /(levant\w*|erg\w*|empurr\w*|press\w*|elev\w*)[^.]{0,40}acima da cabe[çc]a/i;

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
      const executa = [e.description, e.easierVariation ?? "", e.harderVariation ?? ""].join(" | ");
      expect({ id, prescreve: PRESCRICAO.test(executa) }).toEqual({ id, prescreve: false });
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

  // A rede vale pro catálogo inteiro, não só pros três exercícios do padrão —
  // a restrição de ombro é do programa todo desde o início, não uma regra
  // local desses exercícios.
  it("NENHUM exercício do catálogo inteiro prescreve carga acima da cabeça", () => {
    const prescrevem = EXERCISES.filter((e) => {
      const executa = [e.description, e.easierVariation ?? "", e.harderVariation ?? ""].join(" | ");
      return PRESCRICAO.test(executa);
    }).map((e) => e.id);
    expect(prescrevem).toEqual([]);
  });

  it("onde 'acima da cabeça' aparece, é para explicar por que NÃO se faz", () => {
    for (const id of PADRAO_LEVANTAR) {
      const texto = JSON.stringify(EXERCISES.find((x) => x.id === id)!);
      if (!/acima da cabe[çc]a/i.test(texto)) continue;
      expect({ id, explica: /(n[ãa]o|em vez|oposto|engross\w*|evita)/i.test(texto) })
        .toEqual({ id, explica: true });
    }
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
