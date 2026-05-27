interface Props {
  label: string;
  count: number;
  total?: number;
  unit?: string;
}

export function StreakCard({ label, count, total, unit = "dias" }: Props) {
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
