import type { SVGProps } from "react";

export function RulerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="9" width="18" height="6" rx="1" />
      <line x1="7" y1="9" x2="7" y2="11" />
      <line x1="11" y1="9" x2="11" y2="13" />
      <line x1="15" y1="9" x2="15" y2="11" />
      <line x1="19" y1="9" x2="19" y2="13" />
    </svg>
  );
}
