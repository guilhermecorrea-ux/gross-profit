"use client";

import { useRef, useState } from "react";
import { useDados } from "@/lib/storage";
import { useTema } from "@/lib/tema";
import { exportarJSON, importarJSON } from "@/lib/storage";
import { slugify } from "@/lib/format";
import { CATEGORIAS } from "@/lib/constants";
import { archivo } from "@/lib/fonts";
import { Cabecalho } from "@/components/Cabecalho";
import { TabelaProdutos } from "@/components/TabelaProdutos";
import { PainelTaxas } from "@/components/PainelTaxas";
import type { Categoria, Produto } from "@/lib/types";

const BOTAO_FANTASMA =
  "rounded-[15px] border border-[#2C2E35]/25 px-3.5 py-2 text-sm font-semibold text-[#2C2E35] hover:bg-[#2C2E35]/5 dark:border-[#F2EFE4]/25 dark:text-[#F2EFE4] dark:hover:bg-[#F2EFE4]/10";

const CAMPO =
  "rounded-[15px] border border-[#2C2E35]/20 bg-white px-3 py-2 text-sm text-[#2C2E35] outline-none focus:border-laranja focus:ring-1 focus:ring-laranja dark:border-[#F2EFE4]/20 dark:bg-[#1F1F19] dark:text-[#F2EFE4]";

export default function CustosPage() {
  const { dark } = useTema();
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F4EC] dark:bg-[#14140F]">
        <p className="text-sm text-[#2C2E35]/50 dark:text-[#F2EFE4]/50">
          Carregando…
        </p>
      </div>
    );
  }

  return (
    <div
      data-theme={dark ? "dark" : "light"}
      className="grid min-h-screen w-full grid-cols-1 content-start gap-8 bg-[#F6F4EC] px-6 pt-7 pb-12 dark:bg-[#14140F] lg:px-14"
    >
      <Cabecalho
        titulo="Custos & Produtos"
        subtitulo="Catálogo de produtos e taxas padrão por canal."
      />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2
            className={`${archivo.className} text-lg font-extrabold text-[#2C2E35] dark:text-[#F2EFE4]`}
          >
            Produtos
          </h2>
          <div className="flex gap-2">
            <button type="button" onClick={exportar} className={BOTAO_FANTASMA}>
              Exportar JSON
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={BOTAO_FANTASMA}
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
          <p className="text-sm text-[#2C2E35]/60 dark:text-[#F2EFE4]/60">
            {mensagemImportacao}
          </p>
        )}

        <TabelaProdutos produtos={produtos} onChange={setProdutos} />

        <div className="rounded-[15px] bg-white p-4 dark:bg-[#1F1F19]">
          <h3 className="text-sm font-semibold text-[#2C2E35] dark:text-[#F2EFE4]">
            Adicionar produto
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <input
              type="text"
              placeholder="Nome do produto"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className={CAMPO}
            />
            <select
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value as Categoria)}
              className={CAMPO}
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
              className={CAMPO}
            />
            <button
              type="button"
              onClick={adicionarProduto}
              className="rounded-[15px] bg-laranja px-4 py-2 text-sm font-bold text-white hover:bg-laranja-escuro"
            >
              Adicionar
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2
          className={`${archivo.className} text-lg font-extrabold text-[#2C2E35] dark:text-[#F2EFE4]`}
        >
          Percentuais padrão — {canal.nome}
        </h2>
        <PainelTaxas
          taxas={canal.taxas}
          onChange={atualizarTaxas}
          onRestaurarPadroes={restaurarComConfirmacao}
        />
      </section>

      <section className="pb-4">
        <button
          type="button"
          onClick={restaurarComConfirmacao}
          className="rounded-[15px] border border-laranja-escuro/30 px-4 py-2 text-sm font-semibold text-laranja-escuro hover:bg-laranja-escuro/5"
        >
          Restaurar padrões de fábrica
        </button>
      </section>
    </div>
  );
}
