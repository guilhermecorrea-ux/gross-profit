import type {
  EntradaCalculo,
  EntradaCalculoReverso,
  Produto,
  ResultadoCalculo,
  ResultadoCalculoReverso,
  Taxa,
} from "./types";

function cmvTotalDeItens(
  itens: EntradaCalculo["itens"],
  produtos: Produto[]
): number {
  const produtoPorId = new Map(produtos.map((p) => [p.id, p]));
  return itens.reduce((soma, item) => {
    const produto = produtoPorId.get(item.produtoId);
    if (!produto) return soma;
    return soma + produto.cmv * item.quantidade;
  }, 0);
}

function somaTaxasFixas(taxas: Taxa[]): number {
  return taxas
    .filter((t) => t.tipo === "fixo")
    .reduce((soma, t) => soma + t.valor, 0);
}

function somaPercentuaisDecimal(taxas: Taxa[]): number {
  return taxas
    .filter((t) => t.tipo === "percentual")
    .reduce((soma, t) => soma + t.valor / 100, 0);
}

export function calcular(
  entrada: EntradaCalculo,
  produtos: Produto[]
): ResultadoCalculo {
  const { preco, itens, taxas } = entrada;

  const cmvTotal = cmvTotalDeItens(itens, produtos);
  const custosFixos = somaTaxasFixas(taxas);

  const linhas = taxas.map((taxa) => {
    const valorReais =
      taxa.tipo === "percentual" ? preco * (taxa.valor / 100) : taxa.valor;
    const percentualDoPreco = preco > 0 ? valorReais / preco : 0;
    return { nome: taxa.nome, valorReais, percentualDoPreco };
  });

  const custosPercentuais = taxas
    .filter((t) => t.tipo === "percentual")
    .reduce((soma, t) => soma + preco * (t.valor / 100), 0);

  const custoTotal = cmvTotal + custosPercentuais + custosFixos;
  const lucro = preco - custoTotal;
  const margem = preco === 0 ? NaN : lucro / preco;
  const markup = cmvTotal === 0 ? null : preco / cmvTotal;

  return { cmvTotal, linhas, custoTotal, lucro, margem, markup };
}

export function calcularReverso(
  entrada: EntradaCalculoReverso,
  produtos: Produto[]
): ResultadoCalculoReverso {
  const { margemAlvo, itens, taxas } = entrada;

  const cmvTotal = cmvTotalDeItens(itens, produtos);
  const custosFixos = somaTaxasFixas(taxas);
  const somaPercentuais = somaPercentuaisDecimal(taxas);
  const denominador = 1 - somaPercentuais - margemAlvo;

  if (denominador <= 0) {
    return {
      ok: false,
      motivo:
        "A soma dos percentuais mais a margem alvo atinge ou ultrapassa 100% do preço. A meta é matematicamente inalcançável com esses percentuais.",
    };
  }

  const precoIdeal = (cmvTotal + custosFixos) / denominador;
  const resultado = calcular({ preco: precoIdeal, itens, taxas }, produtos);

  return { ok: true, precoIdeal, resultado };
}
