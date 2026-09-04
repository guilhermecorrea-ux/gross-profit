import Image from "next/image";

const DIMENSOES = {
  ink: { w: 611, h: 133 },
  white: { w: 1081, h: 288 },
} as const;

type Props = {
  dark: boolean;
  height?: number;
  className?: string;
};

export function Marca({ dark, height = 26, className }: Props) {
  const variante = dark ? "white" : "ink";
  const { w, h } = DIMENSOES[variante];

  return (
    <Image
      src={`/brand/vitanuts-logo-${variante}.png`}
      alt="Vitanuts"
      width={Math.round((w / h) * height)}
      height={height}
      className={className}
      priority
    />
  );
}
