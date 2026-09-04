"use client";

import type { Produto } from "@/lib/types";
import { CATEGORIAS } from "@/lib/constants";

type Props = {
  produtos: Produto[];
  onChange: (produtos: Produto[]) => void;
};

export function TabelaProdutos({ produtos, onChange }: Props) {
  function atualizarCmv(id: string, cmv: number) {
    onChange(
      produtos.map((p) =>
        p.id === id ? { ...p, cmv: Number.isFinite(cmv) ? cmv : 0 } : p
      )
    );
  }

  function alternarAtivo(id: string) {
    onChange(
      produtos.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p))
    );
  }

  function excluirProduto(id: string) {
    onChange(produtos.filter((p) => p.id !== id));
  }

  return (
    <div className="overflow-hidden rounded-[15px] border border-[#2C2E35]/10 dark:border-[#F2EFE4]/10">
      <table className="w-full text-sm">
        <thead className="bg-[#2C2E35]/5 text-left text-[11px] tracking-wide text-[#2C2E35]/50 uppercase dark:bg-[#F2EFE4]/5 dark:text-[#F2EFE4]/50">
          <tr>
            <th className="px-3 py-2 font-semibold">Produto</th>
            <th className="px-3 py-2 font-semibold">Categoria</th>
            <th className="px-3 py-2 font-semibold">CMV (R$)</th>
            <th className="px-3 py-2 font-semibold">Ativo</th>
            <th className="px-3 py-2 font-semibold" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2C2E35]/10 dark:divide-[#F2EFE4]/10">
          {produtos.map((produto) => {
            const categoriaLabel =
              CATEGORIAS.find((c) => c.id === produto.categoria)?.label ??
              produto.categoria;
            return (
              <tr key={produto.id} className={produto.ativo ? "" : "opacity-50"}>
                <td className="px-3 py-2 text-[#2C2E35] dark:text-[#F2EFE4]">
                  {produto.nome}
                  {produto.origem === "custom" && (
                    <span className="ml-2 rounded-full bg-[#2C2E35]/10 px-2 py-0.5 text-xs text-[#2C2E35]/60 dark:bg-[#F2EFE4]/10 dark:text-[#F2EFE4]/60">
                      custom
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-[#2C2E35]/60 dark:text-[#F2EFE4]/60">
                  {categoriaLabel}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={produto.cmv}
                    onChange={(e) =>
                      atualizarCmv(produto.id, Number(e.target.value))
                    }
                    className="w-24 rounded-[15px] border border-[#2C2E35]/20 bg-white px-2 py-1 text-right text-sm tabular-nums text-[#2C2E35] outline-none focus:border-laranja focus:ring-1 focus:ring-laranja dark:border-[#F2EFE4]/20 dark:bg-[#1F1F19] dark:text-[#F2EFE4]"
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => alternarAtivo(produto.id)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      produto.ativo
                        ? "bg-verde/15 text-verde"
                        : "bg-[#2C2E35]/10 text-[#2C2E35]/50 dark:bg-[#F2EFE4]/10 dark:text-[#F2EFE4]/50"
                    }`}
                  >
                    {produto.ativo ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="px-3 py-2 text-right">
                  {produto.origem === "custom" && (
                    <button
                      type="button"
                      onClick={() => excluirProduto(produto.id)}
                      className="text-xs text-laranja-escuro hover:underline"
                    >
                      Excluir
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
