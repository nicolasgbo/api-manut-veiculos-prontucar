import Link from "next/link";
import {
  hrefRelatorio,
  temFiltroRelatorio,
  type AbaRelatorioId,
  type FiltrosRelatorioUi,
} from "@/lib/relatorio-ui";
import type { VeiculoResumo } from "@/lib/types-ui";

type RelatorioFiltrosProps = {
  aba: AbaRelatorioId;
  veiculos: VeiculoResumo[];
  filtros: FiltrosRelatorioUi;
  usaPeriodo: boolean;
};

export function RelatorioFiltros({
  aba,
  veiculos,
  filtros,
  usaPeriodo,
}: RelatorioFiltrosProps) {
  const temFiltro = temFiltroRelatorio(filtros, usaPeriodo);

  return (
    <form className="filter-bar filter-bar-report" method="get" action="/relatorios">
      <input type="hidden" name="aba" value={aba} />

      <div className="field">
        <label htmlFor="rel-veiculo">Veículo</label>
        <select
          id="rel-veiculo"
          name="veiculoId"
          defaultValue={filtros.veiculoId ?? ""}
        >
          <option value="">Todos</option>
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} — {v.marca} {v.modelo}
            </option>
          ))}
        </select>
      </div>

      {usaPeriodo ? (
        <>
          <div className="field">
            <label htmlFor="rel-de">Data inicial</label>
            <input
              id="rel-de"
              name="dataDe"
              type="date"
              defaultValue={filtros.dataDe ?? ""}
            />
          </div>
          <div className="field">
            <label htmlFor="rel-ate">Data final</label>
            <input
              id="rel-ate"
              name="dataAte"
              type="date"
              defaultValue={filtros.dataAte ?? ""}
            />
          </div>
        </>
      ) : null}

      <div className="filter-actions">
        <button type="submit" className="btn btn-primary btn-inline">
          Aplicar filtros
        </button>
        {temFiltro ? (
          <Link
            href={hrefRelatorio(aba, {})}
            className="btn btn-ghost btn-inline"
          >
            Limpar filtros
          </Link>
        ) : null}
      </div>
    </form>
  );
}
