import { describe, it, expect } from "vitest";

const raw = (glob: Record<string, unknown>) => Object.values(glob)[0] as string;
const MANIFEST = raw(import.meta.glob("../../android/app/src/main/AndroidManifest.xml", { query: "?raw", import: "default", eager: true }));
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
