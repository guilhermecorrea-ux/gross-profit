import { useEffect, useState } from "react";
import { produtosSeed } from "@/data/produtos.seed";
import { canaisSeed } from "@/data/canais.seed";
import type { Canal, ItemCalculo, Produto, Taxa } from "./types";

export const STORAGE_KEYS = {
  produtos: "vitanuts-calc:produtos:v1",
  canais: "vitanuts-calc:canais:v1",
  sessaoCalculo: "vitanuts-calc:sessao-calculo:v1",
} as const;

function lerChave<T>(chave: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(chave);
    if (!bruto) return null;
    return JSON.parse(bruto) as T;
  } catch {
    return null;
  }
}

function escreverChave<T>(chave: string, valor: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(chave, JSON.stringify(valor));
}

export function mergeProdutos(
  seed: Produto[],
  armazenados: Produto[] | null
): Produto[] {
  if (!armazenados) return seed;

  const armazenadosPorId = new Map(armazenados.map((p) => [p.id, p]));
  const seedIds = new Set(seed.map((p) => p.id));

  const produtosSeedMerged = seed.map((produtoSeed) => {
    const existente = armazenadosPorId.get(produtoSeed.id);
    return existente ?? produtoSeed;
  });

  const produtosCustom = armazenados.filter(
    (p) => p.origem === "custom" && !seedIds.has(p.id)
  );

  return [...produtosSeedMerged, ...produtosCustom];
}

export function mergeCanais(seed: Canal[], armazenados: Canal[] | null): Canal[] {
  if (!armazenados) return seed;

  const armazenadosPorId = new Map(armazenados.map((c) => [c.id, c]));

  return seed.map((canalSeed) => {
    const canalArmazenado = armazenadosPorId.get(canalSeed.id);
    if (!canalArmazenado) return canalSeed;

    const taxasArmazenadasPorId = new Map(
      canalArmazenado.taxas.map((t) => [t.id, t])
    );

    const taxas: Taxa[] = canalSeed.taxas.map((taxaSeed) => {
      const existente = taxasArmazenadasPorId.get(taxaSeed.id);
      return existente ?? taxaSeed;
    });

    return { ...canalSeed, taxas };
  });
}

export function carregarProdutos(): Produto[] {
  const armazenados = lerChave<Produto[]>(STORAGE_KEYS.produtos);
  return mergeProdutos(produtosSeed, armazenados);
}

export function carregarCanais(): Canal[] {
  const armazenados = lerChave<Canal[]>(STORAGE_KEYS.canais);
  return mergeCanais(canaisSeed, armazenados);
}

export function salvarProdutos(produtos: Produto[]): void {
  escreverChave(STORAGE_KEYS.produtos, produtos);
}

export function salvarCanais(canais: Canal[]): void {
  escreverChave(STORAGE_KEYS.canais, canais);
}

export function restaurarPadroesDeFabrica(produtosAtuais: Produto[]): {
  produtos: Produto[];
  canais: Canal[];
} {
  const produtosCustom = produtosAtuais.filter((p) => p.origem === "custom");
  return {
    produtos: [...produtosSeed, ...produtosCustom],
    canais: canaisSeed,
  };
}

export function exportarJSON(produtos: Produto[], canais: Canal[]): string {
  return JSON.stringify({ produtos, canais }, null, 2);
}

export function importarJSON(
  json: string
): { produtos: Produto[]; canais: Canal[] } | { erro: string } {
  try {
    const dados = JSON.parse(json);
    if (!Array.isArray(dados.produtos) || !Array.isArray(dados.canais)) {
      return { erro: "JSON inválido: esperado { produtos: [], canais: [] }." };
    }
    return { produtos: dados.produtos, canais: dados.canais };
  } catch {
    return { erro: "Não foi possível interpretar o arquivo como JSON." };
  }
}

type EstadoDados = {
  produtos: Produto[];
  canais: Canal[];
  carregado: boolean;
};

export function useDados() {
  const [estado, setEstado] = useState<EstadoDados>({
    produtos: produtosSeed,
    canais: canaisSeed,
    carregado: false,
  });
  const { produtos, canais, carregado } = estado;

  useEffect(() => {
    // Hidratação única a partir do localStorage: o servidor não tem acesso
    // a essa fonte, então o primeiro render sempre usa o seed e só troca
    // para os dados persistidos depois de montar no cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEstado({
      produtos: carregarProdutos(),
      canais: carregarCanais(),
      carregado: true,
    });
  }, []);

  function setProdutosState(produtosNovos: Produto[]) {
    setEstado((e) => ({ ...e, produtos: produtosNovos }));
  }

  function setCanaisState(canaisNovos: Canal[]) {
    setEstado((e) => ({ ...e, canais: canaisNovos }));
  }

  function setProdutos(produtosNovos: Produto[]) {
    setProdutosState(produtosNovos);
    salvarProdutos(produtosNovos);
  }

  function setCanais(canaisNovos: Canal[]) {
    setCanaisState(canaisNovos);
    salvarCanais(canaisNovos);
  }

  function restaurarPadroes() {
    const { produtos: produtosPadrao, canais: canaisPadrao } =
      restaurarPadroesDeFabrica(produtos);
    setProdutos(produtosPadrao);
    setCanais(canaisPadrao);
  }

  return {
    produtos,
    canais,
    carregado,
    setProdutos,
    setCanais,
    restaurarPadroes,
  };
}

type SessaoCalculo = {
  itens: ItemCalculo[];
  precoInput: string;
  modoReverso: boolean;
  margemAlvoInput: string;
};

const SESSAO_CALCULO_PADRAO: SessaoCalculo = {
  itens: [],
  precoInput: "",
  modoReverso: false,
  margemAlvoInput: "20",
};

// Estado de trabalho da calculadora (produtos do kit, preço, modo reverso,
// margem alvo): persistido em localStorage para sobreviver à navegação
// entre páginas, que desmonta o componente e perderia esse estado local.
export function useSessaoCalculo() {
  const [sessao, setSessaoState] = useState<SessaoCalculo>(
    SESSAO_CALCULO_PADRAO
  );
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const salva = lerChave<SessaoCalculo>(STORAGE_KEYS.sessaoCalculo);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (salva) setSessaoState({ ...SESSAO_CALCULO_PADRAO, ...salva });
    setCarregado(true);
  }, []);

  function atualizar(patch: Partial<SessaoCalculo>) {
    setSessaoState((atual) => {
      const nova = { ...atual, ...patch };
      escreverChave(STORAGE_KEYS.sessaoCalculo, nova);
      return nova;
    });
  }

  return {
    itens: sessao.itens,
    setItens: (itens: ItemCalculo[]) => atualizar({ itens }),
    precoInput: sessao.precoInput,
    setPrecoInput: (precoInput: string) => atualizar({ precoInput }),
    modoReverso: sessao.modoReverso,
    setModoReverso: (modoReverso: boolean) => atualizar({ modoReverso }),
    margemAlvoInput: sessao.margemAlvoInput,
    setMargemAlvoInput: (margemAlvoInput: string) =>
      atualizar({ margemAlvoInput }),
    carregado,
  };
}
