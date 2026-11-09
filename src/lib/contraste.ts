// Paleta A (clara) — fonte única dos hex. tailwind.config.ts importa daqui.
export const PALETA = {
  fundo: "#fff7f3",
  card: "#ffffff",
  borda: "#f0d9d4",
  texto: "#2a1416",
  texto2: "#7d5f5d",
  verm: "#e23b3b",
  verm2: "#c81d3a",
  verm3: "#9e1430",
  feito: "#17a398",
  vital: "#7b4fd6",
  trilho: "#f5e2de",
} as const;

function luminancia(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste WCAG 2.x entre duas cores hex (#rrggbb). */
export function contraste(hexA: string, hexB: string): number {
  const a = luminancia(hexA);
  const b = luminancia(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
