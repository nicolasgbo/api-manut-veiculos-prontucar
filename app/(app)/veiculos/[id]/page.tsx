import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api-client";
import { Alert } from "@/components/ui/Alert";
import { DeleteVeiculoButton } from "@/components/veiculos/DeleteVeiculoButton";
import type { VeiculoResumo } from "@/lib/types-ui";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sucesso?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Veículo #${id}` };
}

function formatKm(km: number): string {
  return new Intl.NumberFormat("pt-BR").format(km) + " km";
}

/** Formata datetime MySQL sem depender de fuso do runtime (evita mismatch). */
function formatCriadoEm(value: string): string {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return value;
  return `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}`;
}

export default async function VeiculoDetalhePage({
  params,
  searchParams,
}: PageProps) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const { sucesso } = await searchParams;

  let veiculo: VeiculoResumo;
  try {
    veiculo = await apiFetch<VeiculoResumo>(`/api/veiculos/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  return (
    <>
      <header className="page-hero page-hero-row">
        <div>
          <p className="breadcrumb">
            <Link href="/veiculos">Veículos</Link> / {veiculo.placa}
          </p>
          <h1>
            {veiculo.marca} {veiculo.modelo}
          </h1>
          <p>
            Placa {veiculo.placa} · {veiculo.ano} · {formatKm(veiculo.kmAtual)}
          </p>
        </div>
        <div className="hero-actions">
          <Link
            href={`/manutencoes/novo?veiculoId=${veiculo.id}`}
            className="btn btn-ghost btn-inline"
          >
            Nova manutenção
          </Link>
          <Link
            href={`/veiculos/${veiculo.id}/editar`}
            className="btn btn-primary btn-inline"
          >
            Editar
          </Link>
        </div>
      </header>

      {sucesso === "atualizado" ? (
        <Alert variant="success">Veículo atualizado com sucesso.</Alert>
      ) : null}

      <section className="dashboard-grid detail-grid" aria-label="Detalhes">
        <article className="stat-card">
          <div className="label">Placa</div>
          <div className="value value-sm">{veiculo.placa}</div>
        </article>
        <article className="stat-card">
          <div className="label">Ano</div>
          <div className="value value-sm">{veiculo.ano}</div>
        </article>
        <article className="stat-card">
          <div className="label">Quilometragem</div>
          <div className="value value-sm">{formatKm(veiculo.kmAtual)}</div>
        </article>
      </section>

      <section className="panel">
        <h2>Identificação</h2>
        <dl className="detail-list">
          <div>
            <dt>Marca</dt>
            <dd>{veiculo.marca}</dd>
          </div>
          <div>
            <dt>Modelo</dt>
            <dd>{veiculo.modelo}</dd>
          </div>
          {veiculo.criadoEm ? (
            <div>
              <dt>Cadastrado em</dt>
              <dd>{formatCriadoEm(String(veiculo.criadoEm))}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="panel panel-danger">
        <h2>Zona de exclusão</h2>
        <p>
          Veículos com manutenções vinculadas não podem ser excluídos. A
          confirmação será solicitada antes de apagar.
        </p>
        <DeleteVeiculoButton id={veiculo.id} placa={veiculo.placa} />
      </section>
    </>
  );
}
