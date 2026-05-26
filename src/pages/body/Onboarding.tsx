import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { db, type Measurement, type ProgressPhoto } from "../../lib/db";
import { MeasurementForm } from "../../components/MeasurementForm";
import { compressImage } from "../../lib/image-compress";

const PRESET_MEASUREMENT: Partial<Measurement> = {
  neckCm: 40,
  shouldersCm: 120.5,
  chestCm: 106.5,
  waistCm: 99,
  hipCm: 114,
  thighLeftCm: 82.5,
  thighRightCm: 82.5,
  armCm: 34,
  forearmCm: 27.5,
  calfCm: 42,
};

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [busy, setBusy] = useState(false);
  const [photosImported, setPhotosImported] = useState({ self: 0, goal: 0 });
  const [importTag, setImportTag] = useState<ProgressPhoto["tag"]>("front");

  async function handleSaveMeasurement(m: Omit<Measurement, "id">) {
    await db.measurements.add(m as Measurement);
    setStep(2);
  }

  async function handleImportPhotos(category: "self" | "goal", e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
    let added = 0;
    for (const file of Array.from(files)) {
      try {
        const blob = await compressImage(file);
        await db.photos.add({
          date: new Date().toISOString().slice(0, 10),
          blob,
          tag: importTag,
          category,
        } as ProgressPhoto);
        added++;
      } catch {
        // pula imagem com falha
      }
    }
    setPhotosImported((p) => ({ ...p, [category]: p[category] + added }));
    setBusy(false);
    e.target.value = "";
  }

  async function finish() {
    await db.settings.put({ key: "onboarded", value: true });
    navigate("/corpo", { replace: true });
  }

  return (
    <div className="p-4 pb-24 max-w-md mx-auto">
      <p className="text-muted text-xs uppercase tracking-wider mb-2">Passo {step} de 4</p>
      <h1 className="font-serif text-2xl text-nude mb-4">Bem-vinda ao Trein-Final</h1>

      {step === 1 && (
        <div className="card">
          <h2 className="text-nude-warm font-medium mb-1">Suas medidas atuais</h2>
          <p className="text-muted text-sm mb-3">
            Pré-preenchidas com as medidas que você já tem. Confirma e ajusta se mudou alguma coisa.
          </p>
          <MeasurementForm initial={PRESET_MEASUREMENT} onSubmit={handleSaveMeasurement} />
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2 className="text-nude-warm font-medium mb-1">Suas fotos atuais</h2>
          <p className="text-muted text-sm mb-3">
            Selecione as fotos da pasta <code className="text-nude">eu/</code> no seu computador (ou da galeria, se você já transferiu pro celular).
          </p>
          <p className="text-muted text-xs mb-1">Qual vista são essas fotos?</p>
          <div className="flex gap-2 mb-3">
            {(["front", "side", "back", "custom"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setImportTag(t)}
                className={`flex-1 py-2 rounded-md text-xs ${
                  importTag === t ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                }`}
              >
                {t === "front" ? "Frente" : t === "side" ? "Lado" : t === "back" ? "Costas" : "Outra"}
              </button>
            ))}
          </div>
          <label className="block w-full bg-wine text-nude-warm text-center rounded-md py-3 font-medium cursor-pointer hover:bg-wine-light transition">
            {busy ? "Processando..." : photosImported.self ? `${photosImported.self} foto(s) importada(s) — escolher mais?` : "Escolher fotos atuais"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImportPhotos("self", e)}
              disabled={busy}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => setStep(3)}
            disabled={busy}
            className="w-full mt-3 bg-bg-deep border border-bg-border text-nude-warm rounded-md py-2"
          >
            {photosImported.self > 0 ? "Próximo" : "Pular (adicionar depois)"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h2 className="text-nude-warm font-medium mb-1">Suas fotos objetivo</h2>
          <p className="text-muted text-sm mb-3">
            As referências de corpo-alvo que você salvou na pasta <code className="text-nude">objetivo/</code>.
          </p>
          <p className="text-muted text-xs mb-1">Qual vista são essas fotos?</p>
          <div className="flex gap-2 mb-3">
            {(["front", "side", "back", "custom"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setImportTag(t)}
                className={`flex-1 py-2 rounded-md text-xs ${
                  importTag === t ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                }`}
              >
                {t === "front" ? "Frente" : t === "side" ? "Lado" : t === "back" ? "Costas" : "Outra"}
              </button>
            ))}
          </div>
          <label className="block w-full bg-wine text-nude-warm text-center rounded-md py-3 font-medium cursor-pointer hover:bg-wine-light transition">
            {busy ? "Processando..." : photosImported.goal ? `${photosImported.goal} foto(s) importada(s) — escolher mais?` : "Escolher fotos objetivo"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImportPhotos("goal", e)}
              disabled={busy}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => setStep(4)}
            disabled={busy}
            className="w-full mt-3 bg-bg-deep border border-bg-border text-nude-warm rounded-md py-2"
          >
            {photosImported.goal > 0 ? "Próximo" : "Pular (adicionar depois)"}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="card text-center space-y-4">
          <h2 className="font-serif text-2xl text-nude">Pronto.</h2>
          <p className="text-muted text-sm">
            Você pode adicionar mais medidas e fotos a qualquer momento na aba <strong>Corpo</strong>.
            Treino, beleza e trilha chegam nas próximas atualizações.
          </p>
          <button
            type="button"
            onClick={finish}
            className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium"
          >
            Começar
          </button>
        </div>
      )}
    </div>
  );
}
