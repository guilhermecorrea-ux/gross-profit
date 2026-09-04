"use client";

import { useMemo, useState } from "react";
import { useDados, usePrecificacoes, useSessaoCalculo } from "@/lib/storage";
import { useTema } from "@/lib/tema";
import { calcular, calcularReverso } from "@/lib/calc";
import {
  formatarBRL,
  formatarMarkup,
  formatarPercentual,
  parseNumeroBR,
} from "@/lib/format";
import { corDaMargem } from "@/lib/constants";
import { archivo } from "@/lib/fonts";
import { Cabecalho } from "@/components/Cabecalho";
import { PainelTaxas } from "@/components/PainelTaxas";
import { tocarSomDinheiro } from "@/lib/som";

const CORES_BARRA = ["#FBD9C4", "#F5B48C", "#EF8F55", "#ED7032", "#B84C13"];

const COR_MARGEM_TEXTO: Record<string, string> = {
  vermelho: "text-laranja-escuro",
  amarelo: "text-amarelo",
  verde: "text-verde",
  neutro: "text-[#2C2E35]/40 dark:text-[#F2EFE4]/40",
};

const COR_MARGEM_FUNDO: Record<string, string> = {
  vermelho: "bg-laranja-escuro",
  amarelo: "bg-amarelo",
  verde: "bg-verde",
  neutro: "bg-[#2C2E35]/30 dark:bg-[#F2EFE4]/30",
};

