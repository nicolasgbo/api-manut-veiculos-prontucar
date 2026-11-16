import { formatCusto, rotuloTipo } from "@/lib/manutencao-labels";
import type { GastosPorTipoResponse } from "@/lib/relatorio-ui";

type Props = {
  data: GastosPorTipoResponse;
};

export function GastosPorTipoPanel({ data }: Props) {
  const max = Math.max(...data.tipos.map((t) => t.totalGasto), 0);
  const total = data.tipos.reduce((s, t) => s + t.totalGasto, 0);
  const qtd = data.tipos.reduce((s, t) => s + t.quantidade, 0);

  return (
    <>
      <section className="dashboard-grid detail-grid" aria-label="Resumo">
        <article className="stat-card">
          <div className="label">Total gasto</div>
          <div className="value value-sm">{formatCusto(total)}</div>
        </article>
        <article className="stat-card">
          <div className="label">Tipos com registro</div>
          <div className="value value-sm">{data.tipos.length}</div>
        </article>
        <article className="stat-card">
          <div className="label">Manutenções</div>
          <div className="value value-sm">{qtd}</div>
        </article>
      </section>

      {data.tipos.length === 0 ? (
        <div className="empty-state">
          <h2>Nenhum gasto no período</h2>
          <p>Ajuste os filtros ou registre manutenções para ver este relatório.</p>
        </div>
      ) : (
        <>
          <div className="chart-list" aria-label="Distribuição por tipo">
            {data.tipos.map((t) => {
              const pct = max > 0 ? Math.round((t.totalGasto / max) * 100) : 0;
              return (
                <div key={t.tipo} className="chart-row">
                  <div className="chart-label">
                    <strong>{rotuloTipo(t.tipo)}</strong>
                    <span>
                      {t.quantidade} · {formatCusto(t.totalGasto)}
                    </span>
                  </div>
                  <div className="chart-track" aria-hidden="true">
                    <div className="chart-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.tipos.map((t) => (
                  <tr key={t.tipo}>
                    <td>{rotuloTipo(t.tipo)}</td>
                    <td>{t.quantidade}</td>
                    <td>{formatCusto(t.totalGasto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
