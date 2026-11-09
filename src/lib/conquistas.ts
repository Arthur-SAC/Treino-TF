// src/lib/conquistas.ts
// Conquistas que o app já sabe reconhecer (spec 2026-11-09, seção 9). Puro.
// Mapeia só o que existe: os marcos de cintura de objetivo.ts. "Ciclo
// concluído" e "primeira subida de carga" não são fatos guardados hoje — entram
// depois como conquista nova, sem mexer nisto.
import { MARCOS_CINTURA } from "./objetivo";

export interface MarcoCintura {
  cinturaCm: number;
  titulo: string;
  /** ISO da primeira medida com a cintura no alvo ou abaixo. */
  data: string;
}

/** Id em `conquistasVistas`. */
export function idDoMarcoCintura(cinturaCm: number): string {
  return `cintura-${cinturaCm}`;
}

/** Marcos de cintura já batidos, na ordem de MARCOS_CINTURA. Bateu uma vez,
 *  conta: a cintura subir depois não desfaz a conquista. */
export function marcosDeCinturaAtingidos(
  medidas: readonly { date: string; waistCm?: number }[],
): MarcoCintura[] {
  const comCintura = medidas
    .filter((m): m is { date: string; waistCm: number } => typeof m.waistCm === "number" && m.waistCm > 0)
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const atingidos: MarcoCintura[] = [];
  for (const marco of MARCOS_CINTURA) {
    const primeira = comCintura.find((m) => m.waistCm <= marco.cinturaCm);
    if (primeira) atingidos.push({ cinturaCm: marco.cinturaCm, titulo: marco.titulo, data: primeira.date });
  }
  return atingidos;
}
