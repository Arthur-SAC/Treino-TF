import type { StylePalette } from "../lib/db";

export const INITIAL_PALETTE: Omit<StylePalette, "id"> = {
  subtone: "neutral",
  contrast: "high",
  favorableColors: [
    "#000000", // preto
    "#f4ecdf", // off-white
    "#d8c3a5", // bege areia
    "#a0703c", // caramelo
    "#4a2c1d", // marrom chocolate
    "#a23b2a", // vermelho-tijolo
    "#6d1f2b", // vinho
    "#8e1b2c", // cereja escuro
    "#5b6236", // oliva
    "#c0663f", // terracota
    "#1f5560", // petróleo
    "#c9a227", // mostarda
  ],
  unfavorableColors: [
    "#f4b6c2", // rosa
    "#ffd1dc", // rosa-bebê
    "#fff3b0", // amarelo-claro
    "#c6f7e2", // pastel menta
    "#39ff14", // neon
    "#ff4500", // vermelho alaranjado
  ],
  reanalyzed: false,
};
