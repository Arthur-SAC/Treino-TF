import type { Measurement } from "./db";
import { ESPERA_RECUSA_DIAS } from "./ofertas";
import { ITENS_ESTILO, type Degrau, type ItemEstilo } from "../data/estilo-degraus-seed";

export const ORCAMENTO_MES = 100;
export const DIAS_MEDIDA_VELHA = 60;
export const DIFERENCA_CONFERIR_CM = 4;
export const MESES_PRO_PROXIMO_DEGRAU = 6;
export const COMPRAS_PRO_PROXIMO_DEGRAU = 4;

export type CompraEstilo = { data: string; valorPago?: number; medidaCm?: number };
export type ComprasEstilo = Record<string, CompraEstilo>;
export type MesEstilo = { mes: string; acao: "comprei" | "pulei"; itemId?: string } | null;
export type EstadoDoMes =
  | { estado: "sugestao"; item: ItemEstilo }
  | { estado: "fechado"; acao: "comprei" | "pulei"; item: ItemEstilo | null }
  | { estado: "degrau-completo" };

export function mesDe(iso: string): string {
  return iso.slice(0, 7);
}

export function itensDoDegrau(d: Degrau): ItemEstilo[] {
  return ITENS_ESTILO.filter((i) => i.degrau === d).sort((a, b) => a.ordem - b.ordem);
}

/** Itens dos degraus até `d`, em ordem de degrau e depois de `ordem`. */
export function itensAteDegrau(d: Degrau): ItemEstilo[] {
  return ITENS_ESTILO.filter((i) => i.degrau <= d).sort((a, b) => a.degrau - b.degrau || a.ordem - b.ordem);
}

export function sugestaoDoMes(e: {
  hoje: string;
  degrau: Degrau;
  compras: ComprasEstilo;
  mesFechado: MesEstilo;
}): EstadoDoMes {
  const mf = e.mesFechado;
  if (mf && mf.mes === mesDe(e.hoje)) {
    const item = mf.itemId ? (ITENS_ESTILO.find((i) => i.id === mf.itemId) ?? null) : null;
    return { estado: "fechado", acao: mf.acao, item };
  }
  // O que sobrou de degraus de baixo continua valendo: primeiro o mais baixo.
  const item = itensAteDegrau(e.degrau).find((i) => !e.compras[i.id]);
  return item ? { estado: "sugestao", item } : { estado: "degrau-completo" };
}

export type OfertaDegrau = { id: "estilo-degrau-2" | "estilo-degrau-3"; para: 2 | 3 };

const dia = (iso: string) => Date.parse(iso.slice(0, 10) + "T00:00:00Z");

function somaMeses(iso: string, n: number): number {
  const d = new Date(dia(iso));
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.getTime();
}

export function ofertaDeDegrau(e: {
  hoje: string;
  degrau: Degrau;
  compras: ComprasEstilo;
  degrauDesde: string | null;
  recusas: Record<string, string>;
}): OfertaDegrau | null {
  if (e.degrau === 3) return null;
  const itens = itensDoDegrau(e.degrau);
  const feitas = itens.filter((i) => e.compras[i.id]).length;
  const alvo = Math.min(COMPRAS_PRO_PROXIMO_DEGRAU, itens.length);
  const porCompras = feitas >= alvo;
  const porTempo =
    e.degrauDesde !== null && somaMeses(e.degrauDesde, MESES_PRO_PROXIMO_DEGRAU) <= dia(e.hoje);
  if (!porCompras && !porTempo) return null;
  const para = (e.degrau + 1) as 2 | 3;
  const id = para === 2 ? "estilo-degrau-2" : "estilo-degrau-3";
  const r = e.recusas[id];
  if (r && dia(e.hoje) < dia(r) + ESPERA_RECUSA_DIAS * 86_400_000) return null;
  return { id, para };
}

export type Tamanho = "P" | "M" | "G" | "GG" | "XG";

export function tamanhoPorQuadril(cm: number): Tamanho {
  if (cm <= 100) return cm <= 94 ? "P" : "M";
  if (cm <= 106) return "G";
  if (cm <= 112) return "GG";
  return "XG";
}

export function medidaAtual(
  ms: Measurement[],
  campo: "hipCm" | "waistCm",
  hoje: string,
): { cm: number; data: string; velha: boolean } | null {
  let melhor: { cm: number; data: string } | null = null;
  for (const m of ms) {
    const v = m[campo];
    if (v == null) continue;
    if (!melhor || m.date > melhor.data) melhor = { cm: v, data: m.date };
  }
  if (!melhor) return null;
  const dias = (dia(hoje) - dia(melhor.data)) / 86_400_000;
  return { ...melhor, velha: dias > DIAS_MEDIDA_VELHA };
}

export function precisaConferir(compra: CompraEstilo, atualCm: number | null): boolean {
  if (compra.medidaCm == null || atualCm == null) return false;
  return Math.abs(compra.medidaCm - atualCm) >= DIFERENCA_CONFERIR_CM;
}

export function unirComprasEstilo(a: ComprasEstilo, b: ComprasEstilo): ComprasEstilo {
  const out: ComprasEstilo = { ...a };
  for (const [id, cb] of Object.entries(b)) {
    const ca = out[id];
    if (!ca) {
      out[id] = cb;
      continue;
    }
    const [antiga, outra] = ca.data <= cb.data ? [ca, cb] : [cb, ca];
    out[id] = {
      data: antiga.data,
      valorPago: antiga.valorPago ?? outra.valorPago,
      medidaCm: antiga.medidaCm ?? outra.medidaCm,
    };
  }
  return out;
}
