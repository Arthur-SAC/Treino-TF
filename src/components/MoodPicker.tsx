interface Props {
  value: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
}

const LABELS: Record<number, string> = {
  1: "Péssimo",
  2: "Ruim",
  3: "Médio",
  4: "Bom",
  5: "Ótimo",
};

// 5 círculos com intensidade crescente de cor (de cinza-rosado a coral claro)
export const COLORS: Record<number, string> = {
  1: "#8a6a68",
  2: "#9e1430",
  3: "#c81d3a",
  4: "#e23b3b",
  5: "#f08a7e",
};

export function MoodPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {([1, 2, 3, 4, 5] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-md transition ${
            value === v ? "bg-bg-raised border border-nude" : "bg-bg-deep border border-bg-border"
          }`}
        >
          <div
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: COLORS[v], opacity: value === v ? 1 : 0.5 }}
          />
          <span className={`text-[0.65rem] ${value === v ? "text-nude" : "text-muted"}`}>
            {LABELS[v]}
          </span>
        </button>
      ))}
    </div>
  );
}
