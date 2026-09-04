"use client";

import { usePathname } from "next/navigation";
import { NavAbas } from "./NavAbas";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/") {
    return <div className="flex flex-1 flex-col">{children}</div>;
  }

  return (
    <>
      <header className="border-b border-navy/10 bg-navy text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm font-semibold tracking-wide text-amarelo">
              VITANUTS
            </p>
            <h1 className="text-lg font-semibold leading-tight">
              Calculadora de Margem
            </h1>
          </div>
          <NavAbas />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </>
  );
}
