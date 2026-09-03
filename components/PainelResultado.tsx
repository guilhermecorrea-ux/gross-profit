import type { ResultadoCalculo } from "@/lib/types";
import { formatarBRL, formatarMarkup, formatarPercentual } from "@/lib/format";
import { corDaMargem } from "@/lib/constants";

type Props =
  | {
      modoReverso: false;
      resultado: ResultadoCalculo;
      preco: number;
    }
  | {
      modoReverso: true;
      resultado: ResultadoCalculo | null;
      precoIdeal: number | null;
      erro: string | null;
    };

const CORES_SEMAFORO: Record<string, string> = {
  vermelho: "bg-laranja-escuro",
  amarelo: "bg-amarelo",
  verde: "bg-verde",
  neutro: "bg-navy/20",
};

const LABEL_SEMAFORO: Record<string, string> = {
  vermelho: "Margem apertada",
  amarelo: "Margem mediana",
  verde: "Margem saudável",
  neutro: "Sem dados suficientes",
};

export function PainelResultado(props: Props) {
  if (props.modoReverso && !props.resultado) {
    return (
      <div className="rounded-lg border border-laranja-escuro/30 bg-laranja-escuro/5 p-4">
        <p className="text-sm font-medium text-laranja-escuro">
          Meta inalcançável
        </p>
        <p className="mt-1 text-sm text-navy/70">{props.erro}</p>
      </div>
    );
  }

  const resultado = props.resultado as ResultadoCalculo;
  const cor = corDaMargem(resultado.margem);
  const preco = props.modoReverso ? props.precoIdeal ?? 0 : props.preco;
  const percentualCmv = preco > 0 ? resultado.cmvTotal / preco : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-navy/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-navy/50">
            Margem
          </p>
          <p className="mt-1 text-3xl font-semibold text-navy">
            {formatarPercentual(resultado.margem)}
          </p>
        </div>
        <div className="rounded-lg border border-navy/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-navy/50">
            {props.modoReverso ? "Preço ideal" : "Lucro"}
          </p>
          <p className="mt-1 text-3xl font-semibold text-navy">
            {props.modoReverso
              ? formatarBRL(props.precoIdeal ?? NaN)
              : formatarBRL(resultado.lucro)}
          </p>
          {props.modoReverso && (
            <p className="mt-0.5 text-xs text-navy/50">
              Lucro: {formatarBRL(resultado.lucro)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${CORES_SEMAFORO[cor]}`} />
          <span className="text-sm text-navy/70">{LABEL_SEMAFORO[cor]}</span>
        </div>
        <div className="text-sm text-navy/50">
          Markup:{" "}
          <span className="font-medium text-navy">
            {formatarMarkup(resultado.markup)}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-navy/10">
        <table className="w-full text-sm">
          <thead className="bg-navy/5 text-left text-xs uppercase tracking-wide text-navy/50">
            <tr>
              <th className="px-3 py-2 font-medium">Linha de custo</th>
              <th className="px-3 py-2 text-right font-medium">R$</th>
              <th className="px-3 py-2 text-right font-medium">% do preço</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            <tr>
              <td className="px-3 py-2 text-navy">CMV</td>
              <td className="px-3 py-2 text-right text-navy">
                {formatarBRL(resultado.cmvTotal)}
              </td>
              <td className="px-3 py-2 text-right text-navy/60">
                {formatarPercentual(percentualCmv)}
              </td>
            </tr>
            {resultado.linhas.map((linha) => (
              <tr key={linha.nome}>
                <td className="px-3 py-2 text-navy">{linha.nome}</td>
                <td className="px-3 py-2 text-right text-navy">
                  {formatarBRL(linha.valorReais)}
                </td>
                <td className="px-3 py-2 text-right text-navy/60">
                  {formatarPercentual(linha.percentualDoPreco)}
                </td>
              </tr>
            ))}
            <tr className="bg-navy/5 font-semibold">
              <td className="px-3 py-2 text-navy">Custo total</td>
              <td className="px-3 py-2 text-right text-navy">
                {formatarBRL(resultado.custoTotal)}
              </td>
              <td className="px-3 py-2 text-right text-navy/60" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
