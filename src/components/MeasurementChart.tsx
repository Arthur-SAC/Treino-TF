interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  unit?: string;
  height?: number;
  color?: string;
}

export function MeasurementChart({ data, unit = "cm", height = 140, color = "#d4a373" }: Props) {
  if (data.length < 2) {
    return <p className="text-muted text-sm text-center py-3">Pelo menos 2 medidas pra ver evolução.</p>;
  }

  const w = 320;
  const h = height;
  const padding = 24;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const stepX = (w - padding * 2) / (data.length - 1);

  const points = data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y = padding + (1 - (d.value - min) / range) * (h - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" xmlns="http://www.w3.org/2000/svg">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {data.map((d, i) => {
        const cx = padding + i * stepX;
        const cy = padding + (1 - (d.value - min) / range) * (h - padding * 2);
        return <circle key={i} cx={cx} cy={cy} r={2.5} fill="#f4e4d6" />;
      })}
      <text x={padding} y={padding - 6} fontSize={9} fill="#a87a6a">{max.toFixed(1)} {unit}</text>
      <text x={padding} y={h - 6} fontSize={9} fill="#a87a6a">{min.toFixed(1)} {unit}</text>
    </svg>
  );
}
