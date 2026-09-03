"use client";

import type { Taxa } from "@/lib/types";

type Props = {
  taxas: Taxa[];
  onChange: (taxas: Taxa[]) => void;
  onRestaurarPadroes: () => void;
};

export function PainelTaxas({ taxas, onChange, onRestaurarPadroes }: Props) {
  function atualizarValor(id: string, valor: number) {
    onChange(
      taxas.map((t) => (t.id === id ? { ...t, valor: Number.isFinite(valor) ? valor : 0 } : t))
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-navy/80">
          Taxas do canal
        </label>
        <button
          type="button"
          onClick={onRestaurarPadroes}
          className="text-xs text-navy/50 underline decoration-dotted hover:text-laranja-escuro"
        >
          restaurar padrões
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {taxas.map((taxa) => (
          <div key={taxa.id}>
            <label
              htmlFor={`taxa-${taxa.id}`}
              className="block text-xs text-navy/60"
            >
              {taxa.nome}
            </label>
            <div className="relative mt-1">
              {taxa.tipo === "fixo" && (
                <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-sm text-navy/40">
                  R$
                </span>
              )}
              <input
                id={`taxa-${taxa.id}`}
                type="number"
                step="0.01"
                min={0}
                disabled={!taxa.editavel}
                value={taxa.valor}
                onChange={(e) =>
                  atualizarValor(taxa.id, Number(e.target.value))
                }
                placeholder={taxa.tipo === "fixo" ? "0,00" : "0"}
                className={`w-full rounded-md border border-navy/20 py-1.5 text-sm outline-none focus:border-laranja focus:ring-1 focus:ring-laranja disabled:bg-navy/5 ${
                  taxa.tipo === "fixo" ? "pl-8 pr-2" : "pl-2 pr-6"
                }`}
              />
              {taxa.tipo === "percentual" && (
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-navy/40">
                  %
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
