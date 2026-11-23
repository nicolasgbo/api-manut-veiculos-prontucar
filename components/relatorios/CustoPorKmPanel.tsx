import Link from "next/link";
import { formatCusto, formatKm } from "@/lib/manutencao-labels";
import type { CustoPorKmResponse } from "@/lib/relatorio-ui";

type Props = {
  data: CustoPorKmResponse;
};

export function CustoPorKmPanel({ data }: Props) {
  const comDados = data.veiculos.filter((v) => v.custoPorKm != null);

  return (
    <>
      <section className="dashboard-grid detail-grid" aria-label="Resumo">
        <article className="stat-card">
          <div className="label">Veículos analisados</div>
          <div className="value value-sm">{data.veiculos.length}</div>
        </article>
        <article className="stat-card">
          <div className="label">Com custo/km</div>
          <div className="value value-sm">{comDados.length}</div>
        </article>
        <article className="stat-card">
          <div className="label">Dados insuficientes</div>
          <div className="value value-sm">
            {data.veiculos.length - comDados.length}
          </div>
        </article>
      </section>

      {data.veiculos.length === 0 ? (
        <div className="empty-state">
          <h2>Nenhum veículo encontrado</h2>
          <p>Cadastre veículos e manutenções para calcular o custo por km.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Veículo</th>
                <th>Total gasto</th>
                <th>Km considerados</th>
                <th>Custo por km</th>
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
                  <td>{formatCusto(v.totalGasto)}</td>
                  <td>{formatKm(v.kmRodado)}</td>
                  <td>
                    {v.custoPorKm == null ? (
                      <span className="badge badge-muted">
                        Dados insuficientes
                      </span>
                    ) : (
                      formatCusto(v.custoPorKm)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="field-hint report-hint">
        O custo por km só é calculado quando há quilômetros rodados no período
        (diferença entre o maior e o menor km lançado). Valores nulos da API
        aparecem como “Dados insuficientes”.
      </p>
    </>
  );
}
