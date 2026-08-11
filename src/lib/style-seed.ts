import { db } from "./db";
import { GARMENTS } from "../data/garments-seed";
import { INITIAL_PALETTE } from "../data/palette-seed";
import { OUTFITS } from "../data/outfits-seed";

export async function seedStyle(): Promise<void> {
  const v1 = await db.settings.get("styleSeeded");
  if (v1?.value !== true) {
    await db.transaction("rw", [db.garments, db.stylePalette, db.settings], async () => {
      for (const g of GARMENTS) {
        await db.garments.put(g);
      }
      if ((await db.stylePalette.count()) === 0) {
        await db.stylePalette.add(INITIAL_PALETTE as never);
      }
      await db.settings.put({ key: "styleSeeded", value: true });
    });
  }

  // V2: aplica discrição/fitTip + peças novas + combinações. Idempotente e não destrutivo.
  const v2 = await db.settings.get("styleSeededV2");
  if (v2?.value !== true) {
    await db.transaction("rw", [db.garments, db.outfits, db.settings], async () => {
      for (const g of GARMENTS) {
        await db.garments.put(g); // put atualiza as existentes e cria as novas
      }
      for (const o of OUTFITS) {
        await db.outfits.add(o as never);
      }
      await db.settings.put({ key: "styleSeededV2", value: true });
    });
  }

  // Daqui em diante, versão numerada em vez de flag booleana: as duas flags acima
  // só sabiam responder "já rodou?", então texto corrigido em peça ou combinação
  // nunca chegava a quem já tinha o app instalado — foi assim que "gola alta com
  // ombros largos vira look masculino" sobreviveu no aparelho dela depois de sair
  // do arquivo.
  const STYLE_SEED_VERSION = 3;
  const sv = await db.settings.get("styleSeedVersion");
  if (((sv?.value as number) ?? 0) < STYLE_SEED_VERSION) {
    await db.transaction("rw", [db.garments, db.outfits, db.settings], async () => {
      // Peça tem id do seed: put sobrescreve a mesma linha e não duplica.
      for (const g of GARMENTS) {
        await db.garments.put(g);
      }
      // Combinação não tem id do seed — a chave natural é o nome. O que é dela
      // (status, anotação, look testado) fica; o que é do seed é reescrito.
      const existentes = await db.outfits.toArray();
      for (const o of OUTFITS) {
        const match = existentes.find((x) => x.name === o.name);
        if (match?.id !== undefined) {
          await db.outfits.update(match.id, {
            context: o.context,
            occasion: o.occasion,
            pieces: o.pieces,
            whyItWorks: o.whyItWorks,
            silhouetteNote: o.silhouetteNote,
          });
        } else {
          await db.outfits.add(o as never);
        }
      }
      await db.settings.put({ key: "styleSeedVersion", value: STYLE_SEED_VERSION });
    });
  }
}
