import type { SVGProps } from "react";

export function TagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12V4h8l9 9-8 8-9-9z" />
      <circle cx="7.5" cy="8.5" r="1" />
    </svg>
  );
}
