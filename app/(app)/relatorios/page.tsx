import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api-client";
import { Alert } from "@/components/ui/Alert";
import { RelatorioFiltros } from "@/components/relatorios/RelatorioFiltros";
import { RelatoriosTabs } from "@/components/relatorios/RelatoriosTabs";
import { GastosPorVeiculoPanel } from "@/components/relatorios/GastosPorVeiculoPanel";
import { GastosPorTipoPanel } from "@/components/relatorios/GastosPorTipoPanel";
import { CustoPorKmPanel } from "@/components/relatorios/CustoPorKmPanel";
import { RevisoesPendentesPanel } from "@/components/relatorios/RevisoesPendentesPanel";
import {
  ABAS_RELATORIO,
  isAbaRelatorio,
  montarQueryRelatorio,
  type AbaRelatorioId,
  type CustoPorKmResponse,
  type FiltrosRelatorioUi,
  type GastosPorTipoResponse,
  type GastosPorVeiculoResponse,
  type RevisoesPendentesResponse,
} from "@/lib/relatorio-ui";
import type { VeiculoResumo } from "@/lib/types-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Relatórios",
};

type PageProps = {
  searchParams: Promise<{
    aba?: string;
    veiculoId?: string;
    dataDe?: string;
    dataAte?: string;
  }>;
};

export default async function RelatoriosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const aba: AbaRelatorioId = isAbaRelatorio(params.aba)
    ? params.aba
    : "gastos";
  const meta = ABAS_RELATORIO.find((a) => a.id === aba)!;

  const filtros: FiltrosRelatorioUi = {
    veiculoId: params.veiculoId || undefined,
    dataDe: meta.usaPeriodo ? params.dataDe || undefined : undefined,
    dataAte: meta.usaPeriodo ? params.dataAte || undefined : undefined,
  };

  const veiculos = await apiFetch<VeiculoResumo[]>("/api/veiculos").catch(
    () => [] as VeiculoResumo[],
  );

  let erro: string | null = null;
  let gastos: GastosPorVeiculoResponse | null = null;
  let tipos: GastosPorTipoResponse | null = null;
  let custoKm: CustoPorKmResponse | null = null;
  let pendentes: RevisoesPendentesResponse | null = null;

  try {
    const path = `${meta.path}${montarQueryRelatorio(filtros, meta.usaPeriodo)}`;
    if (aba === "gastos") {
      gastos = await apiFetch<GastosPorVeiculoResponse>(path);
    } else if (aba === "tipos") {
      tipos = await apiFetch<GastosPorTipoResponse>(path);
    } else if (aba === "custo-km") {
      custoKm = await apiFetch<CustoPorKmResponse>(path);
    } else {
      pendentes = await apiFetch<RevisoesPendentesResponse>(path);
    }
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      redirect("/auth/limpar-sessao");
    }
    if (e instanceof ApiError) {
      const detalhes = e.detalhes?.map((d) => d.mensagem).filter(Boolean);
      erro =
        detalhes && detalhes.length > 0
          ? `${e.message}: ${detalhes.join(" · ")}`
          : e.message;
    } else {
      throw e;
    }
  }

  return (
    <>
      <header className="page-hero">
        <h1>Relatórios</h1>
        <p>
          Acompanhe gastos, custo por quilômetro e revisões pendentes com base
          nos dados reais da frota.
        </p>
      </header>

      <RelatoriosTabs abaAtual={aba} filtros={filtros} />

      <section className="panel">
        <div className="report-heading">
          <h2>{meta.label}</h2>
          <p>{meta.descricao}</p>
        </div>

        <RelatorioFiltros
          aba={aba}
          veiculos={veiculos}
          filtros={filtros}
          usaPeriodo={meta.usaPeriodo}
        />

        {erro ? <Alert>{erro}</Alert> : null}

        {!erro && aba === "gastos" && gastos ? (
          <GastosPorVeiculoPanel data={gastos} />
        ) : null}
        {!erro && aba === "tipos" && tipos ? (
          <GastosPorTipoPanel data={tipos} />
        ) : null}
        {!erro && aba === "custo-km" && custoKm ? (
          <CustoPorKmPanel data={custoKm} />
        ) : null}
        {!erro && aba === "pendentes" && pendentes ? (
          <RevisoesPendentesPanel data={pendentes} />
        ) : null}
      </section>
    </>
  );
}
