"use client";

import { useRef, useState } from "react";
import { useDados } from "@/lib/storage";
import { exportarJSON, importarJSON } from "@/lib/storage";
import { slugify } from "@/lib/format";
import { CATEGORIAS } from "@/lib/constants";
import { TabelaProdutos } from "@/components/TabelaProdutos";
import { PainelTaxas } from "@/components/PainelTaxas";
import type { Categoria, Produto } from "@/lib/types";

export default function CustosPage() {
  const {
    produtos,
    canais,
    carregado,
    setProdutos,
    setCanais,
    restaurarPadroes,
  } = useDados();

  const canal = canais[0];

  const [novoNome, setNovoNome] = useState("");
  const [novaCategoria, setNovaCategoria] = useState<Categoria>("outro");
  const [novoCmv, setNovoCmv] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mensagemImportacao, setMensagemImportacao] = useState<string | null>(
    null
  );

  function atualizarTaxas(taxasNovas: typeof canal.taxas) {
    setCanais(
      canais.map((c) => (c.id === canal.id ? { ...c, taxas: taxasNovas } : c))
    );
  }

  function adicionarProduto() {
    if (!novoNome.trim()) return;
    const cmv = Number(novoCmv.replace(",", "."));
    const baseId = slugify(novoNome);
    let id = baseId;
    let contador = 2;
    const idsExistentes = new Set(produtos.map((p) => p.id));
    while (idsExistentes.has(id)) {
      id = `${baseId}-${contador}`;
      contador += 1;
    }

    const novoProduto: Produto = {
      id,
      nome: novoNome.trim(),
      categoria: novaCategoria,
      cmv: Number.isFinite(cmv) ? cmv : 0,
      ativo: true,
      origem: "custom",
    };

    setProdutos([...produtos, novoProduto]);
    setNovoNome("");
    setNovoCmv("");
    setNovaCategoria("outro");
  }

  function restaurarComConfirmacao() {
    const confirmado = window.confirm(
      "Isso restaura os CMVs e percentuais do seed original. Produtos cadastrados por você (custom) são mantidos. Continuar?"
    );
    if (confirmado) restaurarPadroes();
  }

  function exportar() {
    const json = exportarJSON(produtos, canais);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vitanuts-calc-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const reader = new FileReader();
    reader.onload = () => {
      const resultado = importarJSON(String(reader.result));
      if ("erro" in resultado) {
        setMensagemImportacao(resultado.erro);
        return;
      }
      setProdutos(resultado.produtos);
      setCanais(resultado.canais);
      setMensagemImportacao("Importado com sucesso.");
    };
    reader.readAsText(arquivo);
    e.target.value = "";
  }

  if (!carregado) {
    return <p className="text-sm text-navy/50">Carregando…</p>;
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Produtos</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportar}
              className="rounded-md border border-navy/20 px-3 py-1.5 text-sm text-navy hover:bg-navy/5"
            >
              Exportar JSON
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border border-navy/20 px-3 py-1.5 text-sm text-navy hover:bg-navy/5"
            >
              Importar JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={importar}
              className="hidden"
            />
          </div>
        </div>
        {mensagemImportacao && (
          <p className="text-sm text-navy/60">{mensagemImportacao}</p>
        )}

        <TabelaProdutos produtos={produtos} onChange={setProdutos} />

        <div className="rounded-lg border border-navy/10 bg-white p-4">
          <h3 className="text-sm font-semibold text-navy">
            Adicionar produto
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <input
              type="text"
              placeholder="Nome do produto"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className="rounded-md border border-navy/20 px-3 py-2 text-sm outline-none focus:border-laranja focus:ring-1 focus:ring-laranja"
            />
            <select
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value as Categoria)}
              className="rounded-md border border-navy/20 px-3 py-2 text-sm outline-none focus:border-laranja focus:ring-1 focus:ring-laranja"
            >
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              inputMode="decimal"
              placeholder="CMV (R$)"
              value={novoCmv}
              onChange={(e) => setNovoCmv(e.target.value)}
              className="rounded-md border border-navy/20 px-3 py-2 text-sm outline-none focus:border-laranja focus:ring-1 focus:ring-laranja"
            />
            <button
              type="button"
              onClick={adicionarProduto}
              className="rounded-md bg-laranja px-4 py-2 text-sm font-medium text-white hover:bg-laranja-escuro"
            >
              Adicionar
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-navy">
          Percentuais padrão — {canal.nome}
        </h2>
        <PainelTaxas
          taxas={canal.taxas}
          onChange={atualizarTaxas}
          onRestaurarPadroes={restaurarComConfirmacao}
        />
      </section>

      <section>
        <button
          type="button"
          onClick={restaurarComConfirmacao}
          className="rounded-md border border-laranja-escuro/30 px-4 py-2 text-sm font-medium text-laranja-escuro hover:bg-laranja-escuro/5"
        >
          Restaurar padrões de fábrica
        </button>
      </section>
    </div>
  );
}
