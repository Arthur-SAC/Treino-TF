import { db } from "./db";
import { PRODUCTS } from "../data/products-seed";
import { ROUTINES } from "../data/skincare-routines-seed";

// Bump quando o seed de rotinas mudar. A migração faz upsert POR NOME: atualiza
// os passos das rotinas do seed (troca de produtos) e adiciona as que faltam.
const ROUTINE_SEED_VERSION = 3;

// v1 (2026-09-23): os produtos de cabelo passam a ser os da rotina Juba. Os
// antigos (Salon Line/Lola "pro pixie") saem SÓ se ela não mexeu neles — nota
// igual à do seed antigo; o que ela editou é dela e fica.
export const PRODUCT_SEED_VERSION = 1;
const CABELO_ANTIGO: ReadonlyArray<readonly [string, string]> = [
  ["Shampoo Salon Line Meu Cacho Minha Vida hidratação", "Sem sulfato agressivo. Mantém cachos. Use 2-3x/semana, alterna com co-wash."],
  ["Co-wash Salon Line / Lola", "Limpa cachos sem espumar. Use nos dias entre shampoo."],
  ["Máscara de hidratação Lola My Curls", "Hidratação semanal. Deixa 20min antes de enxaguar."],
  ["Máscara de nutrição (manteiga de karité)", "Nutrição quinzenal. Repõe lipídios."],
  ["Máscara de reconstrução (queratina/hidrolisado)", "Reconstrução mensal. Repõe proteína. NÃO USE toda semana — proteína em excesso quebra fios."],
  ["Creme de pentear leve pra cachos curtos", "Aplica em mecha úmida pra definir cachos do pixie. Não usa muito — pixie cacheado fica leve."],
];

export async function seedBeauty(): Promise<void> {
  const seeded = await db.settings.get("beautySeeded");
  if (seeded?.value !== true) {
    await db.transaction("rw", [db.products, db.skincareRoutines, db.settings], async () => {
      for (const p of PRODUCTS) {
        await db.products.add({ ...p } as never);
      }
      for (const r of ROUTINES) {
        await db.skincareRoutines.add(r as never);
      }
      await db.settings.put({ key: "beautySeeded", value: true });
      await db.settings.put({ key: "routineSeedVersion", value: ROUTINE_SEED_VERSION });
      await db.settings.put({ key: "productSeedVersion", value: PRODUCT_SEED_VERSION });
    });
  }

  // Migração de rotinas pra contas existentes: upsert POR NOME — atualiza os
  // passos das rotinas do seed (ex.: troca de produtos pelo kit barato) e
  // adiciona as que faltam. Idempotente.
  const rvSetting = await db.settings.get("routineSeedVersion");
  const rv = (rvSetting?.value as number) ?? 1;
  if (rv < ROUTINE_SEED_VERSION) {
    await db.transaction("rw", [db.skincareRoutines, db.settings], async () => {
      const existing = await db.skincareRoutines.toArray();
      for (const r of ROUTINES) {
        const match = existing.find((x) => x.name === r.name);
        if (match?.id !== undefined) {
          await db.skincareRoutines.update(match.id, { time: r.time, target: r.target, steps: r.steps });
        } else {
          await db.skincareRoutines.add(r as never);
        }
      }
      await db.settings.put({ key: "routineSeedVersion", value: ROUTINE_SEED_VERSION });
    });
  }

  const pvSetting = await db.settings.get("productSeedVersion");
  const pv = (pvSetting?.value as number) ?? 0;
  if (pv < PRODUCT_SEED_VERSION) {
    await db.transaction("rw", [db.products, db.settings], async () => {
      const existentes = await db.products.toArray();
      for (const [nome, notaAntiga] of CABELO_ANTIGO) {
        const intacto = existentes.find((x) => x.name === nome && x.notes === notaAntiga && !x.boughtAt);
        if (intacto?.id !== undefined) await db.products.delete(intacto.id);
      }
      // Só os de cabelo novos: acrescentar tudo que falta traria de volta o
      // que ela apagou de propósito na tela de produtos.
      const nomes = new Set(existentes.map((x) => x.name));
      for (const p of PRODUCTS.filter((x) => x.category === "haircare")) {
        if (!nomes.has(p.name)) await db.products.add({ ...p } as never);
      }
      await db.settings.put({ key: "productSeedVersion", value: PRODUCT_SEED_VERSION });
    });
  }
}

