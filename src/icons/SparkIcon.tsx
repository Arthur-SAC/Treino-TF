import type { SVGProps } from "react";

/** Ícone da aba Vitalidade. Deliberadamente abstrato — uma chama/faísca, não um
 *  símbolo que descreva o conteúdo. O rótulo da aba fica visível pra quem olhar
 *  o celular dela, e o ambiente onde ela mora não é receptivo; o ícone segue a
 *  mesma regra que o texto: "Vitalidade" nunca descreve o que conta. */
export function SparkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3c.9 3 2.6 4.3 4 5.7 1.6 1.6 2.4 3.2 2.4 5A6.4 6.4 0 0 1 12 21a6.4 6.4 0 0 1-6.4-7.3c.2-1.8 1-3.4 2.5-5C9.4 7.3 11.1 6 12 3z" />
      <path d="M12 21a3 3 0 0 0 3-3c0-1.4-1.2-2.3-3-4.6-1.8 2.3-3 3.2-3 4.6a3 3 0 0 0 3 3z" />
    </svg>
  );
}
