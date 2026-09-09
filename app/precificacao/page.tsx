"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePrecificacoes } from "@/lib/storage";
import { useTema } from "@/lib/tema";
import { recalcularComLinhaAtualizada } from "@/lib/calc";
import {
  formatarBRL,
  formatarMarkup,
  formatarPercentual,
  parseNumeroBR,
} from "@/lib/format";
import { corDaMargem } from "@/lib/constants";
import { archivo } from "@/lib/fonts";
import { Cabecalho } from "@/components/Cabecalho";
import type { Precificacao } from "@/lib/types";

const NOME_LINHA_FRETE = "Custo de frete";

const COR_MARGEM_TEXTO: Record<string, string> = {
  vermelho: "text-laranja-escuro",
  amarelo: "text-amarelo",
  verde: "text-verde",
  neutro: "text-[#2C2E35]/40 dark:text-[#F2EFE4]/40",
};

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function PrecificacaoPage() {
  const { dark } = useTema();
  const { precificacoes, carregado, remover, editarResultado } =
    usePrecificacoes();

  function editarFrete(p: Precificacao) {
    const linhaFrete = p.resultado.linhas.find(
      (l) => l.nome === NOME_LINHA_FRETE
    );
    const valorAtual = linhaFrete?.valorReais ?? 0;
    const entrada = window.prompt(
      "Novo custo de frete (R$):",
      valorAtual.toFixed(2).replace(".", ",")
    );
    if (entrada === null) return;

    const novoValor = parseNumeroBR(entrada);
    const novoResultado = recalcularComLinhaAtualizada(
      p.resultado,
      p.preco,
      NOME_LINHA_FRETE,
      novoValor
    );
    editarResultado(p.id, novoResultado);
  }

  const nomesLinhas = useMemo(() => {
    const vistos = new Set<string>();
    const ordem: string[] = [];
    for (const p of precificacoes) {
      for (const linha of p.resultado.linhas) {
        if (!vistos.has(linha.nome)) {
          vistos.add(linha.nome);
          ordem.push(linha.nome);
        }
      }
    }
    return ordem;
  }, [precificacoes]);

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
        titulo="Precificação"
        subtitulo="Histórico dos produtos precificados na calculadora."
      />

      <section className="flex min-w-0 flex-col gap-4">
        <p className="max-w-2xl text-sm text-[#2C2E35]/60 dark:text-[#F2EFE4]/60">
          Cada linha desta tabela é um preço salvo a partir da Calculadora —
          com a margem, o lucro, o markup e a composição de custo completa no
          momento em que foi definido. Use esta página para comparar
          precificações lado a lado antes de decidir qual vai pra rua.
        </p>

        {precificacoes.length === 0 ? (
          <div className="rounded-[15px] bg-white p-6 dark:bg-[#1F1F19]">
            <p className="text-sm text-[#2C2E35]/60 dark:text-[#F2EFE4]/60">
              Nenhuma precificação salva ainda.{" "}
              <Link href="/" className="text-laranja hover:underline">
                Volte para a Calculadora
              </Link>{" "}
              e clique em &quot;Salvar em Precificação&quot;, logo abaixo de
              Custo de frete.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[15px] border border-[#2C2E35]/10 dark:border-[#F2EFE4]/10">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-[#2C2E35]/5 text-left text-[11px] tracking-wide text-[#2C2E35]/50 uppercase dark:bg-[#F2EFE4]/5 dark:text-[#F2EFE4]/50">
                <tr>
                  <th className="px-3 py-2 font-semibold">Produto</th>
                  <th className="px-3 py-2 font-semibold">Canal</th>
                  <th className="px-3 py-2 text-right font-semibold">
                    Preço
                  </th>
                  <th className="px-3 py-2 text-right font-semibold">CMV</th>
                  {nomesLinhas.map((nome) => (
                    <th key={nome} className="px-3 py-2 text-right font-semibold">
                      {nome}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right font-semibold">
                    Custo total
                  </th>
                  <th className="px-3 py-2 text-right font-semibold">Lucro</th>
                  <th className="px-3 py-2 text-right font-semibold">
                    Margem
                  </th>
                  <th className="px-3 py-2 text-right font-semibold">
                    Markup
                  </th>
                  <th className="px-3 py-2 font-semibold">Data</th>
                  <th className="px-3 py-2 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2E35]/10 dark:divide-[#F2EFE4]/10">
                {precificacoes.map((p) => {
                  const cor = corDaMargem(p.resultado.margem);
                  return (
                    <tr key={p.id}>
                      <td className="px-3 py-2 text-[#2C2E35] dark:text-[#F2EFE4]">
                        {p.nome}
                      </td>
                      <td className="px-3 py-2 text-[#2C2E35]/60 dark:text-[#F2EFE4]/60">
                        {p.canal}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-[#2C2E35] dark:text-[#F2EFE4]">
                        {formatarBRL(p.preco)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-[#2C2E35]/70 dark:text-[#F2EFE4]/70">
                        {formatarBRL(p.resultado.cmvTotal)}
                      </td>
                      {nomesLinhas.map((nome) => {
                        const linha = p.resultado.linhas.find(
                          (l) => l.nome === nome
                        );
                        return (
                          <td
                            key={nome}
                            className="px-3 py-2 text-right tabular-nums text-[#2C2E35]/70 dark:text-[#F2EFE4]/70"
                          >
                            {linha ? formatarBRL(linha.valorReais) : "—"}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-right tabular-nums font-semibold text-[#2C2E35] dark:text-[#F2EFE4]">
                        {formatarBRL(p.resultado.custoTotal)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-[#2C2E35] dark:text-[#F2EFE4]">
                        {formatarBRL(p.resultado.lucro)}
                      </td>
                      <td
                        className={`${archivo.className} px-3 py-2 text-right tabular-nums font-extrabold ${COR_MARGEM_TEXTO[cor]}`}
                      >
                        {formatarPercentual(p.resultado.margem)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-[#2C2E35]/70 dark:text-[#F2EFE4]/70">
                        {formatarMarkup(p.resultado.markup)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-[#2C2E35]/50 dark:text-[#F2EFE4]/50">
                        {formatarData(p.criadoEm)}
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => editarFrete(p)}
                          aria-label={`Editar frete de ${p.nome}`}
                          className="text-xs text-[#2C2E35]/60 hover:underline dark:text-[#F2EFE4]/60"
                        >
                          Editar frete
                        </button>
                        <span className="mx-1.5 text-[#2C2E35]/20 dark:text-[#F2EFE4]/20">
                          ·
                        </span>
                        <button
                          type="button"
                          onClick={() => remover(p.id)}
                          aria-label={`Remover ${p.nome}`}
                          className="text-xs text-laranja-escuro hover:underline"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
