interface DataPoint {
  date: string;
  weight: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
}

export function ProgressionChart({ data, height = 160 }: Props) {
  if (data.length === 0) {
    return <p className="text-muted text-sm text-center py-4">Sem dados ainda.</p>;
  }
  if (data.length === 1) {
    return (
      <div className="text-center py-4">
        <p className="text-2xl font-serif text-nude">{data[0].weight} kg</p>
        <p className="text-muted text-xs">{data[0].date}</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.weight));
  const min = Math.min(...data.map((d) => d.weight));
  const range = max - min || 1;
  const padding = 20;
  const w = 320;
  const h = height;
  const stepX = (w - padding * 2) / (data.length - 1);

  const points = data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y = padding + (1 - (d.weight - min) / range) * (h - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" xmlns="http://www.w3.org/2000/svg">
      <polyline points={points} fill="none" stroke="#d4a373" strokeWidth={1.5} strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = padding + i * stepX;
        const y = padding + (1 - (d.weight - min) / range) * (h - padding * 2);
        return <circle key={i} cx={x} cy={y} r={2.5} fill="#f4e4d6" />;
      })}
      <text x={padding} y={padding - 4} fontSize={10} fill="#a87a6a">{max} kg</text>
      <text x={padding} y={h - 4} fontSize={10} fill="#a87a6a">{min} kg</text>
    </svg>
  );
}
