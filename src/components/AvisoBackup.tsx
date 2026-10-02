import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { backupVencido, diasSemBackup } from "../lib/backup-lembrete";
import { hojeISO } from "../lib/today-date";

/** Os dados só existem no celular: sem backup recente, perder o aparelho é
 *  perder meses de medidas e fotos. Some quando ela exporta. */
export function AvisoBackup() {
  // useLiveQuery direto (e não useSetting): o useSetting devolve o padrão ("")
  // enquanto carrega, e o card piscaria pra quem já fez backup.
  const ultimo = useLiveQuery(async () => ((await db.settings.get("ultimoBackupEm"))?.value as string | undefined) ?? "", []);
  if (ultimo === undefined) return null;
  const hoje = hojeISO();
  if (!backupVencido(ultimo, hoje)) return null;
  const n = diasSemBackup(ultimo, hoje);
  return (
    <div className="card border-wine-light mb-3">
      <p className="text-nude-warm text-sm">
        {n === null ? "Você ainda não fez backup" : `Faz ${n} dias sem backup`} — seus dados só existem neste celular.
      </p>
      <Link to="/configuracoes" className="mt-2 block w-full bg-wine text-nude-warm rounded-md py-2 text-sm text-center">Fazer backup</Link>
    </div>
  );
}
