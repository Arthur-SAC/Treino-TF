import { db } from "./db";
import { PRODUCTS } from "../data/products-seed";
import { ROUTINES } from "../data/skincare-routines-seed";

// Bump quando o seed de rotinas mudar. A migração faz upsert POR NOME: atualiza
// os passos das rotinas do seed (troca de produtos) e adiciona as que faltam.
// v4 (2026-11-10): protetor às 15h30, adapaleno nas costas no lugar do
// Bepantol, aparador no lugar da lâmina.
export const ROUTINE_SEED_VERSION = 4;

// v1 (2026-09-23): os produtos de cabelo passam a ser os da rotina Juba. Os
// antigos (Salon Line/Lola "pro pixie") saem SÓ se ela não mexeu neles — nota
// igual à do seed antigo; o que ela editou é dela e fica.
// v2 (2026-11-10): kit de custo-benefício pro clima de Aracaju. O kit caro
// antigo sai pela mesma regra (nome e nota iguais ao seed antigo, nunca
// comprado); Bepantol e Kelo-Cote saem porque não tratam marca de acne.
export const PRODUCT_SEED_VERSION = 2;
const SKINCARE_ANTIGO: ReadonlyArray<readonly [string, string]> = [
  ["Sabonete líquido facial CeraVe (pele oleosa)", "Limpa sem agredir barreira. Use 2x/dia. Pra começar."],
  ["Sabonete La Roche Effaclar Concentrado", "Pra pele com tendência a oleosidade ou acne. Use noite."],
  ["Tônico hidratante Bioderma Sensibio", "Equilibra pH depois da limpeza. Aplica antes do hidratante."],
  ["Vitamina C 10% Adcos", "Antioxidante de manhã, antes do protetor solar. Clareia manchas com o tempo."],
  ["Hidratante Cetaphil PRO Oil Control", "Hidrata sem deixar oleoso. Use manhã + noite."],
  ["Protetor solar La Roche Anthelios FPS 60", "OBRIGATÓRIO de manhã, sempre. Sem ele, vitamina C, ácidos e tudo se anula."],
  ["Ácido glicólico 8% noturno (Neostrata)", "1-2x/semana à noite. Renova pele, ajuda cicatrizes. NÃO usar mesmo dia que retinol."],
  ["Retinol 0,3% Skinceuticals", "1-2x/semana à noite (alternar com glicólico). Estimula renovação. Pode irritar — começa devagar."],
  ["Bepantol Derma Pré + Pós", "Cicatrizante. Use em cicatrizes recentes nas costas. Acelera reparação."],
  ["Kelo-Cote silicone para cicatrizes", "Gel de silicone pra cicatrizes velhas. Aplica fina camada, 2x/dia, por 3-6 meses."],
  ["Esfoliante químico corporal (ácido salicílico 2%)", "Pra costas com acne. 1-2x/semana. Não usar junto com glicólico forte."],
  ["Clareador axila/íntima Adcos (com niacinamida)", "Niacinamida + alfa-arbutin. Clareamento gradual em 2-3 meses. Aplica à noite."],
  ["Hidratante íntimo de glicerina", "Mantém maciez da região. Aplica após banho."],
];
/** Nota antiga de produto que continua no seed com texto novo: só troca se ela não editou. */
const NOTA_ANTIGA: Readonly<Record<string, string>> = {
  "Gel de fixação": "Última camada; forma a casquinha que o óleo quebra depois de seco.",
};
/** Nomes que entraram na v2 — os únicos que a migração acrescenta. */
const JA_EXISTIAM_NA_V1 = new Set(["Sabonete íntimo Lucretin / Dermacyd"]);
export const NOVOS_V2: ReadonlySet<string> = new Set(
  PRODUCTS.filter((p) => p.category === "skincare" && !JA_EXISTIAM_NA_V1.has(p.name))
    .map((p) => p.name)
    .concat("Shampoo antirresíduo (Skala Anti Resíduos 325 ml)"),
);
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
        await db.skincareRoutines.add({ ...r } as never);
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
          await db.skincareRoutines.add({ ...r } as never);
        }
      }
      await db.settings.put({ key: "routineSeedVersion", value: ROUTINE_SEED_VERSION });
    });
  }

  const pvSetting = await db.settings.get("productSeedVersion");
  const pv = (pvSetting?.value as number) ?? 0;
  if (pv < 1) {
    await db.transaction("rw", [db.products, db.settings], async () => {
      const existentes = await db.products.toArray();
      for (const [nome, notaAntiga] of CABELO_ANTIGO) {
        const intacto = existentes.find((x) => x.name === nome && x.notes === notaAntiga && !x.boughtAt);
        if (intacto?.id !== undefined) await db.products.delete(intacto.id);
      }
      // Só os de cabelo novos: acrescentar tudo que falta traria de volta o
      // que ela apagou de propósito na tela de produtos.
      const nomes = new Set(existentes.map((x) => x.name));
      for (const p of PRODUCTS.filter((x) => x.category === "haircare" && !NOVOS_V2.has(x.name))) {
        if (!nomes.has(p.name)) await db.products.add({ ...p } as never);
      }
      await db.settings.put({ key: "productSeedVersion", value: 1 });
    });
  }

  if (pv < 2) {
    await db.transaction("rw", [db.products, db.settings], async () => {
      const existentes = await db.products.toArray();
      for (const [nome, notaAntiga] of SKINCARE_ANTIGO) {
        const intacto = existentes.find((x) => x.name === nome && x.notes === notaAntiga && !x.boughtAt);
        if (intacto?.id !== undefined) await db.products.delete(intacto.id);
      }
      for (const [nome, notaAntiga] of Object.entries(NOTA_ANTIGA)) {
        const novo = PRODUCTS.find((p) => p.name === nome)!;
        const intacto = existentes.find((x) => x.name === nome && x.notes === notaAntiga);
        if (intacto?.id !== undefined) await db.products.update(intacto.id, { notes: novo.notes });
      }
      const nomes = new Set(existentes.map((x) => x.name));
      for (const p of PRODUCTS.filter((x) => NOVOS_V2.has(x.name))) {
        if (!nomes.has(p.name)) await db.products.add({ ...p } as never);
      }
      await db.settings.put({ key: "productSeedVersion", value: PRODUCT_SEED_VERSION });
    });
  }
}

