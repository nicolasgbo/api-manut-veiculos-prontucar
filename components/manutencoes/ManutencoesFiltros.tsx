import Link from "next/link";
import { OPCOES_TIPO_MANUTENCAO } from "@/lib/manutencao-labels";
import type { VeiculoResumo } from "@/lib/types-ui";

export type FiltrosManutencaoUi = {
  veiculoId?: string;
  tipo?: string;
  dataDe?: string;
  dataAte?: string;
  busca?: string;
};

type ManutencoesFiltrosProps = {
  veiculos: VeiculoResumo[];
  filtros: FiltrosManutencaoUi;
};

export function ManutencoesFiltros({
  veiculos,
  filtros,
}: ManutencoesFiltrosProps) {
  const temFiltro = Boolean(
    filtros.veiculoId ||
      filtros.tipo ||
      filtros.dataDe ||
      filtros.dataAte ||
      filtros.busca,
  );

  return (
    <form className="filter-bar" method="get" action="/manutencoes">
      <div className="field">
        <label htmlFor="filtro-veiculo">Veículo</label>
        <select
          id="filtro-veiculo"
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

      <div className="field">
        <label htmlFor="filtro-tipo">Tipo</label>
        <select id="filtro-tipo" name="tipo" defaultValue={filtros.tipo ?? ""}>
          <option value="">Todos</option>
          {OPCOES_TIPO_MANUTENCAO.map((op) => (
            <option key={op.valor} value={op.valor}>
              {op.rotulo}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filtro-de">Data inicial</label>
        <input
          id="filtro-de"
          name="dataDe"
          type="date"
          defaultValue={filtros.dataDe ?? ""}
        />
      </div>

      <div className="field">
        <label htmlFor="filtro-ate">Data final</label>
        <input
          id="filtro-ate"
          name="dataAte"
          type="date"
          defaultValue={filtros.dataAte ?? ""}
        />
      </div>

      <div className="field filter-busca">
        <label htmlFor="filtro-busca">Busca</label>
        <input
          id="filtro-busca"
          name="busca"
          type="search"
          placeholder="Oficina ou observações"
          defaultValue={filtros.busca ?? ""}
        />
      </div>

      <div className="filter-actions">
        <button type="submit" className="btn btn-primary btn-inline">
          Filtrar
        </button>
        {temFiltro ? (
          <Link href="/manutencoes" className="btn btn-ghost btn-inline">
            Limpar
          </Link>
        ) : null}
      </div>
    </form>
  );
}
