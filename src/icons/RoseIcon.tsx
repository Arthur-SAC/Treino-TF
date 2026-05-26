import type { SVGProps } from "react";

export function RoseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 21 L6 12" />
      <path d="M6 12 C6 6, 10 4, 12 8 C14 4, 18 6, 18 12" />
      <circle cx="12" cy="10" r="1.5" />
    </svg>
  );
}
