interface DataPoint {
  date: string;
  whr: number;
}

interface Props {
  data: DataPoint[];
  target?: number;
  height?: number;
}

export function WhrChart({ data, target = 0.68, height = 160 }: Props) {
  if (data.length < 2) {
    return (
      <p className="text-muted text-sm text-center py-3">
        Pelo menos 2 medidas pra ver evolução. Alvo: {target.toFixed(2)}.
      </p>
    );
  }

  const w = 320;
  const h = height;
  const padding = 24;
  const max = Math.max(...data.map((d) => d.whr), target + 0.05);
  const min = Math.min(...data.map((d) => d.whr), target - 0.05);
  const range = max - min || 1;
  const stepX = (w - padding * 2) / (data.length - 1);

  const yOf = (whr: number) => padding + (1 - (whr - min) / range) * (h - padding * 2);
  const targetY = yOf(target);

  const points = data.map((d, i) => `${padding + i * stepX},${yOf(d.whr)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" xmlns="http://www.w3.org/2000/svg">
      <line x1={padding} x2={w - padding} y1={targetY} y2={targetY} stroke="#5c1a2b" strokeWidth={1} strokeDasharray="3 3" />
      <text x={w - padding - 60} y={targetY - 4} fontSize={9} fill="#a87a6a">alvo {target.toFixed(2)}</text>
      <polyline points={points} fill="none" stroke="#d4a373" strokeWidth={1.5} strokeLinejoin="round" />
      {data.map((d, i) => {
        const cx = padding + i * stepX;
        const cy = yOf(d.whr);
        return <circle key={i} cx={cx} cy={cy} r={2.5} fill="#f4e4d6" />;
      })}
      <text x={padding} y={padding - 6} fontSize={9} fill="#a87a6a">{max.toFixed(2)}</text>
      <text x={padding} y={h - 6} fontSize={9} fill="#a87a6a">{min.toFixed(2)}</text>
    </svg>
  );
}
