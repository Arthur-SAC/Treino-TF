import { describe, it, expect } from "vitest";
import { problemasDaExecucao, type Execucao } from "../../src/lib/execucao";

const ok: Execucao = {
  posicao: "Deitada de barriga pra cima, joelhos dobrados.",
  movimento: ["Suba o quadril.", "Desça devagar."],
  ondeSentir: "No glúteo.",
  erradoSe: ["Sentiu a lombar → suba menos"],
  renderMais: ["Segure 2 segundos em cima."],
};

describe("problemasDaExecucao", () => {
  it("aceita um exemplo válido", () => {
    expect(problemasDaExecucao(ok)).toEqual([]);
  });
  it("acusa 1 e 5 passos", () => {
    expect(problemasDaExecucao({ ...ok, movimento: ["a"] }).length).toBeGreaterThan(0);
    expect(problemasDaExecucao({ ...ok, movimento: ["a", "b", "c", "d", "e"] }).length).toBeGreaterThan(0);
  });
  it("acusa erradoSe sem seta", () => {
    expect(problemasDaExecucao({ ...ok, erradoSe: ["lombar dói"] }).length).toBeGreaterThan(0);
  });
  it("acusa máquina sem regulagem e aceita com", () => {
    expect(problemasDaExecucao(ok, ["maquina-abdutora"]).length).toBeGreaterThan(0);
    expect(problemasDaExecucao(ok, ["leg-press"]).length).toBeGreaterThan(0);
    expect(problemasDaExecucao(ok, ["polia-alta"]).length).toBeGreaterThan(0);
    expect(problemasDaExecucao({ ...ok, regulagem: "Banco na marca 3." }, ["maquina-abdutora"])).toEqual([]);
  });
  it("acusa termo sem tradução e aceita com tradução", () => {
    const sem = { ...ok, movimento: ["Faça rotação interna do quadril.", "Volte."] };
    expect(problemasDaExecucao(sem).length).toBeGreaterThan(0);
    const com = { ...ok, movimento: ["Faça rotação interna — girar o joelho pra dentro.", "Volte."] };
    expect(problemasDaExecucao(com)).toEqual([]);
    const par = { ...ok, ondeSentir: "No transverso (o músculo fundo da barriga)." };
    expect(problemasDaExecucao(par)).toEqual([]);
  });
  it("não diferencia maiúsculas", () => {
    expect(problemasDaExecucao({ ...ok, posicao: "Rotação Interna parada." }).length).toBeGreaterThan(0);
  });
});