export default function CalculadoraPage() {
  const { produtos, canais, carregado, setCanais, restaurarPadroes } =
    useDados();

  const canal = canais[0];
  const { dark } = useTema();

  const {
    itens,
    setItens,
    precoInput,
    setPrecoInput,
    modoReverso,
    setModoReverso,
    margemAlvoInput,
    setMargemAlvoInput,
    carregado: sessaoCarregada,
  } = useSessaoCalculo();
  const { adicionar: adicionarPrecificacao } = usePrecificacoes();
  const [busca, setBusca] = useState("");
  const [salvo, setSalvo] = useState(false);

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
      setItens(
        itens.map((i) =>
          i.produtoId === produtoId
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        )
      );
    } else {
      setItens([...itens, { produtoId, quantidade: 1 }]);
    }
    setBusca("");
  }

  function atualizarQuantidade(produtoId: string, quantidade: number) {
    if (quantidade <= 0) {
      removerItem(produtoId);
      return;
    }
    setItens(
      itens.map((i) => (i.produtoId === produtoId ? { ...i, quantidade } : i))
    );
  }

  function removerItem(produtoId: string) {
    setItens(itens.filter((i) => i.produtoId !== produtoId));
  }

  function atualizarTaxas(taxasNovas: typeof canal.taxas) {
    setCanais(
      canais.map((c) => (c.id === canal.id ? { ...c, taxas: taxasNovas } : c))
    );
  }

  const preco = precoInput.trim() === "" ? 0 : parseNumeroBR(precoInput);
  const margemAlvo =
    margemAlvoInput.trim() === "" ? 0 : parseNumeroBR(margemAlvoInput) / 100;

  const resultadoDireto = useMemo(
    () => calcular({ preco, itens, taxas: canal.taxas }, produtos),
    [preco, itens, canal.taxas, produtos]
  );

  const resultadoReverso = useMemo(
    () => calcularReverso({ margemAlvo, itens, taxas: canal.taxas }, produtos),
    [margemAlvo, itens, canal.taxas, produtos]
  );

  const resultadoAtivo = modoReverso
    ? resultadoReverso.ok
      ? resultadoReverso.resultado
      : null
    : resultadoDireto;
  const precoEfetivo = modoReverso
    ? resultadoReverso.ok
      ? resultadoReverso.precoIdeal
      : 0
    : preco;

  function salvarEmPrecificacao() {
    if (!resultadoAtivo) return;
    const nomeProduto =
      itens
        .map((i) => produtoPorId.get(i.produtoId)?.nome)
        .filter((nome): nome is string => Boolean(nome))
        .join(" + ") || "Sem produto";

    adicionarPrecificacao({
      id: crypto.randomUUID(),
      nome: nomeProduto,
      canal: canal.nome,
      preco: precoEfetivo,
      resultado: resultadoAtivo,
      criadoEm: new Date().toISOString(),
    });

    tocarSomDinheiro();

    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  if (!carregado || !sessaoCarregada) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F4EC] dark:bg-[#14140F]">
        <p className="text-sm text-[#2C2E35]/50 dark:text-[#F2EFE4]/50">
          Carregando…
        </p>
      </div>
    );
  }

  const percentualCmv =
    precoEfetivo > 0 && resultadoAtivo ? resultadoAtivo.cmvTotal / precoEfetivo : 0;
  const linhasCusto = resultadoAtivo
    ? [
        {
          nome: "CMV",
          valorReais: resultadoAtivo.cmvTotal,
          percentualDoPreco: percentualCmv,
        },
        ...resultadoAtivo.linhas,
      ]
    : [];
  const corMargem = resultadoAtivo ? corDaMargem(resultadoAtivo.margem) : "neutro";
  const margemBarraPct = resultadoAtivo
    ? Math.max(0, Math.min(100, resultadoAtivo.margem * 100))
    : 0;
  const temBarraLucro = !!resultadoAtivo && resultadoAtivo.margem > 0;

  return (
    <div
      data-theme={dark ? "dark" : "light"}
      className="grid min-h-screen w-full grid-cols-1 content-start gap-8 bg-[#F6F4EC] px-6 pt-7 pb-12 dark:bg-[#14140F] lg:grid-cols-[380px_1fr] lg:gap-16 lg:px-14"
    >
      <Cabecalho
        titulo="Gross Profit Calculator"
        subtitulo="A vida não para. E a gente também não precisa."
      />

      <div className="flex flex-col gap-7">
        <div>
          <div className="mb-1.5 text-[11px] font-semibold tracking-wide text-[#2C2E35]/50 uppercase dark:text-[#F2EFE4]/50">
            Canal
          </div>
          <select
            value={canal.id}
            disabled
            className="w-full rounded-[15px] border border-[#2C2E35]/20 bg-white px-3 py-2.5 text-sm font-semibold text-[#2C2E35] dark:border-[#F2EFE4]/20 dark:bg-[#1F1F19] dark:text-[#F2EFE4]"
          >
            <option value={canal.id}>{canal.nome}</option>
          </select>
        </div>

        <div>
          <div className="mb-1.5 text-[11px] font-semibold tracking-wide text-[#2C2E35]/50 uppercase dark:text-[#F2EFE4]/50">
            Produtos
          </div>

          <div className="relative">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto por nome…"
              className="w-full rounded-[15px] border border-[#2C2E35]/20 bg-white px-3 py-2 text-sm outline-none focus:border-laranja focus:ring-1 focus:ring-laranja dark:border-[#F2EFE4]/20 dark:bg-[#1F1F19] dark:text-[#F2EFE4]"
            />
            {resultadosBusca.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full rounded-[15px] border border-[#2C2E35]/10 bg-white shadow-lg dark:border-[#F2EFE4]/10 dark:bg-[#1F1F19]">
                {resultadosBusca.map((produto) => (
                  <li key={produto.id}>
                    <button
                      type="button"
                      onClick={() => adicionarProduto(produto.id)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-[#2C2E35] hover:bg-[#2C2E35]/5 dark:text-[#F2EFE4] dark:hover:bg-[#F2EFE4]/10"
                    >
                      <span>{produto.nome}</span>
                      <span className="tabular-nums text-[#2C2E35]/50 dark:text-[#F2EFE4]/50">
                        {formatarBRL(produto.cmv)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {itens.length > 0 && (
            <div className="mt-2">
              {itens.map((item) => {
                const produto = produtoPorId.get(item.produtoId);
                if (!produto) return null;
                return (
                  <div
                    key={item.produtoId}
                    className="flex items-center gap-2.5 border-b border-[#2C2E35]/10 py-2.5 dark:border-[#F2EFE4]/10"
                  >
                    <div className="min-w-0 flex-1 truncate text-[13.5px] text-[#2C2E35] dark:text-[#F2EFE4]">
                      {produto.nome}
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
                      className="w-7 border-0 border-b border-dashed border-[#2C2E35]/30 bg-transparent py-0.5 text-center text-[13px] text-[#2C2E35] outline-none tabular-nums dark:border-[#F2EFE4]/30 dark:text-[#F2EFE4]"
                    />
                    <span className="w-14 shrink-0 text-right text-[13px] tabular-nums text-[#2C2E35]/55 dark:text-[#F2EFE4]/55">
                      {formatarBRL(produto.cmv)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removerItem(item.produtoId)}
                      aria-label={`Remover ${produto.nome}`}
                      className="px-1.5 text-[17px] leading-none text-[#2C2E35]/40 hover:text-laranja-escuro dark:text-[#F2EFE4]/40"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-1.5 flex justify-between border-t border-[#2C2E35]/15 pt-2.5 text-sm font-bold text-[#2C2E35] dark:border-[#F2EFE4]/15 dark:text-[#F2EFE4]">
            <span>CMV total</span>
            <span className="tabular-nums">
              {formatarBRL(resultadoDireto.cmvTotal)}
            </span>
          </div>
        </div>

        {!modoReverso ? (
          <div>
            <div className="mb-1.5 text-[11px] font-semibold tracking-wide text-[#2C2E35]/50 uppercase dark:text-[#F2EFE4]/50">
              Preço de venda (R$)
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={precoInput}
              onChange={(e) => setPrecoInput(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-[15px] border-2 border-laranja bg-white px-3.5 py-2.5 text-[28px] font-extrabold text-[#2C2E35] outline-none tabular-nums dark:bg-[#1F1F19] dark:text-[#F2EFE4]"
            />
          </div>
        ) : (
          <div>
            <div className="mb-1.5 text-[11px] font-semibold tracking-wide text-[#2C2E35]/50 uppercase dark:text-[#F2EFE4]/50">
              Margem desejada (%)
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={margemAlvoInput}
              onChange={(e) => setMargemAlvoInput(e.target.value)}
              placeholder="20"
              className="w-full rounded-[15px] border-2 border-laranja bg-white px-3.5 py-2.5 text-[28px] font-extrabold text-[#2C2E35] outline-none tabular-nums dark:bg-[#1F1F19] dark:text-[#F2EFE4]"
            />
            <div className="mt-2 text-sm text-[#2C2E35]/60 dark:text-[#F2EFE4]/60">
              Preço sugerido:{" "}
              <strong className="text-[#2C2E35] dark:text-[#F2EFE4]">
                {resultadoReverso.ok
                  ? formatarBRL(resultadoReverso.precoIdeal)
                  : "—"}
              </strong>
            </div>
          </div>
        )}

        <div
          role="button"
          tabIndex={0}
          onClick={() => setModoReverso(!modoReverso)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setModoReverso(!modoReverso);
          }}
          className="flex cursor-pointer items-center justify-between"
        >
          <div className="text-[13px] font-semibold text-[#2C2E35] dark:text-[#F2EFE4]">
            Modo reverso
          </div>
          <div
            className={`relative h-[22px] w-10 rounded-full transition-colors ${
              modoReverso ? "bg-laranja" : "bg-[#2C2E35]/15 dark:bg-[#F2EFE4]/15"
            }`}
          >
            <div
              className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-[left]"
              style={{ left: modoReverso ? "20px" : "2px" }}
            />
          </div>
        </div>

        <PainelTaxas
          taxas={canal.taxas}
          onChange={atualizarTaxas}
          onRestaurarPadroes={restaurarPadroes}
        />

        <button
          type="button"
          onClick={salvarEmPrecificacao}
          disabled={!resultadoAtivo}
          className="rounded-[15px] bg-laranja px-4 py-2.5 text-sm font-bold text-white hover:bg-laranja-escuro disabled:cursor-not-allowed disabled:opacity-40"
        >
          {salvo ? "Adicionado à Precificação ✓" : "Salvar em Precificação"}
        </button>
      </div>

      <div className="flex flex-col gap-10 rounded-[15px] bg-white p-8 dark:bg-[#1F1F19]">
        {resultadoAtivo ? (
          <>
            <div>
              <div
                className={`${archivo.className} mb-1 text-[13px] font-extrabold tracking-widest text-[#2C2E35] uppercase dark:text-[#F2EFE4]`}
              >
                Margem
              </div>
              <div
                className={`${archivo.className} text-[96px] leading-[0.88] font-black tracking-[-4px] tabular-nums sm:text-[176px] sm:tracking-[-7px] ${COR_MARGEM_TEXTO[corMargem]}`}
              >
                {formatarPercentual(resultadoAtivo.margem)}
              </div>
              <div className="mt-4 flex flex-wrap gap-9">
                <div
                  className={`${archivo.className} text-[22px] font-extrabold tabular-nums text-[#2C2E35] dark:text-[#F2EFE4]`}
                >
                  Lucro {formatarBRL(resultadoAtivo.lucro)}
                </div>
                <div
                  className={`${archivo.className} text-[22px] font-extrabold tabular-nums text-[#2C2E35]/55 dark:text-[#F2EFE4]/55`}
                >
                  Markup {formatarMarkup(resultadoAtivo.markup)}
                </div>
              </div>

              <div className="mt-7">
                <div className="flex h-4 w-full gap-0.5 overflow-hidden rounded-[3px] bg-[#2C2E35]/[0.06] dark:bg-[#F2EFE4]/[0.06]">
                  {linhasCusto.map((linha, i) => (
                    <div
                      key={linha.nome}
                      style={{
                        width: `${Math.max(0, linha.percentualDoPreco * 100)}%`,
                        background: CORES_BARRA[i % CORES_BARRA.length],
                      }}
                    />
                  ))}
                  {temBarraLucro && (
                    <div
                      className={COR_MARGEM_FUNDO[corMargem]}
                      style={{ width: `${margemBarraPct}%` }}
                    />
                  )}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-4">
                  {linhasCusto.map((linha, i) => (
                    <div
                      key={linha.nome}
                      className="flex items-center gap-1.5 text-[11px] text-[#2C2E35]/55 dark:text-[#F2EFE4]/55"
                    >
                      <span
                        className="inline-block h-[7px] w-[7px] rounded-[1px]"
                        style={{ background: CORES_BARRA[i % CORES_BARRA.length] }}
                      />
                      <span>{linha.nome}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 text-[11px] text-[#2C2E35]/55 dark:text-[#F2EFE4]/55">
                    <span
                      className={`inline-block h-[7px] w-[7px] rounded-[1px] ${COR_MARGEM_FUNDO[corMargem]}`}
                    />
                    <span>Lucro</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="-my-2 h-[54px]"
              style={{
                backgroundImage:
                  "repeating-radial-gradient(circle at 50% 190%, transparent 0 11px, currentColor 11px 13px)",
                backgroundRepeat: "no-repeat",
                color: dark ? "rgba(242,239,228,0.16)" : "rgba(44,46,53,0.16)",
              }}
            />

            <div>
              <div className="mb-2 text-[11px] font-semibold tracking-wide text-[#2C2E35]/45 uppercase dark:text-[#F2EFE4]/45">
                Quebra de custos
              </div>
              <div className="grid grid-cols-[1fr_110px_90px] border-b border-[#2C2E35]/20 py-1.5 text-[11px] font-semibold tracking-wide text-[#2C2E35]/40 uppercase dark:border-[#F2EFE4]/20 dark:text-[#F2EFE4]/40">
                <span>Item</span>
                <span className="text-right">R$</span>
                <span className="text-right">% do preço</span>
              </div>
              {linhasCusto.map((linha) => (
                <div
                  key={linha.nome}
                  className="grid grid-cols-[1fr_110px_90px] border-b border-[#2C2E35]/[0.08] py-2.5 text-[13.5px] text-[#2C2E35] dark:border-[#F2EFE4]/[0.08] dark:text-[#F2EFE4]"
                >
                  <span>{linha.nome}</span>
                  <span className="text-right tabular-nums">
                    {formatarBRL(linha.valorReais)}
                  </span>
                  <span className="text-right tabular-nums text-[#2C2E35]/55 dark:text-[#F2EFE4]/55">
                    {formatarPercentual(linha.percentualDoPreco)}
                  </span>
                </div>
              ))}
              <div className="grid grid-cols-[1fr_110px_90px] border-t-2 border-[#2C2E35]/30 py-2.5 text-[13.5px] font-bold text-[#2C2E35] dark:border-[#F2EFE4]/30 dark:text-[#F2EFE4]">
                <span>Custo total</span>
                <span className="text-right tabular-nums">
                  {formatarBRL(resultadoAtivo.custoTotal)}
                </span>
                <span className="text-right tabular-nums">
                  {formatarPercentual(
                    precoEfetivo > 0 ? resultadoAtivo.custoTotal / precoEfetivo : 0
                  )}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[15px] border border-laranja-escuro/30 bg-laranja-escuro/5 p-4">
            <p className="text-sm font-medium text-laranja-escuro">
              Meta inalcançável
            </p>
            <p className="mt-1 text-sm text-[#2C2E35]/70 dark:text-[#F2EFE4]/70">
              {!resultadoReverso.ok && resultadoReverso.motivo}
            </p>
          </div>
        )}
      </div>

      <div
        className="col-span-full -mx-6 -mb-12 mt-4 h-[110px] lg:-mx-14"
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 50% 340%, transparent 0 16px, currentColor 16px 19px)",
          backgroundRepeat: "no-repeat",
          color: dark ? "rgba(242,239,228,0.09)" : "rgba(44,46,53,0.09)",
        }}
      />
    </div>
  );
}
