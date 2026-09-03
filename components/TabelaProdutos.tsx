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
    <div className="overflow-hidden rounded-lg border border-navy/10">
      <table className="w-full text-sm">
        <thead className="bg-navy/5 text-left text-xs uppercase tracking-wide text-navy/50">
          <tr>
            <th className="px-3 py-2 font-medium">Produto</th>
            <th className="px-3 py-2 font-medium">Categoria</th>
            <th className="px-3 py-2 font-medium">CMV (R$)</th>
            <th className="px-3 py-2 font-medium">Ativo</th>
            <th className="px-3 py-2 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/10">
          {produtos.map((produto) => {
            const categoriaLabel =
              CATEGORIAS.find((c) => c.id === produto.categoria)?.label ??
              produto.categoria;
            return (
              <tr key={produto.id} className={produto.ativo ? "" : "opacity-50"}>
                <td className="px-3 py-2 text-navy">
                  {produto.nome}
                  {produto.origem === "custom" && (
                    <span className="ml-2 rounded-full bg-navy/10 px-2 py-0.5 text-xs text-navy/60">
                      custom
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-navy/60">{categoriaLabel}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={produto.cmv}
                    onChange={(e) =>
                      atualizarCmv(produto.id, Number(e.target.value))
                    }
                    className="w-24 rounded-md border border-navy/20 px-2 py-1 text-right text-sm outline-none focus:border-laranja focus:ring-1 focus:ring-laranja"
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => alternarAtivo(produto.id)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      produto.ativo
                        ? "bg-verde/15 text-verde"
                        : "bg-navy/10 text-navy/50"
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
