import type { ItemEstilo } from "../data/estilo-degraus-seed";

export const AVISO_TABELA = "Confira a tabela de medidas da marca — cada uma numera de um jeito.";

export const faixaDePreco = (i: ItemEstilo) => `R$ ${i.precoMin}–${i.precoMax}`;

export const textoLavagem = (i: ItemEstilo) => (i.lavagem === "maquina" ? "máquina e varal" : "à mão, seca no quarto");

/** "2026-11-14" → "14/11" */
export const diaMes = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Hidratante e body splash não lavam: sem medida e sem cor, não há o que dizer. */
export const temLavagem = (i: ItemEstilo) => !(i.medida === null && i.cores.length === 0);
