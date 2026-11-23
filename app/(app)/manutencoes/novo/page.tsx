import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { criarManutencaoAction } from "@/app/actions/manutencoes";
import { ManutencaoForm } from "@/components/manutencoes/ManutencaoForm";
import { Alert } from "@/components/ui/Alert";
import type { VeiculoResumo } from "@/lib/types-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nova manutenção",
};

type PageProps = {
  searchParams: Promise<{ veiculoId?: string }>;
};

export default async function NovaManutencaoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const veiculos = await apiFetch<VeiculoResumo[]>("/api/veiculos");

  if (veiculos.length === 0) {
    redirect("/veiculos/novo");
  }

  const veiculoPre = params.veiculoId
    ? veiculos.find((v) => String(v.id) === params.veiculoId)
    : undefined;

  return (
    <>
      <header className="page-hero">
        <p className="breadcrumb">
          <Link href="/manutencoes">Manutenções</Link> / Nova
        </p>
        <h1>Registrar manutenção</h1>
        <p>
          Informe o veículo, o tipo de serviço e os dados do atendimento.
        </p>
      </header>

      {veiculoPre ? (
        <Alert variant="success">
          Veículo pré-selecionado: {veiculoPre.placa} — {veiculoPre.marca}{" "}
          {veiculoPre.modelo}.
        </Alert>
      ) : null}

      <section className="panel panel-form panel-form-wide">
        <ManutencaoForm
          action={criarManutencaoAction}
          veiculos={veiculos}
          initial={
            veiculoPre
              ? { veiculoId: veiculoPre.id, veiculo: veiculoPre }
              : undefined
          }
          submitLabel="Registrar manutenção"
          cancelHref="/manutencoes"
        />
      </section>
    </>
  );
}
