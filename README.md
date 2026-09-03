# Calculadora de Margem Vitanuts

Ferramenta interna para calcular margem, lucro, markup e quebra de custos por produto/kit no canal Site (DTC), com modo reverso (margem alvo → preço ideal).

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A aba "Custos & Produtos" fica em `/custos`.

## Testes

O motor de cálculo (`lib/calc.ts`) é puro e coberto pelos casos da especificação:

```bash
npm run test        # roda uma vez
npm run test:watch  # modo watch
```

## Estrutura

- `lib/calc.ts` — motor de cálculo puro (única fonte da verdade matemática). Nenhum componente calcula nada.
- `lib/storage.ts` — persistência em `localStorage`, com merge entre seed e dados editados pelo usuário.
- `lib/format.ts` — formatação BRL/percentual em pt-BR.
- `data/*.seed.ts` — CMV e taxas padrão (editáveis pela interface, não requer alterar código).
- `app/page.tsx` — aba Calculadora.
- `app/custos/page.tsx` — aba Custos & Produtos.

## Deploy

Deploy automático na Vercel a cada push em `main`. Para conectar pela primeira vez:

```bash
npx vercel link
npx vercel --prod
```

Ou importe o repositório diretamente em [vercel.com/new](https://vercel.com/new).
