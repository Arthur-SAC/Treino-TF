// Uma linha que responde "estou progredindo?": treinos da semana contra os 5 do
// plano, e peso e cintura contra a partida. Na fase 1 os dois números descem;
// na fase 2 o peso sobe de propósito — por isso o card mostra o número, não um
// julgamento.
const sinal = (n: number, unidade: string) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("pt-BR")} ${unidade}`;

export function SemanaCard({
  treinos,
  variacao,
}: {
  treinos: number;
  variacao: { pesoKg: number | null; cinturaCm: number | null } | null;
}) {
  const partes: string[] = [];
  if (variacao?.pesoKg !== null && variacao?.pesoKg !== undefined) partes.push(`peso ${sinal(variacao.pesoKg, "kg")}`);
  if (variacao?.cinturaCm !== null && variacao?.cinturaCm !== undefined) partes.push(`cintura ${sinal(variacao.cinturaCm, "cm")}`);
  return (
    <div className="card">
      <p className="text-muted text-xs uppercase tracking-wider">Esta semana</p>
      <p className="text-nude-warm text-sm mt-1">{Math.min(treinos, 5)}/5 treinos</p>
      {partes.length > 0 && <p className="text-muted text-xs mt-1">Desde a partida: {partes.join(" · ")}</p>}
    </div>
  );
}
