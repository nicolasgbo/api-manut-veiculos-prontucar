import Link from "next/link";
import {
  formatDataBr,
  formatKm,
  rotuloTipo,
} from "@/lib/manutencao-labels";
import type { RevisoesPendentesResponse } from "@/lib/relatorio-ui";

type Props = {
  data: RevisoesPendentesResponse;
};

function badgeMotivo(motivo: string) {
  const porData = /data/i.test(motivo);
  const porKm = /\bkm\b/i.test(motivo);
  if (porData && !porKm) {
    return <span className="badge badge-date">Por data</span>;
  }
  if (porKm && !porData) {
    return <span className="badge badge-km">Por km</span>;
  }
  return <span className="badge badge-muted">Pendente</span>;
}

export function RevisoesPendentesPanel({ data }: Props) {
  return (
    <>
      <section className="dashboard-grid detail-grid" aria-label="Resumo">
        <article className="stat-card">
          <div className="label">Pendentes</div>
          <div className="value value-sm">{data.total}</div>
        </article>
        <article className="stat-card">
          <div className="label">Referência (hoje)</div>
          <div className="value value-sm">{formatDataBr(data.hoje)}</div>
        </article>
      </section>

      {data.pendentes.length === 0 ? (
        <div className="empty-state">
          <h2>Nenhuma revisão pendente</h2>
          <p>
            Não há próximas revisões vencidas por data ou quilometragem com os
            filtros atuais.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Veículo</th>
                <th>Tipo</th>
                <th>Última data</th>
                <th>Km atual</th>
                <th>Próxima revisão</th>
                <th>Motivos</th>
              </tr>
            </thead>
            <tbody>
              {data.pendentes.map((p) => (
                <tr key={`${p.manutencaoId}-${p.tipo}`}>
                  <td>
                    <Link
                      href={`/veiculos/${p.veiculoId}`}
                      className="table-link"
                    >
                      {p.placa}
                    </Link>
                    <div className="table-sub">
                      {p.marca} {p.modelo}
                    </div>
                  </td>
                  <td>{rotuloTipo(p.tipo)}</td>
                  <td>{formatDataBr(p.data)}</td>
                  <td>{formatKm(p.kmAtual)}</td>
                  <td>
                    <div>
                      {p.proximaRevisaoData
                        ? formatDataBr(p.proximaRevisaoData)
                        : "—"}
                    </div>
                    <div className="table-sub">
                      {p.proximaRevisaoKm != null
                        ? formatKm(p.proximaRevisaoKm)
                        : "—"}
                    </div>
                  </td>
                  <td>
                    <ul className="motivo-list">
                      {p.motivos.map((m) => (
                        <li key={m}>
                          {badgeMotivo(m)}
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
