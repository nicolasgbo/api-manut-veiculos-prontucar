import Link from "next/link";
import { formatCusto } from "@/lib/manutencao-labels";
import type { GastosPorVeiculoResponse } from "@/lib/relatorio-ui";

type Props = {
  data: GastosPorVeiculoResponse;
};

export function GastosPorVeiculoPanel({ data }: Props) {
  const comGasto = data.veiculos.filter((v) => v.quantidade > 0);

  return (
    <>
      <section className="dashboard-grid detail-grid" aria-label="Resumo">
        <article className="stat-card">
          <div className="label">Total geral</div>
          <div className="value value-sm">{formatCusto(data.totalGeral)}</div>
        </article>
        <article className="stat-card">
          <div className="label">Veículos no relatório</div>
          <div className="value value-sm">{data.veiculos.length}</div>
        </article>
        <article className="stat-card">
          <div className="label">Com manutenções</div>
          <div className="value value-sm">{comGasto.length}</div>
        </article>
      </section>

      {data.veiculos.length === 0 ? (
        <div className="empty-state">
          <h2>Nenhum veículo encontrado</h2>
          <p>Cadastre veículos para acompanhar os gastos da frota.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Veículo</th>
                <th>Manutenções</th>
                <th>Total gasto</th>
              </tr>
            </thead>
            <tbody>
              {data.veiculos.map((v) => (
                <tr key={v.veiculoId}>
                  <td>
                    <Link
                      href={`/veiculos/${v.veiculoId}`}
                      className="table-link"
                    >
                      {v.placa}
                    </Link>
                    <div className="table-sub">
                      {v.marca} {v.modelo}
                    </div>
                  </td>
                  <td>{v.quantidade}</td>
                  <td>{formatCusto(v.totalGasto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
