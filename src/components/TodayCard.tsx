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
  const variantCls = variant === "highlight" ? "bg-gradient-to-br from-verm to-verm-2 border-verm-3 text-white shadow-lg shadow-verm-3/30" : "hover:border-nude/40";
  const claro = variant === "highlight";
  const inner = (
    <>
      <div className="flex justify-between items-baseline">
        <h3 className={`font-medium ${claro ? "text-white" : "text-nude-warm"}`}>{title}</h3>
        {rightSlot}
      </div>
      {subtitle && <p className={`text-sm mt-1 ${claro ? "text-white/90" : "text-muted"}`}>{subtitle}</p>}
      {note && <p className={`text-xs mt-1 opacity-80 ${claro ? "text-white" : "text-muted"}`}>{note}</p>}
    </>
  );
  if (to) {
    return <Link to={to} className={`${base} ${variantCls}`}>{inner}</Link>;
  }
  return <div className={`card ${variantCls}`}>{inner}</div>;
}
