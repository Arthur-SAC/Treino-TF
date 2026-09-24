import { useState } from "react";
import { restaurarBackup, type BackupPayload } from "../lib/backup-io";
import { decryptBackup } from "../lib/backup";
import { isNativo } from "../lib/plataforma";

// accept=".trein-backup" derruba o app no APK: o seletor do Capacitor troca a
// extensão pelo MIME e, sem MIME conhecido, lê uma lista vazia (revisão final).
export function RestaurarBackup({ rotulo = "Importar backup", onPronto }: { rotulo?: string; onPronto?: () => void }) {
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [ocupada, setOcupada] = useState(false);

  async function importar(file: File) {
    setErro(null);
    // No APK o seletor não filtra pela extensão (ver o input): confere aqui.
    if (!file.name.endsWith(".trein-backup")) {
      setErro("Esse arquivo não é um backup do app (termina em .trein-backup).");
      return;
    }
    const senha = prompt("Senha do backup:");
    if (!senha) return;
    setOcupada(true);
    try {
      const payload = await decryptBackup<BackupPayload>(await file.text(), senha);
      await restaurarBackup(payload);
      setOk(true);
      onPronto?.();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha na importação (senha errada ou arquivo corrompido?).");
    } finally {
      setOcupada(false);
    }
  }

  return (
    <div>
      <label className="block w-full bg-bg-deep border border-bg-border text-nude-warm text-center rounded-md py-2 text-sm cursor-pointer">
        {ocupada ? "Restaurando…" : rotulo}
        <input type="file" accept={isNativo() ? undefined : ".trein-backup"} aria-label={rotulo} className="hidden" disabled={ocupada}
          onChange={(e) => e.target.files?.[0] && void importar(e.target.files[0])} />
      </label>
      {ok && <p className="text-nude text-sm mt-1">Backup importado.</p>}
      {erro && <p className="text-red-300 text-sm mt-1">{erro}</p>}
    </div>
  );
}
