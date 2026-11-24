import { describe, it, expect } from "vitest";
import {
  mesDe, sugestaoDoMes, ofertaDeDegrau, tamanhoPorQuadril, medidaAtual,
  precisaConferir, unirComprasEstilo, type ComprasEstilo,
} from "../../src/lib/estilo-degraus";

const c = (...ids: string[]): ComprasEstilo =>
  Object.fromEntries(ids.map((id) => [id, { data: "2026-10-01" }]));
const todos1 = ["casa-short-camiseta","calcinhas-algodao","hidratante-doce","calca-cintura-alta","body-splash","blusa-que-cai","acessorios-pequenos"];

describe("mesDe", () => it("corta o mês", () => expect(mesDe("2026-11-24")).toBe("2026-11")));

describe("sugestaoDoMes", () => {
  it("primeiro item do degrau", () => {
    const r = sugestaoDoMes({ hoje: "2026-11-24", degrau: 1, compras: {}, mesFechado: null });
    expect(r.estado).toBe("sugestao");
    if (r.estado === "sugestao") expect(r.item.id).toBe("casa-short-camiseta");
  });
  it("pula comprados fora de ordem", () => {
    const r = sugestaoDoMes({ hoje: "2026-11-24", degrau: 1, compras: c("casa-short-camiseta", "calca-cintura-alta"), mesFechado: null });
    expect(r.estado === "sugestao" && r.item.id).toBe("calcinhas-algodao");
  });
  it("mês fechado por pulei, e reabre no mês seguinte", () => {
    const mf = { mes: "2026-11", acao: "pulei" as const };
    const a = sugestaoDoMes({ hoje: "2026-11-28", degrau: 1, compras: {}, mesFechado: mf });
    expect(a.estado).toBe("fechado");
    if (a.estado === "fechado") expect(a.acao).toBe("pulei");
    const b = sugestaoDoMes({ hoje: "2026-12-01", degrau: 1, compras: {}, mesFechado: mf });
    expect(b.estado === "sugestao" && b.item.id).toBe("casa-short-camiseta");
  });
  it("degrau completo", () =>
    expect(sugestaoDoMes({ hoje: "2026-11-24", degrau: 1, compras: c(...todos1), mesFechado: null })).toEqual({ estado: "degrau-completo" }));
});

describe("ofertaDeDegrau", () => {
  const base = { hoje: "2026-12-01", degrau: 1 as const, degrauDesde: "2026-11-01", recusas: {} };
  it("3 compras: nada", () => expect(ofertaDeDegrau({ ...base, compras: c(...todos1.slice(0, 3)) })).toBeNull());
  it("4 compras: oferta", () =>
    expect(ofertaDeDegrau({ ...base, compras: c(...todos1.slice(0, 4)) })).toEqual({ id: "estilo-degrau-2", para: 2 }));
  it("6 meses sem compras: oferta", () =>
    expect(ofertaDeDegrau({ hoje: "2026-11-01", degrau: 1, compras: {}, degrauDesde: "2026-05-01", recusas: {} })).toEqual({ id: "estilo-degrau-2", para: 2 }));
  it("sem degrauDesde e sem compras: nada", () =>
    expect(ofertaDeDegrau({ hoje: "2026-11-01", degrau: 1, compras: {}, degrauDesde: null, recusas: {} })).toBeNull());
  it("recusa espera 7 dias", () => {
    const e = { degrau: 1 as const, compras: c(...todos1.slice(0, 4)), degrauDesde: "2026-11-01", recusas: { "estilo-degrau-2": "2026-11-20" } };
    expect(ofertaDeDegrau({ ...e, hoje: "2026-11-26" })).toBeNull();
    expect(ofertaDeDegrau({ ...e, hoje: "2026-11-27" })).not.toBeNull();
  });
  it("degrau 3 nunca oferece", () =>
    expect(ofertaDeDegrau({ hoje: "2027-12-01", degrau: 3, compras: {}, degrauDesde: "2026-01-01", recusas: {} })).toBeNull());
});

describe("tamanhoPorQuadril", () => {
  it.each([[92,"P"],[95,"M"],[100,"M"],[101,"G"],[106,"G"],[107,"GG"],[112,"GG"],[113,"XG"],[114,"XG"]] as const)(
    "%i -> %s", (cm, t) => expect(tamanhoPorQuadril(cm)).toBe(t));
});

describe("medidaAtual", () => {
  const m = (o: object) => ({ id: 1, ...o }) as never;
  it("vazia", () => expect(medidaAtual([], "hipCm", "2026-11-24")).toBeNull());
  it("pula registro sem o campo e marca velha", () =>
    expect(medidaAtual([m({ date: "2026-05-13", hipCm: 114 }), m({ date: "2026-11-01", weightKg: 90 })], "hipCm", "2026-11-24"))
      .toEqual({ cm: 114, data: "2026-05-13", velha: true }));
  it("recente não é velha", () =>
    expect(medidaAtual([m({ date: "2026-11-01", hipCm: 112 })], "hipCm", "2026-11-24")?.velha).toBe(false));
});

describe("precisaConferir", () => {
  it("regras", () => {
    expect(precisaConferir({ data: "x", medidaCm: 114 }, 110)).toBe(true);
    expect(precisaConferir({ data: "x", medidaCm: 114 }, 111)).toBe(false);
    expect(precisaConferir({ data: "x" }, 100)).toBe(false);
    expect(precisaConferir({ data: "x", medidaCm: 114 }, null)).toBe(false);
  });
});

describe("unirComprasEstilo", () => {
  it("mantém a data mais antiga e preenche campos", () => {
    const r = unirComprasEstilo({ a: { data: "2026-12-01" } }, { a: { data: "2026-11-10", valorPago: 40 }, b: { data: "2026-11-12" } });
    expect(r.a.data).toBe("2026-11-10");
    expect(r.a.valorPago).toBe(40);
    expect(r.b).toBeDefined();
  });
});
