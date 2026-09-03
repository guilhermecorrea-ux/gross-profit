"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/", label: "Calculadora" },
  { href: "/custos", label: "Custos & Produtos" },
] as const;

export function NavAbas() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 rounded-lg bg-white/10 p-1">
      {ABAS.map((aba) => {
        const ativa = pathname === aba.href;
        return (
          <Link
            key={aba.href}
            href={aba.href}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              ativa
                ? "bg-laranja text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {aba.label}
          </Link>
        );
      })}
    </nav>
  );
}
