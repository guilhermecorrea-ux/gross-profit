// Limites do semáforo de margem — únicos ajustáveis para toda a interface.
export const LIMITE_MARGEM_VERMELHA = 0.05;
export const LIMITE_MARGEM_AMARELA = 0.15;

export type CorMargem = "vermelho" | "amarelo" | "verde" | "neutro";

export function corDaMargem(margem: number): CorMargem {
  if (!Number.isFinite(margem)) return "neutro";
  if (margem < LIMITE_MARGEM_VERMELHA) return "vermelho";
  if (margem < LIMITE_MARGEM_AMARELA) return "amarelo";
  return "verde";
}

export const CATEGORIAS: { id: string; label: string }[] = [
  { id: "pasta-205g", label: "Pasta 205g" },
  { id: "pasta-500g", label: "Pasta 500g" },
  { id: "barrinha", label: "Barrinha" },
  { id: "doce-de-leite", label: "Doce de leite" },
  { id: "outro", label: "Outro" },
];
