interface Props {
  label: string;
  count: number;
  total?: number;
  unit?: string;
  /** Sem borda própria: quatro lado a lado dentro do card da semana. */
  compacto?: boolean;
}

export function StreakCard({ label, count, total, unit = "dias", compacto = false }: Props) {
  if (compacto) {
    return (
      <div className="text-center min-w-0">
        <p className="text-muted text-[10px] uppercase truncate">{label}</p>
        <p className="font-serif text-xl text-nude leading-tight mt-0.5">
          {count}
          {total !== undefined && <span className="text-muted text-sm"> / {total}</span>}
        </p>
        <p className="text-muted text-[0.6rem]">{unit}</p>
      </div>
    );
  }
  return (
    <div className="card !p-3 text-center">
      <p className="text-muted text-xs uppercase tracking-wider">{label}</p>
      <p className="font-serif text-2xl text-nude mt-1">
        {count}
        {total !== undefined && <span className="text-muted text-base"> / {total}</span>}
      </p>
      <p className="text-muted text-[0.65rem] mt-0.5">{unit}</p>
    </div>
  );
}
