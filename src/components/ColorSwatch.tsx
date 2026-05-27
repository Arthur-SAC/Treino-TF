interface Props {
  color: string;
  label?: string;
}

export function ColorSwatch({ color, label }: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-14 h-14 rounded-card border border-bg-border"
        style={{ backgroundColor: color }}
      />
      {label && <span className="text-muted text-[0.65rem]">{label}</span>}
    </div>
  );
}
