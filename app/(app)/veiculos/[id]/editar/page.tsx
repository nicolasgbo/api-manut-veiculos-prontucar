import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api-client";
import { atualizarVeiculoAction } from "@/app/actions/veiculos";
import { VeiculoForm } from "@/components/veiculos/VeiculoForm";
import type { VeiculoResumo } from "@/lib/types-ui";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Editar veículo #${id}` };
}

export default async function EditarVeiculoPage({ params }: PageProps) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let veiculo: VeiculoResumo;
  try {
    veiculo = await apiFetch<VeiculoResumo>(`/api/veiculos/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const action = atualizarVeiculoAction.bind(null, veiculo.id);

  return (
    <>
      <header className="page-hero">
        <p className="breadcrumb">
          <Link href="/veiculos">Veículos</Link> /{" "}
          <Link href={`/veiculos/${veiculo.id}`}>{veiculo.placa}</Link> / Editar
        </p>
        <h1>Editar veículo</h1>
        <p>
          Atualize os dados de {veiculo.marca} {veiculo.modelo}.
        </p>
      </header>

      <section className="panel panel-form">
        <VeiculoForm
          action={action}
          initial={veiculo}
          submitLabel="Salvar alterações"
          cancelHref={`/veiculos/${veiculo.id}`}
        />
      </section>
    </>
  );
}
