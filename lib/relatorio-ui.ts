export const ABAS_RELATORIO = [
  {
    id: "gastos",
    label: "Gastos por veículo",
    descricao: "Total geral e detalhamento por veículo da frota.",
    path: "/api/relatorios/gastos-por-veiculo",
    usaPeriodo: true,
  },
  {
    id: "tipos",
    label: "Gastos por tipo",
    descricao: "Quantidade e custo agrupados por tipo de serviço.",
    path: "/api/relatorios/por-tipo",
    usaPeriodo: true,
  },
  {
    id: "custo-km",
    label: "Custo por km",
    descricao: "Relação entre gastos e quilômetros no período.",
    path: "/api/relatorios/custo-por-km",
    usaPeriodo: true,
  },
  {
    id: "pendentes",
    label: "Revisões pendentes",
    descricao: "Próximas revisões vencidas por data ou quilometragem.",
    path: "/api/relatorios/revisoes-pendentes",
    usaPeriodo: false,
  },
] as const;

export type AbaRelatorioId = (typeof ABAS_RELATORIO)[number]["id"];

export function isAbaRelatorio(value: string | undefined): value is AbaRelatorioId {
  return ABAS_RELATORIO.some((a) => a.id === value);
}

export type FiltrosRelatorioUi = {
  veiculoId?: string;
  dataDe?: string;
  dataAte?: string;
};

export function temFiltroRelatorio(
  filtros: FiltrosRelatorioUi,
  usaPeriodo: boolean,
): boolean {
  if (filtros.veiculoId) return true;
  if (!usaPeriodo) return false;
  return Boolean(filtros.dataDe || filtros.dataAte);
}

export function montarQueryRelatorio(
  filtros: FiltrosRelatorioUi,
  usaPeriodo: boolean,
): string {
  const qs = new URLSearchParams();
  if (filtros.veiculoId) qs.set("veiculoId", filtros.veiculoId);
  if (usaPeriodo) {
    if (filtros.dataDe) qs.set("dataDe", filtros.dataDe);
    if (filtros.dataAte) qs.set("dataAte", filtros.dataAte);
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function hrefRelatorio(
  aba: AbaRelatorioId,
  filtros: FiltrosRelatorioUi,
): string {
  const qs = new URLSearchParams();
  qs.set("aba", aba);
  if (filtros.veiculoId) qs.set("veiculoId", filtros.veiculoId);
  const meta = ABAS_RELATORIO.find((a) => a.id === aba);
  if (meta?.usaPeriodo) {
    if (filtros.dataDe) qs.set("dataDe", filtros.dataDe);
    if (filtros.dataAte) qs.set("dataAte", filtros.dataAte);
  }
  return `/relatorios?${qs.toString()}`;
}

export type GastosPorVeiculoResponse = {
  filtros: FiltrosRelatorioUi;
  totalGeral: number;
  veiculos: Array<{
    veiculoId: number;
    placa: string;
    marca: string;
    modelo: string;
    quantidade: number;
    totalGasto: number;
  }>;
};

export type GastosPorTipoResponse = {
  filtros: FiltrosRelatorioUi;
  tipos: Array<{
    tipo: string;
    quantidade: number;
    totalGasto: number;
  }>;
};

export type CustoPorKmResponse = {
  filtros: FiltrosRelatorioUi;
  veiculos: Array<{
    veiculoId: number;
    placa: string;
    marca: string;
    modelo: string;
    totalGasto: number;
    kmRodado: number;
    custoPorKm: number | null;
  }>;
};

export type RevisoesPendentesResponse = {
  hoje: string;
  total: number;
  pendentes: Array<{
    manutencaoId: number;
    veiculoId: number;
    placa: string;
    marca: string;
    modelo: string;
    kmAtual: number;
    tipo: string;
    data: string;
    proximaRevisaoKm: number | null;
    proximaRevisaoData: string | null;
    motivos: string[];
  }>;
};
