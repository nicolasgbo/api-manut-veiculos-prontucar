import type { TipoManutencao } from "@/types/Manutencao";

export type UsuarioMe = {
  id: number;
  nome: string;
  email: string;
};

export type VeiculoResumo = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  kmAtual: number;
  criadoEm?: string;
};

export type ManutencaoResumo = {
  id: number;
  veiculoId: number;
  tipo: TipoManutencao;
  data: string;
  km: number;
  custo: number;
  oficina: string | null;
  observacoes: string | null;
  proximaRevisaoKm: number | null;
  proximaRevisaoData: string | null;
  criadoEm?: string;
  veiculo: {
    id: number;
    placa: string;
    marca: string;
    modelo: string;
  };
};
