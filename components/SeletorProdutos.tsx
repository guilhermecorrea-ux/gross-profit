"use client";

import { useMemo, useState } from "react";
import type { ItemCalculo, Produto } from "@/lib/types";
import { formatarBRL } from "@/lib/format";

type Props = {
  produtos: Produto[];
  itens: ItemCalculo[];
  onChange: (itens: ItemCalculo[]) => void;
};

export function SeletorProdutos({ produtos, itens, onChange }: Props) {
  const [busca, setBusca] = useState("");

  const produtosAtivos = useMemo(
    () => produtos.filter((p) => p.ativo),
    [produtos]
  );

  const produtoPorId = useMemo(
    () => new Map(produtosAtivos.map((p) => [p.id, p])),
    [produtosAtivos]
  );

  const resultadosBusca = useMemo(() => {
    if (!busca.trim()) return [];
    const termo = busca.trim().toLowerCase();
    return produtosAtivos
      .filter((p) => p.nome.toLowerCase().includes(termo))
      .slice(0, 8);
  }, [busca, produtosAtivos]);

  function adicionarProduto(produtoId: string) {
    const existente = itens.find((i) => i.produtoId === produtoId);
    if (existente) {
      onChange(
        itens.map((i) =>
          i.produtoId === produtoId
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        )
      );
    } else {
      onChange([...itens, { produtoId, quantidade: 1 }]);
    }
    setBusca("");
  }

  function atualizarQuantidade(produtoId: string, quantidade: number) {
    if (quantidade <= 0) {
      removerItem(produtoId);
      return;
    }
    onChange(
      itens.map((i) => (i.produtoId === produtoId ? { ...i, quantidade } : i))
    );
  }

  function removerItem(produtoId: string) {
    onChange(itens.filter((i) => i.produtoId !== produtoId));
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-navy/80">
        Produtos
        {itens.length >= 2 && (
          <span className="ml-2 rounded-full bg-laranja/10 px-2 py-0.5 text-xs font-semibold text-laranja-escuro">
            Kit ({itens.length} itens)
          </span>
        )}
      </label>

      <div className="relative">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produto por nome…"
          className="w-full rounded-md border border-navy/20 px-3 py-2 text-sm outline-none focus:border-laranja focus:ring-1 focus:ring-laranja"
        />
        {resultadosBusca.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-md border border-navy/10 bg-white shadow-lg">
            {resultadosBusca.map((produto) => (
              <li key={produto.id}>
                <button
                  type="button"
                  onClick={() => adicionarProduto(produto.id)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-navy/5"
                >
                  <span>{produto.nome}</span>
                  <span className="text-navy/50">
                    {formatarBRL(produto.cmv)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {itens.length > 0 && (
        <ul className="divide-y divide-navy/10 rounded-md border border-navy/10">
          {itens.map((item) => {
            const produto = produtoPorId.get(item.produtoId);
            if (!produto) return null;
            return (
              <li
                key={item.produtoId}
                className="flex items-center gap-3 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">
                    {produto.nome}
                  </p>
                  <p className="text-xs text-navy/50">
                    CMV unitário: {formatarBRL(produto.cmv)}
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantidade}
                  onChange={(e) =>
                    atualizarQuantidade(
                      item.produtoId,
                      Number(e.target.value)
                    )
                  }
                  className="w-16 rounded-md border border-navy/20 px-2 py-1 text-right text-sm outline-none focus:border-laranja focus:ring-1 focus:ring-laranja"
                />
                <button
                  type="button"
                  onClick={() => removerItem(item.produtoId)}
                  aria-label={`Remover ${produto.nome}`}
                  className="rounded-md px-2 py-1 text-sm text-laranja-escuro hover:bg-laranja-escuro/10"
                >
                  Remover
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
