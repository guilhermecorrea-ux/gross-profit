import type { Metadata } from "next";
import "./globals.css";
import { NavAbas } from "@/components/NavAbas";

export const metadata: Metadata = {
  title: "Calculadora de Margem Vitanuts",
  description: "Margem, lucro e markup em tempo real por produto e canal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
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
      </body>
    </html>
  );
}
