import { useState, type FormEvent } from "react";
import type { Measurement } from "../lib/db";

type MeasurementInput = Omit<Measurement, "id">;

interface Props {
  initial?: Partial<MeasurementInput>;
  onSubmit: (m: MeasurementInput) => void | Promise<void>;
}

const FIELDS: Array<{ key: keyof MeasurementInput; label: string }> = [
  { key: "neckCm", label: "Pescoço" },
  { key: "shouldersCm", label: "Ombros" },
  { key: "chestCm", label: "Busto" },
  { key: "waistCm", label: "Cintura" },
  { key: "hipCm", label: "Quadril" },
  { key: "thighLeftCm", label: "Coxa esquerda" },
  { key: "thighRightCm", label: "Coxa direita" },
  { key: "armCm", label: "Braço" },
  { key: "forearmCm", label: "Antebraço" },
  { key: "calfCm", label: "Panturrilha" },
];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function validateCm(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const n = Number(value.replace(",", "."));
  if (!Number.isFinite(n) || n < 5 || n > 250) return undefined;
  return n;
}

export function MeasurementForm({ initial, onSubmit }: Props) {
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [values, setValues] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const { key } of FIELDS) {
      const v = initial?.[key];
      out[key] = typeof v === "number" ? String(v).replace(".", ",") : "";
    }
    return out;
  });
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [errors, setErrors] = useState<string[]>([]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const m: MeasurementInput = { date };
    const errs: string[] = [];
    for (const { key, label } of FIELDS) {
      const raw = values[key];
      if (raw.trim() === "") continue;
      const num = validateCm(raw);
      if (num === undefined) {
        errs.push(`${label}: valor inválido (entre 5 e 250 cm)`);
      } else {
        (m as Record<string, unknown>)[key] = num;
      }
    }
    if (notes.trim()) m.notes = notes.trim();
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    void onSubmit(m);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-muted text-xs uppercase tracking-wider mb-1">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">{label}</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={values[key]}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                placeholder="—"
                className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 pr-10 text-nude-warm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs">cm</span>
            </div>
          </div>
        ))}
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-wider mb-1">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
        />
      </div>
      {errors.length > 0 && (
        <ul className="text-red-300 text-sm space-y-1">
          {errors.map((er) => (
            <li key={er}>{er}</li>
          ))}
        </ul>
      )}
      <button
        type="submit"
        className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium hover:bg-wine transition"
      >
        Salvar medida
      </button>
    </form>
  );
}
