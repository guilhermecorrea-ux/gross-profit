const formatadorBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatadorPercentual = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const formatadorMarkup = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatarBRL(valor: number): string {
  if (!Number.isFinite(valor)) return "—";
  return formatadorBRL.format(valor);
}

export function formatarPercentual(decimal: number): string {
  if (!Number.isFinite(decimal)) return "—";
  return `${formatadorPercentual.format(decimal * 100)}%`;
}

export function formatarMarkup(markup: number | null): string {
  if (markup === null || !Number.isFinite(markup)) return "—";
  return `${formatadorMarkup.format(markup)}x`;
}

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
