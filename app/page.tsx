"use client";

import { useMemo, useState } from "react";
import { useDados } from "@/lib/storage";
import { calcular, calcularReverso } from "@/lib/calc";
import { SeletorProdutos } from "@/components/SeletorProdutos";
import { PainelTaxas } from "@/components/PainelTaxas";
import { PainelResultado } from "@/components/PainelResultado";
import type { ItemCalculo } from "@/lib/types";

export default function CalculadoraPage() {
  const { produtos, canais, carregado, setCanais, restaurarPadroes } =
    useDados();

  const canal = canais[0];

  const [itens, setItens] = useState<ItemCalculo[]>([]);
  const [precoInput, setPrecoInput] = useState("");
  const [modoReverso, setModoReverso] = useState(false);
  const [margemAlvoInput, setMargemAlvoInput] = useState("20");

  const preco = precoInput.trim() === "" ? 0 : Number(precoInput.replace(",", "."));
  const margemAlvo =
    margemAlvoInput.trim() === ""
      ? 0
      : Number(margemAlvoInput.replace(",", ".")) / 100;

  function atualizarTaxas(taxasNovas: typeof canal.taxas) {
    setCanais(
      canais.map((c) => (c.id === canal.id ? { ...c, taxas: taxasNovas } : c))
    );
  }

  const resultadoDireto = useMemo(
    () => calcular({ preco, itens, taxas: canal.taxas }, produtos),
    [preco, itens, canal.taxas, produtos]
  );

  const resultadoReverso = useMemo(
    () => calcularReverso({ margemAlvo, itens, taxas: canal.taxas }, produtos),
    [margemAlvo, itens, canal.taxas, produtos]
  );

  if (!carregado) {
    return <p className="text-sm text-navy/50">Carregando…</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-navy/80">
            Canal
          </label>
          <select
            value={canal.id}
            disabled
            className="mt-1 w-full rounded-md border border-navy/20 bg-navy/5 px-3 py-2 text-sm text-navy/70"
          >
            <option value={canal.id}>{canal.nome}</option>
          </select>
        </div>

        <SeletorProdutos produtos={produtos} itens={itens} onChange={setItens} />

        <div className="flex items-end gap-3">
          <div className="flex-1">
            {modoReverso ? (
              <>
                <label
                  htmlFor="margem-alvo"
                  className="block text-sm font-medium text-navy/80"
                >
                  Margem alvo (%)
                </label>
                <input
                  id="margem-alvo"
                  type="text"
                  inputMode="decimal"
                  value={margemAlvoInput}
                  onChange={(e) => setMargemAlvoInput(e.target.value)}
                  placeholder="20"
                  className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 text-sm outline-none focus:border-laranja focus:ring-1 focus:ring-laranja"
                />
              </>
            ) : (
              <>
                <label
                  htmlFor="preco"
                  className="block text-sm font-medium text-navy/80"
                >
                  Preço de venda (R$)
                </label>
                <input
                  id="preco"
                  type="text"
                  inputMode="decimal"
                  value={precoInput}
                  onChange={(e) => setPrecoInput(e.target.value)}
                  placeholder="0,00"
                  className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 text-sm outline-none focus:border-laranja focus:ring-1 focus:ring-laranja"
                />
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setModoReverso((v) => !v)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              modoReverso
                ? "bg-laranja text-white"
                : "border border-navy/20 text-navy hover:bg-navy/5"
            }`}
          >
            Modo reverso
          </button>
        </div>

        <PainelTaxas
          taxas={canal.taxas}
          onChange={atualizarTaxas}
          onRestaurarPadroes={restaurarPadroes}
        />
      </section>

      <section>
        {modoReverso ? (
          resultadoReverso.ok ? (
            <PainelResultado
              modoReverso
              resultado={resultadoReverso.resultado}
              precoIdeal={resultadoReverso.precoIdeal}
              erro={null}
            />
          ) : (
            <PainelResultado
              modoReverso
              resultado={null}
              precoIdeal={null}
              erro={resultadoReverso.motivo}
            />
          )
        ) : (
          <PainelResultado
            modoReverso={false}
            resultado={resultadoDireto}
            preco={preco}
          />
        )}
      </section>
    </div>
  );
}
