import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { useState } from "react";
import { db, type StylePalette } from "../../../lib/db";
import { BeautyTabs } from "../../../components/BeautyTabs";
import { StyleTabs } from "../../../components/StyleTabs";
import { ColorSwatch } from "../../../components/ColorSwatch";
import { DisclaimerCard } from "../../../components/DisclaimerCard";

const SUBTONE_LABEL: Record<StylePalette["subtone"], string> = {
  warm: "Quente",
  cool: "Frio",
  neutral: "Neutro",
};

const CONTRAST_LABEL: Record<StylePalette["contrast"], string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
};

export function PaletteView() {
  const palette = useLiveQuery(async () => (await db.stylePalette.toArray())[0], []);
  const [showWizard, setShowWizard] = useState(false);
  const [subtone, setSubtone] = useState<StylePalette["subtone"]>("warm");
  const [contrast, setContrast] = useState<StylePalette["contrast"]>("medium");

  async function reanalyze() {
    if (!palette?.id) return;
    await db.stylePalette.update(palette.id, { subtone, contrast, reanalyzed: true });
    setShowWizard(false);
  }

  if (!palette) {
    return <div className="p-4 text-muted text-sm">Carregando…</div>;
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Estilo</h1>
      </div>
      <BeautyTabs />
      <StyleTabs />

      {!palette.reanalyzed && (
        <DisclaimerCard text="Esta análise é inicial — inferida pelas suas fotos em luz de cabine. Pra confirmar, faça o wizard de re-análise em luz natural (de dia, perto da janela)." />
      )}

      <div className="card mt-3">
        <h2 className="text-nude-warm font-medium mb-3">Sua paleta atual</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Subtom</p>
            <p className="text-nude-warm">{SUBTONE_LABEL[palette.subtone]}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Contraste</p>
            <p className="text-nude-warm">{CONTRAST_LABEL[palette.contrast]}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowWizard((v) => !v)}
          className="text-nude text-sm underline"
        >
          {showWizard ? "Cancelar" : palette.reanalyzed ? "Re-analisar" : "Confirmar em luz natural"}
        </button>

        {showWizard && (
          <div className="mt-4 pt-4 border-t border-bg-border space-y-3">
            <p className="text-muted text-sm">
              Faça em luz natural (perto da janela, sem luz amarela artificial). Tire uma foto sem maquiagem.
            </p>
            <div>
              <label className="block text-muted text-xs uppercase tracking-wider mb-1">Veia do pulso parece</label>
              <div className="flex gap-2">
                {(["warm", "cool", "neutral"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubtone(s)}
                    className={`flex-1 py-2 rounded-md text-sm ${
                      subtone === s ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                    }`}
                  >
                    {s === "warm" ? "Esverdeada (quente)" : s === "cool" ? "Azulada (fria)" : "Mista (neutra)"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-muted text-xs uppercase tracking-wider mb-1">Contraste cabelo × pele</label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setContrast(c)}
                    className={`flex-1 py-2 rounded-md text-sm ${
                      contrast === c ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                    }`}
                  >
                    {CONTRAST_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void reanalyze()}
              className="w-full bg-wine-light text-nude-warm rounded-md py-2 text-sm"
            >
              Salvar nova análise
            </button>
          </div>
        )}
      </div>

      <div className="card mt-3">
        <h2 className="text-nude-warm font-medium mb-3">Cores que te favorecem</h2>
        <div className="flex flex-wrap gap-3">
          {palette.favorableColors.map((c) => (
            <ColorSwatch key={c} color={c} />
          ))}
        </div>
      </div>

      <div className="card mt-3">
        <h2 className="text-nude-warm font-medium mb-3">Cores que te apagam</h2>
        <div className="flex flex-wrap gap-3">
          {palette.unfavorableColors.map((c) => (
            <ColorSwatch key={c} color={c} />
          ))}
        </div>
        <p className="text-muted text-xs mt-3">
          Não significa que você nunca pode usar — apenas que ficam melhor longe do rosto (em saias, calças, sapatos), e melhor ainda com algo da sua paleta perto do pescoço.
        </p>
      </div>
    </div>
  );
}
