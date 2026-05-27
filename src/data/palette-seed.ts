import type { StylePalette } from "../lib/db";

export const INITIAL_PALETTE: Omit<StylePalette, "id"> = {
  subtone: "warm",
  contrast: "medium",
  favorableColors: [
    "#5c1a2b", // vinho profundo
    "#8b3a4a", // vinho rosado
    "#a0522d", // siena / ferrugem
    "#cd853f", // mostarda escura / peru
    "#6b4423", // marrom chocolate
    "#bc8f5e", // camel
    "#d4a373", // nude/dourado
    "#f4e4d6", // off-white quente
    "#556b2f", // oliva escuro
    "#9b6b43", // bronze
  ],
  unfavorableColors: [
    "#ffc0cb", // rosa-bebê
    "#add8e6", // azul-bebê
    "#e6e6fa", // lavanda gelada
    "#98fb98", // verde-menta
    "#ffffff", // branco puro
    "#000000", // preto puro (use com moderação, com nude próximo do rosto)
  ],
  reanalyzed: false,
};
