import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, type SkincareRoutine } from "../../lib/db";

type Step = SkincareRoutine["steps"][number];

export function SkincareNew() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [time, setTime] = useState<SkincareRoutine["time"]>("morning");
  const [target, setTarget] = useState<SkincareRoutine["target"]>("face");
  const [steps, setSteps] = useState<Step[]>([{ productName: "", technique: "", waitMin: 0 }]);

  function updateStep(i: number, patch: Partial<Step>) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function addStep() {
    setSteps((prev) => [...prev, { productName: "", technique: "", waitMin: 0 }]);
  }

  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const cleanSteps = steps.filter((s) => s.productName.trim() !== "");
    if (cleanSteps.length === 0) return;
    await db.skincareRoutines.add({ name: name.trim(), time, target, steps: cleanSteps } as SkincareRoutine);
    navigate("/beleza/pele-cabelo/skincare", { replace: true });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/beleza/pele-cabelo/skincare" className="text-muted text-sm">&larr; Skincare</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Nova rotina</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Rosto noite com retinol"
            className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Horário</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value as SkincareRoutine["time"])}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            >
              <option value="morning">Manhã</option>
              <option value="evening">Noite</option>
            </select>
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Área</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as SkincareRoutine["target"])}
              className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm"
            >
              <option value="face">Rosto</option>
              <option value="back">Costas</option>
              <option value="armpit">Axila</option>
              <option value="intimate">Íntima</option>
              <option value="general">Geral</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-muted text-xs uppercase tracking-wider">Passos</label>
            <button type="button" onClick={addStep} className="text-nude text-xs">+ adicionar</button>
          </div>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={i} className="card !p-3 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-muted text-xs">Passo {i + 1}</span>
                  {steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(i)} className="text-muted text-xs hover:text-red-300">
                      remover
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={s.productName}
                  onChange={(e) => updateStep(i, { productName: e.target.value })}
                  placeholder="Nome do produto"
                  className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
                />
                <textarea
                  value={s.technique}
                  onChange={(e) => updateStep(i, { technique: e.target.value })}
                  placeholder="Como aplicar (técnica)"
                  rows={2}
                  className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={s.waitMin}
                    onChange={(e) => updateStep(i, { waitMin: Number(e.target.value) })}
                    className="w-20 bg-bg-deep border border-bg-border rounded-md px-2 py-1.5 text-nude-warm text-sm"
                  />
                  <span className="text-muted text-xs">min de espera</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium"
        >
          Salvar rotina
        </button>
      </form>
    </div>
  );
}
