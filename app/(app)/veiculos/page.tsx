import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { Alert } from "@/components/ui/Alert";
import { VeiculosBusca } from "@/components/veiculos/VeiculosBusca";
import type { VeiculoResumo } from "@/lib/types-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Veículos",
};

type PageProps = {
  searchParams: Promise<{ busca?: string; sucesso?: string }>;
};

function mensagemSucesso(codigo?: string): string | null {
  switch (codigo) {
    case "cadastrado":
      return "Veículo cadastrado com sucesso.";
    case "atualizado":
      return "Veículo atualizado com sucesso.";
    case "excluido":
      return "Veículo excluído com sucesso.";
    default:
      return null;
  }
}

function formatKm(km: number): string {
  return new Intl.NumberFormat("pt-BR").format(km) + " km";
}

export default async function VeiculosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const busca = params.busca?.trim() || undefined;
  const sucesso = mensagemSucesso(params.sucesso);

  const path = busca
    ? `/api/veiculos?busca=${encodeURIComponent(busca)}`
    : "/api/veiculos";
  const veiculos = await apiFetch<VeiculoResumo[]>(path);

  return (
    <>
      <header className="page-hero page-hero-row">
        <div>
          <h1>Veículos</h1>
          <p>Cadastre e gerencie a frota vinculada à sua conta.</p>
        </div>
        <Link href="/veiculos/novo" className="btn btn-primary btn-inline">
          Novo veículo
        </Link>
      </header>

      {sucesso ? <Alert variant="success">{sucesso}</Alert> : null}

      <section className="panel">
        <VeiculosBusca valorInicial={busca ?? ""} />

        {veiculos.length === 0 ? (
          <div className="empty-state">
            <h2>{busca ? "Nenhum resultado" : "Nenhum veículo cadastrado"}</h2>
            <p>
              {busca
                ? "Tente outro termo de busca ou limpe o filtro."
                : "Comece cadastrando o primeiro veículo da frota."}
            </p>
            {!busca ? (
              <Link href="/veiculos/novo" className="btn btn-primary btn-inline">
                Cadastrar veículo
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Ano</th>
                  <th>Km</th>
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {veiculos.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link href={`/veiculos/${v.id}`} className="table-link">
                        {v.placa}
                      </Link>
                    </td>
                    <td>{v.marca}</td>
                    <td>{v.modelo}</td>
                    <td>{v.ano}</td>
                    <td>{formatKm(v.kmAtual)}</td>
                    <td className="table-actions">
                      <Link
                        href={`/veiculos/${v.id}`}
                        className="btn btn-ghost btn-compact"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/veiculos/${v.id}/editar`}
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
        )}
      </section>
    </>
  );
}
