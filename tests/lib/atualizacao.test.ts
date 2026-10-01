import { describe, it, expect, vi } from "vitest";
import { verificarAtualizacao, type DepsAtualizacao } from "../../src/lib/atualizacao";

const deps = (over: Partial<DepsAtualizacao> = {}) => {
  const d = {
    notifyAppReady: vi.fn(async () => ({})),
    buscarManifesto: vi.fn(async () => ({ version: "abc1234", url: "https://x/b.zip", checksum: "f00", nativeVersion: 1 })),
    baixar: vi.fn(async () => ({ id: "b1" })),
    agendarProxima: vi.fn(async () => ({})),
    adiarParaFechar: vi.fn(async () => ({})),
    versaoNativaInstalada: vi.fn(async () => 1),
  };
  return { ...d, ...over } as typeof d;
};

describe("verificarAtualizacao", () => {
  it("avisa que abriu bem ANTES de qualquer coisa — é o que impede o rollback", async () => {
    const d = deps();
    await verificarAtualizacao(d, "old0000");
    expect(d.notifyAppReady.mock.invocationCallOrder[0]).toBeLessThan(d.buscarManifesto.mock.invocationCallOrder[0]);
  });
  it("versão nova: baixa com checksum e aplica na próxima abertura", async () => {
    const d = deps();
    expect(await verificarAtualizacao(d, "old0000")).toEqual({ apkNovo: false });
    expect(d.baixar).toHaveBeenCalledWith(expect.objectContaining({ version: "abc1234", checksum: "f00" }));
    expect(d.agendarProxima).toHaveBeenCalledWith("b1");
  });
  it("mesma versão: não baixa", async () => {
    const d = deps();
    await verificarAtualizacao(d, "abc1234");
    expect(d.baixar).not.toHaveBeenCalled();
  });
  it("pacote pede APK mais novo: NÃO baixa e avisa", async () => {
    const d = deps({ buscarManifesto: vi.fn(async () => ({ version: "n", url: "u", checksum: "c", nativeVersion: 2 })) });
    expect(await verificarAtualizacao(d, "old0000")).toEqual({ apkNovo: true });
    expect(d.baixar).not.toHaveBeenCalled();
  });
  it("sem internet: não quebra e o app abriu", async () => {
    const d = deps({ buscarManifesto: vi.fn(async () => { throw new Error("offline"); }) });
    await expect(verificarAtualizacao(d, "old0000")).resolves.toEqual({ apkNovo: false });
    expect(d.notifyAppReady).toHaveBeenCalled();
  });
  it("download falha: não quebra", async () => {
    const d = deps({ baixar: vi.fn(async () => { throw new Error("checksum"); }) });
    await expect(verificarAtualizacao(d, "old0000")).resolves.toEqual({ apkNovo: false });
    expect(d.agendarProxima).not.toHaveBeenCalled();
  });
});

// Revisão final: o capgo aplica o next() em qualquer ida pro segundo plano —
// abrir o seletor de arquivo (Restaurar backup) ou a câmera recarregava o app
// no meio. O pacote novo espera o app ser fechado.
describe("verificarAtualizacao — quando o pacote entra", () => {
  it("depois de agendar, adia pra quando o app for fechado", async () => {
    const d = deps();
    await verificarAtualizacao(d, "old0000");
    expect(d.adiarParaFechar).toHaveBeenCalled();
    expect(d.agendarProxima.mock.invocationCallOrder[0]).toBeLessThan(d.adiarParaFechar.mock.invocationCallOrder[0]);
  });
  it("sem pacote novo, não mexe no atraso", async () => {
    const d = deps();
    await verificarAtualizacao(d, "abc1234");
    expect(d.adiarParaFechar).not.toHaveBeenCalled();
  });
});
