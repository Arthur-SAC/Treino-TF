// De quanto em quanto tempo pedir backup. Módulo puro.
//
// Os dados dela só existem no celular (decisão do APK: sem cópia automática
// pro Drive). Se o celular sumir sem um backup recente, somem meses de medidas
// e fotos. 15 dias é o equilíbrio entre lembrar e encher o saco.

export const INTERVALO_BACKUP_DIAS = 15;

const dia = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / 86_400_000;

/** Dias desde o último backup; `null` quando ela nunca fez. */
export function diasSemBackup(ultimo: string, hoje: string): number | null {
  return ultimo ? Math.round(dia(hoje) - dia(ultimo)) : null;
}

export function backupVencido(ultimo: string, hoje: string): boolean {
  const n = diasSemBackup(ultimo, hoje);
  return n === null || n >= INTERVALO_BACKUP_DIAS;
}
