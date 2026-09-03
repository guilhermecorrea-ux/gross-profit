import type { Canal } from "@/lib/types";

export const canaisSeed: Canal[] = [
  {
    id: "site",
    nome: "Site (DTC)",
    taxas: [
      {
        id: "imposto",
        nome: "Imposto",
        tipo: "percentual",
        valor: 15,
        base: "preco",
        editavel: true,
      },
      {
        id: "adspend",
        nome: "Adspend",
        tipo: "percentual",
        valor: 28,
        base: "preco",
        editavel: true,
      },
      {
        id: "gateway",
        nome: "Taxa de plataforma",
        tipo: "percentual",
        valor: 3,
        base: "preco",
        editavel: true,
      },
      {
        id: "frete",
        nome: "Custo de frete",
        tipo: "fixo",
        valor: 0,
        base: "preco",
        editavel: true,
      },
    ],
  },
];
