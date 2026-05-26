export function formatCm(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " cm";
}

export function formatKg(value: number): string {
  const isInteger = Number.isInteger(value);
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: isInteger ? 0 : 1,
    maximumFractionDigits: 1,
  }) + " kg";
}

export function formatDateBR(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatRelativeDays(days: number): string {
  if (days === 0) return "hoje";
  if (days === 1) return "ontem";
  if (days > 0) return `há ${days} ${days === 1 ? "dia" : "dias"}`;
  const abs = Math.abs(days);
  return `em ${abs} ${abs === 1 ? "dia" : "dias"}`;
}
