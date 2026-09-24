// Atualização do conteúdo do APK sem ela baixar nada (spec 2026-09-24). O
// deploy publica android/latest.json no Pages; o app compara com a própria
// versão, baixa o zip (com checksum) e aplica na próxima abertura. Se o
// pacote novo não chamar notifyAppReady, o plugin volta sozinho pro anterior.
import { useSyncExternalStore } from "react";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { App as CapApp } from "@capacitor/app";
import { BUNDLE_VERSION, NATIVE_VERSION } from "./versao-nativa";

export const URL_MANIFESTO = "https://arthur-sac.github.io/Treino-TF/android/latest.json";
export const URL_RELEASES = "https://github.com/Arthur-SAC/Treino-TF/releases/latest";

export interface Pacote { version: string; url: string; checksum: string; nativeVersion: number }
export interface DepsAtualizacao {
  notifyAppReady(): Promise<unknown>;
  buscarManifesto(): Promise<Pacote>;
  baixar(p: Pacote): Promise<{ id: string }>;
  agendarProxima(id: string): Promise<unknown>;
  versaoNativaInstalada(): Promise<number>;
}

export async function verificarAtualizacao(deps: DepsAtualizacao, versaoAtual: string): Promise<{ apkNovo: boolean }> {
  await deps.notifyAppReady().catch(() => {});
  try {
    const p = await deps.buscarManifesto();
    if (p.nativeVersion > (await deps.versaoNativaInstalada())) return { apkNovo: true };
    if (p.version === versaoAtual) return { apkNovo: false };
    const { id } = await deps.baixar(p);
    await deps.agendarProxima(id);
  } catch {
    // Sem internet ou pacote ruim: o app segue na versão que já roda.
  }
  return { apkNovo: false };
}

let apkNovo = false;
const ouvintes = new Set<() => void>();
export function useApkNovo(): boolean {
  return useSyncExternalStore((cb) => { ouvintes.add(cb); return () => ouvintes.delete(cb); }, () => apkNovo);
}

export function iniciarAtualizacao(): void {
  const deps: DepsAtualizacao = {
    notifyAppReady: () => CapacitorUpdater.notifyAppReady(),
    buscarManifesto: async () => (await fetch(`${URL_MANIFESTO}?t=${Date.now()}`, { cache: "no-store" })).json(),
    baixar: (p) => CapacitorUpdater.download({ url: p.url, version: p.version, checksum: p.checksum }),
    agendarProxima: (id) => CapacitorUpdater.next({ id }),
    versaoNativaInstalada: async () => Number((await CapApp.getInfo()).build) || NATIVE_VERSION,
  };
  void verificarAtualizacao(deps, BUNDLE_VERSION).then((r) => {
    apkNovo = r.apkNovo;
    ouvintes.forEach((f) => f());
  });
}
