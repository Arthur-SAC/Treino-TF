import { describe, it, expect } from "vitest";

const raw = (g: Record<string, unknown>) => (Object.values(g)[0] as string | undefined) ?? "";
const DEPLOY = raw(import.meta.glob("../../.github/workflows/deploy.yml", { query: "?raw", import: "default", eager: true }));
const ANDROID = raw(import.meta.glob("../../.github/workflows/android.yml", { query: "?raw", import: "default", eager: true }));
const VERSAO = raw(import.meta.glob("../../src/lib/versao-nativa.ts", { query: "?raw", import: "default", eager: true }));

describe("CI do APK", () => {
  it("o deploy publica o pacote e o latest.json no caminho que o app busca", () => {
    expect(DEPLOY).toMatch(/build:app/);
    expect(DEPLOY).toMatch(/dist\/android\/latest\.json/);
    expect(DEPLOY).toMatch(/VITE_BUNDLE_VERSION/);
  });
  it("o CI lê a versão nativa do mesmo arquivo que o app", () => {
    expect(VERSAO).toMatch(/^export const NATIVE_VERSION = \d+;$/m);
    expect(DEPLOY).toMatch(/versao-nativa\.ts/);
    expect(ANDROID).toMatch(/versao-nativa\.ts/);
  });
  it("o APK é assinado pelos secrets, nunca por arquivo do repositório", () => {
    expect(ANDROID).toMatch(/secrets\.KEYSTORE_BASE64/);
    expect(ANDROID).toMatch(/assembleRelease/);
    expect(ANDROID).not.toMatch(/\.jks["']?\s*$/m);
  });
});
