import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  note?: string;
  to?: string;
  variant?: "default" | "highlight";
  rightSlot?: ReactNode;
}

export function TodayCard({ title, subtitle, note, to, variant = "default", rightSlot }: Props) {
  const base = "card block transition";
  const variantCls = variant === "highlight" ? "bg-wine/40 border-wine-light" : "hover:border-nude/40";
  const inner = (
    <>
      <div className="flex justify-between items-baseline">
        <h3 className="text-nude-warm font-medium">{title}</h3>
        {rightSlot}
      </div>
      {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
      {note && <p className="text-muted text-xs mt-1 opacity-80">{note}</p>}
    </>
  );
  if (to) {
    return <Link to={to} className={`${base} ${variantCls}`}>{inner}</Link>;
  }
  return <div className={`card ${variantCls}`}>{inner}</div>;
}
