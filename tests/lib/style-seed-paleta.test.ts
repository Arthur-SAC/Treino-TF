import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { seedStyle, STYLE_SEED_VERSION } from "../../src/lib/style-seed";
import { StyleTabs } from "../../src/components/StyleTabs";
import { EXPOE } from "../../src/lib/discricao";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createElement } from "react";

const antiga = {
  subtone: "warm" as const, contrast: "medium" as const,
  favorableColors: ["#5c1a2b"], unfavorableColors: ["#000000"], reanalyzed: false,
};

async function preparar(p: typeof antiga | (Omit<typeof antiga, "reanalyzed" | "subtone"> & { reanalyzed: boolean; subtone: "cool" })) {
  await db.garments.clear(); await db.outfits.clear(); await db.stylePalette.clear(); await db.settings.clear();
  await db.stylePalette.add(p as never);
  await db.settings.bulkPut([
    { key: "styleSeeded", value: true }, { key: "styleSeededV2", value: true },
    { key: "styleSeedVersion", value: 4 },
  ]);
}

describe("paleta dela (v5)", () => {
  it("versão 5", () => expect(STYLE_SEED_VERSION).toBe(5));

  it("paleta antiga é trocada inteira", async () => {
    await preparar(antiga);
    await seedStyle();
    const [p] = await db.stylePalette.toArray();
    expect(p.favorableColors).toContain("#000000");
    expect(p.favorableColors).toContain("#a23b2a");
    expect(p.unfavorableColors).toContain("#f4b6c2");
    expect(p.subtone).toBe("neutral");
    expect(p.contrast).toBe("high");
    expect((await db.settings.get("styleSeedVersion"))?.value).toBe(5);
  });

  it("reanalyzed: cores trocam, subtom fica", async () => {
    await preparar({ ...antiga, subtone: "cool", reanalyzed: true });
    await seedStyle();
    const [p] = await db.stylePalette.toArray();
    expect(p.favorableColors).toContain("#a23b2a");
    expect(p.subtone).toBe("cool");
  });
});

describe("aba Só seu", () => {
  it("rótulo novo e nada que case com EXPOE", () => {
    render(createElement(MemoryRouter, null, createElement(StyleTabs)));
    expect(screen.getByText("Só seu")).toBeInTheDocument();
    for (const a of screen.getAllByRole("link")) expect(a.textContent ?? "").not.toMatch(EXPOE);
  });
});
