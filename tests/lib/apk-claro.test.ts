import { describe, it, expect } from "vitest";
import { NATIVE_VERSION } from "../../src/lib/versao-nativa";

const raw = (g: Record<string, unknown>) => (Object.values(g)[0] as string | undefined) ?? "";
const BG = raw(import.meta.glob("../../android/app/src/main/res/values/ic_launcher_background.xml", { query: "?raw", import: "default", eager: true }));
const STYLES = raw(import.meta.glob("../../android/app/src/main/res/values/styles.xml", { query: "?raw", import: "default", eager: true }));
const COLORS = raw(import.meta.glob("../../android/app/src/main/res/values/colors.xml", { query: "?raw", import: "default", eager: true }));
const SPLASH_XML = raw(import.meta.glob("../../android/app/src/main/res/drawable/splash.xml", { query: "?raw", import: "default", eager: true }));
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
    expect(SPLASH_XML).toMatch(/#fff7f3/i);
    expect(SPLASH_XML).toMatch(/@mipmap\/ic_launcher_foreground/);
    expect(SPLASH_PNGS).toEqual([]);
    expect(STYLES).toMatch(/windowSplashScreenBackground">@color\/splash_background</);
  });
  it("o recurso nativo novo sobe a versão nativa", () => {
    expect(NATIVE_VERSION).toBe(2);
  });
});
