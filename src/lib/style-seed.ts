import { db, type Garment, type StyleMode } from "./db";
import { GARMENTS } from "../data/garments-seed";
import { INITIAL_PALETTE } from "../data/palette-seed";
import { OUTFITS } from "../data/outfits-seed";

// Exportada (e não mais local a este módulo) porque era o único seed grande
// cuja versão nenhum teste de chegada alcançava — a mesma configuração que já
// custou seis correções perdidas neste projeto.
//
// v3 (histórico): peças e combinações passaram a ser reescritas por versão, em
// vez das duas flags booleanas que só sabiam responder "já rodou?".
// v4: `discretion` (discreto/livre) vira `mode` (publico/casa/intimo), as peças
// de casa passam a declarar se marcam por contato ou por contraste, e o
// guarda-roupa íntimo ganha as peças DE USAR — que não existiam: as doze peças
// íntimas do app eram todas de olhar, e a recomendada para o atrito era renda.
export const STYLE_SEED_VERSION = 4;

/** Traduz o dado antigo. `intimate` é o desempate do "livre": era o único jeito
 *  de separar o que é da noiva do que é de andar pela casa. */
function modoDoValorAntigo(g: { discretion?: string; category?: string; mode?: string }): StyleMode {
  if (g.mode === "publico" || g.mode === "casa" || g.mode === "intimo") return g.mode;
  if (g.discretion === "discreto") return "publico";
  return g.category === "intimate" ? "intimo" : "casa";
}

/** Converte todas as peças do banco para os três modos — inclusive as que ela
 *  criou, que o seed não conhece. */
export async function migrarModos(): Promise<void> {
  const todas = await db.garments.toArray();
  for (const g of todas) {
    const modo = modoDoValorAntigo(g as never);
    if (g.mode === modo && !("discretion" in g)) continue;
    // `discretion` sai do registro junto: deixar o campo velho ao lado do novo
    // é convite pra uma tela ler o antigo e outra o novo, que é exatamente como
    // regra duplicada diverge em silêncio.
    const { discretion: _antigo, ...resto } = g as Garment & { discretion?: string };
    await db.garments.put({ ...resto, mode: modo } as Garment);
  }
}

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
  const sv = await db.settings.get("styleSeedVersion");
  if (((sv?.value as number) ?? 0) < STYLE_SEED_VERSION) {
    await db.transaction("rw", [db.garments, db.outfits, db.settings], async () => {
      // Primeiro migra TUDO o que está no banco — inclusive as peças que ela
      // criou, que o seed não conhece e nunca reescreveria.
      await migrarModos();
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
