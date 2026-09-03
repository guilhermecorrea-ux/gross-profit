import { describe, expect, it } from "vitest";
import { calcular, calcularReverso } from "./calc";
import { produtosSeed } from "@/data/produtos.seed";
import { canaisSeed } from "@/data/canais.seed";
import type { Taxa } from "./types";

const taxasBase = canaisSeed[0].taxas;

function comFrete(valor: number): Taxa[] {
  return taxasBase.map((t) => (t.id === "frete" ? { ...t, valor } : t));
}

function round(n: number, casas: number): number {
  return Math.round(n * 10 ** casas) / 10 ** casas;
}

describe("calcular (modo direto)", () => {
  it("A — pasta caju tradicional 500g, frete próprio de 14,15, fica quase zero a zero (sanidade)", () => {
    const resultado = calcular(
      {
        preco: 59.9,
        itens: [{ produtoId: "pasta-caju-tradicional-500g", quantidade: 1 }],
        taxas: comFrete(14.15),
      },
      produtosSeed
    );

    expect(resultado.cmvTotal).toBeCloseTo(17.36, 6);
    expect(round(resultado.lucro, 2)).toBeCloseTo(0.84, 2);
    expect(round(resultado.margem * 100, 1)).toBeCloseTo(1.4, 1);
    expect(round(resultado.markup!, 2)).toBeCloseTo(3.45, 2);
  });

  it("B — kit 2x pasta amendoim chocolate crocante 205g", () => {
    const resultado = calcular(
      {
        preco: 59.9,
        itens: [
          { produtoId: "pasta-amendoim-choc-crocante-205g", quantidade: 2 },
        ],
        taxas: comFrete(12.0),
      },
      produtosSeed
    );

    expect(resultado.cmvTotal).toBeCloseTo(14.0, 6);
    expect(round(resultado.lucro, 2)).toBeCloseTo(6.35, 2);
    expect(round(resultado.margem * 100, 1)).toBeCloseTo(10.6, 1);
    expect(round(resultado.markup!, 2)).toBeCloseTo(4.28, 2);
  });

  it("C — caixa de barrinhas 12un, sem custo de frete", () => {
    const resultado = calcular(
      {
        preco: 129.9,
        itens: [{ produtoId: "barrinha-mix-sabores-12un", quantidade: 1 }],
        taxas: comFrete(0),
      },
      produtosSeed
    );

    expect(resultado.cmvTotal).toBeCloseTo(58.0, 6);
    expect(round(resultado.lucro, 2)).toBeCloseTo(12.15, 2);
    expect(round(resultado.margem * 100, 1)).toBeCloseTo(9.4, 1);
    expect(round(resultado.markup!, 2)).toBeCloseTo(2.24, 2);
  });

  it("F — nenhum produto selecionado: markup indefinido (—), lucro e margem seguem a fórmula", () => {
    const resultado = calcular(
      {
        preco: 59.9,
        itens: [],
        taxas: comFrete(0),
      },
      produtosSeed
    );

    expect(resultado.cmvTotal).toBe(0);
    expect(resultado.markup).toBeNull();
    // custoTotal = apenas os 46% de percentuais (15 + 28 + 3), já que CMV e frete são 0
    expect(round(resultado.lucro, 2)).toBeCloseTo(32.35, 2);
    expect(round(resultado.margem * 100, 1)).toBeCloseTo(54.0, 1);
  });

  it("preço 0 ou vazio: margem indefinida (NaN), nunca Infinity", () => {
    const resultado = calcular(
      {
        preco: 0,
        itens: [{ produtoId: "pasta-caju-tradicional-500g", quantidade: 1 }],
        taxas: comFrete(0),
      },
      produtosSeed
    );

    expect(Number.isNaN(resultado.margem)).toBe(true);
    expect(Number.isFinite(resultado.lucro)).toBe(true);
  });

  it("nunca arredonda valores intermediários antes de somar", () => {
    const resultado = calcular(
      {
        preco: 59.9,
        itens: [{ produtoId: "pasta-caju-tradicional-500g", quantidade: 1 }],
        taxas: comFrete(14.15),
      },
      produtosSeed
    );

    // valor exato, sem arredondamento intermediário: 59.9 - (17.36 + 59.9*0.46 + 14.15)
    const custoTotalExato = 17.36 + 59.9 * 0.46 + 14.15;
    expect(resultado.lucro).toBeCloseTo(59.9 - custoTotalExato, 10);
  });
});

describe("calcularReverso (modo reverso)", () => {
  it("D — caju 500g, frete 14,15, margem alvo 20%", () => {
    const resultado = calcularReverso(
      {
        margemAlvo: 0.2,
        itens: [{ produtoId: "pasta-caju-tradicional-500g", quantidade: 1 }],
        taxas: comFrete(14.15),
      },
      produtosSeed
    );

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(round(resultado.precoIdeal, 2)).toBeCloseTo(92.68, 2);
    expect(round(resultado.resultado.lucro, 2)).toBeCloseTo(18.54, 2);
    expect(round(resultado.resultado.margem * 100, 1)).toBeCloseTo(20.0, 1);
    expect(round(resultado.resultado.markup!, 2)).toBeCloseTo(5.34, 2);
  });

  it("E — margem alvo 60% com percentuais em 46%: meta inalcançável, erro tratado", () => {
    const resultado = calcularReverso(
      {
        margemAlvo: 0.6,
        itens: [{ produtoId: "pasta-caju-tradicional-500g", quantidade: 1 }],
        taxas: comFrete(14.15),
      },
      produtosSeed
    );

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;
    expect(resultado.motivo).toMatch(/inalcançável|100%/);
  });
});
