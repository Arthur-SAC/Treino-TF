import { describe, it, expect } from "vitest";
import { primeiraMarcacao, mostrarAvisoAgua } from "../../src/lib/creatina";

describe("aviso de água da creatina", () => {
  it("antes de começar, avisa — ela precisa saber antes da balança subir", () => {
    expect(mostrarAvisoAgua(null, "2026-09-24")).toBe(true);
  });
  it("avisa nos primeiros 14 dias a partir da primeira marcação", () => {
    expect(mostrarAvisoAgua("2026-09-24", "2026-10-07")).toBe(true);
  });
  it("some no 14º dia depois da primeira marcação", () => {
    expect(mostrarAvisoAgua("2026-09-24", "2026-10-08")).toBe(false);
  });
  it("marcação desfeita (done: false) não conta como começo", () => {
    expect(primeiraMarcacao([
      { date: "2026-09-20", itemId: "creatina", done: false },
      { date: "2026-09-24", itemId: "creatina", done: true },
      { date: "2026-09-22", itemId: "agua", done: true },
    ])).toBe("2026-09-24");
  });
  it("sem nenhuma marcação feita, não há começo", () => {
    expect(primeiraMarcacao([{ date: "2026-09-20", itemId: "creatina", done: false }])).toBeNull();
  });
});

import { subtituloCreatina } from "../../src/lib/creatina";

describe("subtítulo da creatina", () => {
  const dose = "No café, todo dia";
  it("nas 2 primeiras semanas, mostra a dose E o aviso — a dose não some quando ela mais precisa", () => {
    const s = subtituloCreatina(dose, "2026-09-24", "2026-09-30");
    expect(s).toContain(dose);
    expect(s).toMatch(/1–2 kg de água/);
  });
  it("depois das 2 semanas, só a dose", () => {
    expect(subtituloCreatina(dose, "2026-09-24", "2026-10-20")).toBe(dose);
  });
});
