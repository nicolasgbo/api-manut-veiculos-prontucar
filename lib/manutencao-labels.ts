import {
  TIPOS_MANUTENCAO,
  type TipoManutencao,
} from "@/types/Manutencao";

export const ROTULOS_TIPO_MANUTENCAO: Record<TipoManutencao, string> = {
  TROCA_OLEO: "Troca de óleo",
  FREIOS: "Freios",
  PNEUS: "Pneus",
  REVISAO: "Revisão",
  OUTROS: "Outros",
};

export const OPCOES_TIPO_MANUTENCAO = TIPOS_MANUTENCAO.map((tipo) => ({
  valor: tipo,
  rotulo: ROTULOS_TIPO_MANUTENCAO[tipo],
}));

export function rotuloTipo(tipo: string): string {
  return (
    ROTULOS_TIPO_MANUTENCAO[tipo as TipoManutencao] ?? tipo.replaceAll("_", " ")
  );
}

/** Formata aaaa-mm-dd sem depender de fuso do runtime. */
export function formatDataBr(value: string | null | undefined): string {
  if (!value) return "—";
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(value);
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function formatKm(km: number): string {
  return `${new Intl.NumberFormat("pt-BR").format(km)} km`;
}

export function formatCusto(custo: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(custo);
}

export function hojeIso(): string {
  return new Date().toISOString().slice(0, 10);
}
