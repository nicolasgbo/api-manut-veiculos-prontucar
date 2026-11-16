import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api-client";
import { atualizarManutencaoAction } from "@/app/actions/manutencoes";
import { ManutencaoForm } from "@/components/manutencoes/ManutencaoForm";
import { rotuloTipo } from "@/lib/manutencao-labels";
import type { ManutencaoResumo, VeiculoResumo } from "@/lib/types-ui";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Editar manutenção #${id}` };
}

export default async function EditarManutencaoPage({ params }: PageProps) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let manutencao: ManutencaoResumo;
  try {
    manutencao = await apiFetch<ManutencaoResumo>(`/api/manutencoes/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const veiculos = await apiFetch<VeiculoResumo[]>("/api/veiculos");
  const action = atualizarManutencaoAction.bind(
    null,
    manutencao.id,
    manutencao.veiculoId,
  );

  // Normaliza data MySQL para input type="date"
  const initial = {
    ...manutencao,
    data: String(manutencao.data).slice(0, 10),
    proximaRevisaoData: manutencao.proximaRevisaoData
      ? String(manutencao.proximaRevisaoData).slice(0, 10)
      : null,
  };

  return (
    <>
      <header className="page-hero">
        <p className="breadcrumb">
          <Link href="/manutencoes">Manutenções</Link> /{" "}
          <Link href={`/manutencoes/${manutencao.id}`}>#{manutencao.id}</Link> /
          Editar
        </p>
        <h1>Editar manutenção</h1>
        <p>
          {rotuloTipo(manutencao.tipo)} do veículo {manutencao.veiculo.placa}.
        </p>
      </header>

      <section className="panel panel-form panel-form-wide">
        <ManutencaoForm
          action={action}
          veiculos={veiculos}
          initial={initial}
          veiculoFixo
          submitLabel="Salvar alterações"
          cancelHref={`/manutencoes/${manutencao.id}`}
        />
      </section>
    </>
  );
}
