import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

mkdirSync("public/icons", { recursive: true });

function svgIcon(size, mask = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#fff7f3"/>
  ${mask ? "" : `<rect x="${size * 0.1}" y="${size * 0.1}" width="${size * 0.8}" height="${size * 0.8}" rx="${size * 0.15}" fill="#e23b3b"/>`}
  <text x="50%" y="50%" font-family="Georgia, serif" font-size="${size * 0.4}" fill="#ffffff" text-anchor="middle" dominant-baseline="central" font-style="italic">T</text>
</svg>`;
}

writeFileSync(join("public", "icons", "icon-192.svg"), svgIcon(192));
writeFileSync(join("public", "icons", "icon-512.svg"), svgIcon(512));
writeFileSync(join("public", "icons", "maskable-icon.svg"), svgIcon(512, true));

console.log("Ícones SVG gerados em public/icons/");
