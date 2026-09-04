"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Marca } from "./Marca";
import { useTema } from "@/lib/tema";
import { archivo } from "@/lib/fonts";

const PALETA_SABOR_BASE = ["#ED7032", "#F5BA54", "#BACC82", "#519BB4"];
const PALETA_SABOR_TAIL = ["#EC338F", "#CB8964"];

const ABAS = [
  { href: "/", label: "Calculadora" },
  { href: "/precificacao", label: "Precificação" },
  { href: "/custos", label: "Custos & produtos" },
] as const;

type Props = {
  titulo: string;
  subtitulo: string;
};

export function Cabecalho({ titulo, subtitulo }: Props) {
  const pathname = usePathname();
  const { dark, alternarTema } = useTema();

  const paletaSabor = [
    ...PALETA_SABOR_BASE,
    dark ? "#B56C76" : "#6E1F44",
    ...PALETA_SABOR_TAIL,
  ];

  return (
    <div className="col-span-full flex items-start justify-between gap-8">
      <div>
        <Marca dark={dark} height={26} className="mb-3.5" />
        <h1
          className={`${archivo.className} text-[32px] font-black leading-none tracking-[-1.2px] text-[#2C2E35] sm:text-[40px] dark:text-[#F2EFE4]`}
        >
          {titulo}
        </h1>
        <p className="mt-2 text-sm font-semibold text-[#2C2E35]/55 dark:text-[#F2EFE4]/55">
          {subtitulo}
        </p>
      </div>
      <div className="flex flex-col items-end gap-3.5">
        <div className="flex items-center gap-2">
          {ABAS.map((aba) => {
            const ativa = pathname === aba.href;
            return (
              <Link
                key={aba.href}
                href={aba.href}
                className={`rounded-[15px] border px-4 py-2 text-xs font-bold tracking-wide ${
                  ativa
                    ? "border-laranja bg-laranja text-white"
                    : "border-[#2C2E35]/25 text-[#2C2E35] hover:bg-[#2C2E35]/5 dark:border-[#F2EFE4]/25 dark:text-[#F2EFE4] dark:hover:bg-[#F2EFE4]/10"
                }`}
              >
                {aba.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={alternarTema}
            className="rounded-[15px] border border-[#2C2E35]/25 px-4 py-2 text-xs font-bold tracking-wide text-[#2C2E35] hover:bg-[#2C2E35]/5 dark:border-[#F2EFE4]/25 dark:text-[#F2EFE4] dark:hover:bg-[#F2EFE4]/10"
          >
            {dark ? "Tema claro" : "Tema escuro"}
          </button>
        </div>
        <div className="flex gap-1.5">
          {paletaSabor.map((cor, i) => (
            <span
              key={i}
              className="inline-block h-[15px] w-[15px] rounded-full"
              style={{ background: cor }}
            />
          ))}
        </div>
        <div className="text-[10px] font-semibold tracking-widest text-[#2C2E35]/40 uppercase dark:text-[#F2EFE4]/40">
          Linguagem de sabor
        </div>
      </div>
    </div>
  );
}
