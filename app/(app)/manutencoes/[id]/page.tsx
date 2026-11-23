import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api-client";
import { Alert } from "@/components/ui/Alert";
import { DeleteManutencaoButton } from "@/components/manutencoes/DeleteManutencaoButton";
import {
  formatCusto,
  formatDataBr,
  formatKm,
  rotuloTipo,
} from "@/lib/manutencao-labels";
import type { ManutencaoResumo } from "@/lib/types-ui";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sucesso?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Manutenção #${id}` };
}

export default async function ManutencaoDetalhePage({
  params,
  searchParams,
}: PageProps) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const { sucesso } = await searchParams;

  let manutencao: ManutencaoResumo;
  try {
    manutencao = await apiFetch<ManutencaoResumo>(`/api/manutencoes/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const titulo = `${rotuloTipo(manutencao.tipo)} · ${manutencao.veiculo.placa}`;

  return (
    <>
      <header className="page-hero page-hero-row">
        <div>
          <p className="breadcrumb">
            <Link href="/manutencoes">Manutenções</Link> / #{manutencao.id}
          </p>
          <h1>{rotuloTipo(manutencao.tipo)}</h1>
          <p>
            {manutencao.veiculo.marca} {manutencao.veiculo.modelo} (
            {manutencao.veiculo.placa}) · {formatDataBr(manutencao.data)}
          </p>
        </div>
        <div className="hero-actions">
          <Link
            href={`/manutencoes/${manutencao.id}/editar`}
            className="btn btn-primary btn-inline"
          >
            Editar
          </Link>
        </div>
      </header>

      {sucesso === "cadastrado" ? (
        <Alert variant="success">Manutenção registrada com sucesso.</Alert>
      ) : null}
      {sucesso === "atualizado" ? (
        <Alert variant="success">Manutenção atualizada com sucesso.</Alert>
      ) : null}

      <section className="dashboard-grid detail-grid" aria-label="Resumo">
        <article className="stat-card">
          <div className="label">Data</div>
          <div className="value value-sm">{formatDataBr(manutencao.data)}</div>
        </article>
        <article className="stat-card">
          <div className="label">Quilometragem</div>
          <div className="value value-sm">{formatKm(manutencao.km)}</div>
        </article>
        <article className="stat-card">
          <div className="label">Custo</div>
          <div className="value value-sm">{formatCusto(manutencao.custo)}</div>
        </article>
      </section>

      <section className="panel">
        <h2>Detalhes</h2>
        <dl className="detail-list">
          <div>
            <dt>Veículo</dt>
            <dd>
              <Link
                href={`/veiculos/${manutencao.veiculo.id}`}
                className="table-link"
              >
                {manutencao.veiculo.placa}
              </Link>{" "}
              — {manutencao.veiculo.marca} {manutencao.veiculo.modelo}
            </dd>
          </div>
          <div>
            <dt>Tipo</dt>
            <dd>{rotuloTipo(manutencao.tipo)}</dd>
          </div>
          <div>
            <dt>Oficina</dt>
            <dd>{manutencao.oficina || "—"}</dd>
          </div>
          <div>
            <dt>Observações</dt>
            <dd>{manutencao.observacoes || "—"}</dd>
          </div>
          <div>
            <dt>Próxima revisão (km)</dt>
            <dd>
              {manutencao.proximaRevisaoKm != null
                ? formatKm(manutencao.proximaRevisaoKm)
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Próxima revisão (data)</dt>
            <dd>{formatDataBr(manutencao.proximaRevisaoData)}</dd>
          </div>
        </dl>
      </section>

      <section className="panel panel-danger">
        <h2>Zona de exclusão</h2>
        <p>
          A exclusão remove apenas este registro. O km atual do veículo não é
          reduzido automaticamente.
        </p>
        <DeleteManutencaoButton
          id={manutencao.id}
          veiculoId={manutencao.veiculoId}
          rotulo={titulo}
        />
      </section>
    </>
  );
}
