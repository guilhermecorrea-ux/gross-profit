"use client";

import { TemaProvider } from "@/lib/tema";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return <TemaProvider>{children}</TemaProvider>;
}
