import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Alert } from "@/components/ui/Alert";
import {
  ManutencoesFiltros,
  type FiltrosManutencaoUi,
} from "@/components/manutencoes/ManutencoesFiltros";
import {
  formatCusto,
  formatDataBr,
  formatKm,
  rotuloTipo,
} from "@/lib/manutencao-labels";
import type { ManutencaoResumo, VeiculoResumo } from "@/lib/types-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manutenções",
};

type PageProps = {
  searchParams: Promise<FiltrosManutencaoUi & { sucesso?: string }>;
};

function mensagemSucesso(codigo?: string): string | null {
  switch (codigo) {
    case "cadastrado":
      return "Manutenção registrada com sucesso.";
    case "atualizado":
      return "Manutenção atualizada com sucesso.";
    case "excluido":
      return "Manutenção excluída com sucesso.";
    default:
      return null;
  }
}

function montarQuery(filtros: FiltrosManutencaoUi): string {
  const qs = new URLSearchParams();
  if (filtros.veiculoId) qs.set("veiculoId", filtros.veiculoId);
  if (filtros.tipo) qs.set("tipo", filtros.tipo);
  if (filtros.dataDe) qs.set("dataDe", filtros.dataDe);
  if (filtros.dataAte) qs.set("dataAte", filtros.dataAte);
  if (filtros.busca?.trim()) qs.set("busca", filtros.busca.trim());
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export default async function ManutencoesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filtros: FiltrosManutencaoUi = {
    veiculoId: params.veiculoId || undefined,
    tipo: params.tipo || undefined,
    dataDe: params.dataDe || undefined,
    dataAte: params.dataAte || undefined,
    busca: params.busca || undefined,
  };
  const sucesso = mensagemSucesso(params.sucesso);

  const veiculos = await apiFetch<VeiculoResumo[]>("/api/veiculos").catch(
    () => [] as VeiculoResumo[],
  );

  let manutencoes: ManutencaoResumo[] = [];
  let erroFiltro: string | null = null;

  try {
    manutencoes = await apiFetch<ManutencaoResumo[]>(
      `/api/manutencoes${montarQuery(filtros)}`,
    );
  } catch (e) {
    if (e instanceof ApiError) {
      erroFiltro = e.message;
    } else {
      throw e;
    }
  }

  const temFiltro = Boolean(
    filtros.veiculoId ||
      filtros.tipo ||
      filtros.dataDe ||
      filtros.dataAte ||
      filtros.busca,
  );

  return (
    <>
      <header className="page-hero page-hero-row">
        <div>
          <h1>Manutenções</h1>
          <p>Histórico de serviços vinculados aos veículos da frota.</p>
        </div>
        <Link
          href="/manutencoes/novo"
          className="btn btn-primary btn-inline"
        >
          Nova manutenção
        </Link>
      </header>

      {sucesso ? <Alert variant="success">{sucesso}</Alert> : null}
      {erroFiltro ? <Alert>{erroFiltro}</Alert> : null}

      <section className="panel">
        <ManutencoesFiltros veiculos={veiculos} filtros={filtros} />

        {manutencoes.length === 0 && !erroFiltro ? (
          <div className="empty-state">
            <h2>
              {temFiltro
                ? "Nenhum resultado"
                : "Nenhuma manutenção registrada"}
            </h2>
            <p>
              {temFiltro
                ? "Ajuste ou limpe os filtros para ver mais registros."
                : veiculos.length === 0
                  ? "Cadastre um veículo antes de registrar manutenções."
                  : "Registre a primeira manutenção da frota."}
            </p>
            {!temFiltro ? (
              <Link
                href={
                  veiculos.length === 0 ? "/veiculos/novo" : "/manutencoes/novo"
                }
                className="btn btn-primary btn-inline"
              >
                {veiculos.length === 0
                  ? "Cadastrar veículo"
                  : "Registrar manutenção"}
              </Link>
            ) : null}
          </div>
        ) : null}

        {manutencoes.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Veículo</th>
                  <th>Tipo</th>
                  <th>Km</th>
                  <th>Custo</th>
                  <th>Oficina</th>
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {manutencoes.map((m) => (
                  <tr key={m.id}>
                    <td>{formatDataBr(m.data)}</td>
                    <td>
                      <Link
                        href={`/veiculos/${m.veiculo.id}`}
                        className="table-link"
                      >
                        {m.veiculo.placa}
                      </Link>
                      <div className="table-sub">
                        {m.veiculo.marca} {m.veiculo.modelo}
                      </div>
                    </td>
                    <td>{rotuloTipo(m.tipo)}</td>
                    <td>{formatKm(m.km)}</td>
                    <td>{formatCusto(m.custo)}</td>
                    <td>{m.oficina || "—"}</td>
                    <td className="table-actions">
                      <Link
                        href={`/manutencoes/${m.id}`}
                        className="btn btn-ghost btn-compact"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/manutencoes/${m.id}/editar`}
                        className="btn btn-ghost btn-compact"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </>
  );
}
