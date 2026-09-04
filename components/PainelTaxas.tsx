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
      taxas.map((t) =>
        t.id === id ? { ...t, valor: Number.isFinite(valor) ? valor : 0 } : t
      )
    );
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <div className="text-[11px] font-semibold tracking-wide text-[#2C2E35]/50 uppercase dark:text-[#F2EFE4]/50">
          Taxas do canal
        </div>
        <button
          type="button"
          onClick={onRestaurarPadroes}
          className="text-[11px] text-[#2C2E35]/45 underline hover:text-laranja-escuro dark:text-[#F2EFE4]/45"
        >
          restaurar padrões
        </button>
      </div>

      {taxas.map((taxa) => (
        <div
          key={taxa.id}
          className="flex items-center justify-between border-b border-[#2C2E35]/10 py-2 last:border-b-0 dark:border-[#F2EFE4]/10"
        >
          <span className="text-[13px] text-[#2C2E35] dark:text-[#F2EFE4]">
            {taxa.nome}
          </span>
          <div className="flex items-baseline gap-0.5">
            {taxa.tipo === "fixo" && (
              <span className="text-[13px] text-[#2C2E35] dark:text-[#F2EFE4]">
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
              onChange={(e) => atualizarValor(taxa.id, Number(e.target.value))}
              className={`border-0 border-b border-dashed border-[#2C2E35]/30 bg-transparent py-0.5 text-right text-[13px] font-semibold text-[#2C2E35] outline-none tabular-nums disabled:opacity-50 dark:border-[#F2EFE4]/30 dark:text-[#F2EFE4] ${
                taxa.tipo === "fixo" ? "w-12" : "w-8"
              }`}
            />
            {taxa.tipo === "percentual" && (
              <span className="text-[13px] text-[#2C2E35] dark:text-[#F2EFE4]">
                %
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
