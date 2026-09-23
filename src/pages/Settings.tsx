import { useState } from "react";
import { Link } from "react-router-dom";
import { useSetting } from "../hooks/useSetting";
import { setSetting } from "../lib/settings-helpers";
import { requestNotificationPermission } from "../lib/notifications";
import { encryptBackup, decryptBackup } from "../lib/backup";
import { coletarBackup, restaurarBackup, type BackupPayload } from "../lib/backup-io";
import { db } from "../lib/db";
import { hojeISO } from "../lib/today-date";

export function Settings() {
  const notif = useSetting("notificationsEnabled");
  const morning = useSetting("morningReminderTime");
  const evening = useSetting("eveningReminderTime");
  const workout = useSetting("workoutReminderTime");
  const presenca = useSetting("presencaReminderTime");
  const quietHours = useSetting("quietHours");
  const breakInterval = useSetting("activeBreakIntervalMin");
  const hydrInterval = useSetting("hydrationIntervalMin");
  const hydrGoal = useSetting("hydrationGoalMl");
  const focus = useSetting("focusModeUntil");
  const heightCm = useSetting("heightCm");
  const targetWhr = useSetting("targetWhr");
  const targetShr = useSetting("targetShoulderHipRatio");
  const pitchLow = useSetting("voicePitchTargetLowHz");
  const pitchHigh = useSetting("voicePitchTargetHighHz");

  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleNotifs() {
    if (!notif) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setError("Notificações foram bloqueadas pelo navegador. Ative em Configurações > Site.");
        return;
      }
    }
    await setSetting("notificationsEnabled", !notif);
  }

  async function pauseFocus(min: number) {
    await setSetting("focusModeUntil", Date.now() + min * 60_000);
    setInfo(`Modo foco ativo por ${min} min`);
    setTimeout(() => setInfo(null), 2500);
  }

  async function clearFocus() {
    await setSetting("focusModeUntil", null);
  }

  async function exportBackup() {
    setBusy(true);
    setError(null);
    const password = prompt("Senha pra criptografar o backup (mínimo 6 caracteres):");
    if (!password || password.length < 6) {
      setBusy(false);
      setError("Senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    try {
      const payload = await coletarBackup();
      const encrypted = await encryptBackup(payload, password);
      const blob = new Blob([encrypted], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trein-final-${hojeISO()}.trein-backup`;
      link.click();
      URL.revokeObjectURL(url);
      setInfo("Backup baixado.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no backup.");
    } finally {
      setBusy(false);
    }
  }

  async function importBackup(file: File) {
    setBusy(true);
    setError(null);
    const password = prompt("Senha do backup:");
    if (!password) {
      setBusy(false);
      return;
    }
    try {
      const encrypted = await file.text();
      const payload = await decryptBackup<BackupPayload>(encrypted, password);
      await restaurarBackup(payload);
      setInfo("Backup importado.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha na importação (senha errada ou arquivo corrompido?).");
    } finally {
      setBusy(false);
    }
  }

  async function wipeAll() {
    if (!confirm("APAGAR TUDO? Não dá pra desfazer.")) return;
    if (!confirm("Tem certeza mesmo? Vai apagar TODAS suas medidas, fotos, sessões.")) return;
    await db.delete();
    location.reload();
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-muted text-sm">&larr; Hoje</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Configurações</h1>
      </div>

      {info && <p className="text-nude text-sm">{info}</p>}
      {error && <p className="text-red-300 text-sm">{error}</p>}

      <div className="card space-y-3">
        <h2 className="text-nude-warm font-medium">Notificações</h2>
        <label className="flex items-center justify-between">
          <span className="text-sm">Ativadas</span>
          <input type="checkbox" checked={notif} onChange={() => void toggleNotifs()} />
        </label>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Manhã</label>
          <input type="time" value={morning} onChange={(e) => void setSetting("morningReminderTime", e.target.value)}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Treino</label>
          <input type="time" value={workout} onChange={(e) => void setSetting("workoutReminderTime", e.target.value)}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Noite</label>
          <input type="time" value={evening} onChange={(e) => void setSetting("eveningReminderTime", e.target.value)}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Lembrete de presença (noite)</label>
          <input type="time" value={presenca} onChange={(e) => void setSetting("presencaReminderTime", e.target.value)}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Pausa ativa a cada</label>
          <input type="number" min={30} max={240} value={breakInterval} onChange={(e) => void setSetting("activeBreakIntervalMin", Number(e.target.value))}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          <p className="text-muted text-xs mt-1">minutos</p>
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Hidratação a cada</label>
          <input type="number" min={30} max={240} value={hydrInterval} onChange={(e) => void setSetting("hydrationIntervalMin", Number(e.target.value))}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          <p className="text-muted text-xs mt-1">minutos · meta diária: {hydrGoal}ml</p>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="text-nude-warm font-medium">Quiet hours</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">De</label>
            <input type="time" value={quietHours.from} onChange={(e) => void setSetting("quietHours", { ...quietHours, from: e.target.value })}
                   className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Até</label>
            <input type="time" value={quietHours.to} onChange={(e) => void setSetting("quietHours", { ...quietHours, to: e.target.value })}
                   className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          </div>
        </div>
      </div>

      <div className="card space-y-2">
        <h2 className="text-nude-warm font-medium">Modo foco</h2>
        {focus && focus > Date.now() ? (
          <>
            <p className="text-sm">Ativo até {new Date(focus).toLocaleTimeString()}</p>
            <button onClick={() => void clearFocus()} className="text-xs text-nude underline">Desativar</button>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => void pauseFocus(30)} className="bg-bg-deep border border-bg-border rounded-md py-2 text-sm">30 min</button>
            <button onClick={() => void pauseFocus(120)} className="bg-bg-deep border border-bg-border rounded-md py-2 text-sm">2 h</button>
            <button onClick={() => void pauseFocus(480)} className="bg-bg-deep border border-bg-border rounded-md py-2 text-sm">8 h</button>
          </div>
        )}
      </div>

      <div className="card space-y-3">
        <h2 className="text-nude-warm font-medium">Silhueta</h2>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Altura (cm)</label>
          <input type="number" min={120} max={220} value={heightCm || ""} placeholder="ex.: 165"
                 onChange={(e) => void setSetting("heightCm", Number(e.target.value))}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          <p className="text-muted text-xs mt-1">Usada pra estimar a gordura corporal (método Navy).</p>
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Meta WHR (cintura/quadril)</label>
          <input type="number" step={0.01} min={0.5} max={1.1} value={targetWhr}
                 onChange={(e) => void setSetting("targetWhr", Number(e.target.value))}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          <p className="text-muted text-xs mt-1">0,72 = ampulheta forte · 0,80 = moderada.</p>
        </div>
        <div>
          <label className="block text-muted text-xs uppercase tracking-wider mb-1">Meta ombro/quadril</label>
          <input type="number" step={0.01} min={0.7} max={1.3} value={targetShr}
                 onChange={(e) => void setSetting("targetShoulderHipRatio", Number(e.target.value))}
                 className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          <p className="text-muted text-xs mt-1">1,00 = ombro no máximo igual ao quadril.</p>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="text-nude-warm font-medium">Voz</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Pitch alvo mín (Hz)</label>
            <input type="number" min={100} max={300} value={pitchLow}
                   onChange={(e) => void setSetting("voicePitchTargetLowHz", Number(e.target.value))}
                   className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1">Pitch alvo máx (Hz)</label>
            <input type="number" min={100} max={350} value={pitchHigh}
                   onChange={(e) => void setSetting("voicePitchTargetHighHz", Number(e.target.value))}
                   className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm" />
          </div>
        </div>
        <p className="text-muted text-xs">Faixa feminina típica: 165-220 Hz. Use o medidor ao vivo nos exercícios de voz.</p>
      </div>

      <div className="card space-y-2">
        <h2 className="text-nude-warm font-medium">Backup</h2>
        <button onClick={() => void exportBackup()} disabled={busy} className="w-full bg-wine text-nude-warm rounded-md py-2 text-sm disabled:opacity-50">
          {busy ? "Processando..." : "Exportar backup criptografado"}
        </button>
        <label className="block w-full bg-bg-deep border border-bg-border text-nude-warm text-center rounded-md py-2 text-sm cursor-pointer">
          Importar backup
          <input type="file" accept=".trein-backup" onChange={(e) => e.target.files?.[0] && void importBackup(e.target.files[0])} className="hidden" disabled={busy} />
        </label>
      </div>

      <div className="card space-y-2">
        <h2 className="text-nude-warm font-medium">Sistema</h2>
        <p className="text-muted text-xs">No Android, adicione o app na lista "Não otimizar bateria" pra notificações chegarem em tempo.</p>
        <button onClick={() => void wipeAll()} className="w-full bg-red-900/40 border border-red-900 text-red-200 rounded-md py-2 text-sm">
          Apagar TUDO
        </button>
      </div>
    </div>
  );
}
