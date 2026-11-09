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
  it("pega plurais e flexões que escapavam", () => {
    const c = (t: string) => problemasDaExecucao({ ...ok, ondeSentir: t }).length;
    expect(c("Trabalha as rotações internas do quadril.")).toBeGreaterThan(0);
    expect(c("Faça rotações externas.")).toBeGreaterThan(0);
    expect(c("Boa flexão do quadril.")).toBeGreaterThan(0);
    expect(c("Boa extensão do quadril.")).toBeGreaterThan(0);
    expect(c("Junte as escápulas.")).toBeGreaterThan(0);
    expect(c("Ative os transversos.")).toBeGreaterThan(0);
    expect(c("Junte as escápulas (as pás das costas).")).toBe(0);
    expect(c("Boa extensão do quadril — levar a perna pra trás.")).toBe(0);
  });
  it("aceita a tradução em qualquer ponto da mesma oração", () => {
    const c = (t: string) => problemasDaExecucao({ ...ok, ondeSentir: t }).length;
    expect(c("Sinta o transverso do abdômen (o músculo fundo da barriga).")).toBe(0);
    expect(c("Sinta o transverso. Depois (algo).")).toBeGreaterThan(0);
    expect(c("Sinta o transverso do abdômen: o músculo fundo.")).toBe(0);
  });
  it("normaliza NFC antes de casar", () => {
    const nfd = "Faça rotação interna parada.".normalize("NFD");
    expect(problemasDaExecucao({ ...ok, posicao: nfd }).length).toBeGreaterThan(0);
  });
  it("acusa itens só com espaços", () => {
    expect(problemasDaExecucao({ ...ok, movimento: ["a", "  "] }).length).toBeGreaterThan(0);
    expect(problemasDaExecucao({ ...ok, erradoSe: [" "] }).length).toBeGreaterThan(0);
    expect(problemasDaExecucao({ ...ok, renderMais: [" "] }).length).toBeGreaterThan(0);
  });
});
