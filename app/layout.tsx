import type { Metadata } from "next";
import "./globals.css";
import { archivo } from "@/lib/fonts";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Calculadora de Margem Vitanuts",
  description: "Margem, lucro e markup em tempo real por produto e canal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`h-full antialiased ${archivo.variable}`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
