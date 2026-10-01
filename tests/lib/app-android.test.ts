import { describe, it, expect } from "vitest";

const raw = (glob: Record<string, unknown>) => Object.values(glob)[0] as string;
const MANIFEST = raw(import.meta.glob("../../android/app/src/main/AndroidManifest.xml", { query: "?raw", import: "default", eager: true }));
const GITIGNORE = raw(import.meta.glob("../../.gitignore", { query: "?raw", import: "default", eager: true }));
const CAP = raw(import.meta.glob("../../capacitor.config.ts", { query: "?raw", import: "default", eager: true }));
const EXPOE = /\bTRH\b|horm|fertilidade|disforia|transi[çc][ãa]o|intimidade|[íi]ntim|firmeza|sexo|sexual|safad/i;

describe("o APK", () => {
  it("existe o projeto Android", () => {
    expect(MANIFEST).toBeTruthy();
  });
  it("microfone (voz) e câmera (fotos) continuam funcionando dentro do app", () => {
    for (const p of ["RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS", "CAMERA"]) {
      expect(MANIFEST).toContain(`android.permission.${p}`);
    }
  });
  it("pode notificar e agendar no horário exato", () => {
    for (const p of ["POST_NOTIFICATIONS", "SCHEDULE_EXACT_ALARM", "RECEIVE_BOOT_COMPLETED"]) {
      expect(MANIFEST).toContain(`android.permission.${p}`);
    }
  });
  it("nome neutro e id fixo", () => {
    expect(CAP).toMatch(/appName:\s*"Treino"/);
    expect(CAP).toMatch(/appId:\s*"io\.github\.arthursac\.treino"/);
    expect(CAP).not.toMatch(EXPOE);
  });
  it("o updater não se atualiza sozinho — quem decide é atualizacao.ts", () => {
    expect(CAP).toMatch(/autoUpdate:\s*false/);
  });
});

describe("o APK — revisão final", () => {
  it("o updater não manda estatística pra servidor de terceiro (dados só no celular)", () => {
    expect(CAP).toMatch(/statsUrl:\s*""/);
  });
  it("o botão de tirar foto enxerga o app de câmera (visibilidade de pacotes)", () => {
    expect(MANIFEST).toMatch(/<queries>[\s\S]*android\.media\.action\.IMAGE_CAPTURE[\s\S]*<\/queries>/);
  });
  it("o Android não copia os dados do app pro Drive sozinho", () => {
    expect(MANIFEST).toMatch(/android:allowBackup="false"/);
  });
  it("ícone e tela de abertura vão pro repositório — o *.png das fotos não pode engolir", () => {
    // O CI compila do que está no git. Ignorado aqui, o recurso existe na
    // máquina dela e falta no build: "resource drawable/splash not found".
    // No .gitignore vale a ÚLTIMA regra que casa: a exceção tem de vir depois
    // de todo "*.png" — e só para a pasta de recursos, pra fotos seguirem fora.
    const linhas = GITIGNORE.split(/\r?\n/).map((l) => l.trim());
    const ultimoPng = linhas.lastIndexOf("*.png");
    const excecao = linhas.lastIndexOf("!android/app/src/main/res/**/*.png");
    expect({ temExcecao: excecao >= 0, depoisDoPng: excecao > ultimoPng }).toEqual({ temExcecao: true, depoisDoPng: true });
    expect(linhas.filter((l) => l.startsWith("!") && /png|jpe?g/.test(l))).toEqual(["!android/app/src/main/res/**/*.png"]);
  });
});
