import { describe, it, expect } from "vitest";
import { NATIVE_VERSION } from "../../src/lib/versao-nativa";

const raw = (g: Record<string, unknown>) => (Object.values(g)[0] as string | undefined) ?? "";
const BG = raw(import.meta.glob("../../android/app/src/main/res/values/ic_launcher_background.xml", { query: "?raw", import: "default", eager: true }));
const STYLES = raw(import.meta.glob("../../android/app/src/main/res/values/styles.xml", { query: "?raw", import: "default", eager: true }));
const COLORS = raw(import.meta.glob("../../android/app/src/main/res/values/colors.xml", { query: "?raw", import: "default", eager: true }));
const SPLASH_XML = raw(import.meta.glob("../../android/app/src/main/res/drawable/splash.xml", { query: "?raw", import: "default", eager: true }));
const ICONE = raw(import.meta.glob("../../android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml", { query: "?raw", import: "default", eager: true }));
const ICONE_REDONDO = raw(import.meta.glob("../../android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml", { query: "?raw", import: "default", eager: true }));
const FRENTE = raw(import.meta.glob("../../android/app/src/main/res/drawable/ic_launcher_foreground_claro.xml", { query: "?raw", import: "default", eager: true }));
const SPLASH_PNGS = Object.keys(import.meta.glob("../../android/app/src/main/res/drawable*/splash.png", { query: "?url", import: "default" }));

describe("APK claro", () => {
  it("o fundo do ícone é o creme da paleta", () => {
    expect(BG).toMatch(/name="ic_launcher_background">#fff7f3</i);
  });
  it("a barra de status é clara com ícones escuros nos dois temas", () => {
    expect(COLORS).toMatch(/name="colorPrimary">#fff7f3</i);
    expect(COLORS).toMatch(/name="colorPrimaryDark">#fff7f3</i);
    expect(COLORS).toMatch(/name="colorAccent">#e23b3b</i);
    expect(STYLES).toMatch(/android:statusBarColor">@color\/colorPrimaryDark</);
    expect(STYLES).toMatch(/android:windowLightStatusBar">true</);
    const nb = STYLES.match(/<style name="AppTheme\.NoActionBar"[\s\S]*?<\/style>/)?.[0] ?? "";
    const nbl = STYLES.match(/<style name="AppTheme\.NoActionBarLaunch"[\s\S]*?<\/style>/)?.[0] ?? "";
    for (const s of [nb, nbl]) {
      expect(s).toMatch(/statusBarColor/);
      expect(s).toMatch(/windowLightStatusBar">true</);
    }
  });
  it("a splash é um XML claro, sem PNG escuro por perto", () => {
    // android:drawable é referência: cor literal ali o AAPT2 recusa. A cor vem
    // de colors.xml e tem de ser o creme.
    expect(SPLASH_XML).not.toMatch(/android:drawable="#/);
    expect(SPLASH_XML).toMatch(/<item android:drawable="@color\/splash_background"\s*\/>/);
    expect(COLORS).toMatch(/name="splash_background">#fff7f3</i);
    // Vetor não entra em <bitmap>: vai direto no <item>, com tamanho.
    expect(SPLASH_XML).not.toMatch(/<bitmap/);
    expect(SPLASH_XML).toMatch(/android:drawable="@drawable\/ic_launcher_foreground_claro"/);
    expect(SPLASH_XML).toMatch(/android:gravity="center"/);
    expect(SPLASH_XML).toMatch(/android:width="\d+dp"/);
    expect(SPLASH_XML).toMatch(/android:height="\d+dp"/);
    expect(SPLASH_PNGS).toEqual([]);
    expect(STYLES).toMatch(/windowSplashScreenBackground">@color\/splash_background</);
    expect(STYLES).toMatch(/windowSplashScreenAnimatedIcon">@drawable\/ic_launcher_foreground_claro</);
  });
  it("o ícone adaptativo usa o T vermelho em vetor, dentro da zona segura", () => {
    for (const xml of [ICONE, ICONE_REDONDO]) {
      expect(xml).toMatch(/<foreground android:drawable="@drawable\/ic_launcher_foreground_claro"\s*\/>/);
      expect(xml).toMatch(/<background android:drawable="@color\/ic_launcher_background"\s*\/>/);
    }
    expect(FRENTE).toMatch(/android:viewportWidth="108"/);
    expect(FRENTE).toMatch(/android:viewportHeight="108"/);
    const cores = [...FRENTE.matchAll(/android:fillColor="([^"]+)"/g)].map((m) => m[1].toLowerCase());
    expect(cores.length).toBeGreaterThan(0);
    expect(new Set(cores)).toEqual(new Set(["#c81d3a"]));
    // Todo ponto do desenho dentro do círculo de 66dp no centro (54,54).
    const pontos = [...FRENTE.matchAll(/android:pathData="([^"]+)"/g)]
      .flatMap((m) => [...m[1].matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map((p) => [Number(p[1]), Number(p[2])]));
    expect(pontos.length).toBeGreaterThan(0);
    for (const [x, y] of pontos) expect(Math.hypot(x - 54, y - 54)).toBeLessThanOrEqual(33);
  });
  it("o recurso nativo novo sobe a versão nativa", () => {
    expect(NATIVE_VERSION).toBe(2);
  });
});
