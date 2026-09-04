export type Categoria =
  | "pasta-205g"
  | "pasta-500g"
  | "barrinha"
  | "doce-de-leite"
  | "outro";

export type Produto = {
  id: string;
  nome: string;
  categoria: Categoria;
  cmv: number;
  ativo: boolean;
  origem: "seed" | "custom";
};

export type Taxa = {
  id: string;
  nome: string;
  tipo: "percentual" | "fixo";
  valor: number;
  base: "preco";
  editavel: boolean;
};

export type Canal = {
  id: string;
  nome: string;
  taxas: Taxa[];
};

export type ItemCalculo = {
  produtoId: string;
  quantidade: number;
};

export type EntradaCalculo = {
  preco: number;
  itens: ItemCalculo[];
  taxas: Taxa[];
};

export type LinhaCusto = {
  nome: string;
  valorReais: number;
  percentualDoPreco: number;
};

export type ResultadoCalculo = {
  cmvTotal: number;
  linhas: LinhaCusto[];
  custoTotal: number;
  lucro: number;
  margem: number;
  markup: number | null;
};

export type EntradaCalculoReverso = {
  margemAlvo: number;
  itens: ItemCalculo[];
  taxas: Taxa[];
};

export type ResultadoCalculoReverso =
  | {
      ok: true;
      precoIdeal: number;
      resultado: ResultadoCalculo;
    }
  | {
      ok: false;
      motivo: string;
    };

export type Precificacao = {
  id: string;
  nome: string;
  canal: string;
  preco: number;
  resultado: ResultadoCalculo;
  criadoEm: string;
};
